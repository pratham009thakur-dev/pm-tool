import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckCircle2, Kanban, BarChart2, ShieldCheck, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <FolderKanban className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TaskMaster</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center px-3.5 py-1.5 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          Production Grade MERN Architecture • Enterprise Suite
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Modern Project Management, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            Engineered for Precision.
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Full lifecycle project coordination with interactive Kanban workflows, dynamic Gantt roadmaps, real-time workload analytics, and strict role-based access control.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/25"
          >
            Launch Your Workspace <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition"
          >
            Sign In with Existing Account
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-6 lg:px-12 py-16 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Persisted Kanban Board</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drag-and-drop tasks across 5 distinct stages. Position and status changes persist instantly to MongoDB Atlas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-time Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Aggregated MongoDB pipelines power automated completion rates, workload heatmaps, and monthly burndown charts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Granular project authorization distinguishing Owners, Admins, and Members with JWT-secured endpoints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;