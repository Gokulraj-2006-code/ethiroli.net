import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import NotificationBell from '../../../common/components/NotificationBell.jsx';
import SelfAttendancePunch from '../../../common/components/Attendance/SelfAttendancePunch.jsx';

const unwrap = (response) => response?.data?.data ?? response?.data;

export default function ManagerDashboard() {
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [peopleResponse, tasksResponse] = await Promise.all([
        axiosInstance.get('/v1/org/directory'), axiosInstance.get('/v1/tasks')
      ]);
      setTeam(unwrap(peopleResponse) || []);
      setTasks(unwrap(tasksResponse) || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your team summary. Check your manager team scope.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const metrics = [
    ['Team members', team.length, 'emp-stat--olive'],
    ['Employees', team.filter((person) => person.employment_type !== 'Intern').length, 'emp-stat--teal'],
    ['Interns', team.filter((person) => person.employment_type === 'Intern').length, 'emp-stat--gold'],
    ['Open tasks', tasks.filter((task) => !['COMPLETED', 'CANCELLED'].includes(task.status)).length, 'emp-stat--clay'],
  ];

  return <div className="emp-portal"><AdminPage title="Manager dashboard" subtitle="Your attendance, team progress, and assigned work at a glance" loading={loading} error={error} onRetry={load} actions={null}>
    <SelfAttendancePunch />
    <div className="row g-3 mb-4">{metrics.map(([label, value, tone]) => <div className="col-6 col-xl-3" key={label}>
      <div className={`emp-stat ${tone} h-100`}><span className="emp-stat__label">{label}</span><div className="emp-stat__value">{value}</div><div className="emp-stat__hint">From your authorized team and task data</div></div>
    </div>)}</div>
    <section className="card shadow-sm"><div className="card-header bg-white"><h2 className="h6 mb-0">Manager quick links</h2></div><div className="card-body d-flex flex-wrap gap-2">
      <Link className="btn btn-outline-primary" to="/app/manager/attendance">My attendance</Link><Link className="btn btn-outline-primary" to="/app/manager/calendar">Team attendance calendar</Link><Link className="btn btn-outline-primary" to="/app/manager/workspace">Manager workspace</Link>
    </div></section>
    <section className="card shadow-sm mt-4"><div className="card-header bg-white"><h2 className="h6 mb-0">Team attendance today</h2></div><div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Team member</th><th>Type</th><th>Attendance</th><th>Check in</th><th>Check out</th></tr></thead><tbody>
      {team.slice(0, 8).map((person) => <tr key={person.user_id}><td>{person.full_name}</td><td>{person.employment_type || 'Employee'}</td><td>{person.attendance_status || 'Not recorded'}</td><td>{person.check_in_time ? new Date(person.check_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }) : '—'}</td><td>{person.check_out_time ? new Date(person.check_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }) : '—'}</td></tr>)}
      {!team.length && !loading && <tr><td colSpan="5" className="text-center text-secondary py-4">No team members are available in your authorized scope.</td></tr>}
    </tbody></table></div></section>
  </AdminPage></div>;
}
