import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import PersonMonitoringModal from '../../../common/components/Attendance/PersonMonitoringModal.jsx';

const METRICS = [
  ['Total employees', 'totalEmployees'],
  ['Total interns', 'totalInterns'],
  ['Present today', 'presentToday'],
  ['Confirmed absent', 'confirmedAbsentToday'],
  ['On approved leave', 'onApprovedLeaveToday'],
  ['Attendance not recorded', 'attendanceNotRecordedToday'],
  ['Active tasks', 'activeTasks'],
  ['In progress', 'inProgressTasks'],
  ['Completed tasks', 'completedTasks'],
  ['Overdue tasks', 'overdueTasks'],
];
const companyToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const clockIST = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }) : '�';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [people, setPeople] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(companyToday());
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = branchId ? `?branch_id=${encodeURIComponent(branchId)}` : '';
      const calendarQuery = `?date=${encodeURIComponent(attendanceDate)}${branchId ? `&branch_id=${encodeURIComponent(branchId)}` : ''}`;
      const [overviewRes, directoryRes, attendanceRes] = await Promise.all([
        axiosInstance.get(`/v1/org/overview${query}`),
        axiosInstance.get(`/v1/org/directory${query}`),
        axiosInstance.get(`/v1/org/attendance${calendarQuery}`)
      ]);
      const overview = overviewRes?.data?.data || overviewRes?.data;
      const directory = directoryRes?.data?.data || directoryRes?.data;
      const statusCount = (status) => Number(overview?.tasks?.find((row) => row.status === status)?.count || 0);
      const attendanceCount = (status) => Number(overview?.attendance?.byStatus?.find((row) => row.status === status)?.count || 0);
      setBranches(overview?.branches || []);
      setDepartments(overview?.departments || []);
      setPeople(Array.isArray(directory) ? directory : []);
      setAttendanceRows(attendanceRes?.data?.data?.rows || []);
      setRecentTasks(overview?.recentTasks || []);
      const dirList = Array.isArray(directory) ? directory : [];
      // Count only active EMPLOYEE roles as employees (matches 6 in Salem)
      const employeeCount = dirList.filter(p => p.role === 'EMPLOYEE' && p.is_active === 1).length;
      const hrCount = dirList.filter(p => p.role === 'HR' && p.is_active === 1).length;
      const managerCount = dirList.filter(p => p.role === 'PROJECT_MANAGER' && p.is_active === 1).length;
      setStats({
        totalEmployees: employeeCount,
        totalInterns: overview?.interns,
        presentToday: attendanceCount('PRESENT'),
        confirmedAbsentToday: attendanceCount('ABSENT'),
        onApprovedLeaveToday: overview?.attendance?.approvedLeave,
        attendanceNotRecordedToday: overview?.attendance?.notRecorded,
        activeTasks: statusCount('PENDING') + statusCount('IN_PROGRESS') + statusCount('UNDER_REVIEW') + statusCount('BLOCKED'),
        inProgressTasks: statusCount('IN_PROGRESS'),
        completedTasks: statusCount('COMPLETED'),
        overdueTasks: overview?.overdueTasks
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load company monitoring data.');
    } finally {
      setLoading(false);
    }
  }, [branchId, attendanceDate]);

  const inspectPerson = (person) => setSelectedPerson(person);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminPage title="Company overview" subtitle="Read-only workforce and task monitoring" actions={undefined}>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <p className="text-secondary mb-0">Live totals from recorded employee, intern, attendance, leave, and task data.</p>
        <label className="d-flex align-items-center gap-2 small">
          Branch
          <select className="form-select form-select-sm" value={branchId} onChange={(event) => setBranchId(event.target.value)} aria-label="Filter by branch">
            <option value="">All branches</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </label>
        <button className="btn btn-outline-primary btn-sm" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3">
        {METRICS.map(([label, key]) => (
          <div className="col-6 col-md-4 col-xl-3" key={key}>
            <section className="card h-100 shadow-sm">
              <div className="card-body">
                <p className="text-secondary small mb-2">{label}</p>
                <p className="h3 mb-0" aria-live="polite">{loading ? '�' : (stats?.[key] ?? '�')}</p>
              </div>
            </section>
          </div>
        ))}
      </div>

      <section className="card mt-4 shadow-sm">
        <div className="card-header bg-white"><h2 className="h6 mb-0">Division overview</h2></div>
        <div className="table-responsive"><table className="table table-sm mb-0 align-middle">
          <thead><tr><th>Division</th><th>Employees</th><th>Interns</th></tr></thead>
          <tbody>{departments.map((row) => <tr key={row.department}><td>{row.department}</td><td>{row.employees}</td><td>{row.interns}</td></tr>)}</tbody>
        </table></div>
      </section>

      <section className="card mt-4 shadow-sm">
        <div className="card-header bg-white"><h2 className="h6 mb-0">Workforce by branch</h2></div>
        <div className="table-responsive"><table className="table table-sm mb-0"><thead><tr><th>Branch</th><th>Employees</th><th>Interns</th><th>Total</th></tr></thead><tbody>{branches.map((branch) => <tr key={branch.id}><td>{branch.name}</td><td>{branch.employees}</td><td>{branch.interns}</td><td>{Number(branch.employees || 0) + Number(branch.interns || 0)}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card mt-4 shadow-sm">
        <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2"><h2 className="h6 mb-0">Attendance calendar</h2><label className="small">Date <input className="form-control form-control-sm d-inline-block ms-2" style={{ width: 160 }} type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></label></div>
        <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Name</th><th>Type</th><th>Branch</th><th>Division</th><th>Day status</th><th>Check in</th><th>Check out</th></tr></thead><tbody>
          {attendanceRows.map((row) => <tr key={row.user_id}><td><button type="button" className="btn btn-link p-0" onClick={() => inspectPerson({ ...row, selected_date: attendanceDate })}>{row.full_name}</button></td><td>{row.employment_type === 'Intern' ? <span className="badge text-bg-info">Intern</span> : row.employment_type || 'Employee'}</td><td>{row.branch_name || 'Unassigned'}</td><td>{row.department_name || 'Unassigned'}</td><td className={row.day_status === 'SUNDAY' || row.day_status === 'ABSENT' ? 'text-danger fw-semibold' : row.day_status === 'PRESENT' ? 'text-success fw-semibold' : ''}>{row.day_status === 'SUNDAY' ? 'Sunday' : row.day_status === 'ABSENT' ? 'Absent' : row.day_status === 'APPROVED_LEAVE' ? 'Approved leave' : row.day_status === 'NOT_RECORDED' ? 'Not recorded' : row.day_status === 'HALF_DAY' ? 'Half day' : row.day_status === 'HOLIDAY' ? `Holiday${row.holiday_name ? `: ${row.holiday_name}` : ''}` : 'Present'}</td><td>{clockIST(row.check_in_time)}</td><td>{clockIST(row.check_out_time)}</td></tr>)}
        </tbody></table>{!attendanceRows.length && !loading && <div className="p-3 text-secondary">No employee or intern records for this date and branch.</div>}</div>
      </section>

      <section className="card mt-4 shadow-sm">
        <div className="card-header bg-white"><h2 className="h6 mb-0">Recent task progress</h2></div>
        <div className="table-responsive"><table className="table table-sm mb-0 align-middle"><thead><tr><th>Task</th><th>Assigned to</th><th>Branch</th><th>Status</th><th>Priority</th><th>Updated</th></tr></thead><tbody>{recentTasks.map((task) => <tr key={task.id}><td>{task.description}</td><td>{task.full_name}{task.employment_type === 'Intern' && <span className="badge text-bg-info ms-1">Intern</span>}</td><td>{task.branch_name || 'Unassigned'}</td><td>{task.status}</td><td>{task.priority}</td><td>{task.updated_at ? String(task.updated_at).slice(0, 10) : '�'}</td></tr>)}</tbody></table>{!recentTasks.length && !loading && <div className="p-3 text-secondary">No assigned tasks have been updated.</div>}</div>
      </section>

      <section className="card mt-4 shadow-sm">
        <div className="card-header bg-white"><h2 className="h6 mb-0">People directory</h2></div>
        <div className="table-responsive"><table className="table table-hover mb-0 align-middle">
          <thead><tr><th>Name</th><th>Employee ID</th><th>Type</th><th>Branch</th><th>Division</th><th>Sub-role</th></tr></thead>
          <tbody>{people.map((person) => <tr key={person.user_id} role="button" tabIndex={0} onClick={() => inspectPerson(person)} onKeyDown={(event) => event.key === 'Enter' && inspectPerson(person)}>
            <td>{person.full_name} {person.employment_type === 'Intern' && <span className="badge text-bg-info ms-1">Intern</span>}</td>
            <td>{person.employee_code || '�'}</td><td>{person.role === 'PROJECT_MANAGER' ? 'Manager' : person.role === 'HR' ? 'HR' : person.role === 'EMPLOYEE' ? 'Employee' : person.role}</td><td>{person.branch_name || 'Unassigned'}</td><td>{person.department_name || person.department || 'Unassigned'}</td><td>{person.sub_role || 'Unassigned'}</td>
          </tr>)}</tbody>
        </table></div>
        {!people.length && !loading && <p className="text-secondary p-3 mb-0">No personnel records are assigned to this view.</p>}
      </section>

      {selectedPerson && <PersonMonitoringModal person={selectedPerson} onClose={() => setSelectedPerson(null)} canAssignCoverage={false} />}

      <div className="alert alert-info mt-4 mb-0" role="note">
        Attendance marked absent is counted only when an explicit attendance record exists. Employees on approved leave
        and people with no attendance record are shown separately. Choose a branch above to filter its assigned records.
      </div>
    </AdminPage>
  );
}


