import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import { downloadHrIssuedDocument, issueHrDocument, listHrDocumentRecipients, listHrIssuedDocuments } from '../../../../services/api/hrApi.standardized.js';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const asBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(new Error('Could not read the selected PDF.'));
  reader.readAsDataURL(file);
});

export default function HRDocuments() {
  const [people, setPeople] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const formElementRef = useRef(null);
  const [form, setForm] = useState({ recipient_user_id: '', title: '', document_type: 'OFFER_LETTER', file: null });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [recipientResponse, documentResponse] = await Promise.all([listHrDocumentRecipients(), listHrIssuedDocuments()]);
      setPeople(unwrap(recipientResponse)); setDocuments(unwrap(documentResponse));
    } catch (err) { setError(err.message || 'Unable to load HR documents.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const send = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const { file } = form;
      if (!file || file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Choose a PDF file.');
      if (file.size > 7 * 1024 * 1024) throw new Error('PDF must be 7 MB or smaller.');
      await issueHrDocument({ recipient_user_id: form.recipient_user_id, title: form.title, document_type: form.document_type, original_filename: file.name, file_base64: await asBase64(file) });
      setNotice('Document delivered to the selected employee or intern portal.');
      setForm({ recipient_user_id: '', title: '', document_type: 'OFFER_LETTER', file: null });
      formElementRef.current?.reset();
      await load();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Could not send document.'); }
    finally { setSaving(false); }
  };

  const download = async (doc) => {
    try {
      const blob = await downloadHrIssuedDocument(doc.id);
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
      anchor.href = url; anchor.download = doc.original_filename; anchor.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message || 'Could not download document.'); }
  };

  return <AdminPage title="Employee & Intern Documents" subtitle="Issue private offer letters, appointment letters, and certificates to an individual portal." loading={loading} error={error} onRetry={load}>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <section className="card mb-4"><div className="cardHeader"><h3 className="cardTitle">Send a document</h3></div><div className="cardBody">
      <form ref={formElementRef} onSubmit={send}>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label" htmlFor="recipient">Employee or intern</label><select id="recipient" required className="form-select" value={form.recipient_user_id} onChange={(e) => setForm({ ...form, recipient_user_id: e.target.value })}><option value="">Select recipient</option>{people.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email} — {p.role}{p.job_title ? ` · ${p.job_title}` : ''}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label" htmlFor="doc-title">Document title</label><input id="doc-title" className="form-control" required maxLength="255" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Offer letter — AI Automation" /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="doc-type">Document type</label><select id="doc-type" className="form-select" value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}><option value="OFFER_LETTER">Offer letter</option><option value="APPOINTMENT_LETTER">Appointment letter</option><option value="INTERNSHIP_CERTIFICATE">Internship certificate</option><option value="EMPLOYMENT_CERTIFICATE">Employment certificate</option><option value="EXPERIENCE_LETTER">Experience letter</option><option value="OTHER">Other</option></select></div>
          <div className="col-md-6"><label className="form-label" htmlFor="doc-file">PDF file (up to 7 MB)</label><input id="doc-file" type="file" accept="application/pdf,.pdf" required className="form-control" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /></div>
        </div>
        <button type="submit" className="btn btn-primary mt-3" disabled={saving || people.length === 0}>{saving ? 'Sending…' : 'Send to portal'}</button>
      </form>
    </div></section>
    <section className="card"><div className="cardHeader"><h3 className="cardTitle">Previously sent ({documents.length})</h3></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Document</th><th>Recipient</th><th>Type</th><th>Sent</th><th /></tr></thead><tbody>{documents.length === 0 ? <tr><td colSpan="5" className="text-center text-muted p-4">No documents sent yet.</td></tr> : documents.map((doc) => <tr key={doc.id}><td>{doc.title}<div className="small text-muted">{doc.original_filename}</div></td><td>{doc.recipient_name || doc.recipient_email} <span className="badge bg-light text-dark">{doc.recipient_role}</span></td><td>{doc.document_type.replaceAll('_', ' ')}</td><td>{new Date(doc.created_at).toLocaleDateString()}</td><td><button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => download(doc)}>Download</button></td></tr>)}</tbody></table></div></section>
  </AdminPage>;
}
