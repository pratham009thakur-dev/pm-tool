import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import {
  getProjectTasksApi,
  updateTaskStatusApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from '../services/taskService';
import { useProject } from '../context/ProjectContext';
import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskDetailModal from '../components/kanban/TaskDetailModal';
import TaskCreateModal from '../components/kanban/TaskCreateModal';
import Spinner from '../components/common/Spinner';
import { Plus, Filter, Search, Kanban as KanbanIcon } from 'lucide-react';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'];

const KanbanPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [defaultColumn, setDefaultColumn] = useState('To Do');

  // Filters
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = async () => {
    try {
      const data = await getProjectTasksApi(projectId, {
        priority: filterPriority,
        assignee: filterAssignee,
        search: searchQuery,
      });
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      selectProject(projectId);
    }
    loadTasks();
  }, [projectId, filterPriority, filterAssignee, searchQuery]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Optimistic UI state update
    const updatedTasks = Array.from(tasks);
    const movedTaskIndex = updatedTasks.findIndex((t) => t._id === draggableId);
    if (movedTaskIndex === -1) return;

    const [movedTask] = updatedTasks.splice(movedTaskIndex, 1);
    movedTask.status = destStatus;
    updatedTasks.splice(destination.index, 0, movedTask);
    setTasks(updatedTasks);

    try {
      await updateTaskStatusApi(draggableId, destStatus, destination.index);
    } catch (err) {
      console.error('Failed to persist task status to MongoDB', err);
      loadTasks(); // rollback on error
    }
  };

  const handleCreateTask = async (taskData) => {
    await createTaskApi({ ...taskData, project: projectId });
    loadTasks();
  };

  const handleUpdateTask = async (taskId, updates) => {
    const updated = await updateTaskApi(taskId, updates);
    setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
    if (selectedTask?._id === taskId) {
      setSelectedTask(updated);
    }
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTaskApi(taskId);
    setTasks(tasks.filter((t) => t._id !== taskId));
    setSelectedTask(null);
  };

  const openCreateForColumn = (colName) => {
    setDefaultColumn(colName);
    setIsCreateOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <KanbanIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kanban Board</h1>
            <p className="text-xs text-slate-500">{currentProject?.title || 'Interactive Sprint Tracker'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Assignees</option>
            {currentProject?.members?.map((m) => (
              <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                {m.user?.name || 'Member'}
              </option>
            ))}
          </select>

          <button
            onClick={() => openCreateForColumn('To Do')}
            className="flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Drag-and-Drop Columns Container */}
      {loading ? (
        <Spinner size="lg" className="h-64" />
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex items-start gap-4 h-full min-w-max">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col}
                  columnId={col}
                  title={col}
                  tasks={tasks.filter((t) => t.status === col)}
                  onCardClick={(task) => setSelectedTask(task)}
                  onQuickAdd={openCreateForColumn}
                />
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={handleCreateTask}
        members={currentProject?.members || []}
        defaultStatus={defaultColumn}
      />

      {/* Task Inspection & Comment Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        members={currentProject?.members || []}
      />
    </div>
  );
};

export default KanbanPage;