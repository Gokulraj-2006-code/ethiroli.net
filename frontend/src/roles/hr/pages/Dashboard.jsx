import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import NotificationBell from '../../../common/components/NotificationBell.jsx';
import SelfAttendancePunch from '../../../common/components/Attendance/SelfAttendancePunch.jsx';

const unwrap = (response) => response?.data?.data ?? response?.data;

export default function HRDashboard() {
  const [overview, setOverview] = useState(null);
  const [directory, setDirectory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [overviewResponse, directoryResponse] = await Promise.all([
        axiosInstance.get('/v1/org/overview'), axiosInstance.get('/v1/org/directory')
      ]);
      const base = unwrap(overviewResponse);
      setOverview(base);
      setDirectory(unwrap(directoryResponse) || []);
      const branchRows = await Promise.all((base?.branches || []).map(async (branch) => {
        const response = await axiosInstance.get(`/v1/org/overview?branch_id=${encodeURIComponent(branch.id)}`);
        const row = unwrap(response);
        return { id: branch.id, name: branch.name, employees: row.employees, interns: row.interns };
      }));
      setBranches(branchRows);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load HR workforce data.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const attendance = (status) => Number(overview?.attendance?.byStatus?.find((row) => row.status === status)?.count || 0);
  const metrics = [
    ['Employees', overview?.employees, 'emp-stat--olive'],
    ['Interns', overview?.interns, 'emp-stat--teal'],
    ['Present today', attendance('PRESENT'), 'emp-stat--gold'],
    ['Recorded absences', attendance('ABSENT'), 'emp-stat--clay'],
    ['Approved leave', overview?.attendance?.approvedLeave, 'emp-stat--teal'],
    ['Needs organization assignment', directory.filter((person) => !person.branch_id || !person.department_name || !person.sub_role).length, 'emp-stat--olive'],
  ];

  return <div className="emp-portal"><AdminPage title="HR dashboard" subtitle="People operations, attendance, leave requests, and workforce updates" loading={loading} error={error} onRetry={load} actions={null}>
    <SelfAttendancePunch />
    <div className="row g-3 mb-4">{metrics.map(([label, value, tone]) => <div className="col-6 col-xl-4" key={label}>
      <div className={`emp-stat ${tone} h-100`}><span className="emp-stat__label">{label}</span><div className="emp-stat__value">{value ?? '—'}</div><div className="emp-stat__hint">Live workforce data</div></div>
    </div>)}</div>
    <section className="card shadow-sm mb-4"><div className="card-header bg-white"><h2 className="h6 mb-0">HR quick links</h2></div><div className="card-body d-flex flex-wrap gap-2">
      <Link className="btn btn-outline-primary" to="/app/hr/attendance">Attendance</Link><Link className="btn btn-outline-primary" to="/app/hr/calendar">Attendance calendar</Link>
      <Link className="btn btn-outline-primary" to="/app/hr/employees">Employees</Link><Link className="btn btn-outline-primary" to="/app/hr/interns">Interns</Link>
      <Link className="btn btn-outline-primary" to="/app/hr/leaves">Leave requests</Link><Link className="btn btn-outline-primary" to="/app/hr/enquiries">Contact enquiries</Link>
    </div></section>
    <div className="card shadow-sm"><div className="card-header bg-white"><h2 className="h6 mb-0">Branch workforce</h2></div><div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Branch</th><th>Employees</th><th>Interns</th><th>Total</th></tr></thead><tbody>
      {branches.map((branch) => <tr key={branch.id}><td>{branch.name}</td><td>{branch.employees ?? '—'}</td><td>{branch.interns ?? '—'}</td><td>{Number(branch.employees || 0) + Number(branch.interns || 0)}</td></tr>)}
      {!branches.length && <tr><td colSpan="4" className="text-center text-secondary py-4">No branch records are available.</td></tr>}
    </tbody></table></div></div>
  </AdminPage></div>;
}
