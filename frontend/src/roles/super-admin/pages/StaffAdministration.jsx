import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const payload = (response) => response?.data?.data ?? response?.data;

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  role: 'HR',
  branch_id: '',
  department: '',
  designation: '',
  joining_date: '',
  password: '',
  confirm_password: '',
  is_active: true,
};

export default function StaffAdministration() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [staffRes, overviewRes] = await Promise.all([
        axiosInstance.get('/v1/staff'),
        axiosInstance.get('/v1/org/overview'),
      ]);
      setStaff(payload(staffRes) || []);
      setBranches(payload(overviewRes)?.branches || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load staff accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return staff.filter((person) => !term || [person.full_name, person.email, person.role, person.branch_name].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [staff, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const openEdit = (person) => {
    setEditing(person);
    setForm({
      full_name: person.full_name || '',
      email: person.email || '',
      phone: person.phone || '',
      role: person.role || 'HR',
      branch_id: person.branch_id || '',
      department: person.department || '',
      designation: person.designation || '',
      joining_date: person.joining_date || '',
      password: '',
      confirm_password: '',
      is_active: person.is_active !== 0 && person.is_active !== false,
    });
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    if (!form.branch_id) {
      setError('Branch is required.');
      return;
    }
    if (!form.department.trim() || !form.designation.trim()) {
      setError('Department and designation are required.');
      return;
    }
    if (form.password.trim() && form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!editing && !form.password.trim()) {
      setError('Password is required when creating an account.');
      return;
    }
    if (form.password.trim() && form.password.trim().length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        role: form.role,
        branch_id: form.branch_id,
        department: form.department.trim(),
        designation: form.designation.trim(),
        joining_date: form.joining_date || null,
        is_active: form.is_active,
      };
      if (form.password.trim()) body.password = form.password.trim();
      if (form.password.trim()) body.confirm_password = form.confirm_password.trim();
      if (editing) {
        await axiosInstance.patch(`/v1/staff/${encodeURIComponent(editing.id)}`, body);
        setNotice('Staff account updated successfully.');
      } else {
        await axiosInstance.post('/v1/staff', { ...body, password: form.password.trim() });
        setNotice('Staff account created successfully.');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save staff account.');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (person) => {
    if (!window.confirm(`Deactivate ${person.full_name || 'this account'}?`)) return;
    try {
      await axiosInstance.patch(`/v1/staff/${encodeURIComponent(person.id)}/deactivate`);
      setNotice('Staff account deactivated.');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to deactivate account.');
    }
  };

  const activate = async (person) => {
    try {
      await axiosInstance.patch(`/v1/staff/${encodeURIComponent(person.id)}/activate`);
      setNotice('Staff account activated.');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to activate account.');
    }
  };

  return (
    <AdminPage title="Staff Administration" subtitle="Create, edit, update, activate and deactivate HR and Manager accounts." loading={loading} error={error} onRetry={load} actions={<button type="button" className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add staff</button>}>
      {notice && <div className="alert alert-success">{notice}</div>}
      <div className="mb-3"><input className="form-control" style={{ maxWidth: 320 }} placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="card"><div className="table-responsive"><table className="table table-sm mb-0 align-middle">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
        <tbody>
          {filtered.map((person) => (
            <tr key={person.id}>
              <td>{person.full_name || '—'}</td>
              <td>{person.email || '—'}</td>
              <td><span className={`badge ${person.role === 'PROJECT_MANAGER' ? 'text-bg-info' : 'text-bg-secondary'}`}>{person.role === 'PROJECT_MANAGER' ? 'Manager' : 'HR'}</span></td>
              <td>{person.branch_name || '—'}</td>
              <td><span className={`badge ${person.is_active ? 'text-bg-success' : 'text-bg-danger'}`}>{person.is_active ? 'Active' : 'Inactive'}</span></td>
              <td className="text-end">
                <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(person)}>Edit</button>
                {person.is_active ? (
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deactivate(person)}>Deactivate</button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline-success" onClick={() => activate(person)}>Activate</button>
                )}
              </td>
            </tr>
          ))}
          {!filtered.length && <tr><td colSpan="6" className="text-center text-muted p-3">No staff accounts found.</td></tr>}
        </tbody>
      </table></div></div>

      {showForm && (
        <div className="modal d-block" role="dialog" aria-modal="true" style={{ background: '#0007', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <form className="modal-content" onSubmit={submit}>
              <div className="modal-header">
                <h2 className="modal-title h5">{editing ? 'Edit staff account' : 'Create staff account'}</h2>
                <button type="button" className="btn-close" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close" />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <Field label="Full name" required><input className="form-control" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
                  <Field label="Email" required><input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                  <Field label="Phone"><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                  <Field label="Role" required>
                    <select className="form-select" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="HR">HR</option>
                      <option value="PROJECT_MANAGER">Manager</option>
                    </select>
                  </Field>
                  <Field label="Branch" required>
                    <select className="form-select" required value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                      <option value="">Select branch</option>
                      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Department" required><input className="form-control" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
                  <Field label="Designation" required><input className="form-control" required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
                  <Field label="Joining date"><input className="form-control" type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} /></Field>
                  <Field label={editing ? 'New password (optional)' : 'Password'} required={!editing}>
                    <input className="form-control" type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </Field>
                  {!editing && <Field label="Confirm password" required>
                    <input className="form-control" type="password" required value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} />
                  </Field>}
                  {editing && (
                    <Field label="Status">
                      <select className="form-select" value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </Field>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update account' : 'Create account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function Field({ label, required, children }) {
  return <div className="col-sm-6"><label className="form-label">{label}{required ? ' *' : ''}</label>{children}</div>;
}