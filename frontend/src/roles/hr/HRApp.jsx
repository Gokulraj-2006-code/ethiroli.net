import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import '../employee/styles/employee-portal.css';

const HRDashboard = lazy(() => import('./pages/Dashboard.jsx'));
const HREmployees = lazy(() => import('./pages/Employees.jsx'));
const HRInterns = lazy(() => import('./pages/Interns.jsx'));
const OrganizationSettings = lazy(() => import('./pages/OrganizationSettings.jsx'));
const HRDocuments = lazy(() => import('./pages/Documents.jsx'));
const LeaveRequests = lazy(() => import('./pages/LeaveRequests.jsx'));
const Enquiries = lazy(() => import('./pages/Enquiries.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const HRProfile = lazy(() => import('../../common/components/RoleProfile/RoleProfile.jsx'));
const CareerApplications = lazy(() => import('./pages/CareerApplications.jsx'));
const DeactivatedRegister = lazy(() => import('./pages/DeactivatedRegister.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));

export default function HRApp() {
  return <Suspense fallback={<div className="p-4" role="status">Loading People Operations…</div>}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<HRDashboard />} />
      <Route path="employees" element={<HREmployees />} />
      <Route path="interns" element={<HRInterns />} />
      <Route path="organization" element={<OrganizationSettings />} />
      <Route path="documents" element={<HRDocuments />} />
      <Route path="leaves" element={<LeaveRequests />} />
      <Route path="enquiries" element={<Enquiries />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="deactivated" element={<DeactivatedRegister />} />
      <Route path="career-applications" element={<CareerApplications />} />
      <Route path="profile" element={<HRProfile title="HR Profile & Security" subtitle="Manage your HR account identity, profile photo, contact details, and password." />} />
      <Route path="messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/app/hr/dashboard" replace />} />
    </Routes>
  </Suspense>;
}
