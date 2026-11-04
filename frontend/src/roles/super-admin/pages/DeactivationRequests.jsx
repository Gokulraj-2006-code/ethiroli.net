import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const payload = (response) => response?.data?.data ?? response?.data;

export default function DeactivationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [notes, setNotes] = useState({});
  const [workingId, setWorkingId] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/v1/deactivation-requests');
      setRequests(payload(response) || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load deactivation requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter !== 'ALL' && request.status !== statusFilter) return false;
      if (!term) return true;
      return [request.user_name, request.user_role, request.reason, request.requester_name, request.reviewer_name].some((value) => String(value || '').toLowerCase().includes(term));
    });
  }, [requests, statusFilter, search]);

  const review = async (request, decision) => {
    const note = (notes[request.id] || '').trim();
    if (decision === 'REJECTED' && !note) {
      setError('A rejection reason is required.');
      return;
    }
    setWorkingId(request.id);
    setError('');
    setNotice('');
    try {
      await axiosInstance.patch(`/v1/deactivation-requests/${encodeURIComponent(request.id)}`, {
        decision,
        review_note: note || null,
      });
      setNotice(`Deactivation request ${decision.toLowerCase()}.`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to review request.');
    } finally {
      setWorkingId('');
    }
  };

  const statusBadge = (status) => {
    if (status === 'APPROVED') return 'text-bg-success';
    if (status === 'REJECTED') return 'text-bg-danger';
    return 'text-bg-warning';
  };

  return (
    <AdminPage title="Deactivation Requests" subtitle="Review HR-submitted employee and intern deactivation requests." loading={loading} error={error} onRetry={load}>
      {notice && <div className="alert alert-success">{notice}</div>}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input className="form-control" style={{ maxWidth: 260 }} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All</option>
        </select>
      </div>
      <div className="card"><div className="table-responsive"><table className="table table-sm mb-0 align-middle">
        <thead><tr><th>Employee / Intern</th><th>Role</th><th>Reason submitted</th><th>Requested by</th><th>Date</th><th>Status</th><th>Review note</th><th className="text-end">Actions</th></tr></thead>
        <tbody>
          {filtered.map((request) => (
            <tr key={request.id}>
              <td>{request.user_name || request.user_id}</td>
              <td>{request.user_role || '—'}</td>
              <td style={{ maxWidth: 260 }}>{request.reason}</td>
              <td>{request.requester_name || request.requested_by || '—'}</td>
              <td>{String(request.created_at || '').slice(0, 10)}</td>
              <td><span className={`badge ${statusBadge(request.status)}`}>{request.status}</span></td>
              <td style={{ minWidth: 220 }}>
                {request.status === 'PENDING' ? (
                  <input
                    className="form-control form-control-sm"
                    placeholder="Review note / reason"
                    value={notes[request.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [request.id]: e.target.value })}
                  />
                ) : (
                  request.review_note || '—'
                )}
              </td>
              <td className="text-end">
                {request.status === 'PENDING' && (
                  <>
                    <button type="button" className="btn btn-sm btn-success me-1" disabled={workingId === request.id} onClick={() => review(request, 'APPROVED')}>Approve</button>
                    <button type="button" className="btn btn-sm btn-danger" disabled={workingId === request.id} onClick={() => review(request, 'REJECTED')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {!filtered.length && <tr><td colSpan="8" className="text-center text-muted p-3">No deactivation requests found.</td></tr>}
        </tbody>
      </table></div></div>
    </AdminPage>
  );
}