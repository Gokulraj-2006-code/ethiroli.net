import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import { useAuth } from '../../../common/hooks/useAuth.js';

const unwrap = (response) => response?.data?.data ?? response?.data;
const messageOf = (error) => error?.response?.data?.message || error?.message || 'The request could not be completed.';
const dateOnly = (value) => (value ? String(value).slice(0, 10) : '—');
const money = (value, currency = 'INR') => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const STATUS_TONE = {
  PLANNED: 'secondary',
  ASSIGNED: 'info',
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  UNDER_REVIEW: 'info',
  READY_FOR_DELIVERY: 'primary',
  DELIVERY_SUBMITTED: 'primary',
  AWAITING_ADMIN_CONFIRMATION: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger'
};

const EMPTY_TASK = { description: '', due_date: '', assigned_to: '', priority: 'MEDIUM' };

/**
 * Manager's assigned company projects. Every mutation calls a real, scoped
 * endpoint. Progress is read from the backend; it is never edited here.
 */
export default function ManagerCompanyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [assignable, setAssignable] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [teamSelection, setTeamSelection] = useState([]);
  const [expenseNote, setExpenseNote] = useState({});
  const [review, setReview] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [projectRows, staffRows] = await Promise.all([
        axiosInstance.get('/v1/company-projects'),
        axiosInstance.get('/v1/company-projects/assignable-staff')
      ]);
      setProjects(unwrap(projectRows) || []);
      setAssignable(unwrap(staffRows) || []);
    } catch (requestError) {
      setError(messageOf(requestError));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id, silent = false) => {
    if (!id) {
      setDetail(null);
      return;
    }
    if (!silent) setDetailLoading(true);
    try {
      const data = unwrap(await axiosInstance.get(`/v1/company-projects/${encodeURIComponent(id)}`)) || {};
      setDetail(data);
      setTeamSelection(Array.isArray(data.team) ? data.team : []);
    } catch (requestError) {
      setError(messageOf(requestError));
      if (!silent) setDetail(null);
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedId && projects.length) setSelectedId(projects[0].id);
  }, [projects, selectedId]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const project = detail?.project || null;
  const isLead = Boolean(project?.manager_id && project.manager_id === user?.id);
  const tasks = useMemo(() => (detail?.tasks || []).filter((task) => !task.is_checklist_item), [detail]);
  const pendingTasks = tasks.filter((task) => task.status === 'UNDER_REVIEW');
  const pendingExpenses = (detail?.expenses || []).filter((expense) => expense.status === 'PENDING');

  const filteredProjects = projects.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [item.name, item.project_code, item.client_name, item.manager_name]
      .some((value) => String(value || '').toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const runAction = async (request, successMessage, after) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request();
      setNotice(successMessage);
      if (after) await after();
      await Promise.all([load(true), loadDetail(selectedId, true)]);
      return true;
    } catch (requestError) {
      setError(messageOf(requestError));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const acceptProject = () => runAction(
    () => axiosInstance.post(`/v1/company-projects/${encodeURIComponent(project.id)}/accept`),
    'Project accepted and now active.'
  );

  const saveTeam = () => runAction(
    () => axiosInstance.post(`/v1/company-projects/${encodeURIComponent(project.id)}/team`, { user_ids: teamSelection }),
    'Project team updated. New members have been notified.'
  );

  const createTask = (event) => {
    event.preventDefault();
    return runAction(
      () => axiosInstance.post(`/v1/company-projects/${encodeURIComponent(project.id)}/tasks`, taskForm),
      'Task created and assigned. The employee has been notified.',
      () => setTaskForm(EMPTY_TASK)
    );
  };

  const openReview = (task, action) => setReview({ task, action, note: '' });

  const submitReview = () => {
    if (!review) return;
    const { task, action, note } = review;
    const endpoint = `/v1/tasks/${encodeURIComponent(task.id)}`;
    let request;
    if (action === 'approve') request = axiosInstance.post(`${endpoint}/approve`, { review_note: note });
    else if (action === 'reject') request = axiosInstance.post(`${endpoint}/reject`, { review_note: note });
    else request = axiosInstance.patch(`${endpoint}/status`, {
      status: action === 'block' ? 'BLOCKED' : action === 'unblock' ? 'IN_PROGRESS' : 'CANCELLED',
      review_note: note
    });
    const label = action === 'approve' ? 'Task approved.' : action === 'reject' ? 'Task returned to the employee with feedback.' : 'Task status updated.';
    runAction(() => request, label, () => setReview(null));
  };

  const decideExpense = (expense, approve) => runAction(
    () => axiosInstance.put(
      `/v1/company-projects/${encodeURIComponent(project.id)}/expenses/${encodeURIComponent(expense.id)}/${approve ? 'approve' : 'reject'}`,
      { note: approve ? undefined : expenseNote[expense.id] }
    ),
    approve ? 'Expense approved.' : 'Expense rejected.'
  );

  const submitDelivery = () => runAction(
    () => axiosInstance.post(`/v1/company-projects/${encodeURIComponent(project.id)}/delivery/submit`, {}),
    'Project submitted for delivery. Sales and Super Admin have been notified.'
  );

  const staffName = (id) => assignable.find((person) => person.id === id)?.full_name || 'Team member';

  return (
    <div className="emp-portal">
      <AdminPage
        title="Assigned company projects"
        subtitle="Accept projects, build the delivery team, assign work, and review submitted tasks"
        loading={loading}
        error={error}
        onRetry={() => load()}
      >
        {notice && <div className="alert alert-success" role="status">{notice}</div>}
        <div className="row g-3 mb-4">
          {[
            ['Assigned projects', projects.length],
            ['Awaiting my acceptance', projects.filter((item) => item.manager_id === user?.id && !item.manager_accepted_at).length],
            ['Awaiting my review', projects.reduce((total, item) => total + (item.id === project?.id ? pendingTasks.length : 0), 0)],
            ['Expenses to review', projects.reduce((total, item) => total + (item.id === project?.id ? pendingExpenses.length : 0), 0)]
          ].map(([label, value]) => (
            <div className="col-6 col-xl-3" key={label}>
              <div className="emp-stat h-100"><span className="emp-stat__label">{label}</span><div className="emp-stat__value">{value}</div></div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <section className="card shadow-sm h-100">
              <div className="card-header bg-white"><h2 className="h6 mb-0">Projects</h2></div>
              <div className="card-body border-bottom">
                <input className="form-control mb-2" type="search" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} />
                <select className="form-select" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="ALL">All statuses</option>
                  {[...new Set(projects.map((item) => item.status).filter(Boolean))].map((status) => (
                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '560px', overflowY: 'auto' }}>
                {filteredProjects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`list-group-item list-group-item-action ${item.id === selectedId ? 'active' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="d-flex justify-content-between gap-2 align-items-start">
                      <strong>{item.project_code || item.name}</strong>
                      <span className={`badge text-bg-${STATUS_TONE[item.status] || 'secondary'}`}>{String(item.status || '').replace(/_/g, ' ')}</span>
                    </div>
                    <div className="small mt-1">{item.name}</div>
                    <div className="d-flex justify-content-between small text-muted mt-1">
                      <span>{item.client_name || item.client_record_name || 'Internal'}</span>
                      <span>{Number(item.progress_percent || 0).toFixed(0)}% complete</span>
                    </div>
                  </button>
                ))}
                {!filteredProjects.length && !loading && <div className="p-3 text-secondary">No company projects are assigned to you.</div>}
              </div>
            </section>
          </div>

          <div className="col-12 col-xl-8">
            {detailLoading && <div className="card shadow-sm p-4" role="status">Loading project…</div>}
            {!detailLoading && !project && <div className="card shadow-sm p-4 text-secondary">Select a project to view its delivery details.</div>}
            {!detailLoading && project && (
              <section className="card shadow-sm">
                <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-start gap-2">
                  <div>
                    <h2 className="h6 mb-1">{project.name}</h2>
                    <div className="small text-secondary">
                      {project.project_code || 'No code'} · {project.client_name || project.client_record_name || 'Internal project'} · Sales: {project.sales_owner_name || '—'}
                    </div>
                  </div>
                  {isLead && !project.manager_accepted_at && (
                    <button className="btn btn-sm btn-primary" disabled={saving} onClick={acceptProject}>Accept project</button>
                  )}
                </div>

                <div className="card-body">
                  <div className="progress" role="progressbar" aria-valuenow={Number(project.progress_percent || 0)} aria-valuemin="0" aria-valuemax="100" style={{ height: '8px' }}>
                    <div className="progress-bar" style={{ width: `${Number(project.progress_percent || 0)}%` }} />
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mt-1">
                    <span>Progress derived from {Number(project.completed_tasks || 0)} of {Number(project.task_count || 0)} completed tasks and milestones.</span>
                    <span>{Number(project.progress_percent || 0)}%</span>
                  </div>

                  <ul className="nav nav-tabs mt-3">
                    {[
                      ['overview', 'Overview'],
                      ['tasks', `Tasks (${pendingTasks.length} awaiting review)`],
                      ['expenses', `Expenses (${pendingExpenses.length} pending)`],
                      ['activity', 'Activity']
                    ].map(([key, label]) => (
                      <li className="nav-item" key={key}>
                        <button className={`nav-link ${tab === key ? 'active' : ''}`} type="button" onClick={() => setTab(key)}>{label}</button>
                      </li>
                    ))}
                  </ul>

                  {tab === 'overview' && (
                    <div className="pt-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <h3 className="h6">Delivery team</h3>
                          {isLead ? (
                            <>
                              <div className="border rounded p-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                {assignable.length ? assignable.map((person) => (
                                  <div className="form-check" key={person.id}>
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`project-member-${person.id}`}
                                      checked={teamSelection.includes(person.id)}
                                      onChange={() => setTeamSelection((current) => current.includes(person.id) ? current.filter((id) => id !== person.id) : [...current, person.id])}
                                    />
                                    <label className="form-check-label" htmlFor={`project-member-${person.id}`}>
                                      {person.full_name} <span className="text-muted small">· {person.designation || person.role}{person.department_id ? ` · Dept ${person.department_id}` : ''}</span>
                                    </label>
                                  </div>
                                )) : <p className="text-secondary small mb-0">No assignable staff available.</p>}
                              </div>
                              <button className="btn btn-sm btn-outline-primary mt-2" disabled={saving} onClick={saveTeam}>Save team</button>
                            </>
                          ) : (
                            <p className="text-secondary">{teamSelection.length ? teamSelection.map(staffName).join(', ') : 'No delivery team assigned yet.'}</p>
                          )}
                        </div>
                        <div className="col-md-6">
                          <h3 className="h6">Milestones</h3>
                          {(detail?.milestones || []).length ? (
                            <ul className="list-unstyled mb-0">
                              {detail.milestones.map((milestone) => (
                                <li key={milestone.id} className="d-flex justify-content-between border-bottom py-1 small">
                                  <span>{milestone.title}</span><span className="text-secondary">{dateOnly(milestone.target_date)} · {milestone.status || 'PENDING'}</span>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-secondary">No milestones have been recorded for this project.</p>}
                        </div>
                      </div>
                      {isLead && Number(project.progress_percent) >= 100 && project.status === 'ACTIVE' && (
                        <div className="alert alert-info mt-3 d-flex justify-content-between align-items-center">
                          <span>All work items are complete. Submit the project for client delivery.</span>
                          <button className="btn btn-sm btn-primary" disabled={saving} onClick={submitDelivery}>Submit for delivery</button>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'tasks' && (
                    <div className="pt-3">
                      {isLead && (
                        <form className="row g-2 align-items-end border rounded p-3 mb-3" onSubmit={createTask}>
                          <div className="col-md-4">
                            <label className="form-label mb-1">Task description</label>
                            <input className="form-control" required value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label mb-1">Assign to</label>
                            <select className="form-select" required value={taskForm.assigned_to} onChange={(event) => setTaskForm({ ...taskForm, assigned_to: event.target.value })}>
                              <option value="">Choose a team member</option>
                              {(teamSelection.length ? teamSelection : assignable.map((person) => person.id)).map((id) => (
                                <option key={id} value={id}>{staffName(id)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-2">
                            <label className="form-label mb-1">Due date</label>
                            <input className="form-control" type="date" required value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label mb-1">Priority</label>
                            <select className="form-select" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
                              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}
                            </select>
                          </div>
                          <div className="col-md-1"><button className="btn btn-primary w-100" disabled={saving}>Add</button></div>
                        </form>
                      )}
                      <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0">
                          <thead><tr><th>Task</th><th>Assigned to</th><th>Progress</th><th>Due</th><th>Status</th><th>Review</th></tr></thead>
                          <tbody>
                            {tasks.map((task) => (
                              <tr key={task.id}>
                                <td>{task.description}{task.review_note && <div className="small text-muted">Feedback: {task.review_note}</div>}</td>
                                <td>{task.assignee_name || staffName(task.assigned_to)}</td>
                                <td>{Number(task.progress_percent || 0)}%</td>
                                <td>{dateOnly(task.due_date)}</td>
                                <td>{String(task.status || '').replace(/_/g, ' ')}</td>
                                <td>
                                  {task.status === 'UNDER_REVIEW' && isLead && (
                                    <div className="d-flex gap-1">
                                      <button className="btn btn-sm btn-success" disabled={saving} onClick={() => openReview(task, 'approve')}>Approve</button>
                                      <button className="btn btn-sm btn-outline-warning" disabled={saving} onClick={() => openReview(task, 'reject')}>Request changes</button>
                                    </div>
                                  )}
                                  {isLead && ['PENDING', 'IN_PROGRESS'].includes(task.status) && (
                                    <button className="btn btn-sm btn-outline-secondary" disabled={saving} onClick={() => openReview(task, 'block')}>Block</button>
                                  )}
                                  {isLead && task.status === 'BLOCKED' && (
                                    <button className="btn btn-sm btn-outline-success" disabled={saving} onClick={() => openReview(task, 'unblock')}>Unblock</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {!tasks.length && <tr><td colSpan="6" className="text-center text-secondary py-4">No tasks have been created for this project.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {tab === 'expenses' && (
                    <div className="table-responsive pt-3">
                      <table className="table table-sm table-hover align-middle mb-0">
                        <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th><th>Logged by</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                          {(detail?.expenses || []).map((expense) => (
                            <tr key={expense.id}>
                              <td>{expense.description}{expense.rejection_note && <div className="small text-muted">Reason: {expense.rejection_note}</div>}</td>
                              <td>{expense.category}</td>
                              <td>{money(expense.amount, expense.currency)}</td>
                              <td>{dateOnly(expense.expense_date)}</td>
                              <td>{expense.logged_by_name || '—'}</td>
                              <td>{expense.status}</td>
                              <td>
                                {expense.status === 'PENDING' && isLead && (
                                  <div className="d-flex gap-1">
                                    <input className="form-control form-control-sm" style={{ width: '140px' }} placeholder="Rejection reason" value={expenseNote[expense.id] || ''} onChange={(event) => setExpenseNote({ ...expenseNote, [expense.id]: event.target.value })} />
                                    <button className="btn btn-sm btn-success" disabled={saving} onClick={() => decideExpense(expense, true)}>Approve</button>
                                    <button className="btn btn-sm btn-outline-danger" disabled={saving} onClick={() => decideExpense(expense, false)}>Reject</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                          {!(detail?.expenses || []).length && <tr><td colSpan="7" className="text-center text-secondary py-4">No expenses have been logged against this project.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {tab === 'activity' && (
                    <ul className="list-unstyled pt-3 mb-0">
                      {(detail?.activity || []).map((entry) => (
                        <li key={entry.id} className="border-bottom py-2 small">
                          <strong>{entry.actor_name || 'System'}</strong> · {String(entry.event_type || '').replace(/_/g, ' ')}
                          <div className="text-secondary">{entry.note || entry.description || ''}</div>
                          <div className="text-muted">{entry.created_at ? new Date(entry.created_at).toLocaleString('en-IN') : ''}</div>
                        </li>
                      ))}
                      {!(detail?.activity || []).length && <li className="text-secondary">No activity has been recorded yet.</li>}
                    </ul>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {review && (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setReview(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header"><h5 className="modal-title">{review.action === 'approve' ? 'Approve task' : review.action === 'reject' ? 'Return task for correction' : 'Update task status'}</h5><button className="btn-close" onClick={() => setReview(null)} /></div>
                <div className="modal-body">
                  <p><strong>{review.task.description}</strong></p>
                  <label className="form-label">{review.action === 'reject' ? 'Feedback (required)' : 'Review note (optional)'}</label>
                  <textarea className="form-control" rows={3} value={review.note} onChange={(event) => setReview({ ...review, note: event.target.value })} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setReview(null)}>Cancel</button>
                  <button className="btn btn-primary" disabled={saving || (review.action === 'reject' && !review.note.trim())} onClick={submitReview}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminPage>
    </div>
  );
}
