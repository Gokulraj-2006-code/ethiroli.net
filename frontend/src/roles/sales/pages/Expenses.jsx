import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import companyProjectApi from '../../../services/api/companyProjectApi.js';
import { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { EmptyState, FieldError, FormAlert, SalesModal, StatusBadge, SuccessAlert } from '../components/SalesUi.jsx';
import { asArray, formatDate, formatMoney, labelize } from '../utils/salesFormat.js';

const CATEGORIES = [
  'CLOUD_INFRA', 'SOFTWARE_LICENSE', 'HARDWARE', 'CONTRACTOR_FEE', 'TRAVEL', 'MISC',
  'EQUIPMENT', 'MARKETING', 'OFFICE', 'SUBCONTRACTOR', 'UTILITIES', 'OTHER',
];

const today = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const emptyExpenseForm = (projectId) => ({
  project_id: projectId || '',
  category: 'MISC',
  description: '',
  amount: '',
  currency: '',
  expense_date: today(),
  vendor: '',
  reference_no: '',
  receipt_url: '',
  is_billable: true,
});

export default function Expenses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectParam = searchParams.get('project') || '';
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [filters, setFilters] = useState({ project_id: projectParam, status: '', category: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyExpenseForm(projectParam));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarnings([]);
    try {
      const projectRows = await companyProjectApi.listProjects();
      const list = asArray(projectRows);
      setProjects(list);
      if (list.length === 0) {
        setExpenses([]);
        return;
      }

      const results = await Promise.allSettled(list.map((project) => companyProjectApi.listExpenses(project.id)));
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length === results.length) {
        setError(salesErrorMessage(failed[0].reason));
        setExpenses([]);
        return;
      }
      if (failed.length) setWarnings([`${failed.length} project expense feed(s) could not be loaded.`]);

      const rows = results.flatMap((result, index) => (
        result.status === 'fulfilled' ? asArray(result.value).map((row) => ({ ...row, project_name: list[index].name, project_code: list[index].project_code })) : []
      ));
      rows.sort((a, b) => String(b.expense_date || '').localeCompare(String(a.expense_date || '')));
      setExpenses(rows);
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setFilters((current) => ({ ...current, project_id: projectParam }));
  }, [projectParam]);

  const projectName = (id) => projects.find((project) => String(project.id) === String(id))?.name || '—';

  const visibleExpenses = useMemo(() => expenses.filter((expense) => (
    (!filters.project_id || String(expense.project_id) === String(filters.project_id)) &&
    (!filters.status || String(expense.status).toUpperCase() === filters.status) &&
    (!filters.category || String(expense.category).toUpperCase() === filters.category)
  )), [expenses, filters]);

  const openForm = () => {
    setFormError(null);
    setFieldErrors({});
    setForm(emptyExpenseForm(projectParam));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
    setFieldErrors({});
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = {
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        expense_date: form.expense_date,
        is_billable: form.is_billable,
      };
      if (form.currency.trim()) payload.currency = form.currency.trim().toUpperCase();
      if (form.vendor.trim()) payload.vendor = form.vendor.trim();
      if (form.reference_no.trim()) payload.reference_no = form.reference_no.trim();
      if (form.receipt_url.trim()) payload.receipt_url = form.receipt_url.trim();

      const result = await companyProjectApi.createExpense(form.project_id, payload);
      setNotice(result?.message || 'Expense logged for manager approval.');
      closeForm();
      await load();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      setFormError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const changeProjectFilter = (projectId) => {
    setFilters({ ...filters, project_id: projectId });
    if (projectId) setSearchParams({ project: projectId });
    else setSearchParams({});
  };

  return (
    <AdminPage
      title="Project Expenses"
      subtitle="Log project costs against your Sales projects and follow manager approval."
      loading={loading}
      error={error}
      onRetry={load}
      actions={<button type="button" className="btn btn-primary" onClick={openForm}><i className="bi bi-plus-lg me-2"></i>Log expense</button>}
    >
      <SuccessAlert message={notice} onDismiss={() => setNotice('')} />
      {warnings.length > 0 && (
        <div className="alert alert-warning py-2 small" role="status">
          <i className="bi bi-exclamation-circle me-2" aria-hidden="true"></i>
          {warnings.join(' · ')}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="sales-filter-bar">
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="expense-project-filter">Project</label>
              <select
                id="expense-project-filter"
                className="form-select form-select-sm"
                value={filters.project_id}
                onChange={(event) => changeProjectFilter(event.target.value)}
              >
                <option value="">All my projects</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </div>
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="expense-status-filter">Status</label>
              <select
                id="expense-status-filter"
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="">All statuses</option>
                {['PENDING', 'APPROVED', 'REJECTED'].map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
              </select>
            </div>
            <div className="sales-filter-field">
              <label className="form-label small mb-1" htmlFor="expense-category-filter">Category</label>
              <select
                id="expense-category-filter"
                className="form-select form-select-sm"
                value={filters.category}
                onChange={(event) => setFilters({ ...filters, category: event.target.value })}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((category) => <option key={category} value={category}>{labelize(category)}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        {visibleExpenses.length === 0 ? (
          <EmptyState
            icon="bi-receipt"
            title="No expenses"
            message={projects.length === 0 ? 'Convert a client order into a project before logging expenses.' : 'No expenses match the current filters.'}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th><th>Project</th><th>Description</th><th>Category</th>
                  <th>Amount</th><th>Logged by</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.expense_date)}</td>
                    <td>
                      <Link to={`/app/sales/projects/${expense.project_id}`}>{expense.project_name}</Link>
                      <small className="text-muted d-block">{expense.project_code || ''}</small>
                    </td>
                    <td>{expense.description}</td>
                    <td>{labelize(expense.category)}</td>
                    <td className="fw-semibold">{formatMoney(expense.amount, expense.currency)}</td>
                    <td>{expense.logged_by_name || '—'}</td>
                    <td><StatusBadge status={expense.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <SalesModal title="Log a project expense" subtitle="New expenses are pending until the project manager approves them." onClose={closeForm} size="modal-lg">
          <form onSubmit={submitExpense}>
            <div className="modal-body">
              <FormAlert error={formError} />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="expense-project">Project <span className="text-danger">*</span></label>
                  <select
                    id="expense-project"
                    className={`form-select ${fieldErrors.project_id ? 'is-invalid' : ''}`}
                    value={form.project_id}
                    onChange={(event) => setForm({ ...form, project_id: event.target.value })}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                  <FieldError message={fieldErrors.project_id} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="expense-category-field">Category</label>
                  <select
                    id="expense-category-field"
                    className="form-select"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  >
                    {CATEGORIES.map((category) => <option key={category} value={category}>{labelize(category)}</option>)}
                  </select>
                  <FieldError message={fieldErrors.category} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="expense-description">Description <span className="text-danger">*</span></label>
                  <input
                    id="expense-description"
                    className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    required
                  />
                  <FieldError message={fieldErrors.description} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="expense-amount">Amount <span className="text-danger">*</span></label>
                  <input
                    id="expense-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={`form-control ${fieldErrors.amount ? 'is-invalid' : ''}`}
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    required
                  />
                  <FieldError message={fieldErrors.amount} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="expense-currency">Currency</label>
                  <input
                    id="expense-currency"
                    className={`form-control ${fieldErrors.currency ? 'is-invalid' : ''}`}
                    placeholder="Backend default when blank"
                    value={form.currency}
                    onChange={(event) => setForm({ ...form, currency: event.target.value })}
                  />
                  <FieldError message={fieldErrors.currency} />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="expense-date">Expense date</label>
                  <input
                    id="expense-date"
                    type="date"
                    className={`form-control ${fieldErrors.expense_date ? 'is-invalid' : ''}`}
                    value={form.expense_date}
                    onChange={(event) => setForm({ ...form, expense_date: event.target.value })}
                  />
                  <FieldError message={fieldErrors.expense_date} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="expense-vendor">Vendor</label>
                  <input
                    id="expense-vendor"
                    className="form-control"
                    value={form.vendor}
                    onChange={(event) => setForm({ ...form, vendor: event.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="expense-reference">Reference number</label>
                  <input
                    id="expense-reference"
                    className="form-control"
                    value={form.reference_no}
                    onChange={(event) => setForm({ ...form, reference_no: event.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="expense-receipt">Receipt URL</label>
                  <input
                    id="expense-receipt"
                    className="form-control"
                    value={form.receipt_url}
                    onChange={(event) => setForm({ ...form, receipt_url: event.target.value })}
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      id="expense-billable"
                      className="form-check-input"
                      type="checkbox"
                      checked={form.is_billable}
                      onChange={(event) => setForm({ ...form, is_billable: event.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="expense-billable">Billable to the client project</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy || !form.project_id}>{busy ? 'Saving…' : 'Log expense'}</button>
            </div>
          </form>
        </SalesModal>
      )}
    </AdminPage>
  );
}
