import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import employeePortalApi from '../../../services/api/employeePortalApi.js';
import { EmptyState } from '../components/StatCard.jsx';
import DetailModal, { DetailBodyText, DetailRow, DetailSection, DetailBadge } from '../components/DetailModal.jsx';

/**
 * My Assigned Tasks.
 *
 * Every row comes from the server-scoped `GET /v1/tasks` list, and every action
 * calls the real review-workflow endpoints. An employee can start their own
 * PENDING task, move progress up to 99%, and submit work for manager review
 * with a note. Approval/rejection stays with the manager; completion is set by
 * the backend when a manager approves.
 */

const MAX_EMPLOYEE_PROGRESS = 99;
const EMPLOYEE_EDITABLE_STATUSES = new Set(['IN_PROGRESS', 'BLOCKED']);

const PRIORITY_TONE = {
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'secondary'
};

const PRIORITY_ICON = {
  CRITICAL: 'bi-exclamation-octagon-fill',
  HIGH: 'bi-exclamation-lg',
  MEDIUM: 'bi-dash-lg',
  LOW: 'bi-arrow-down'
};

const STATUS_ICON = {
  PENDING: 'bi-hourglass-split',
  IN_PROGRESS: 'bi-play-circle',
  UNDER_REVIEW: 'bi-send-check',
  BLOCKED: 'bi-exclamation-triangle',
  COMPLETED: 'bi-check-circle',
  CANCELLED: 'bi-ban'
};

const STATUS_ICON_TONE = {
  PENDING: 'text-warning',
  IN_PROGRESS: 'text-primary',
  UNDER_REVIEW: 'text-info',
  BLOCKED: 'text-danger',
  COMPLETED: 'text-success',
  CANCELLED: 'text-secondary'
};

const FILTERS = [
  { key: 'ALL', label: 'All Tasks' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'BLOCKED', label: 'Blocked' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' }
];

const humanise = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** DECIMAL columns arrive as strings ("8.0"), so normalise before formatting. */
const toHours = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  return `${Number(n.toFixed(2))} hour${n === 1 ? '' : 's'}`;
};

const formatDate = (value) => {
  if (!value) return null;
  // Date-only values are parsed as UTC midnight by `new Date()`, which renders as
  // the previous day for anyone west of Greenwich. Pin them to local midnight.
  const raw = String(value);
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    ? new Date(Number(raw.slice(0, 4)), Number(raw.slice(5, 7)) - 1, Number(raw.slice(8, 10)))
    : new Date(raw);
  return Number.isNaN(dateOnly.getTime()) ? String(value) : dateOnly.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

/** axiosInstance rejects with the raw Axios error; its response body is the
 *  `{ success, data, message }` envelope. Surface the server's own validation
 *  message instead of a generic "Request failed". */
const getErrorMessage = (err, fallback) => {
  const body = err?.response?.data;
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
    const fields = body.errors || body.validationErrors;
    if (fields && typeof fields === 'object') {
      const messages = Object.values(fields)
        .flat()
        .map((entry) => (typeof entry === 'string' ? entry : entry?.msg || entry?.message))
        .filter(Boolean);
      if (messages.length) return messages.join(' ');
    }
  }
  return err?.message || fallback;
};

const readProgress = (task) => {
  const n = Number(task?.progress_percent ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

/** Employee input is deliberately capped below 100: only a manager can approve. */
const draftProgress = (task) => {
  const value = readProgress(task);
  return EMPLOYEE_EDITABLE_STATUSES.has(task?.status)
    ? Math.min(MAX_EMPLOYEE_PROGRESS, value)
    : value;
};

function ProgressControl({ task, value, saving, onDraftChange, onSave }) {
  const editable = EMPLOYEE_EDITABLE_STATUSES.has(task.status);
  const percent = readProgress(task);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-muted small">{percent}%</span>
        {!editable && percent === 100 && (
          <span className="text-success small fw-semibold">Approved</span>
        )}
      </div>
      <div
        className="progress mb-2"
        style={{ height: 6 }}
        role="progressbar"
        aria-label={`Progress for ${task.description}`}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${percent}%` }}></div>
      </div>
      {editable && (
        <div className="d-flex align-items-center gap-1">
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 68 }}
            min={0}
            max={MAX_EMPLOYEE_PROGRESS}
            step={1}
            value={value}
            disabled={saving}
            aria-label={`Update progress for ${task.description}`}
            onChange={(e) => onDraftChange(task.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave(task);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={saving}
            onClick={() => onSave(task)}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [progressDrafts, setProgressDrafts] = useState({});
  const [submitTask, setSubmitTask] = useState(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async (syncTaskId = null, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await employeePortalApi.getTasks();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setTasks(list);
      if (syncTaskId) {
        setSelectedTask((prev) => (
          prev && prev.id === syncTaskId
            ? (list.find((task) => task.id === syncTaskId) || null)
            : prev
        ));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load assigned tasks'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const showSuccess = (message) => {
    setUpdateError('');
    setSuccessMsg(message);
  };

  const showActionError = (err, fallback) => {
    setSuccessMsg('');
    setUpdateError(getErrorMessage(err, fallback));
  };

  const handleStartTask = async (task) => {
    if (task.status !== 'PENDING' || savingTaskId) return;
    setSavingTaskId(task.id);
    try {
      await employeePortalApi.startTask(task.id);
      await fetchTasks(task.id, true);
      showSuccess('Task started. You can now record your progress.');
    } catch (err) {
      showActionError(err, 'Failed to start task');
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleProgressDraftChange = useCallback((id, raw) => {
    if (raw === '') {
      setProgressDrafts((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const capped = Math.min(MAX_EMPLOYEE_PROGRESS, Math.max(0, Math.round(n)));
    setProgressDrafts((prev) => ({ ...prev, [id]: String(capped) }));
  }, []);

  const handleSaveProgress = async (task) => {
    if (!EMPLOYEE_EDITABLE_STATUSES.has(task.status) || savingTaskId) return;
    const raw = progressDrafts[task.id] ?? String(draftProgress(task));
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > MAX_EMPLOYEE_PROGRESS) {
      setSuccessMsg('');
      setUpdateError(`Progress must be between 0 and ${MAX_EMPLOYEE_PROGRESS}% until a manager approves the work.`);
      return;
    }
    const capped = Math.min(MAX_EMPLOYEE_PROGRESS, Math.max(0, Math.round(value)));
    setSavingTaskId(task.id);
    try {
      await employeePortalApi.updateTaskProgress(task.id, capped);
      await fetchTasks(task.id, true);
      setProgressDrafts((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
      showSuccess(`Progress saved at ${capped}%.`);
    } catch (err) {
      showActionError(err, 'Failed to update task progress');
    } finally {
      setSavingTaskId(null);
    }
  };

  const openSubmit = (task) => {
    if (!EMPLOYEE_EDITABLE_STATUSES.has(task.status)) return;
    setUpdateError('');
    setSuccessMsg('');
    setSubmissionError('');
    setSubmissionNote('');
    setSubmitTask(task);
  };

  const closeSubmit = useCallback(() => {
    setSubmitTask(null);
    setSubmissionNote('');
    setSubmissionError('');
  }, []);

  const handleSubmitForReview = async (e) => {
    e.preventDefault();
    if (!submitTask || submitting) return;
    const note = submissionNote.trim();
    if (!note) {
      setSubmissionError('Please add a submission note before sending your work for review.');
      return;
    }
    setSubmitting(true);
    setSubmissionError('');
    try {
      await employeePortalApi.submitTaskForReview(submitTask.id, note);
      const submittedId = submitTask.id;
      closeSubmit();
      await fetchTasks(submittedId, true);
      showSuccess('Task submitted for review. Your manager will see it shortly.');
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to submit task for review');
      setSubmissionError(message);
      setSuccessMsg('');
      setUpdateError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeDetails = useCallback(() => setSelectedTask(null), []);

  const filteredTasks = filter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge bg-success">Approved</span>;
      case 'IN_PROGRESS':
        return <span className="badge bg-primary">In Progress</span>;
      case 'UNDER_REVIEW':
        return <span className="badge bg-info text-dark">Submitted · Under Review</span>;
      case 'BLOCKED':
        return <span className="badge bg-danger">Blocked</span>;
      case 'CANCELLED':
        return <span className="badge bg-secondary">Cancelled</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  const counts = useMemo(() => FILTERS.reduce((acc, f) => ({
    ...acc,
    [f.key]: f.key === 'ALL' ? tasks.length : tasks.filter((t) => t.status === f.key).length
  }), {}), [tasks]);

  // A task is overdue when its due date has passed and it is not finished.
  const isOverdue = (task) =>
    task.due_date &&
    !['COMPLETED', 'CANCELLED'].includes(task.status) &&
    new Date(`${String(task.due_date).slice(0, 10)}T23:59:59`) < new Date();

  const renderAction = (task, large = false) => {
    const busy = savingTaskId === task.id;
    const cls = `btn ${large ? '' : 'btn-sm '}${busy ? 'btn-outline-secondary' : 'btn-outline-success'}`;
    if (task.status === 'PENDING') {
      return (
        <button type="button" className={cls} disabled={busy} onClick={() => handleStartTask(task)}>
          <i className="bi bi-play-fill me-1" aria-hidden="true"></i>
          {busy ? 'Starting...' : 'Start Task'}
        </button>
      );
    }
    if (EMPLOYEE_EDITABLE_STATUSES.has(task.status)) {
      return (
        <button type="button" className={cls} disabled={busy} onClick={() => openSubmit(task)}>
          <i className="bi bi-send me-1" aria-hidden="true"></i>
          Submit for Review
        </button>
      );
    }
    if (task.status === 'UNDER_REVIEW') {
      return <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Submitted</button>;
    }
    if (task.status === 'COMPLETED') {
      return <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Approved</button>;
    }
    return <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Cancelled</button>;
  };

  return (
    <AdminPage
      title="My Assigned Tasks"
      subtitle="Track your daily deliverables, record progress, and send completed work to your manager for review"
      loading={loading}
      error={error}
      onRetry={() => fetchTasks()}
    >
      {updateError && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{updateError}</div>
          <button type="button" className="btn-close" onClick={() => setUpdateError('')}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-2" role="status">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <div className="btn-group flex-wrap" role="group">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`btn btn-sm ${filter === f.key ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
            >
              {f.label} ({counts[f.key] || 0})
            </button>
          ))}
        </div>

        <span className="text-muted small">
          {counts.COMPLETED || 0} of {tasks.length} tasks approved
        </span>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th style={{ width: '40px' }}><span className="visually-hidden">Status</span></th>
                <th>Task Description</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Manager Feedback</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    {tasks.length === 0 ? (
                      <EmptyState
                        icon="bi-clipboard-check"
                        title="No tasks assigned yet"
                        text="When your manager assigns work to you it will appear here automatically. Nothing has been assigned to you yet."
                        compact
                      />
                    ) : (
                      <div className="text-center py-4 text-muted small">
                        No tasks match this filter.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="emp-row-clickable"
                    onClick={() => setSelectedTask(task)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for task: ${task.description}`}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTask(task);
                      }
                    }}
                  >
                    <td className="text-center">
                      <i
                        className={`bi ${STATUS_ICON[task.status] || 'bi-circle'} ${STATUS_ICON_TONE[task.status] || 'text-muted'}`}
                        aria-hidden="true"
                      ></i>
                    </td>
                    <td>
                      <div className={`fw-semibold text-dark ${task.status === 'COMPLETED' ? 'text-muted' : ''}`}>
                        {task.description}
                      </div>
                      {(task.project_name || task.sprint_name) && (
                        <div className="text-muted small">
                          {[task.project_name, task.sprint_name].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td>
                      {task.priority ? (
                        <DetailBadge tone={PRIORITY_TONE[task.priority] || 'secondary'}>
                          <i className={`bi ${PRIORITY_ICON[task.priority] || 'bi-dash'} me-1`} aria-hidden="true"></i>
                          {humanise(task.priority)}
                        </DetailBadge>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {task.due_date ? formatDate(task.due_date) : 'No due date'}
                      {isOverdue(task) && (
                        <div>
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Overdue</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(task.status)}
                      {Number(task.rejection_count) > 0 && (
                        <div className="mt-1">
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                            Rejected {task.rejection_count}×
                          </span>
                        </div>
                      )}
                      {task.submitted_at && (
                        <div className="text-muted small mt-1">Submitted {formatDate(task.submitted_at)}</div>
                      )}
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <ProgressControl
                        task={task}
                        value={progressDrafts[task.id] ?? String(draftProgress(task))}
                        saving={savingTaskId === task.id}
                        onDraftChange={handleProgressDraftChange}
                        onSave={handleSaveProgress}
                      />
                    </td>
                    <td className="small emp-clamp-cell" style={{ maxWidth: 220 }}>
                      {task.review_note ? (
                        <span className="text-muted fst-italic" title={task.review_note}>
                          &ldquo;{task.review_note}&rdquo;
                        </span>
                      ) : task.status === 'UNDER_REVIEW' ? (
                        <span className="text-muted">Awaiting manager review</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                      {task.reviewed_at && (
                        <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                          Reviewed {formatDate(task.reviewed_at)}
                        </div>
                      )}
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      {renderAction(task)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailModal
        open={Boolean(selectedTask)}
        onClose={closeDetails}
        icon="bi-check2-square"
        accent={selectedTask?.status === 'COMPLETED' ? 'success' : selectedTask?.status === 'IN_PROGRESS' ? 'info' : 'warning'}
        title={selectedTask?.description || 'Task'}
        subtitle={
          selectedTask
            ? [selectedTask.project_name, selectedTask.sprint_name].filter(Boolean).join(' · ') || 'Assigned task'
            : ''
        }
        badge={selectedTask && getStatusBadge(selectedTask.status)}
        footer={
          selectedTask && (
            <>
              <button type="button" className="btn btn-light" onClick={closeDetails}>
                Close
              </button>
              {renderAction(selectedTask, true)}
            </>
          )
        }
      >
        {selectedTask && (
          <>
            <DetailSection title="Assignment">
              <dl className="emp-detail__row-list mb-0">
                <DetailRow label="Status" value={humanise(selectedTask.status)} />
                <DetailRow label="Priority" value={humanise(selectedTask.priority)} />
                <DetailRow label="Due date" value={formatDate(selectedTask.due_date)} />
                <DetailRow label="Started" value={formatDateTime(selectedTask.started_at)} />
                <DetailRow label="Submitted" value={formatDateTime(selectedTask.submitted_at)} />
                <DetailRow label="Assigned" value={formatDateTime(selectedTask.created_at)} />
                <DetailRow label="Last updated" value={formatDateTime(selectedTask.updated_at)} />
                <DetailRow label="Task ID" value={selectedTask.id} mono />
              </dl>
            </DetailSection>

            <DetailSection title="Progress" icon="bi-bar-chart">
              <ProgressControl
                task={selectedTask}
                value={progressDrafts[selectedTask.id] ?? String(draftProgress(selectedTask))}
                saving={savingTaskId === selectedTask.id}
                onDraftChange={handleProgressDraftChange}
                onSave={handleSaveProgress}
              />
              {EMPLOYEE_EDITABLE_STATUSES.has(selectedTask.status) && (
                <p className="text-muted small mt-2 mb-0">
                  You can save up to {MAX_EMPLOYEE_PROGRESS}%. Only a manager can mark work as complete.
                </p>
              )}
            </DetailSection>

            <DetailSection title="Work breakdown" icon="bi-diagram-3">
              <dl className="emp-detail__row-list mb-0">
                <DetailRow label="Project" value={selectedTask.project_name} />
                <DetailRow
                  label="Sprint"
                  value={selectedTask.sprint_name
                    ? `${selectedTask.sprint_name}${selectedTask.sprint_number != null ? ` (#${selectedTask.sprint_number})` : ''}`
                    : null}
                />
                <DetailRow label="Milestone" value={selectedTask.milestone_name} />
                <DetailRow label="Milestone target" value={formatDate(selectedTask.milestone_target_date)} />
                <DetailRow
                  label="Estimated effort"
                  value={toHours(selectedTask.estimated_hours)}
                />
                {/* actual_hours is a NOT NULL decimal defaulting to 0.0, so a task
                    nobody has logged time against reports 0 rather than NULL.
                    Treated as "not logged yet" so the dialog never implies work
                    was recorded. */}
                <DetailRow
                  label="Logged effort"
                  value={Number(selectedTask.actual_hours) > 0 ? toHours(selectedTask.actual_hours) : null}
                />
              </dl>
            </DetailSection>

            <DetailSection title="Submission & manager feedback" icon="bi-chat-square-quote">
              {Number(selectedTask.rejection_count) > 0 && (
                <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3" role="status">
                  <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                  <span>
                    Sent back <strong>{selectedTask.rejection_count}×</strong> by your manager.
                    Revise the work and submit it again.
                  </span>
                </div>
              )}

              {selectedTask.submission_note ? (
                <>
                  <h6 className="emp-detail__section-title">Your submission note</h6>
                  <DetailBodyText>{selectedTask.submission_note}</DetailBodyText>
                </>
              ) : null}

              {selectedTask.status === 'UNDER_REVIEW' && (
                <div className="emp-decision emp-decision--pending mt-3">
                  <div className="fw-semibold text-dark">
                    <i className="bi bi-hourglass-split me-2" aria-hidden="true"></i>
                    Submitted and awaiting manager review
                  </div>
                  <div className="emp-decision__by">
                    {selectedTask.submitted_at ? formatDateTime(selectedTask.submitted_at) : 'Your submission is with your manager.'}
                  </div>
                </div>
              )}

              {selectedTask.review_note && (
                <div
                  className={`emp-decision mt-3 ${
                    selectedTask.status === 'COMPLETED' ? 'emp-decision--approved' : 'emp-decision--rejected'
                  }`}
                >
                  <div className="fw-semibold text-dark">
                    <i
                      className={`bi ${selectedTask.status === 'COMPLETED' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}
                      aria-hidden="true"
                    ></i>
                    {selectedTask.status === 'COMPLETED' ? 'Approved by manager' : 'Manager feedback'}
                  </div>
                  {selectedTask.reviewed_at && (
                    <div className="emp-decision__by">{formatDateTime(selectedTask.reviewed_at)}</div>
                  )}
                  <div className="mt-2">
                    <DetailBodyText>{selectedTask.review_note}</DetailBodyText>
                  </div>
                </div>
              )}
            </DetailSection>
          </>
        )}
      </DetailModal>

      {/* Submit-for-review dialog. The note is required so a manager always has
          context, and server validation messages appear here and in the top alert. */}
      {submitTask && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="taskSubmitTitle"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 id="taskSubmitTitle" className="modal-title fw-bold">Submit Task for Review</h5>
                <button type="button" className="btn-close" onClick={closeSubmit} disabled={submitting}></button>
              </div>
              <form onSubmit={handleSubmitForReview}>
                <div className="modal-body">
                  <p className="fw-semibold text-dark mb-1">{submitTask.description}</p>
                  <p className="text-muted small mb-3">
                    Current progress: {readProgress(submitTask)}%. Your manager will review this submission.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="taskSubmissionNote">Submission note</label>
                    <textarea
                      id="taskSubmissionNote"
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Summarise what you completed and anything your manager should check..."
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      disabled={submitting}
                    ></textarea>
                  </div>
                  {submissionError && (
                    <div className="alert alert-danger d-flex align-items-center mb-0" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
                      <div>{submissionError}</div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeSubmit} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
