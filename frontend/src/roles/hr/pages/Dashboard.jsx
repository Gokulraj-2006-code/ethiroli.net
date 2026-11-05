import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import NotificationBell from '../../../common/components/NotificationBell.jsx';
import SelfAttendancePunch from '../../../common/components/Attendance/SelfAttendancePunch.jsx';
import { useSocket } from '../../../common/contexts/SocketContext.jsx';

const unwrap = (response) => response?.data?.data ?? response?.data;

const formatReceived = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString([], {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

export default function HRDashboard() {
  const socket = useSocket();
  const [overview, setOverview] = useState(null);
  const [directory, setDirectory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryMeta, setEnquiryMeta] = useState({ total: 0, new_count: 0 });
  const [enquiryError, setEnquiryError] = useState('');
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

  const loadEnquiries = useCallback(async () => {
    setEnquiryError('');
    try {
      const response = await axiosInstance.get('/v1/contact-messages?limit=5');
      setEnquiries(unwrap(response) || []);
      setEnquiryMeta(response?.data?.meta || { total: 0, new_count: 0 });
    } catch (requestError) {
      setEnquiryError(requestError.response?.data?.message || 'Website enquiries are unavailable right now.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadEnquiries(); }, [loadEnquiries]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (payload) => {
      const inquiryId = payload?.inquiry_id;
      setEnquiries((prev) => prev.filter((item) => item.inquiry_id !== inquiryId));
      setEnquiryMeta((prev) => ({
        total: Math.max(0, Number(prev?.total || 0) - 1),
        new_count: Math.max(0, Number(prev?.new_count || 0)),
      }));
    };
    socket.on('contact_enquiry_deleted', handler);
    return () => socket.off('contact_enquiry_deleted', handler);
  }, [socket]);

  // A website enquiry emits `new_contact_message` to the HR role room. Refresh
  // the preview immediately instead of waiting for the next page visit.
  useEffect(() => {
    if (!socket) return undefined;
    const handler = () => { loadEnquiries(); };
    socket.on('new_contact_message', handler);
    return () => socket.off('new_contact_message', handler);
  }, [socket, loadEnquiries]);

  const attendance = (status) => Number(overview?.attendance?.byStatus?.find((row) => row.status === status)?.count || 0);
  const metrics = [
    ['Employees', overview?.employees, 'emp-stat--olive'],
    ['Interns', overview?.interns, 'emp-stat--teal'],
    ['Present today', attendance('PRESENT'), 'emp-stat--gold'],
    ['Recorded absences', attendance('ABSENT'), 'emp-stat--clay'],
    ['Approved leave', overview?.attendance?.approvedLeave, 'emp-stat--teal'],
    ['Needs organization assignment', directory.filter((person) => !person.branch_id || !person.department_name || !person.sub_role).length, 'emp-stat--olive'],
  ];


  return <div className="emp-portal"><AdminPage title="HR dashboard" subtitle="People operations, attendance, leave requests, and workforce updates" loading={loading} actions={null}>
    {error ? <div className="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert">
      <span><i className="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>{error}</span>
      <button type="button" className="btn btn-sm btn-outline-dark" onClick={load}>Retry workforce data</button>
    </div> : null}
    <SelfAttendancePunch />
    <div className="row g-3 mb-4">{metrics.map(([label, value, tone]) => <div className="col-6 col-xl-4" key={label}>
      <div className={`emp-stat ${tone} h-100`}><span className="emp-stat__label">{label}</span><div className="emp-stat__value">{value ?? '—'}</div><div className="emp-stat__hint">Live workforce data</div></div>
    </div>)}</div>

    <section className="card shadow-sm mb-4">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h2 className="h6 mb-0">
          <i className="bi bi-envelope-paper me-2" aria-hidden="true"></i>
          Latest website enquiries
        </h2>
        <Link className="btn btn-sm btn-outline-primary" to="/app/hr/enquiries">
          View all enquiries
        </Link>
      </div>
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead><tr><th>Received</th><th>From</th><th>Subject</th><th>Type</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
          <tbody>
            {enquiries.map((item) => <tr key={item.inquiry_id}>
              <td className="text-secondary small">{formatReceived(item.created_at)}</td>
              <td>
                <div className="fw-semibold">{item.name}</div>
                <a className="small" href={`mailto:${item.email}`}>{item.email}</a>
              </td>
              <td>{item.subject}</td>
              <td><span className="badge text-bg-light">{item.enquiry_type || 'General'}</span></td>
              <td className="text-end">
                <Link className="btn btn-sm btn-outline-secondary" to="/app/hr/enquiries" state={{ enquiryId: item.inquiry_id }}>
                  Open
                </Link>
              </td>
            </tr>)}
            {!enquiries.length && <tr><td colSpan="6" className="text-center text-secondary py-4">
              {enquiryError || 'No website enquiries have arrived yet.'}
            </td></tr>}
          </tbody>
        </table>
      </div>
      {enquiryError && enquiries.length > 0 && <div className="card-footer bg-white text-danger small">{enquiryError}</div>}
    </section>

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