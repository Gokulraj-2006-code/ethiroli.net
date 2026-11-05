import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (r) => r?.data?.data ?? r?.data;

export default function Enquiries({ readOnly = false }) {
  const location = useLocation();
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [search, setSearch] = useState(''); const [selected, setSelected] = useState(null);
  const openedNavigationRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(unwrap(await axiosInstance.get('/v1/contact-messages')) || []); }
    catch (e) { setError(e.response?.data?.message || 'Unable to load enquiries. Apply migration 024 after the baseline schema and migration 008.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  // A click on a contact notification in the Activity Feed lands here with the
  // enquiry id in navigation state. Open that row once per navigation; using
  // location.key means reloading the list after an update does not reopen it.
  useEffect(() => {
    const enquiryId = location.state?.enquiryId;
    if (!enquiryId || !items.length) return;
    if (openedNavigationRef.current === location.key) return;
    const match = items.find((item) => item.inquiry_id === enquiryId);
    if (match) {
      openedNavigationRef.current = location.key;
      setSelected(match);
    }
  }, [items, location.state, location.key]);
  const visible = items.filter((x) =>
    [x.name, x.email, x.subject, x.message].some((v) => String(v || '').toLowerCase().includes(search.toLowerCase())));
  const handleDelete = async (item) => {
    if (!window.confirm('Delete this enquiry? This cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/v1/contact-messages/${encodeURIComponent(item.inquiry_id)}`);
      await load();
      setSelected(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete enquiry.');
    }
  };
  return <AdminPage title="Contact enquiries" subtitle="Website enquiries and meeting requests. A meeting is not confirmed until the team confirms it." loading={loading} error={error} onRetry={load}>
    <div className="d-flex gap-2 flex-wrap mb-3"><input className="form-control" style={{ maxWidth: 360 }} aria-label="Search enquiries" placeholder="Search name, email, subject, message" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    <div className="card"><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Submitted</th><th>Name / contact</th><th>Type</th><th>Subject / message</th><th>Meeting preference</th><th /></tr></thead>
      <tbody>{visible.map((item) => <tr key={item.inquiry_id}><td>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td><td>{item.name}<br /><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <><br />{item.phone}</>}</td><td>{item.enquiry_type}</td><td>{item.subject}<div className="small text-secondary text-truncate" style={{ maxWidth: 280 }}>{item.message}</div></td><td>{item.meeting_preference ? new Date(item.meeting_preference).toLocaleString() : '—'}</td><td><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelected(item); }}>Details</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)}>Delete</button></div></td></tr>)}
      {!visible.length && <tr><td colSpan="6" className="text-center text-secondary p-4">No enquiries match this filter.</td></tr>}</tbody></table></div></div>
    {selected && <div className="modal d-block" role="dialog" aria-modal="true" aria-label="Enquiry details" style={{ background: '#0007', overflowY: 'auto' }}><div className="modal-dialog modal-lg"><div className="modal-content"><div className="modal-header"><h2 className="h5 modal-title">{selected.subject}</h2><button className="btn-close" onClick={() => setSelected(null)} aria-label="Close" /></div><div className="modal-body"><p><b>{selected.name}</b> · {selected.email} · {selected.phone || 'No phone provided'}</p><p className="text-secondary">{selected.enquiry_type} · Submitted {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</p>{selected.meeting_preference && <p>Requested time: {new Date(selected.meeting_preference).toLocaleString()} (not confirmed)</p>}<p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p></div><div className="modal-footer d-flex gap-2"><button className="btn btn-danger" onClick={() => selected && handleDelete(selected)}>Delete</button><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button></div></div></div></div>}
  </AdminPage>;
}
