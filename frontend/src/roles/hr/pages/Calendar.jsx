import React from 'react';
import TeamAttendanceCalendar from '../../../common/components/Attendance/TeamAttendanceCalendar.jsx';

export default function HRCalendar() {
  return (
    <div className="emp-portal">
      <TeamAttendanceCalendar
        role="HR"
        pageTitle="HR Attendance Calendar"
        pageSubtitle="Review your team's schedule and attendance in the same calendar design as the Employee portal. Select a team member to see their month and daily records."
        canAssignCoverage
      />
    </div>
  );
}
