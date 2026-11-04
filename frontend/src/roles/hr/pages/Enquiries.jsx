import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (r) => r?.data?.data ?? r?.data;
const STATUSES = ['NEW', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'MEETING_REQUESTED', 'RESOLVED', 'CLOSED'];

export default function Enquiries({ readOnly = false }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); const [search, setSearch] = useState(''); const [selected, setSelected] = useState(null);
  const [draftNote, setDraftNote] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(unwrap(await axiosInstance.get('/v1/contact-messages')) || []); }
    catch (e) { setError(e.response?.data?.message || 'Unable to load enquiries. Apply migration 024 after the baseline schema and migration 008.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const update = async (item, status, notes = undefined) => {
    try { await axiosInstance.patch(`/v1/contact-messages/${encodeURIComponent(item.inquiry_id)}/status`, { status, ...(notes !== undefined ? { notes } : {}) }); await load(); setSelected(null); }
    catch (e) { setError(e.response?.data?.message || 'Could not update enquiry.'); }
  };
  const visible = items.filter((x) => (filter === 'ALL' || x.status === filter) &&
    [x.name, x.email, x.subject, x.message].some((v) => String(v || '').toLowerCase().includes(search.toLowerCase())));
  return <AdminPage title="Contact enquiries" subtitle="Website enquiries and meeting requests. A meeting is not confirmed until the team confirms it." loading={loading} error={error} onRetry={load}>
    <div className="d-flex gap-2 flex-wrap mb-3"><input className="form-control" style={{ maxWidth: 360 }} aria-label="Search enquiries" placeholder="Search name, email, subject, message" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select className="form-select" style={{ maxWidth: 240 }} aria-label="Filter enquiries by status" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
    <div className="card"><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Submitted</th><th>Name / contact</th><th>Type</th><th>Subject / message</th><th>Meeting preference</th><th>Status</th><th /></tr></thead>
      <tbody>{visible.map((item) => <tr key={item.inquiry_id}><td>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td><td>{item.name}<br /><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <><br />{item.phone}</>}</td><td>{item.enquiry_type}</td><td>{item.subject}<div className="small text-secondary text-truncate" style={{ maxWidth: 280 }}>{item.message}</div></td><td>{item.meeting_preference ? new Date(item.meeting_preference).toLocaleString() : '—'}</td><td>{item.status}</td><td><button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelected(item); setDraftNote(item.notes || ''); }}>Details</button></td></tr>)}
      {!visible.length && <tr><td colSpan="7" className="text-center text-secondary p-4">No enquiries match this filter.</td></tr>}</tbody></table></div></div>
    {selected && <div className="modal d-block" role="dialog" aria-modal="true" aria-label="Enquiry details" style={{ background: '#0007', overflowY: 'auto' }}><div className="modal-dialog modal-lg"><div className="modal-content"><div className="modal-header"><h2 className="h5 modal-title">{selected.subject}</h2><button className="btn-close" onClick={() => setSelected(null)} aria-label="Close" /></div><div className="modal-body"><p><b>{selected.name}</b> · {selected.email} · {selected.phone || 'No phone provided'}</p><p className="text-secondary">{selected.enquiry_type} · Submitted {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</p>{selected.meeting_preference && <p>Requested time: {new Date(selected.meeting_preference).toLocaleString()} (not confirmed)</p>}<p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p>{!readOnly && <label className="form-label w-100">Internal follow-up notes<textarea className="form-control" rows="3" maxLength="10000" value={draftNote} onChange={(e) => setDraftNote(e.target.value)} /></label>}{readOnly && selected.notes && <p><b>Follow-up notes:</b> {selected.notes}</p>}</div>{!readOnly && <div className="modal-footer d-flex flex-wrap gap-2"><button className="btn btn-primary" onClick={() => update(selected, selected.status, draftNote)}>Save notes</button>{STATUSES.map((status) => <button className="btn btn-sm btn-outline-primary" key={status} onClick={() => update(selected, status, draftNote)}>{status.replaceAll('_', ' ')}</button>)}</div>}</div></div></div>}
  </AdminPage>;
}
