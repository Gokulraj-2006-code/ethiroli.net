import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import {
  apiMessage,
  asArray,
  completeProjectDelivery,
  decideProjectExpense,
  formatDate,
  formatMoney,
  getCompanyProject,
  getCompanyProjectActivity,
  getOrgDirectory,
  labelize,
  listCompanyProjects,
} from '../api/oversightApi.js';

const STATUSES = [
  'AWAITING_MANAGER_ACCEPTANCE',
  'ACTIVE',
  'IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'DELIVERY_SUBMITTED',
  'AWAITING_ADMIN_CONFIRMATION',
  'COMPLETED',
  'CANCELLED',
];

// Both values occur in the delivery workflow; the API guards the transition.
const DELIVERY_CONFIRMATION_STATUSES = ['READY_FOR_DELIVERY', 'AWAITING_ADMIN_CONFIRMATION'];

const StatusBadge = ({ status }) => {
  const key = String(status || '').toUpperCase();
  let tone = 'bg-secondary';
  if (['COMPLETED', 'APPROVED', 'ACTIVE', 'IN_PROGRESS'].includes(key)) tone = 'bg-success';
  else if (['PENDING', 'AWAITING_MANAGER_ACCEPTANCE', 'DELIVERY_SUBMITTED', 'AWAITING_ADMIN_CONFIRMATION', 'READY_FOR_DELIVERY'].includes(key)) tone = 'bg-warning text-dark';
  else if (['REJECTED', 'CANCELLED'].includes(key)) tone = 'bg-danger';
  return <span className={`badge ${tone}`}>{labelize(status)}</span>;
};

export default function CompanyProjects() {
  const { projectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedId, setSelectedId] = useState(projectId || '');
  const [detail, setDetail] = useState(null);
  const [activity, setActivity] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState('');
  const [expenseNotes, setExpenseNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search.trim()) params.search = filters.search.trim();
      const rows = await listCompanyProjects(params);
      setProjects(rows);
      setSelectedId((current) => {
        if (projectId) return projectId;
        if (current && rows.some((row) => String(row.id) === String(current))) return current;
        return rows[0]?.id || '';
      });
    } catch (requestError) {
      setError(apiMessage(requestError, 'Unable to load company projects.'));
    } finally {
      setLoading(false);
    }
  }, [filters, projectId]);

  const loadDetail = useCallback(async () => {
    if (!selectedId) {
      setDetail(null);
      setActivity([]);
      return;
    }
    setDetailLoading(true);
    try {
      const [record, activityRows] = await Promise.all([
        getCompanyProject(selectedId),
        getCompanyProjectActivity(selectedId),
      ]);
      setDetail(record || null);
      setActivity(activityRows);
    } catch (requestError) {
      setDetail(null);
      setActivity([]);
      setNotice({ type: 'error', text: apiMessage(requestError, 'Unable to load project detail.') });
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!loading) loadDetail(); }, [loadDetail, loading]);
  useEffect(() => {
    getOrgDirectory().then(setDirectory).catch(() => setDirectory([]));
  }, []);

  const runAction = async (key, work, successMessage) => {
    setBusy(key);
    setNotice(null);
    try {
      await work();
      setNotice({ type: 'success', text: successMessage });
      await loadDetail();
    } catch (requestError) {
      setNotice({ type: 'error', text: apiMessage(requestError) });
    } finally {
      setBusy('');
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({ status: statusFilter, search: searchInput });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchInput('');
    setFilters({ status: '', search: '' });
  };

  const handleExpense = (expense, decision) => {
    const note = (expenseNotes[expense.id] || '').trim();
    if (decision === 'reject' && !note) {
      setNotice({ type: 'error', text: 'A rejection note is required.' });
      return;
    }
    runAction(
      `expense:${expense.id}:${decision}`,
      () => decideProjectExpense(selectedId, expense.id, decision, note),
      decision === 'approve' ? 'Expense approved.' : 'Expense rejected.'
    );
  };

  const handleCompleteDelivery = () => {
    if (!selectedId) return;
    runAction(
      'complete-delivery',
      () => completeProjectDelivery(selectedId),
      'Project delivery completed and confirmed.'
    );
  };

  const project = detail?.project || {};
  const projectStatus = String(project.status || '').toUpperCase();
  const hasSalesConfirmationField = Object.prototype.hasOwnProperty.call(project, 'sales_confirmed_at');
  const salesConfirmed = projectStatus === 'AWAITING_ADMIN_CONFIRMATION'
    || !hasSalesConfirmationField
    || Boolean(project.sales_confirmed_at);
  const canCompleteDelivery = Boolean(selectedId)
    && DELIVERY_CONFIRMATION_STATUSES.includes(projectStatus)
    && Number(project.progress_percent || 0) >= 100
    && salesConfirmed
    && !project.completed_at
    && !project.admin_confirmed_at;

  const teamIds = asArray(detail?.team);
  const teamMembers = teamIds.map((id) => (
    directory.find((person) => String(person.user_id) === String(id))?.full_name || String(id)
  ));
  const tasks = asArray(detail?.tasks);
  const milestones = asArray(detail?.milestones);
  const expenses = asArray(detail?.expenses);

  return (
    <AdminPage
      title="Company projects"
      subtitle="Read-only delivery oversight with explicit expense and final completion actions."
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
        <div className="card-header bg-white"><h2 className="h6 mb-0">Filter projects</h2></div>
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={applyFilters}>
            <div className="col-12 col-sm-5 col-lg-4">
              <label className="form-label" htmlFor="project-status-filter">Status</label>
              <select
                id="project-status-filter"
                className="form-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                {STATUSES.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-7 col-lg-6">
              <label className="form-label" htmlFor="project-search">Search</label>
              <input
                id="project-search"
                className="form-control"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Project name, code or client"
              />
            </div>
            <div className="col-12 col-lg-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-fill">Apply</button>
              <button type="button" className="btn btn-outline-secondary" onClick={clearFilters}>Clear</button>
            </div>
          </form>
        </div>
      </section>

      <section className="card shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 className="h6 mb-0">Projects</h2>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={load} disabled={loading}>Refresh</button>
        </div>
        {projects.length === 0 ? (
          <p className="text-secondary p-3 mb-0">No company projects match the current filters.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Code</th><th>Project</th><th>Client</th><th>Sales owner</th><th>Manager</th><th>Progress</th><th>Status</th></tr>
              </thead>
              <tbody>
                {projects.map((row) => (
                  <tr
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className={String(row.id) === String(selectedId) ? 'table-primary' : ''}
                    onClick={() => setSelectedId(row.id)}
                    onKeyDown={(event) => event.key === 'Enter' && setSelectedId(row.id)}
                  >
                    <td>{row.project_code || '—'}</td>
                    <td className="fw-semibold">{row.name || '—'}</td>
                    <td>{row.client_record_name || row.client_name || '—'}</td>
                    <td>{row.sales_owner_name || row.sales_owner?.full_name || '—'}</td>
                    <td>{row.manager_name || row.manager?.full_name || '—'}</td>
                    <td style={{ minWidth: 120 }}>
                      <div className="progress" style={{ height: 6 }} role="progressbar" aria-valuenow={Number(row.progress_percent || 0)} aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(0, Number(row.progress_percent || 0)))}%` }} />
                      </div>
                      <span className="small text-secondary">{Number(row.progress_percent || 0).toFixed(0)}%</span>
                    </td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedId && (
        <section className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 className="h6 mb-0">{detailLoading ? 'Loading project…' : (project.name || project.project_code || 'Project detail')}</h2>
            {project.status && <StatusBadge status={project.status} />}
          </div>
          {detailLoading ? (
            <p className="text-secondary p-3 mb-0" role="status">Loading project detail…</p>
          ) : !detail ? (
            <p className="text-secondary p-3 mb-0">Project detail is unavailable.</p>
          ) : (
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Code</p><p className="mb-0">{project.project_code || '—'}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Client</p><p className="mb-0">{project.client_record_name || project.client_name || '—'}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Sales owner</p><p className="mb-0">{project.sales_owner_name || project.sales_owner?.full_name || '—'}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Manager</p><p className="mb-0">{project.manager_name || project.manager?.full_name || '—'}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Estimated cost</p><p className="mb-0">{formatMoney(project.estimated_cost, project.currency)}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Approved expenses</p><p className="mb-0">{formatMoney(project.approved_expenses, project.currency)}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Start date</p><p className="mb-0">{formatDate(project.start_date)}</p></div>
                <div className="col-6 col-lg-3"><p className="text-secondary small mb-1">Delivery submitted</p><p className="mb-0">{formatDate(project.delivery_submitted_at)}</p></div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Progress (derived from tasks and milestones)</span>
                  <span>{Number(project.progress_percent || 0).toFixed(0)}%</span>
                </div>
                <div className="progress" role="progressbar" aria-valuenow={Number(project.progress_percent || 0)} aria-valuemin="0" aria-valuemax="100">
                  <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(0, Number(project.progress_percent || 0)))}%` }} />
                </div>
              </div>

              {canCompleteDelivery && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2" role="note">
                  <span className="mb-0">
                    Sales has confirmed delivery and the backend status permits final completion. The server rejects this action
                    if the workflow is not complete.
                  </span>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleCompleteDelivery}
                    disabled={busy === 'complete-delivery'}
                  >
                    {busy === 'complete-delivery' ? 'Completing…' : 'Complete delivery'}
                  </button>
                </div>
              )}

              <div className="row g-4">
                <div className="col-12 col-xl-6">
                  <h3 className="h6">Tasks ({tasks.length})</h3>
                  {tasks.length === 0 ? (
                    <p className="text-secondary">No tasks have been recorded for this project.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light"><tr><th>Task</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead>
                        <tbody>
                          {tasks.map((task) => (
                            <tr key={task.id}>
                              <td>{task.description || '—'}</td>
                              <td>{task.assignee_name || '—'}</td>
                              <td>{formatDate(task.due_date)}</td>
                              <td><StatusBadge status={task.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h3 className="h6 mt-4">Milestones ({milestones.length})</h3>
                  {milestones.length === 0 ? (
                    <p className="text-secondary">No milestones have been recorded for this project.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light"><tr><th>Milestone</th><th>Target date</th><th>Status</th></tr></thead>
                        <tbody>
                          {milestones.map((milestone) => (
                            <tr key={milestone.id}>
                              <td>{milestone.title || milestone.name || '—'}</td>
                              <td>{formatDate(milestone.target_date)}</td>
                              <td><StatusBadge status={milestone.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h3 className="h6 mt-4">Team ({teamMembers.length})</h3>
                  {teamMembers.length === 0 ? (
                    <p className="text-secondary">No team members are assigned to this project.</p>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {teamMembers.map((name, index) => <span key={`${teamIds[index]}-${name}`} className="badge bg-light text-dark border">{name}</span>)}
                    </div>
                  )}
                </div>

                <div className="col-12 col-xl-6">
                  <h3 className="h6">Expenses ({expenses.length})</h3>
                  {expenses.length === 0 ? (
                    <p className="text-secondary">No expenses have been logged for this project.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light"><tr><th>Expense</th><th>Amount</th><th>Logged by</th><th>Status</th><th>Review</th></tr></thead>
                        <tbody>
                          {expenses.map((expense) => (
                            <tr key={expense.id}>
                              <td>
                                <div>{expense.description || '—'}</div>
                                <div className="text-secondary small">{labelize(expense.category)} · {formatDate(expense.expense_date)}</div>
                                {expense.rejection_note && <div className="text-danger small">Rejection note: {expense.rejection_note}</div>}
                              </td>
                              <td className="text-nowrap">{formatMoney(expense.amount, expense.currency || project.currency)}</td>
                              <td>{expense.logged_by_name || '—'}</td>
                              <td><StatusBadge status={expense.status} /></td>
                              <td>
                                {expense.status === 'PENDING' ? (
                                  <div className="d-flex flex-column gap-1" style={{ minWidth: 180 }}>
                                    <input
                                      className="form-control form-control-sm"
                                      placeholder="Reason (required to reject)"
                                      aria-label={`Review note for ${expense.description || 'expense'}`}
                                      value={expenseNotes[expense.id] || ''}
                                      onChange={(event) => setExpenseNotes((notes) => ({ ...notes, [expense.id]: event.target.value }))}
                                    />
                                    <div className="d-flex gap-1">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleExpense(expense, 'approve')}
                                        disabled={busy === `expense:${expense.id}:approve`}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleExpense(expense, 'reject')}
                                        disabled={busy === `expense:${expense.id}:reject`}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-secondary small">
                                    {expense.approved_by_name ? `Reviewed by ${expense.approved_by_name}` : 'Reviewed'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="h6">Activity</h3>
                {activity.length === 0 ? (
                  <p className="text-secondary">No activity has been recorded for this project.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {activity.map((entry) => (
                      <li key={entry.id} className="list-group-item px-0 py-2">
                        <div className="small">{entry.message || labelize(entry.event_type)}</div>
                        <div className="text-secondary small">
                          {entry.actor_name || 'System'} · {formatDate(entry.created_at)}
                          {entry.event_type ? ` · ${labelize(entry.event_type)}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </AdminPage>
  );
}
