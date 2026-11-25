import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import SelfAttendancePanel, { selfAttendanceApi } from '../../../common/components/Attendance/SelfAttendancePanel.jsx';

export default function ManagerAttendance() {
  return (
    <div className="emp-portal">
      <AdminPage
        title="Attendance & Time Clock"
        subtitle="Your live punch clock, monthly KPIs, and daily attendance records."
      >
        <SelfAttendancePanel api={selfAttendanceApi} embedded />
        <div className="emp-attendance-note card shadow-sm">
          <div className="card-body">
            <h2 className="h6">Team attendance</h2>
            <p className="mb-0 text-secondary">
              Open Calendar to review daily presence, working time, and individual attendance
              details for your authorized team.
            </p>
          </div>
        </div>
      </AdminPage>
    </div>
  );
}
