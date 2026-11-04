import React from 'react';
import SelfAttendancePanel from '../../../common/components/Attendance/SelfAttendancePanel.jsx';
import employeePortalApi from '../../../services/api/employeePortalApi.js';

/**
 * Employee attendance page.
 *
 * The panel itself is shared with the HR and Manager portals so the live punch
 * clock, KPI tiles, and daily records stay visually identical for every role.
 * The Employee-specific API is self-scoped on the server.
 */
export default function Attendance() {
  return (
    <SelfAttendancePanel
      api={employeePortalApi}
      pageTitle="Attendance & Time Clock"
      pageSubtitle="Track your work sessions, punches, and daily working hours"
    />
  );
}
