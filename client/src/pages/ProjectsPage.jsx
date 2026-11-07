import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { createProjectApi, deleteProjectApi } from '../services/projectService';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ProjectModal from '../components/forms/ProjectModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Calendar, CheckSquare, Trash2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const { projects, loadingProjects, fetchProjects } = useProject();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (formData) => {
    await createProjectApi(formData);
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProjectApi(deleteId);
    fetchProjects();
    setDeleteId(null);
  };

  if (loadingProjects) return <Spinner size="lg" className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects Repository</h1>
          <p className="text-sm text-slate-500">Active engineering projects assigned to your account</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects configured"
          description="Create your first project to unlock Kanban tracking, Gantt roadmaps, and analytics."
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isOwner = proj.owner?._id === user?._id || proj.owner === user?._id;
            return (
              <div
                key={proj._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant={proj.priority}>{proj.priority}</Badge>
                    <Badge variant={proj.status}>{proj.status}</Badge>
                  </div>

                  <Link to={`/projects/${proj._id}`} className="group">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center">
                      {proj.title}
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition" />
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {proj.description || 'No detailed description specified.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center">
                        <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        Tasks
                      </span>
                      <span className="font-semibold text-slate-700">
                        {proj.completedTasks || 0} / {proj.totalTasks || 0}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${proj.progress || 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Deadline
                      </span>
                      <span>{new Date(proj.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Owner: {proj.owner?.name || 'You'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isOwner && (
                      <button
                        onClick={() => setDeleteId(proj._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/projects/${proj._id}`}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Entire Project?"
        message="This action permanently deletes this project, its tasks, comments, and activity feeds. It cannot be undone."
      />
    </div>
  );
};

export default ProjectsPage;