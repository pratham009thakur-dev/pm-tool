import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

// Placeholder views dynamically wired in Part 3
const KanbanPage = React.lazy(() => import('./pages/KanbanPage'));
const GanttPage = React.lazy(() => import('./pages/GanttPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const TeamPage = React.lazy(() => import('./pages/TeamPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

const App = () => {
  return (
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/kanban" element={<KanbanPage />} />
            <Route path="/projects/:projectId/gantt" element={<GanttPage />} />
            <Route path="/projects/:projectId/analytics" element={<AnalyticsPage />} />
            <Route path="/projects/:projectId/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default App;