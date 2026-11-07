import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  BarChart3,
  CalendarRange,
  Users,
  User,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentProject } = useProject();
  const { projectId } = useParams();
  const activeProjectId = projectId || currentProject?._id;

  const mainNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'All Projects', to: '/projects', icon: FolderKanban },
  ];

  const projectNavigation = activeProjectId
    ? [
        { name: 'Overview', to: `/projects/${activeProjectId}`, icon: Layers },
        { name: 'Kanban Board', to: `/projects/${activeProjectId}/kanban`, icon: KanbanSquare },
        { name: 'Gantt Chart', to: `/projects/${activeProjectId}/gantt`, icon: CalendarRange },
        { name: 'Analytics', to: `/projects/${activeProjectId}/analytics`, icon: BarChart3 },
        { name: 'Team Members', to: `/projects/${activeProjectId}/team`, icon: Users },
      ]
    : [];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center px-6 h-16 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-none">TaskMaster</h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Enterprise PM</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Workspace</div>
            <nav className="space-y-1">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {projectNavigation.length > 0 && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Active Project</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="px-3 py-1 mb-2 text-xs font-semibold text-indigo-300 truncate rounded-md bg-slate-800/80 border border-slate-700/50">
                {currentProject?.title || 'Selected Project'}
              </p>
              <nav className="space-y-1">
                {projectNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 mr-3 shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Account</div>
            <nav className="space-y-1">
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <User className="w-5 h-5 mr-3 shrink-0" />
                User Profile
              </NavLink>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-xs text-slate-500 text-center">
        Enterprise Project Management
        </div>
      </aside>
    </>
  );
};

export default Sidebar;