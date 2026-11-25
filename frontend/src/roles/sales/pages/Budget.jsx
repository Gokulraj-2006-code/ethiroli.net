import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import salesPortalApi, { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { EmptyState } from '../components/SalesUi.jsx';
import { asArray, formatDate, formatMoney, labelize, progressPercent } from '../utils/salesFormat.js';

const Stat = ({ label, value, tone = '' }) => (
  <div className={`sales-stat ${tone}`}>
    <span className="sales-stat__label">{label}</span>
    <span className="sales-stat__value">{value}</span>
  </div>
);

export default function Budget() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesPortalApi.getSalesBudget();
      setBudget(result || null);
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const configured = Boolean(budget?.configured);
  const currency = budget?.currency;
  const money = (value) => (configured ? formatMoney(value, currency) : '—');
  const allocations = asArray(budget?.allocations);
  const usage = configured && Number(budget?.allocated) > 0
    ? (Math.max(Number(budget?.committed) || 0, Number(budget?.spent) || 0) / Number(budget.allocated)) * 100
    : 0;

  return (
    <AdminPage
      title="Sales Budget"
      subtitle="Read-only view of the approved annual allocation funding Sales projects and expenses."
      loading={loading}
      error={error}
      onRetry={load}
    >
      {!configured ? (
        <div className="card border-0 shadow-sm">
          <EmptyState
            icon="bi-wallet2"
            title="No Sales allocation configured"
            message="An approved annual budget with an active Sales allocation is required before orders can be converted."
          />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-lg-3"><Stat label="Fiscal year" value={`FY ${budget.fiscal_year || '—'}`} tone="sales-stat--info" /></div>
            <div className="col-12 col-sm-6 col-lg-3"><Stat label="Allocated" value={money(budget.allocated)} tone="sales-stat--accent" /></div>
            <div className="col-12 col-sm-6 col-lg-3"><Stat label="Committed" value={money(budget.committed)} tone="sales-stat--warning" /></div>
            <div className="col-12 col-sm-6 col-lg-3"><Stat label="Available" value={money(budget.available)} /></div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="sales-section-title mb-0">Allocation usage</h6>
                <span className="sales-progress-label">{formatMoney(budget.spent, currency)} approved expenses</span>
              </div>
              <div className="sales-progress" role="progressbar" aria-valuenow={progressPercent(usage)} aria-valuemin="0" aria-valuemax="100">
                <span style={{ width: `${progressPercent(usage)}%` }} />
              </div>
              <div className="small text-muted mt-2">
                Available is the allocation less the larger of committed project cost and approved expenses.
                Latest allocation: {formatDate(budget.latest_allocation_date)}.
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white"><h6 className="sales-section-title mb-0">Allocation history</h6></div>
            {allocations.length === 0 ? (
              <EmptyState icon="bi-clock-history" title="No allocation history" message="Allocations made by administration will be listed here." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr><th>Allocation date</th><th>Amount</th><th>Allocated by</th><th>Description</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {allocations.map((allocation) => (
                      <tr key={allocation.id}>
                        <td>{formatDate(allocation.allocation_date)}</td>
                        <td className="fw-semibold">{formatMoney(allocation.allocated_amount, currency)}</td>
                        <td>{allocation.allocated_by_name || '—'}</td>
                        <td>{allocation.description || '—'}</td>
                        <td><StatusBadge status={allocation.status || 'ACTIVE'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {budget.total_budget !== undefined && (
            <p className="small text-muted mt-3 mb-0">
              Annual budget: {formatMoney(budget.total_budget, currency)} · {labelize(budget.status || 'APPROVED')}
            </p>
          )}
        </>
      )}
    </AdminPage>
  );
}
