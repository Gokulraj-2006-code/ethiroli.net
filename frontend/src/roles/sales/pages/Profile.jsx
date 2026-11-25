import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import { useAuth } from '../../../common/contexts/AuthContext.jsx';
import salesPortalApi, { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { FieldError, FormAlert, StatusBadge, SuccessAlert } from '../components/SalesUi.jsx';
import { formatDateTime, labelize } from '../utils/salesFormat.js';

const initialForm = () => ({ full_name: '', phone: '', avatar_url: '' });

const Fact = ({ label, children }) => (
  <div>
    <span className="sales-fact-label">{label}</span>
    <span className="sales-fact-value">{children ?? '—'}</span>
  </div>
);

export default function Profile() {
  const { updateProfile, user: sessionUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm());
  const [fieldErrors, setFieldErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesPortalApi.getMyProfile();
      const user = result?.user || result;
      setProfile(user || null);
      setForm({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        avatar_url: user?.avatar_url || '',
      });
      setFieldErrors({});
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancelEdit = () => {
    setEditing(false);
    setForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      avatar_url: profile?.avatar_url || '',
    });
    setFieldErrors({});
    setFormError(null);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await salesPortalApi.updateMyProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        avatar_url: form.avatar_url.trim(),
      });
      updateProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        avatar_url: form.avatar_url.trim() || null,
      });
      setNotice('Your profile has been updated.');
      setEditing(false);
      await load();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      setFormError(salesErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const avatar = profile?.avatar_url || sessionUser?.avatar_url;
  const role = profile?.role || sessionUser?.role;

  return (
    <AdminPage
      title="My Profile"
      subtitle="Your account identity and contact details. Email and role are managed by administration."
      loading={loading}
      error={error}
      onRetry={load}
      actions={
        !editing && (
          <button type="button" className="btn btn-outline-primary" onClick={() => setEditing(true)}>
            <i className="bi bi-pencil me-2" aria-hidden="true"></i>Edit profile
          </button>
        )
      }
    >
      <SuccessAlert message={notice} onDismiss={() => setNotice('')} />
      <FormAlert error={formError} />

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              {avatar ? (
                <img src={avatar} alt="Profile" className="rounded-circle mb-3" style={{ width: '96px', height: '96px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '96px', height: '96px' }}>
                  <i className="bi bi-person-badge fs-1 text-secondary" aria-hidden="true"></i>
                </div>
              )}
              <h5 className="fw-bold mb-1">{profile?.full_name || sessionUser?.full_name || '—'}</h5>
              <p className="text-muted small mb-2">{profile?.email || '—'}</p>
              <StatusBadge status={role} children={labelize(role)} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="sales-section-title mb-0">Account details</h6>
            </div>
            <div className="card-body">
              <form onSubmit={save} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="sales-profile-name">Full name</label>
                  {editing ? (
                    <input
                      id="sales-profile-name"
                      className={`form-control ${fieldErrors.full_name ? 'is-invalid' : ''}`}
                      value={form.full_name}
                      onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                      required
                    />
                  ) : (
                    <div className="form-control-plaintext">{profile?.full_name || '—'}</div>
                  )}
                  <FieldError message={fieldErrors.full_name} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="sales-profile-email">Email (read-only)</label>
                  <input id="sales-profile-email" className="form-control bg-light" value={profile?.email || ''} disabled readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="sales-profile-phone">Phone</label>
                  {editing ? (
                    <input
                      id="sales-profile-phone"
                      type="tel"
                      className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    />
                  ) : (
                    <div className="form-control-plaintext">{profile?.phone || '—'}</div>
                  )}
                  <FieldError message={fieldErrors.phone} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="sales-profile-role">Role (read-only)</label>
                  <input id="sales-profile-role" className="form-control bg-light" value={labelize(role)} disabled readOnly />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="sales-profile-avatar">Avatar URL</label>
                  {editing ? (
                    <input
                      id="sales-profile-avatar"
                      className={`form-control ${fieldErrors.avatar_url ? 'is-invalid' : ''}`}
                      value={form.avatar_url}
                      onChange={(event) => setForm({ ...form, avatar_url: event.target.value })}
                      placeholder="Leave blank to remove the current photo"
                    />
                  ) : (
                    <div className="form-control-plaintext text-break">{profile?.avatar_url || '—'}</div>
                  )}
                  <FieldError message={fieldErrors.avatar_url} />
                </div>
                <div className="col-12">
                  <div className="sales-fact-grid mt-2">
                    <Fact label="Account status">{labelize(profile?.status)}</Fact>
                    <Fact label="Last login">{formatDateTime(profile?.last_login_at)}</Fact>
                  </div>
                </div>
                {editing && (
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
