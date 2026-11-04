import React from 'react';
import TeamAttendanceCalendar from '../../../common/components/Attendance/TeamAttendanceCalendar.jsx';

export default function SuperAdminCalendar() {
  return (
    <div className="emp-portal">
      <TeamAttendanceCalendar
        role="SUPER_ADMIN"
        pageTitle="Company Attendance Calendar"
        pageSubtitle="Review each employee's monthly attendance, daily punch-in and punch-out times, and attendance status."
      />
    </div>
  );
}
