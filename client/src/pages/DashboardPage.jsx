import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi } from '../services/analyticsService';
import { useProject } from '../context/ProjectContext';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ProjectModal from '../components/forms/ProjectModal';
import { createProjectApi } from '../services/projectService';

const COLORS = ['#6366f1', '#38bdf8', '#fbbf24', '#f87171', '#34d399'];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projects, fetchProjects } = useProject();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStatsApi();
      setStats(data);
      await fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fetchProjects]);

  const handleCreateProject = async (formData) => {
    await createProjectApi(formData);
    loadData();
  };

  if (loading) return <Spinner size="lg" className="h-64" />;

  const metricCards = [
    { label: 'Total Projects', val: stats?.totalProjects || 0, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed Tasks', val: stats?.completedTasks || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'In Progress', val: stats?.inProgressTasks || 0, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Overdue Tasks', val: stats?.overdueTasks || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Main Dashboard</h1>
          <p className="text-sm text-slate-500">Live summary of active projects and workspace metrics</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-2" /> New Project
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{card.val}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Progress & Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Overall Workspace Health</h3>
            <p className="text-xs text-slate-400">Total task completion rate across projects</p>
          </div>
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="56" stroke="#e2e8f0" strokeWidth="12" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="#4f46e5"
                  strokeWidth="12"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * (stats?.overallCompletionRate || 0)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-2xl font-black text-slate-800">
                {stats?.overallCompletionRate || 0}%
              </span>
            </div>
          </div>
          <div className="text-xs text-center text-slate-500 font-medium">
            {stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks resolved
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-1">Task Status Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Calculated from actual MongoDB task collection entries</p>
          <div className="h-56">
            {stats?.statusDistribution && stats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No tasks available for aggregation
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Overview Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Active Workspaces</h3>
            <p className="text-xs text-slate-400">Jump directly to Kanban, Gantt, or project boards</p>
          </div>
          <Link to="/projects" className="text-xs font-bold text-indigo-600 hover:underline flex items-center">
            View All Projects <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.slice(0, 5).map((proj) => (
                <tr key={proj._id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-semibold text-slate-800">{proj.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={proj.status}>{proj.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={proj.priority}>{proj.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${proj.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{proj.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/projects/${proj._id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default DashboardPage;