import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../services/api/axiosInstance.js';

export default function ActivateAccount() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    if (password.length < 12) return setError('Use at least 12 characters for your password.');
    if (password !== confirmation) return setError('The passwords do not match.');
    setSaving(true);
    try {
      const response = await axiosInstance.post('/v1/auth/activate', { token: params.get('token') || '', password });
      setMessage(response?.data?.message || 'Account activated. You can now sign in.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'This activation link is invalid or expired. Contact HR for a new invitation.');
    } finally { setSaving(false); }
  };

  return <main className="container py-5" style={{ maxWidth: 520 }}>
    <section className="card shadow-sm border-0"><div className="card-body p-4 p-md-5">
      <img src="/assets/images/ethiroli_logo.png" alt="Ethiroli" style={{ maxWidth: 190, maxHeight: 64, objectFit: 'contain' }} className="mb-4" />
      <h1 className="h3">Activate your account</h1>
      <p className="text-secondary">Set a password to finish your Ethiroli account setup. Use at least 12 characters.</p>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message ? <div className="alert alert-success" role="status">{message} <Link to="/auth/login">Sign in</Link></div> : <form onSubmit={submit}>
        <label className="form-label" htmlFor="activation-password">New password</label>
        <input id="activation-password" className="form-control mb-3" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label className="form-label" htmlFor="activation-confirmation">Confirm password</label>
        <input id="activation-confirmation" className="form-control mb-4" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
        <button className="btn btn-primary w-100" disabled={saving}>{saving ? 'Activating…' : 'Set password and activate'}</button>
      </form>}
    </div></section>
  </main>;
}
