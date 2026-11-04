import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import '../employee/styles/employee-portal.css';

const ManagerDashboard = lazy(() => import('./pages/Dashboard.jsx'));
const ManagerWorkspace = lazy(() => import('./pages/Workspace.jsx'));
const ManagerProfile = lazy(() => import('./pages/Profile.jsx'));
const ManagerAttendance = lazy(() => import('./pages/Attendance.jsx'));
const ManagerCalendar = lazy(() => import('./pages/Calendar.jsx'));
const ManagerMessages = lazy(() => import('./pages/Messages.jsx'));

export default function ManagerRoutes() {
  return <Suspense fallback={<div className="p-4" role="status">Loading Manager workspace…</div>}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="workspace" element={<ManagerWorkspace />} />
      <Route path="profile" element={<ManagerProfile />} />
      <Route path="messages" element={<ManagerMessages />} />
      <Route path="attendance" element={<ManagerAttendance />} />
      <Route path="calendar" element={<ManagerCalendar />} />
      <Route path="*" element={<Navigate to="/app/manager/dashboard" replace />} />
    </Routes>
  </Suspense>;
}
