import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const payload = (response) => response?.data?.data ?? response?.data;

export default function PersonnelDirectory({ kind }) {
  const intern = kind === 'intern';
  const [people, setPeople] = useState([]);
  const [structure, setStructure] = useState({ branches: [], departments: [], subRoles: [], managers: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [deactivationRequest, setDeactivationRequest] = useState(null); // { user_id, full_name }
  const [deactivationReason, setDeactivationReason] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', employee_code: '', phone: '', branch_id: '', department_id: '', sub_role_id: '', reporting_manager_id: '', date_of_joining: '', start_date: '', end_date: '', employment_type: intern ? 'Intern' : 'Employee', password: '', confirm_password: '' });

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [directoryResponse, structureResponse] = await Promise.all([
        axiosInstance.get('/v1/org/directory'),
        axiosInstance.get('/v1/org/structure')
      ]);
      setPeople((payload(directoryResponse) || []).filter((person) => person.employment_type === (intern ? 'Intern' : 'Employee')));
      setStructure(payload(structureResponse) || { branches: [], departments: [], subRoles: [], managers: [] });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load the organization directory. Confirm migration 023 is applied.');
    } finally { setLoading(false); }
  }, [intern]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return people.filter((person) => !term || [person.full_name, person.employee_code, person.department_name, person.sub_role, person.branch_name].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [people, search]);

  const selectedDepartment = Number(form.department_id);
  const subRoles = structure.subRoles.filter((role) => Number(role.department_id) === selectedDepartment);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setSaving(true);
    if (!editing) {
      if (!form.password || form.password.length < 8) { setError('Password must contain at least 8 characters.'); setSaving(false); return; }
      if (form.password !== form.confirm_password) { setError('Passwords do not match.'); setSaving(false); return; }
    }

    try {
      const isIntern = form.employment_type === 'Intern';
      const body = { ...form };
      delete body.start_date; delete body.end_date;
      if (isIntern) { delete body.date_of_joining; body.start_date = form.start_date; body.end_date = form.end_date; }
      const response = editing
        ? await axiosInstance.patch(`${isIntern ? '/v1/interns' : '/v1/employees'}/${encodeURIComponent(editing.profile_id)}`, body)
        : await axiosInstance.post('/v1/hr/employees', body);
      const result = payload(response);
      setNotice(editing ? 'Personnel assignment updated.' : 'Account created. Provide the email and password to the employee. They must change password on first login.');
      setShowForm(false);
      setEditing(null);
      setForm({ full_name: '', email: '', employee_code: '', phone: '', branch_id: '', department_id: '', sub_role_id: '', reporting_manager_id: '', date_of_joining: '', start_date: '', end_date: '' });
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this personnel record.');
    } finally { setSaving(false); }
  };

  const inspect = async (person) => {
    setDetail({ loading: true, person });
    try { setDetail(payload(await axiosInstance.get(`/v1/org/people/${encodeURIComponent(person.user_id)}`))); }
    catch (requestError) { setDetail({ error: requestError.response?.data?.message || 'Unable to load this record.' }); }
  };

  const resend = async (event, person) => {
    event.stopPropagation(); setError(''); setNotice('');
    try {
      const response = await axiosInstance.post(`/v1/hr/onboarding/accounts/${encodeURIComponent(person.user_id)}/resend`);
      const result = payload(response);
      setNotice(result?.invitationSent ? `Activation invitation resent to ${person.full_name}.` : 'Email delivery is unavailable. The account remains inactive.');
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not resend the activation invitation.'); }
  };

  const setActive = async (event, person) => {
    event.stopPropagation(); setError(''); setNotice('');
    const nextActive = !person.is_active;
    try {
      const base = intern ? '/v1/interns' : '/v1/employees';
      await axiosInstance.patch(`${base}/${encodeURIComponent(person.profile_id)}`, { is_active: nextActive });
      setNotice(nextActive ? 'Account reactivated.' : 'Account deactivated and archived; history is retained.');
      await refresh();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update account status.'); }
  };

  const submitDeactivationRequest = async () => {
    if (!deactivationRequest || !deactivationReason.trim()) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await axiosInstance.post('/v1/deactivation-requests', {
        user_id: deactivationRequest.user_id,
        reason: deactivationReason.trim()
      });
      setNotice(`Deactivation request submitted for ${deactivationRequest.full_name}.`);
      setDeactivationRequest(null);
      setDeactivationReason('');
      await refresh();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to submit deactivation request.'); }
    finally { setSaving(false); }
  };

  return <AdminPage title={intern ? 'Intern directory' : 'Employee directory'} subtitle="Database-backed personnel and organizational assignments" loading={loading} error={error} onRetry={refresh}
    actions={<button className="btn btn-primary" onClick={() => setShowForm(true)}><i className="bi bi-person-plus me-1" />Add {intern ? 'intern' : 'employee'}</button>}>
    {notice && <div className="alert alert-info" role="status">{notice}</div>}
    <div className="card shadow-sm"><div className="card-header bg-white d-flex flex-wrap gap-2 justify-content-between align-items-center">
      <h2 className="h6 mb-0">{intern ? 'Interns' : 'Employees'} <span className="text-secondary fw-normal">({filtered.length})</span></h2>
      <input className="form-control" style={{ maxWidth: 320 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, ID, division, branch" aria-label="Search directory" />
    </div><div className="table-responsive"><table className="table table-hover align-middle mb-0">
      <thead><tr><th>Name</th><th>Employee ID</th><th>Branch</th><th>Division</th><th>Sub-role</th><th>Start date</th><th>Account</th><th>Action</th></tr></thead>
      <tbody>{filtered.map((person) => <tr key={person.user_id} role="button" tabIndex={0} onClick={() => inspect(person)} onKeyDown={(event) => event.key === 'Enter' && inspect(person)}>
        <td>{person.full_name}{intern && <span className="badge text-bg-info ms-2">Intern</span>}</td><td>{person.employee_code || '—'}</td><td>{person.branch_name || 'Unassigned'}</td><td>{person.department_name || person.department || 'Unassigned'}</td><td>{person.sub_role || 'Unassigned'}</td><td>{String(person.start_date || '').slice(0, 10) || '—'}</td><td>{person.account_status === 'ARCHIVED' ? 'INACTIVE' : (person.account_status || 'ACTIVE')}</td><td className="d-flex gap-1"><button className="btn btn-sm btn-outline-secondary" onClick={(event) => { event.stopPropagation(); setEditing(person); setForm({ full_name: person.full_name || '', email: person.email || '', employee_code: person.employee_code || '', phone: person.phone || '', branch_id: person.branch_id || '', department_id: person.department_id || '', sub_role_id: person.sub_role_id || '', reporting_manager_id: person.reporting_manager_id || '', date_of_joining: String(person.date_of_joining || '').slice(0,10), start_date: String(person.start_date || '').slice(0,10), end_date: String(person.end_date || '').slice(0,10) }); setShowForm(true); }}>Edit</button>{person.account_status !== 'ARCHIVED' && (
  <button className="btn btn-sm btn-outline-danger" onClick={(event) => { event.stopPropagation(); setDeactivationRequest({ user_id: person.user_id, full_name: person.full_name }); setDeactivationReason(''); }}>Request Deactivation</button>
)}{person.account_status === 'ARCHIVED' && (
  <button className="btn btn-sm btn-outline-success" onClick={(event) => setActive(event, person)}>Reactivate</button>
)}</td>
      </tr>)}</tbody>
    </table>{!filtered.length && !loading && <div className="text-secondary text-center p-4">No matching personnel records.</div>}</div></div>

    {showForm && <div className="modal d-block" role="dialog" aria-modal="true" aria-label={`Register ${intern ? 'intern' : 'employee'}`} style={{ background: '#0007', overflowY: 'auto' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered"><div className="modal-content"><form onSubmit={submit}>
        <div className="modal-header"><h2 className="modal-title h5">{editing ? 'Edit personnel assignment' : `Register ${intern ? 'intern' : 'employee'}`}</h2><button type="button" className="btn-close" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close" /></div>
        <div className="modal-body"><p className="small text-secondary">An activation email sets the account password. No password is created or shown to HR.</p>
          <div className="row g-3">
            {!editing && <><Field label="Full name" required><input className="form-control" required maxLength={255} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
            <Field label="Work email" required><input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></>}
            <Field label="Employee ID" required><input className="form-control" required maxLength={50} readOnly={Boolean(editing)} value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} /></Field>
            <Field label="Mobile number" required><input className="form-control" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Password" required={!editing}><input className="form-control" type="password" required={!editing} minLength={editing ? undefined : 8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{!editing && <div className="form-text">Password must contain at least 8 characters.</div>}</Field>
            <Field label="Confirm Password" required><input className="form-control" type="password" required value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} /></Field>
            <Field label="Employee Type" required><select className="form-select" required value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })}><option value="Employee">Employee</option><option value="Intern">Intern</option></select></Field>
            <Field label="Branch" required><select className="form-select" required value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}><option value="">Select branch</option>{structure.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></Field>
            <Field label="Division" required><select className="form-select" required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value, sub_role_id: '' })}><option value="">Select division</option>{structure.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></Field>
            <Field label="Sub-role" required><select className="form-select" required value={form.sub_role_id} onChange={(e) => setForm({ ...form, sub_role_id: e.target.value })}><option value="">Select sub-role</option>{subRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></Field>
            <Field label="Reporting manager"><select className="form-select" value={form.reporting_manager_id} onChange={(e) => setForm({ ...form, reporting_manager_id: e.target.value })}><option value="">Not assigned</option>{structure.managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.full_name}</option>)}</select></Field>
            {form.employment_type === 'Intern' ? <Field label="Internship start" required><input className="form-control" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field> : <Field label="Joining date" required><input className="form-control" type="date" required value={form.date_of_joining} onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })} /></Field>}
{form.employment_type === 'Intern' && <Field label="Internship end" required><input className="form-control" type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>}
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save assignment' : 'Save and invite'}</button></div>
      </form></div></div>
    </div>}

    {deactivationRequest && <div className="modal d-block" role="dialog" aria-modal="true" aria-label="Request Deactivation" style={{ background: '#0007', overflowY: 'auto' }}>
      <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
        <div className="modal-header"><h2 className="modal-title h5">Request Deactivation</h2><button type="button" className="btn-close" onClick={() => { setDeactivationRequest(null); setDeactivationReason(''); }} aria-label="Close" /></div>
        <div className="modal-body">
          <p className="small text-secondary">Request deactivation for <strong>{deactivationRequest.full_name}</strong>.</p>
          <div className="row g-3">
            <Field label="Reason (required)" required><textarea className="form-control" required rows={3} value={deactivationReason} onChange={(e) => setDeactivationReason(e.target.value)} /></Field>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => { setDeactivationRequest(null); setDeactivationReason(''); }}>Cancel</button><button type="button" className="btn btn-danger" disabled={saving || !deactivationReason.trim()} onClick={submitDeactivationRequest}>{saving ? 'Submitting…' : 'Submit Request'}</button></div>
      </div></div>
    </div>}

    {detail && <div className="modal d-block" role="dialog" aria-modal="true" aria-label="Personnel record" style={{ background: '#0007', overflowY: 'auto' }}><div className="modal-dialog modal-xl modal-dialog-scrollable"><div className="modal-content">
      <div className="modal-header"><h2 className="modal-title h5">{detail.loading ? 'Loading…' : detail.error || `${detail.person?.full_name || 'Personnel'} · Read only`}</h2><button className="btn-close" onClick={() => setDetail(null)} aria-label="Close" /></div>
      <div className="modal-body">{detail.loading ? 'Loading…' : detail.error ? <div className="alert alert-danger">{detail.error}</div> : <>
        <p>{detail.person?.employment_type} · {detail.person?.branch_name || 'Unassigned branch'} · {detail.person?.department_name || 'Unassigned division'} · {detail.person?.sub_role || 'Unassigned sub-role'}</p>
        <h3 className="h6">Tasks</h3>{detail.tasks?.map((task) => <div className="border-bottom py-2" key={task.id}>{task.description}<span className="text-secondary ms-2">{task.status} · Due {String(task.due_date).slice(0,10)}</span></div>)}
        <h3 className="h6 mt-4">Attendance history</h3><div className="table-responsive"><table className="table table-sm"><thead><tr><th>Date</th><th>Status</th><th>Check in</th><th>Check out</th></tr></thead><tbody>{detail.attendance?.map((row, idx) => <tr key={`${row.date}-${idx}`}><td>{String(row.date).slice(0,10)}</td><td>{row.status}</td><td>{row.check_in_time || '—'}</td><td>{row.check_out_time || '—'}</td></tr>)}</tbody></table></div>
        <h3 className="h6 mt-3">Leave history</h3>{detail.leaves?.map((leave, index) => <div className="border-bottom py-2" key={index}>{leave.leave_type} · {String(leave.start_date).slice(0,10)} – {String(leave.end_date).slice(0,10)} · {leave.status}</div>)}
      </>}</div></div></div></div>}
  </AdminPage>;
}

function Field({ label, required, children }) { return <div className="col-sm-6"><label className="form-label">{label}{required ? ' *' : ''}</label>{children}</div>; }
