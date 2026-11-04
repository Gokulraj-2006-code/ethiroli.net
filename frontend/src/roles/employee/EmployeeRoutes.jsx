import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RouteLoader from '../../common/components/RouteLoader/RouteLoader.jsx';
import './styles/employee-portal.css';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const Leaves = lazy(() => import('./pages/Leaves.jsx'));
const Documents = lazy(() => import('./pages/Documents.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Income = lazy(() => import('./pages/Income.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));

export default function EmployeeRoutes() {
  return <div className="emp-portal"><Suspense fallback={<RouteLoader label="Loading Employee Portal…" />}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="leaves" element={<Leaves />} />
      <Route path="documents" element={<Documents />} />
      <Route path="profile" element={<Profile />} />
      <Route path="messages" element={<Messages />} />
      <Route path="income" element={<Income />} />
      <Route path="*" element={<Navigate to="/app/employee/dashboard" replace />} />
    </Routes>
  </Suspense></div>;
}
