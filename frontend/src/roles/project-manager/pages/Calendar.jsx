import React from 'react';
import TeamAttendanceCalendar from '../../../common/components/Attendance/TeamAttendanceCalendar.jsx';

export default function PMCalendar() {
  return (
    <div className="emp-portal">
      <TeamAttendanceCalendar
        role="PROJECT_MANAGER"
        pageTitle="Manager Attendance Calendar"
        pageSubtitle="Review your team's schedule and attendance in the same calendar design as the Employee portal. Select a team member to see their month and daily records."
      />
    </div>
  );
}
