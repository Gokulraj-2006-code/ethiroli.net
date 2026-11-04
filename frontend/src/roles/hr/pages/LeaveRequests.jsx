import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (r) => r?.data?.data ?? r?.data;
export default function LeaveRequests({ readOnly = false }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [people, setPeople] = useState([]); const [status, setStatus] = useState('ALL'); const [search, setSearch] = useState(''); const [branch, setBranch] = useState('ALL'); const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [leaveResponse, directoryResponse] = await Promise.all([axiosInstance.get('/v1/leaves'), axiosInstance.get('/v1/org/directory')]); setItems(unwrap(leaveResponse) || []); setPeople(unwrap(directoryResponse) || []); }
    catch (e) { setError(e.response?.data?.message || 'Unable to load leave requests.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const decideApprove = async (item) => {
    try { await axiosInstance.patch(`/v1/leaves/${encodeURIComponent(item.id)}/status`, { status: 'APPROVED', review_note: '' }); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Could not save leave decision.'); }
  };
  const [rejectItem, setRejectItem] = useState(null); const [rejectReason, setRejectReason] = useState(''); const [rejectSaving, setRejectSaving] = useState(false);
const [viewItem, setViewItem] = useState(null);
const openViewDetail = (item) => { setViewItem(item); };
const closeViewDetail = () => { setViewItem(null); };
  const openReject = (item) => { setRejectItem(item); setRejectReason(''); };
  const closeReject = () => { setRejectItem(null); setRejectReason(''); };
  const confirmReject = async () => {
    if (!rejectReason.trim()) { setError('Rejection reason is required.'); return; }
    setRejectSaving(true); setError('');
    try { await axiosInstance.patch(`/v1/leaves/${encodeURIComponent(rejectItem.id)}/status`, { status: 'REJECTED', review_note: rejectReason.trim() }); closeReject(); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Could not save leave decision.'); }
    finally { setRejectSaving(false); }
  };
  const peopleById = new Map(people.map((p) => [p.user_id, p]));
  const visible = items.filter((x) => (status === 'ALL' || x.status === status) && (branch === 'ALL' || peopleById.get(x.user_id)?.branch_id === branch) && (!from || String(x.end_date).slice(0,10) >= from) && (!to || String(x.start_date).slice(0,10) <= to) &&
    [x.employee_name, x.email, x.reason].some((v) => String(v || '').toLowerCase().includes(search.toLowerCase())));
  return <AdminPage title="Leave requests" subtitle="Review employee and intern requests; no leave entitlement is assumed." loading={loading} error={error} onRetry={load}>
    <div className="d-flex gap-2 mb-3 flex-wrap"><input className="form-control" style={{ maxWidth: 280 }} placeholder="Search person or reason" aria-label="Search leave requests" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select className="form-select" style={{ maxWidth: 190 }} aria-label="Filter by leave status" value={status} onChange={(e) => setStatus(e.target.value)}>{['ALL','PENDING','APPROVED','REJECTED','CANCELLED'].map((s) => <option key={s}>{s}</option>)}</select>
      <select className="form-select" style={{ maxWidth: 190 }} aria-label="Filter by branch" value={branch} onChange={(e) => setBranch(e.target.value)}><option value="ALL">All branches</option>{[...new Map(people.filter((p) => p.branch_id).map((p) => [p.branch_id, p.branch_name])).entries()].map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select>
      <label className="input-group" style={{ maxWidth: 220 }}><span className="input-group-text">From</span><input className="form-control" aria-label="Leave date from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="input-group" style={{ maxWidth: 220 }}><span className="input-group-text">To</span><input className="form-control" aria-label="Leave date to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label></div>
    <div className="card"><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Reviewed by</th><th>Decision</th></tr></thead><tbody>
      {visible.map((item) => <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setViewItem(item)}><td>{item.employee_name || item.user_name || '—'}<div className="small text-secondary">{peopleById.get(item.user_id)?.branch_name || 'Branch unassigned'} · {item.email || ''}</div></td><td>{item.leave_type}</td><td>{String(item.start_date).slice(0,10)} – {String(item.end_date).slice(0,10)}</td><td>{item.reason}</td><td>{item.status}</td><td>{item.approved_by_name || '—'}{item.review_note && <div className="small text-secondary">{item.review_note}</div>}</td><td>{!readOnly && item.status === 'PENDING' && <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}><button className="btn btn-sm btn-success" onClick={() => decideApprove(item)}>Approve</button><button className="btn btn-sm btn-outline-danger" onClick={() => openReject(item)}>Reject</button></div>}</td></tr>)}
      {!visible.length && <tr><td colSpan="7" className="text-center text-secondary p-4">No leave requests match this filter.</td></tr>}</tbody></table></div></div>
{viewItem && <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={closeViewDetail}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Leave Request Details</h5><button className="btn-close" onClick={closeViewDetail} aria-label="Close"></button></div>
          <div className="modal-body">
            <h6>Employee Information</h6>
            <p><strong>Name:</strong> {viewItem.employee_name || viewItem.user_name || '—'}</p>
            <p><strong>ID:</strong> {viewItem.user_id}</p>
            <p><strong>Email:</strong> {viewItem.email || '—'}</p>
            <p><strong>Type:</strong> {peopleById.get(viewItem.user_id)?.employment_type || '—'}</p>
            <p><strong>Branch:</strong> {peopleById.get(viewItem.user_id)?.branch_name || '—'}</p>
            <p><strong>Division:</strong> {peopleById.get(viewItem.user_id)?.department_name || '—'}</p>
            <p><strong>Sub-role:</strong> {peopleById.get(viewItem.user_id)?.sub_role || '—'}</p>
            <hr />
            <h6>Leave Information</h6>
            <p><strong>Type:</strong> {viewItem.leave_type}</p>
            <p><strong>Start:</strong> {String(viewItem.start_date).slice(0,10)}</p>
            <p><strong>End:</strong> {String(viewItem.end_date).slice(0,10)}</p>
            <p><strong>Total days:</strong> {Math.max(1, Math.ceil((new Date(viewItem.end_date) - new Date(viewItem.start_date)) / 86400000) + 1)}</p>
            <p><strong>Reason:</strong> {viewItem.reason}</p>
            <p><strong>Status:</strong> {viewItem.status}</p>
            {viewItem.review_note && <p><strong>HR Remarks:</strong> {viewItem.review_note}</p>}
            {viewItem.approved_by_name && <p><strong>Reviewed by:</strong> {viewItem.approved_by_name}</p>}
            {!readOnly && viewItem.status === 'PENDING' && <div className="d-flex gap-2 mt-3">
              <button className="btn btn-success" onClick={() => { decideApprove(viewItem); setViewItem(null); }}>Approve</button>
              <button className="btn btn-outline-danger" onClick={() => { openReject(viewItem); setViewItem(null); }}>Reject</button>
            </div>}
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={closeViewDetail}>Close</button></div>
        </div>
      </div>
    </div>}
    {rejectItem && <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={closeReject}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Reject Leave Request</h5><button className="btn-close" onClick={closeReject} aria-label="Close"></button></div>
          <div className="modal-body">
            <p><strong>Employee:</strong> {rejectItem.employee_name || rejectItem.user_name || '—'}</p>
            <p><strong>Email/ID:</strong> {rejectItem.email || rejectItem.user_id}</p>
            <p><strong>Leave type:</strong> {rejectItem.leave_type}</p>
            <p><strong>Dates:</strong> {String(rejectItem.start_date).slice(0,10)} – {String(rejectItem.end_date).slice(0,10)}</p>
            <p><strong>Reason:</strong> {rejectItem.reason}</p>
            <label className="form-label mt-2">Reason for rejection (required)</label>
            <textarea className="form-control" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closeReject} disabled={rejectSaving}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmReject} disabled={rejectSaving || !rejectReason.trim()}>{rejectSaving ? 'Saving…' : 'Confirm Rejection'}</button>
          </div>
        </div>
      </div>
    </div>}
  </AdminPage>;
}
