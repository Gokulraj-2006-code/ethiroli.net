import React, { useState, useEffect, useCallback } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import { useAuth } from '../../../common/hooks/useAuth.js';

const TABS = [
  { key: 'salary', label: 'Salary & Extra-Duty Payments' },
  { key: 'referral', label: 'Project Referral Commission' },
  { key: 'investment', label: 'Investment & Withdrawal' },
];

export default function Income() {
  const { user } = useAuth();
  const [tab, setTab] = useState('salary');
  const [salary, setSalary] = useState(null);
  const [extraDuty, setExtraDuty] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [investments, setInvestments] = useState({ requests: [], config: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, e, r, i] = await Promise.all([
        axiosInstance.get('/v1/earnings/salary'),
        axiosInstance.get('/v1/earnings/extra-duty'),
        axiosInstance.get('/v1/earnings/referrals'),
        axiosInstance.get('/v1/earnings/investments'),
      ]);
      setSalary(s?.data?.data ?? s?.data ?? null);
      setExtraDuty(e?.data?.data ?? e?.data ?? []);
      setReferrals(r?.data?.data ?? r?.data ?? []);
      setInvestments(i?.data?.data ?? i?.data ?? { requests: [], config: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load income data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalExtra = extraDuty.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalReferral = referrals.reduce((s, r) => s + Number(r.commission_amount || 0), 0);

  return (
    <AdminPage title="Income" subtitle="Your earnings, commissions, and investment requests (private to you)." loading={loading} error={error} onRetry={loadAll}>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'salary' && (
        <div className="card p-3">
          <h5 className="mb-2">Salary & Extra-Duty Payments</h5>
          {salary ? (
            <p className="text-muted small">Monthly salary: ₹{Number(salary.monthly_salary || 0).toLocaleString()} · Stipend: ₹{Number(salary.stipend || 0).toLocaleString()}</p>
          ) : (
            <p className="text-muted small">No salary configuration found. Contact HR.</p>
          )}
          <p className="text-muted small">Approved extra duty total: ₹{totalExtra.toLocaleString()}</p>
          <table className="table table-sm"><thead><tr><th>Date</th><th>Hours</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {extraDuty.length === 0 ? <tr><td colSpan="4" className="text-muted">No extra-duty records yet.</td></tr> :
              extraDuty.map((r) => <tr key={r.id}><td>{String(r.work_date).slice(0,10)}</td><td>{r.hours}</td><td>₹{Number(r.amount).toLocaleString()}</td><td>{r.status}</td></tr>)}
          </tbody></table>
        </div>
      )}

      {tab === 'referral' && (
        <div className="card p-3">
          <h5 className="mb-2">Project Referral Commission</h5>
          <p className="text-muted small">Total potential commission: ₹{totalReferral.toLocaleString()} (10% of eligible project value, pending approval).</p>
          <table className="table table-sm"><thead><tr><th>Project</th><th>Value</th><th>Rate</th><th>Commission</th><th>Status</th></tr></thead>
          <tbody>
            {referrals.length === 0 ? <tr><td colSpan="5" className="text-muted">No referral records yet.</td></tr> :
              referrals.map((r) => <tr key={r.id}><td>{r.project_name}</td><td>₹{Number(r.project_value).toLocaleString()}</td><td>{r.commission_rate}%</td><td>₹{Number(r.commission_amount).toLocaleString()}</td><td>{r.status}</td></tr>)}
          </tbody></table>
        </div>
      )}

      {tab === 'investment' && (
        <div className="card p-3">
          <h5 className="mb-2">Investment & Withdrawal</h5>
          <p className="text-muted small">Proposed 2% return is <strong>disabled</strong> until management confirms rate period and terms. No guaranteed returns.</p>
          <p className="text-muted small text-danger">Real-money transactions require approved legal, accounting, and payment processes.</p>
          <table className="table table-sm"><thead><tr><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {(investments.requests || []).length === 0 ? <tr><td colSpan="4" className="text-muted">No investment/withdrawal requests yet.</td></tr> :
              (investments.requests || []).map((r) => <tr key={r.id}><td>{r.request_type}</td><td>₹{Number(r.amount).toLocaleString()}</td><td>{String(r.created_at).slice(0,10)}</td><td>{r.status}</td></tr>)}
          </tbody></table>
        </div>
      )}
    </AdminPage>
  );
}
