import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const CompanyOverview = lazy(() => import('./pages/Dashboard.jsx'));
const LeaveRequests = lazy(() => import('../hr/pages/LeaveRequests.jsx'));
const Enquiries = lazy(() => import('../hr/pages/Enquiries.jsx'));
const StaffAdministration = lazy(() => import('./pages/StaffAdministration.jsx'));
const DeactivationRequests = lazy(() => import('./pages/DeactivationRequests.jsx'));
const Profile = lazy(() => import('../../common/components/RoleProfile/RoleProfile.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));

export default function SuperAdminApp() {
  return (
    <Suspense fallback={<div className="p-4" role="status">Loading company overview…</div>}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CompanyOverview />} />
        <Route path="leaves" element={<LeaveRequests readOnly />} />
        <Route path="enquiries" element={<Enquiries readOnly />} />
        <Route path="staff" element={<StaffAdministration />} />
        <Route path="deactivation-requests" element={<DeactivationRequests />} />
        <Route path="profile" element={<Profile title="CEO Profile & Security" subtitle="Manage your CEO account identity, profile photo, contact details, and password." />} />
        <Route path="messages" element={<Messages />} />
        <Route path="*" element={<Navigate to="/app/super-admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
