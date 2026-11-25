import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RouteLoader from '../../common/components/RouteLoader/RouteLoader.jsx';
import './styles/sales-portal.css';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Budget = lazy(() => import('./pages/Budget.jsx'));
const ClientOrders = lazy(() => import('./pages/ClientOrders.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const Expenses = lazy(() => import('./pages/Expenses.jsx'));
const ToDos = lazy(() => import('./pages/ToDos.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

export default function SalesRoutes() {
  return (
    <div className="sales-portal">
      <Suspense fallback={<RouteLoader label="Loading Sales Portal…" />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="budget" element={<Budget />} />
          <Route path="client-orders" element={<ClientOrders />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="todos" element={<ToDos />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/app/sales/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
