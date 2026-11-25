import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RouteLoader from '../../common/components/RouteLoader/RouteLoader.jsx';

// Lazy-loaded Manager Pages
const PMDashboard = lazy(() => import('./pages/Dashboard.jsx'));
const PMProjects = lazy(() => import('./pages/Projects.jsx'));
const PMTeam = lazy(() => import('./pages/Team.jsx'));
const PMTasks = lazy(() => import('./pages/Tasks.jsx'));
const PMTimesheets = lazy(() => import('./pages/Timesheets.jsx'));
const PMClientComms = lazy(() => import('./pages/ClientCommunication.jsx'));
const PMInvoices = lazy(() => import('./pages/Invoices.jsx'));
const PMReports = lazy(() => import('./pages/Reports.jsx'));
const PMMilestones = lazy(() => import('./pages/Milestones.jsx'));
const PMSprints = lazy(() => import('./pages/Sprints.jsx'));
const PMProjectFiles = lazy(() => import('./pages/ProjectFiles.jsx'));
const PMProjectExpenses = lazy(() => import('./pages/ProjectExpenses.jsx'));
const PMPerformance = lazy(() => import('./pages/Performance.jsx'));
const PMNotifications = lazy(() => import('./pages/Notifications.jsx'));
const PMProfile = lazy(() => import('./pages/Profile.jsx'));
const PMMessages = lazy(() => import('./pages/Messages.jsx'));
const PMApprovals = lazy(() => import('./pages/Approvals.jsx'));
const PMCalendar = lazy(() => import('./pages/Calendar.jsx'));
const PMCompanySettings = lazy(() => import('./pages/CompanySettings.jsx'));
const PMClients = lazy(() => import('./pages/Clients.jsx'));
const PMSubscriptions = lazy(() => import('./pages/Subscriptions.jsx'));

/**
 * PmRoutes - route tree for the Manager portal.
 * Mounted at `/app/manager/*` by the Manager portal (pm.html entry point).
 */
export default function PmRoutes() {
  return (
    <Suspense fallback={<RouteLoader label="Loading Manager portal..." />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PMDashboard />} />
        <Route path="projects" element={<PMProjects />} />
        <Route path="team" element={<PMTeam />} />
        <Route path="tasks" element={<PMTasks />} />
        <Route path="timesheets" element={<PMTimesheets />} />
        <Route path="client-comms" element={<PMClientComms />} />
        <Route path="invoices" element={<PMInvoices />} />
        <Route path="reports" element={<PMReports />} />
        <Route path="milestones" element={<PMMilestones />} />
        <Route path="sprints" element={<PMSprints />} />
        <Route path="files" element={<PMProjectFiles />} />
        <Route path="expenses" element={<PMProjectExpenses />} />
        <Route path="performance" element={<PMPerformance />} />
        <Route path="notifications" element={<PMNotifications />} />
        <Route path="profile" element={<PMProfile />} />
        <Route path="messages" element={<PMMessages />} />
        <Route path="approvals" element={<PMApprovals />} />
        <Route path="calendar" element={<PMCalendar />} />
        <Route path="settings" element={<PMCompanySettings />} />
        <Route path="clients" element={<PMClients />} />
        <Route path="subscriptions" element={<PMSubscriptions />} />
        {/* Absolute on purpose. A relative to="dashboard" inside the splat
            route resolves against the matched path, so an unknown URL such as
            /app/manager/help became /app/manager/help/dashboard, matched "*" again and
            looped forever, growing the URL without bound. */}
        <Route path="*" element={<Navigate to="/app/manager/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
