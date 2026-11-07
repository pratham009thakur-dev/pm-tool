import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectTasksApi } from '../services/taskService';
import { useProject } from '../context/ProjectContext';
import GanttTimeline from '../components/gantt/GanttTimeline';
import Spinner from '../components/common/Spinner';
import { CalendarRange, Layers } from 'lucide-react';

const GanttPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      selectProject(projectId);
    }
    const loadTasks = async () => {
      try {
        const data = await getProjectTasksApi(projectId);
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [projectId]);

  if (loading) return <Spinner size="lg" className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Project Gantt Roadmap</h1>
            <p className="text-xs text-slate-500">
              Interactive timeline visualization computed directly from MongoDB tasks
            </p>
          </div>
        </div>
      </div>

      <GanttTimeline tasks={tasks} project={currentProject} />
    </div>
  );
};

export default GanttPage;