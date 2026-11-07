import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';
import { getTaskCommentsApi, addCommentApi } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, Clock, MessageSquare, Send, Trash2, Tag } from 'lucide-react';

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  onDeleteTask,
  members = [],
}) => {
  if (!task) return null;

  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (task?._id && isOpen) {
      loadComments();
    }
  }, [task?._id, isOpen]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await getTaskCommentsApi(task._id);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await addCommentApi(task._id, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = (e) => {
    onUpdateTask(task._id, { status: e.target.value });
  };

  const handlePriorityChange = (e) => {
    onUpdateTask(task._id, { priority: e.target.value });
  };

  const handleAssigneeChange = (e) => {
    onUpdateTask(task._id, { assignee: e.target.value || null });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Overview" maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details and Discussion */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={task.status}>{task.status}</Badge>
              <Badge variant={task.priority}>{task.priority}</Badge>
              {isOverdue && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Overdue
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No detailed specifications provided.'}
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1" /> Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments System */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5" /> Comments ({comments.length})
            </h4>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-2 mb-4">
              {loadingComments ? (
                <Spinner size="sm" />
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No discussion yet. Leave a note below.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{c.user?.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post an update or reply..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Task Attributes Panel */}
        <div className="space-y-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Status Stage
            </label>
            <select
              value={task.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Backlog">Backlog</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={task.priority}
              onChange={handlePriorityChange}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            <select
              value={task.assignee?._id || task.assignee || ''}
              onChange={handleAssigneeChange}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                  {m.user?.name || 'Member'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-slate-400">
                <Calendar className="w-3.5 h-3.5 mr-1" /> Start
              </span>
              <span className="font-medium">
                {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1" /> Due
              </span>
              <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                onDeleteTask(task._id);
                onClose();
              }}
              className="w-full py-2 px-3 flex items-center justify-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200/60"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;