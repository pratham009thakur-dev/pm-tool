import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectByIdApi, updateProjectApi } from '../services/projectService';
import { getProjectActivitiesApi } from '../services/taskService';
import { useProject } from '../context/ProjectContext';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import ProjectModal from '../components/forms/ProjectModal';
import {
  Calendar,
  Clock,
  KanbanSquare,
  BarChart3,
  CalendarRange,
  Users,
  Edit2,
  Activity as ActivityIcon,
} from 'lucide-react';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject, setCurrentProject } = useProject();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await selectProject(projectId);
        const acts = await getProjectActivitiesApi(projectId);
        setActivities(acts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [projectId, selectProject]);

  const handleUpdate = async (formData) => {
    const updated = await updateProjectApi(projectId, formData);
    setCurrentProject({ ...currentProject, ...updated });
  };

  if (loading || !currentProject) return <Spinner size="lg" className="h-64" />;

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Navigation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{currentProject.title}</h1>
            <Badge variant={currentProject.status}>{currentProject.status}</Badge>
            <Badge variant={currentProject.priority}>{currentProject.priority}</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">{currentProject.description || 'No description provided.'}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Details
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar to specialized views */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to={`/projects/${projectId}/kanban`}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md transition flex items-center space-x-3"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Kanban Board</h4>
            <p className="text-xs text-slate-400">Drag & drop cards</p>
          </div>
        </Link>

        <Link
          to={`/projects/${projectId}/gantt`}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md transition flex items-center space-x-3"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Gantt Chart</h4>
            <p className="text-xs text-slate-400">Timeline roadmaps</p>
          </div>
        </Link>

        <Link
          to={`/projects/${projectId}/analytics`}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md transition flex items-center space-x-3"
        >
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Analytics</h4>
            <p className="text-xs text-slate-400">Workload & reports</p>
          </div>
        </Link>

        <Link
          to={`/projects/${projectId}/team`}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-500 hover:shadow-md transition flex items-center space-x-3"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Team ({currentProject.members?.length || 1})</h4>
            <p className="text-xs text-slate-400">Roles & permissions</p>
          </div>
        </Link>
      </div>

      {/* Grid: Metadata Overview + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Project Parameters</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> Start Date
                </span>
                <span className="font-semibold text-slate-800">
                  {new Date(currentProject.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Deadline
                </span>
                <span className="font-semibold text-slate-800">
                  {new Date(currentProject.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Project Owner</span>
                <span className="font-semibold text-slate-800">{currentProject.owner?.name || 'Owner'}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Task Completion Progress</span>
                <span>{currentProject.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${currentProject.progress || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {currentProject.completedTasks || 0} of {currentProject.totalTasks || 0} tasks marked as Done.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Project Activity Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <ActivityIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Project Audit & Activity Log</h3>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No recorded activity yet.</p>
          ) : (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
              {activities.map((act) => (
                <div key={act._id} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {act.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">{act.user?.name}</span> • {act.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.details}</p>
                    <span className="text-[10px] text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={currentProject}
      />
    </div>
  );
};

export default ProjectDetailsPage;