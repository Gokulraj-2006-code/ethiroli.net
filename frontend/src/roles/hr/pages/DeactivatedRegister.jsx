import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (r) => r?.data?.data ?? r?.data;
export default function DeactivatedRegister() {
  const [active, setActive] = useState([]);
  const [deactivated, setDeactivated] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [dirRes, deactRes] = await Promise.all([
        axiosInstance.get('/v1/org/directory'),
        axiosInstance.get('/v1/deactivation-requests'),
      ]);
      const people = unwrap(dirRes) || [];
      setActive(people.filter((p) => p.account_status !== 'ARCHIVED' && p.account_status !== 'INACTIVE'));
      setDeactivated(people.filter((p) => p.account_status === 'ARCHIVED' || p.account_status === 'INACTIVE'));
      setPending(unwrap(deactRes) || []);
    } catch (e) { setError(e.response?.data?.message || 'Unable to load register.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (list) => list.filter((p) => !search || String(p.full_name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminPage title="Deactivated Register" subtitle="Active, pending and deactivated employee/intern records." loading={loading} error={error} onRetry={load}>
      <div className="mb-3"><input className="form-control" style={{ maxWidth: 320 }} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <h5>Active</h5>
      <div className="card mb-3"><div className="table-responsive"><table className="table table-sm mb-0"><thead><tr><th>Name</th><th>ID</th><th>Branch</th><th>Status</th></tr></thead><tbody>
        {filtered(active).map((p) => <tr key={p.user_id}><td>{p.full_name}</td><td>{p.employee_code || '—'}</td><td>{p.branch_name || '—'}</td><td><span className="badge bg-success">Active</span></td></tr>)}
        {!filtered(active).length && <tr><td colSpan="4" className="text-center text-muted p-3">No active records.</td></tr>}
      </tbody></table></div></div>
      <h5>Pending Deactivation Requests</h5>
      <div className="card mb-3"><div className="table-responsive"><table className="table table-sm mb-0"><thead><tr><th>Employee</th><th>Reason</th><th>Requested by</th><th>Date</th><th>Status</th></tr></thead><tbody>
        {pending.filter((r) => r.status === 'PENDING').map((r) => <tr key={r.id}><td>{r.user_name || r.user_id}</td><td>{r.reason}</td><td>{r.requester_name || r.requested_by}</td><td>{String(r.created_at).slice(0,10)}</td><td><span className="badge bg-warning">Pending</span></td></tr>)}
        {!pending.filter((r) => r.status === 'PENDING').length && <tr><td colSpan="5" className="text-center text-muted p-3">No pending requests.</td></tr>}
      </tbody></table></div></div>
      <h5>Deactivated</h5>
      <div className="card"><div className="table-responsive"><table className="table table-sm mb-0"><thead><tr><th>Name</th><th>ID</th><th>Branch</th><th>Deactivation date</th><th>Reason</th><th>Approved by</th></tr></thead><tbody>
        {filtered(deactivated).map((p) => <tr key={p.user_id}><td>{p.full_name}</td><td>{p.employee_code || '—'}</td><td>{p.branch_name || '—'}</td><td>{String(p.updated_at || '').slice(0,10)}</td><td>—</td><td>—</td></tr>)}
        {!filtered(deactivated).length && <tr><td colSpan="6" className="text-center text-muted p-3">No deactivated records.</td></tr>}
      </tbody></table></div></div>
    </AdminPage>
  );
}
