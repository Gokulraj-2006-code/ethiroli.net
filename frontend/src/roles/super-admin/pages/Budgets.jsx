import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import {
  allocatePanel,
  apiMessage,
  approveBudget,
  asArray,
  createBudget,
  formatDate,
  formatMoney,
  getBudget,
  getBudgetHistory,
  labelize,
  listBudgets,
  reviseAllocation,
  reviseBudget,
} from '../api/oversightApi.js';

const EMPTY_CREATE = { fiscal_year: '', total_amount: '', currency: '', description: '' };
const EMPTY_ALLOCATE = { allocated_amount: '', description: '' };

const StatusBadge = ({ status }) => {
  const tone = status === 'APPROVED' ? 'bg-success' : status === 'DRAFT' ? 'bg-secondary' : 'bg-warning text-dark';
  return <span className={`badge ${tone}`}>{labelize(status)}</span>;
};

const emptyHistory = { budget_revisions: [], allocation_revisions: [] };

export default function Budgets() {
  const { budgetId } = useParams();
  const [budgets, setBudgets] = useState([]);
  const [history, setHistory] = useState(emptyHistory);
  const [selectedId, setSelectedId] = useState(budgetId || '');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState('');
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [reviseForm, setReviseForm] = useState({ total_amount: '', description: '' });
  const [allocateForm, setAllocateForm] = useState(EMPTY_ALLOCATE);
  const [allocationEdits, setAllocationEdits] = useState({});
  const initializedDetailId = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, revisionHistory] = await Promise.all([listBudgets(), getBudgetHistory()]);
      setBudgets(rows);
      setHistory(revisionHistory || emptyHistory);
      setSelectedId((current) => {
        if (budgetId) return budgetId;
        if (current && rows.some((row) => String(row.id) === String(current))) return current;
        return rows[0]?.id || '';
      });
    } catch (requestError) {
      setError(apiMessage(requestError, 'Unable to load annual budgets.'));
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  const loadDetail = useCallback(async () => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const record = await getBudget(selectedId);
      setDetail(record || null);
    } catch (requestError) {
      setDetail(null);
      setNotice({ type: 'error', text: apiMessage(requestError, 'Unable to load budget detail.') });
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!loading) loadDetail(); }, [loadDetail, loading]);

  useEffect(() => {
    if (!detail) {
      initializedDetailId.current = null;
      return;
    }
    if (initializedDetailId.current === detail.id) return;
    initializedDetailId.current = detail.id;
    setReviseForm({ total_amount: detail.total_amount ?? '', description: '' });
    setAllocateForm(EMPTY_ALLOCATE);
    setAllocationEdits(Object.fromEntries(asArray(detail.allocations).map((allocation) => [
      allocation.id,
      { allocated_amount: allocation.allocated_amount ?? '', description: '' },
    ])));
  }, [detail]);

  const runAction = async (key, work, successMessage, afterSuccess) => {
    setBusy(key);
    setNotice(null);
    try {
      await work();
      setNotice({ type: 'success', text: successMessage });
      if (afterSuccess) afterSuccess();
      await Promise.all([load(), loadDetail()]);
    } catch (requestError) {
      setNotice({ type: 'error', text: apiMessage(requestError) });
    } finally {
      setBusy('');
    }
  };

  const positiveAmountError = (value, label) => {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? '' : `${label} must be greater than zero.`;
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const fiscalYear = createForm.fiscal_year.trim();
    if (!/^\d{4}(-\d{4})?$/.test(fiscalYear)) {
      setNotice({ type: 'error', text: 'Enter a fiscal year such as 2026 or 2026-2027.' });
      return;
    }
    const amountError = positiveAmountError(createForm.total_amount, 'Total budget');
    if (amountError) {
      setNotice({ type: 'error', text: amountError });
      return;
    }
    runAction(
      'create',
      () => createBudget({
        fiscal_year: fiscalYear,
        total_amount: Number(createForm.total_amount),
        currency: createForm.currency.trim() || undefined,
        description: createForm.description.trim() || undefined,
      }),
      'Annual budget created as a draft.',
      () => setCreateForm(EMPTY_CREATE)
    );
  };

  const handleApprove = (budget) => {
    runAction(
      `approve:${budget.id}`,
      () => approveBudget(budget.id),
      `${budget.fiscal_year} approved and available for allocation.`
    );
  };

  const handleReviseBudget = (event) => {
    event.preventDefault();
    const amountError = positiveAmountError(reviseForm.total_amount, 'New total');
    if (amountError) {
      setNotice({ type: 'error', text: amountError });
      return;
    }
    if (!reviseForm.description.trim()) {
      setNotice({ type: 'error', text: 'A revision reason is required.' });
      return;
    }
    runAction(
      'revise-budget',
      () => reviseBudget(selectedId, {
        total_amount: Number(reviseForm.total_amount),
        description: reviseForm.description.trim(),
      }),
      'Annual budget revised.',
      () => setReviseForm((form) => ({ ...form, description: '' }))
    );
  };

  const handleAllocate = (event) => {
    event.preventDefault();
    const amountError = positiveAmountError(allocateForm.allocated_amount, 'Allocated amount');
    if (amountError) {
      setNotice({ type: 'error', text: amountError });
      return;
    }
    if (!selectedId) {
      setNotice({ type: 'error', text: 'Select an annual budget first.' });
      return;
    }
    runAction(
      'allocate',
      () => allocatePanel({
        budget_id: selectedId,
        panel: 'SALES',
        allocated_amount: Number(allocateForm.allocated_amount),
        description: allocateForm.description.trim() || undefined,
      }),
      'Sales allocation recorded.',
      () => setAllocateForm(EMPTY_ALLOCATE)
    );
  };

  const handleReviseAllocation = (allocation) => {
    const edit = allocationEdits[allocation.id] || {};
    const amountError = positiveAmountError(edit.allocated_amount, 'New amount');
    if (amountError) {
      setNotice({ type: 'error', text: amountError });
      return;
    }
    if (!edit.description?.trim()) {
      setNotice({ type: 'error', text: 'A revision reason is required.' });
      return;
    }
    runAction(
      `revise-allocation:${allocation.id}`,
      () => reviseAllocation(allocation.id, {
        allocated_amount: Number(edit.allocated_amount),
        description: edit.description.trim(),
      }),
      'Sales allocation revised.',
      () => setAllocationEdits((edits) => ({
        ...edits,
        [allocation.id]: { ...edits[allocation.id], description: '' },
      }))
    );
  };

  const currencyFor = (fiscalYear) => (
    budgets.find((budget) => String(budget.fiscal_year) === String(fiscalYear))?.currency || detail?.currency
  );

  const allocations = asArray(detail?.allocations);
  const approved = detail?.status === 'APPROVED';
  const allocatedTotal = Number(detail?.allocated_total ?? allocations.reduce(
    (sum, allocation) => sum + Number(allocation.allocated_amount || 0), 0
  ));
  const remaining = Number(detail?.total_amount ?? 0) - allocatedTotal;

  return (
    <AdminPage
      title="Annual budgets"
      subtitle="Create, approve and revise annual budgets, and manage the Sales allocation."
      loading={loading}
      error={error}
      onRetry={load}
    >
      {notice && (
        <div className={`alert ${notice.type === 'error' ? 'alert-danger' : 'alert-success'}`} role="alert">
          {notice.text}
        </div>
      )}

      <section className="card shadow-sm mb-4">
        <div className="card-header bg-white"><h2 className="h6 mb-0">Create annual budget</h2></div>
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={handleCreate}>
            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label" htmlFor="budget-fiscal-year">Fiscal year</label>
              <input
                id="budget-fiscal-year"
                className="form-control"
                value={createForm.fiscal_year}
                onChange={(event) => setCreateForm({ ...createForm, fiscal_year: event.target.value })}
                placeholder="2026 or 2026-2027"
                required
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label" htmlFor="budget-total">Total amount</label>
              <input
                id="budget-total"
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                value={createForm.total_amount}
                onChange={(event) => setCreateForm({ ...createForm, total_amount: event.target.value })}
                required
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label" htmlFor="budget-currency">Currency <span className="text-secondary">(optional)</span></label>
              <input
                id="budget-currency"
                className="form-control"
                value={createForm.currency}
                onChange={(event) => setCreateForm({ ...createForm, currency: event.target.value })}
                placeholder="Accepted by the API"
              />
            </div>
            <div className="col-12 col-lg-4">
              <label className="form-label" htmlFor="budget-description">Description <span className="text-secondary">(optional)</span></label>
              <input
                id="budget-description"
                className="form-control"
                value={createForm.description}
                onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
              />
            </div>
            <div className="col-12 col-lg-2 d-grid">
              <button className="btn btn-primary" type="submit" disabled={busy === 'create'}>
                {busy === 'create' ? 'Creating…' : 'Create draft'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="card shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 className="h6 mb-0">Annual budgets</h2>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
        {budgets.length === 0 ? (
          <p className="text-secondary p-3 mb-0">No annual budgets have been recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fiscal year</th><th>Status</th><th>Total</th><th>Allocated</th><th>Unallocated</th>
                  <th>Revisions</th><th>Created by</th><th>Approved by</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => {
                  const left = Number(budget.total_amount || 0) - Number(budget.allocated_total || 0);
                  return (
                    <tr key={budget.id} className={String(budget.id) === String(selectedId) ? 'table-primary' : ''}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => setSelectedId(budget.id)}
                        >
                          {budget.fiscal_year || '—'}
                        </button>
                      </td>
                      <td><StatusBadge status={budget.status} /></td>
                      <td>{formatMoney(budget.total_amount, budget.currency)}</td>
                      <td>{formatMoney(budget.allocated_total, budget.currency)}</td>
                      <td className={left < 0 ? 'text-danger fw-semibold' : ''}>{formatMoney(left, budget.currency)}</td>
                      <td>{budget.revision_count ?? 0}</td>
                      <td>{budget.created_by_name || '—'}</td>
                      <td>{budget.approved_by_name || '—'}</td>
                      <td className="text-nowrap">
                        <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => setSelectedId(budget.id)}>
                          Manage
                        </button>
                        {budget.status !== 'APPROVED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(budget)}
                            disabled={busy === `approve:${budget.id}`}
                          >
                            {busy === `approve:${budget.id}` ? 'Approving…' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedId && (
        <section className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 className="h6 mb-0">
              {detailLoading ? 'Loading budget…' : `Budget ${detail?.fiscal_year || ''}`.trim()}
            </h2>
            {detail && <StatusBadge status={detail.status} />}
          </div>
          {detailLoading ? (
            <p className="text-secondary p-3 mb-0" role="status">Loading budget detail…</p>
          ) : !detail ? (
            <p className="text-secondary p-3 mb-0">Budget detail is unavailable.</p>
          ) : (
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Total</p><p className="h6 mb-0">{formatMoney(detail.total_amount, detail.currency)}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Allocated</p><p className="h6 mb-0">{formatMoney(allocatedTotal, detail.currency)}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Unallocated</p><p className={`h6 mb-0 ${remaining < 0 ? 'text-danger' : ''}`}>{formatMoney(remaining, detail.currency)}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Approved on</p><p className="h6 mb-0">{formatDate(detail.approved_at)}</p></div>
              </div>
              {detail.description && <p className="text-secondary small">{detail.description}</p>}

              <div className="row g-4">
                <div className="col-12 col-xl-6">
                  <h3 className="h6">Revise annual budget</h3>
                  <form onSubmit={handleReviseBudget} className="row g-2 align-items-end">
                    <div className="col-12 col-sm-5">
                      <label className="form-label" htmlFor="revise-total">New total</label>
                      <input
                        id="revise-total"
                        className="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                        value={reviseForm.total_amount}
                        onChange={(event) => setReviseForm({ ...reviseForm, total_amount: event.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-5">
                      <label className="form-label" htmlFor="revise-reason">Reason</label>
                      <input
                        id="revise-reason"
                        className="form-control"
                        value={reviseForm.description}
                        onChange={(event) => setReviseForm({ ...reviseForm, description: event.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-2 d-grid">
                      <button type="submit" className="btn btn-outline-primary" disabled={busy === 'revise-budget'}>Revise</button>
                    </div>
                  </form>

                  <h3 className="h6 mt-4">Allocate to Sales</h3>
                  {!approved ? (
                    <p className="text-secondary small">Approve this annual budget before creating a Sales allocation.</p>
                  ) : (
                    <form onSubmit={handleAllocate} className="row g-2 align-items-end">
                      <div className="col-12 col-sm-4">
                        <label className="form-label" htmlFor="allocate-amount">Amount</label>
                        <input
                          id="allocate-amount"
                          className="form-control"
                          type="number"
                          min="0"
                          step="0.01"
                          value={allocateForm.allocated_amount}
                          onChange={(event) => setAllocateForm({ ...allocateForm, allocated_amount: event.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="form-label" htmlFor="allocate-description">Description <span className="text-secondary">(optional)</span></label>
                        <input
                          id="allocate-description"
                          className="form-control"
                          value={allocateForm.description}
                          onChange={(event) => setAllocateForm({ ...allocateForm, description: event.target.value })}
                        />
                      </div>
                      <div className="col-12 col-sm-2 d-grid">
                        <button type="submit" className="btn btn-primary" disabled={busy === 'allocate'}>
                          {busy === 'allocate' ? 'Saving…' : 'Allocate'}
                        </button>
                      </div>
                      <div className="col-12"><p className="text-secondary small mb-0">Panel: SALES · Server rejects allocations above the unallocated annual budget.</p></div>
                    </form>
                  )}
                </div>

                <div className="col-12 col-xl-6">
                  <h3 className="h6">Sales allocations</h3>
                  {allocations.length === 0 ? (
                    <p className="text-secondary">No Sales allocations have been recorded for this budget.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr><th>Date</th><th>Amount</th><th>Allocated by</th><th>Revision</th></tr>
                        </thead>
                        <tbody>
                          {allocations.map((allocation) => {
                            const edit = allocationEdits[allocation.id] || {};
                            return (
                              <tr key={allocation.id}>
                                <td>{formatDate(allocation.allocation_date)}</td>
                                <td>{formatMoney(allocation.allocated_amount, detail.currency)}</td>
                                <td>{allocation.allocated_by_name || '—'}</td>
                                <td>
                                  <div className="d-flex gap-1 align-items-center flex-wrap">
                                    <input
                                      className="form-control form-control-sm"
                                      style={{ width: 110 }}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      aria-label={`New amount for allocation ${allocation.id}`}
                                      value={edit.allocated_amount ?? ''}
                                      onChange={(event) => setAllocationEdits((edits) => ({
                                        ...edits,
                                        [allocation.id]: { ...(edits[allocation.id] || {}), allocated_amount: event.target.value },
                                      }))}
                                    />
                                    <input
                                      className="form-control form-control-sm"
                                      style={{ width: 130 }}
                                      placeholder="Reason"
                                      aria-label={`Reason for allocation ${allocation.id}`}
                                      value={edit.description ?? ''}
                                      onChange={(event) => setAllocationEdits((edits) => ({
                                        ...edits,
                                        [allocation.id]: { ...(edits[allocation.id] || {}), description: event.target.value },
                                      }))}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleReviseAllocation(allocation)}
                                      disabled={busy === `revise-allocation:${allocation.id}`}
                                    >
                                      Revise
                                    </button>
                                  </div>
                                  {allocation.description && <div className="text-secondary small mt-1">{allocation.description}</div>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="card shadow-sm">
        <div className="card-header bg-white"><h2 className="h6 mb-0">Revision history</h2></div>
        <div className="card-body">
          <h3 className="h6">Annual budget revisions</h3>
          {history.budget_revisions.length === 0 ? (
            <p className="text-secondary">No annual budget revisions have been recorded.</p>
          ) : (
            <div className="table-responsive mb-4">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light"><tr><th>Fiscal year</th><th>Old total</th><th>New total</th><th>Reason</th><th>Revised by</th><th>Date</th></tr></thead>
                <tbody>
                  {history.budget_revisions.map((revision) => {
                    const currency = currencyFor(revision.fiscal_year);
                    return (
                      <tr key={revision.id}>
                        <td>{revision.fiscal_year || '—'}</td>
                        <td>{formatMoney(revision.old_total, currency)}</td>
                        <td>{formatMoney(revision.new_total, currency)}</td>
                        <td>{revision.reason || '—'}</td>
                        <td>{revision.revised_by_name || '—'}</td>
                        <td>{formatDate(revision.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="h6">Allocation revisions</h3>
          {history.allocation_revisions.length === 0 ? (
            <p className="text-secondary mb-0">No allocation revisions have been recorded.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light"><tr><th>Fiscal year</th><th>Panel</th><th>Old amount</th><th>New amount</th><th>Reason</th><th>Revised by</th><th>Date</th></tr></thead>
                <tbody>
                  {history.allocation_revisions.map((revision) => {
                    const currency = currencyFor(revision.fiscal_year);
                    return (
                      <tr key={revision.id}>
                        <td>{revision.fiscal_year || '—'}</td>
                        <td>{labelize(revision.panel || 'SALES')}</td>
                        <td>{formatMoney(revision.old_amount, currency)}</td>
                        <td>{formatMoney(revision.new_amount, currency)}</td>
                        <td>{revision.reason || '—'}</td>
                        <td>{revision.revised_by_name || '—'}</td>
                        <td>{formatDate(revision.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminPage>
  );
}
