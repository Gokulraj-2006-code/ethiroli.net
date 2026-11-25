import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import companyProjectApi from '../../../services/api/companyProjectApi.js';
import { salesErrorMessage } from '../../../services/api/salesPortalApi.js';
import { EmptyState, FormAlert, StatusBadge, SuccessAlert } from '../components/SalesUi.jsx';
import { asArray, formatDate, formatDateTime, formatMoney, labelize, progressPercent } from '../utils/salesFormat.js';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'bi-grid' },
  { key: 'tasks', label: 'Tasks', icon: 'bi-check2-square' },
  { key: 'milestones', label: 'Milestones', icon: 'bi-flag' },
  { key: 'expenses', label: 'Expenses', icon: 'bi-receipt' },
  { key: 'activity', label: 'Activity', icon: 'bi-clock-history' },
  { key: 'team', label: 'Team', icon: 'bi-people' },
];

const Fact = ({ label, children }) => (
  <div>
    <span className="sales-fact-label">{label}</span>
    <span className="sales-fact-value">{children ?? '—'}</span>
  </div>
);

export default function ProjectDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyProjectApi.getProject(id);
      setDetail(result || null);
    } catch (err) {
      setError(salesErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const project = detail?.project || null;
  const tasks = asArray(detail?.tasks);
  const milestones = asArray(detail?.milestones);
  const expenses = asArray(detail?.expenses);
  const activity = asArray(detail?.activity);
  const team = asArray(detail?.team);
  const canConfirmDelivery = Boolean(project?.delivery_submitted_at && !project?.sales_confirmed_at);

  const confirmDelivery = async () => {
    if (!window.confirm('Confirm client delivery to the Manager and Admin?')) return;
    setBusy(true);
    setFormError(null);
    try {
      const result = await companyProjectApi.confirmSalesDelivery(id);
      setNotice(result?.message || 'Client delivery confirmed by Sales.');
      await load();
    } catch (err) {
      setFormError(salesErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      title={project?.name || 'Company project'}
      subtitle={project ? `${project.project_code || 'No project code'} · ${labelize(project.status)}` : 'Project delivery details'}
      loading={loading}
      error={error}
      onRetry={load}
      actions={
        <div className="d-flex gap-2 flex-wrap">
          <Link className="btn btn-outline-secondary" to="/app/sales/projects">Back to projects</Link>
          {canConfirmDelivery && (
            <button type="button" className="btn btn-success" onClick={confirmDelivery} disabled={busy}>
              <i className="bi bi-check2-circle me-2" aria-hidden="true"></i>
              {busy ? 'Confirming…' : 'Confirm client delivery'}
            </button>
          )}
        </div>
      }
    >
      <SuccessAlert message={notice} onDismiss={() => setNotice('')} />
      <FormAlert error={formError} />

      {project && (
        <>
          <div className="sales-detail-head">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
              <div>
                <h5 className="mb-1">{project.name}</h5>
                <div className="sales-detail-meta">
                  {project.client_name || project.client_record_name || 'No client on record'} ·
                  Manager: {project.manager_name || 'Not assigned'} ·
                  Sales owner: {project.sales_owner_name || 'Not assigned'}
                </div>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 mb-1">
              <span className="sales-progress-label">Overall progress</span>
              <span className="sales-progress-label">{progressPercent(project.progress_percent)}%</span>
            </div>
            <div className="sales-progress" role="progressbar" aria-valuenow={progressPercent(project.progress_percent)} aria-valuemin="0" aria-valuemax="100">
              <span style={{ width: `${progressPercent(project.progress_percent)}%` }} />
            </div>
          </div>

          <ul className="nav nav-tabs sales-portal-tabs mb-3" role="tablist">
            {TABS.map((item) => (
              <li className="nav-item" key={item.key}>
                <button
                  type="button"
                  className={`nav-link ${tab === item.key ? 'active' : ''}`}
                  onClick={() => setTab(item.key)}
                  role="tab"
                  aria-selected={tab === item.key}
                >
                  <i className={`bi ${item.icon} me-1`} aria-hidden="true"></i>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {tab === 'overview' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="sales-section-title">Project facts</h6>
                <div className="sales-fact-grid">
                  <Fact label="Project code">{project.project_code}</Fact>
                  <Fact label="Status"><StatusBadge status={project.status} /></Fact>
                  <Fact label="Priority">{labelize(project.priority)}</Fact>
                  <Fact label="Category">{project.category || '—'}</Fact>
                  <Fact label="Estimated cost">{formatMoney(project.estimated_cost, project.currency)}</Fact>
                  <Fact label="Approved expenses">{formatMoney(project.approved_expenses, project.currency)}</Fact>
                  <Fact label="Start date">{formatDate(project.start_date)}</Fact>
                  <Fact label="Expected end">{formatDate(project.expected_end_date || project.due_date)}</Fact>
                  <Fact label="Tasks completed">{tasks.length === 0 ? '—' : `${project.completed_tasks ?? 0} of ${project.task_count ?? tasks.length}`}</Fact>
                  <Fact label="Delivery submitted">{formatDateTime(project.delivery_submitted_at)}</Fact>
                  <Fact label="Sales confirmation">{formatDateTime(project.sales_confirmed_at)}</Fact>
                  <Fact label="Admin completion">{formatDateTime(project.admin_confirmed_at || project.completed_at)}</Fact>
                </div>
                {project.description && <p className="small mt-3 mb-0">{project.description}</p>}
                {canConfirmDelivery && (
                  <div className="alert alert-info py-2 small mt-3 mb-0" role="status">
                    <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
                    The Manager submitted this project for delivery. Confirm it with the client, then Admin can complete the project.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'tasks' && (
            <div className="card border-0 shadow-sm">
              {tasks.length === 0 ? (
                <EmptyState icon="bi-check2-square" title="No project tasks" message="Tasks created by the delivery team will appear here." />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>Task</th><th>Assigned to</th><th>Due</th><th>Priority</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.description}</td>
                          <td>{task.assignee_name || '—'}</td>
                          <td>{formatDate(task.due_date)}</td>
                          <td>{labelize(task.priority)}</td>
                          <td><StatusBadge status={task.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'milestones' && (
            <div className="card border-0 shadow-sm">
              {milestones.length === 0 ? (
                <EmptyState icon="bi-flag" title="No milestones" message="Milestones recorded for this project will appear here." />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>Milestone</th><th>Target date</th><th>Status</th><th>Completed</th></tr>
                    </thead>
                    <tbody>
                      {milestones.map((milestone) => (
                        <tr key={milestone.id}>
                          <td>{milestone.title || milestone.name || milestone.description || '—'}</td>
                          <td>{formatDate(milestone.target_date)}</td>
                          <td><StatusBadge status={milestone.status} /></td>
                          <td>{formatDateTime(milestone.completed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'expenses' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="sales-section-title mb-0">Project expenses</h6>
                <Link className="small" to={`/app/sales/expenses?project=${id}`}>Open expense workspace →</Link>
              </div>
              {expenses.length === 0 ? (
                <EmptyState icon="bi-receipt" title="No expenses" message="Expenses logged against this project will appear here." />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{formatDate(expense.expense_date)}</td>
                          <td>
                            <div>{expense.description}</div>
                            <small className="text-muted">{expense.logged_by_name || ''}</small>
                          </td>
                          <td>{labelize(expense.category)}</td>
                          <td>{formatMoney(expense.amount, expense.currency)}</td>
                          <td><StatusBadge status={expense.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="sales-section-title">Activity log</h6>
                {activity.length === 0 ? (
                  <EmptyState icon="bi-clock-history" title="No activity yet" message="Project events will be listed here as they happen." />
                ) : (
                  activity.map((entry) => (
                    <div className="sales-activity-item" key={entry.id}>
                      <div>{entry.description || labelize(entry.action || entry.event_type)}</div>
                      <small>
                        {entry.actor_name || 'System'} · {formatDateTime(entry.created_at)}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="sales-section-title">Delivery team</h6>
                {team.length === 0 ? (
                  <EmptyState icon="bi-people" title="No team assigned" message="The Manager assigns the delivery team; assignments will appear here." />
                ) : (
                  <ul className="list-unstyled mb-0">
                    {team.map((memberId) => (
                      <li key={memberId} className="py-2 border-bottom">
                        <i className="bi bi-person-badge me-2 text-muted" aria-hidden="true"></i>
                        <span className="font-monospace small">Member {memberId}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
}
