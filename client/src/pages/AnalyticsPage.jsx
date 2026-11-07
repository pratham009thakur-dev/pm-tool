import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectAnalyticsApi } from '../services/analyticsService';
import { useProject } from '../context/ProjectContext';
import Spinner from '../components/common/Spinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { CheckCircle, Clock, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

const COLORS = ['#6366f1', '#38bdf8', '#fbbf24', '#f87171', '#34d399'];

const AnalyticsPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      selectProject(projectId);
    }
    const loadAnalytics = async () => {
      try {
        const stats = await getProjectAnalyticsApi(projectId);
        setData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [projectId]);

  if (loading || !data) return <Spinner size="lg" className="h-64" />;

  const summary = [
    { label: 'Total Tasks', val: data.totalTasks, icon: BarChart3, bg: 'bg-indigo-50 text-indigo-600' },
    { label: 'Completed', val: data.completedTasks, icon: CheckCircle, bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'In Progress', val: data.inProgressTasks, icon: Clock, bg: 'bg-sky-50 text-sky-600' },
    { label: 'Overdue', val: data.overdueTasks, icon: AlertCircle, bg: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Analytics & Intelligence</h1>
        <p className="text-xs text-slate-500">Live aggregated statistics evaluated from MongoDB collections</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((card) => (
          <div key={card.label} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{card.val}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Tasks by Priority</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution across urgency tiers</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priorityBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Workload */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Team Member Workload</h3>
          <p className="text-xs text-slate-400 mb-4">Completed vs pending tasks per engineer</p>
          <div className="h-64">
            {data.memberWorkload && data.memberWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.memberWorkload}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="pending" stackId="a" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No assigned tasks found to evaluate workload.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Monthly Completion Velocity</h3>
          <p className="text-xs text-slate-400 mb-4">Historical resolution rate based on updated records</p>
          <div className="h-64">
            {data.trends && data.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Insufficient historical closed tasks for trend plotting.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;