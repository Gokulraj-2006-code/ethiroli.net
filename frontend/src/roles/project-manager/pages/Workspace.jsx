import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import PersonMonitoringModal from '../../../common/components/Attendance/PersonMonitoringModal.jsx';

const unwrap = (response) => response?.data?.data ?? response?.data;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const clockIST = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }) : '—';

export default function ManagerDashboard() {
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ employee: '', department: '', status: '', priority: '' });
  const [form, setForm] = useState({ assigned_to: '', description: '', due_date: '', priority: 'MEDIUM' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [teamResponse, taskResponse] = await Promise.all([
        axiosInstance.get('/v1/org/directory'),
        axiosInstance.get('/v1/tasks')
      ]);
      setTeam(unwrap(teamResponse) || []);
      setTasks(unwrap(taskResponse) || []);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load the authorized team. Check that a manager scope is assigned.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const person = team.find((member) => member.user_id === task.assigned_to);
    return (!filter.employee || task.assigned_to === filter.employee)
      && (!filter.department || person?.department_name === filter.department)
      && (!filter.status || task.status === filter.status)
      && (!filter.priority || task.priority === filter.priority);
  }), [tasks, team, filter]);

  const submitTask = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      await axiosInstance.post('/v1/tasks', { ...form, subscription_id: undefined });
      // Notify the assigned employee
      try {
        await axiosInstance.post('/v1/notifications', {
          recipient_user_id: form.assigned_to,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${form.description}`,
          related_entity_type: 'TASK',
          related_entity_id: form.assigned_to
        });
      } catch (notifyErr) {
        console.error('Notification failed:', notifyErr.message);
      }
      setNotice('Task assigned and saved. Employee has been notified.');
      setForm({ assigned_to: '', description: '', due_date: '', priority: 'MEDIUM' });
      await load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Task could not be assigned. Confirm the assignee is in your scope.'); }
    finally { setSaving(false); }
  };

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewTask, setReviewTask] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [appreciationMsg, setAppreciationMsg] = useState('');

const openReview = (task, status) => {
    setReviewTask(task);
    setReviewStatus(status);
    setReviewNote('');
    setAppreciationMsg(status === 'COMPLETED' ? 'Excellent work! Well done. Keep up the good work.' : '');
    setReviewModal(true);
  };

  const closeReview = () => {
    setReviewModal(false);
    setReviewTask(null);
    setReviewStatus('');
    setReviewNote('');
    setAppreciationMsg('');
  };

  const submitReview = async () => {
    if (!reviewTask) return;
    setError(''); setNotice('');
    try {
      const apiStatus = reviewStatus === 'UNBLOCKED' ? 'IN_PROGRESS' : reviewStatus;
      await axiosInstance.patch(`/v1/tasks/${encodeURIComponent(reviewTask.id)}/status`, {
        status: apiStatus,
        review_note: reviewNote,
        appreciation: appreciationMsg,
      });
      setNotice(reviewStatus === 'IN_PROGRESS' && reviewTask.status === 'BLOCKED' ? 'Task unblocked and employee notified.' : reviewStatus === 'IN_PROGRESS' ? 'Correction requested.' : reviewStatus === 'UNBLOCKED' ? 'Task unblocked and employee notified.' : 'Task approved and completed.');
      closeReview();
      await load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save the review.'); }
  };

  const count = (status) => tasks.filter((task) => task.status === status).length;
  const divisions = [...new Set(team.map((member) => member.department_name).filter(Boolean))];
  const overdue = tasks.filter((task) => task.status !== 'COMPLETED' && task.due_date && String(task.due_date).slice(0, 10) < today()).length;

  return <AdminPage title="Manager workspace" subtitle="Your assigned team and task workflow" loading={loading} error={error} onRetry={load}>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <div className="row g-3 mb-4">{[
      ['Team members', team.length], ['Employees', team.filter((p) => p.employment_type !== 'Intern').length], ['Interns', team.filter((p) => p.employment_type === 'Intern').length],
      ['Pending', count('PENDING')], ['In progress', count('IN_PROGRESS')], ['Awaiting review', count('UNDER_REVIEW')], ['Completed', count('COMPLETED')], ['Overdue', overdue]
    ].map(([label, value]) => <div className="col-6 col-md-3" key={label}><div className="card h-100 shadow-sm"><div className="card-body"><div className="small text-secondary">{label}</div><div className="h3 mb-0">{loading ? '—' : value}</div></div></div></div>)}</div>

    <div className="row g-4">
      <div className="col-12 col-xl-4"><section className="card shadow-sm h-100"><div className="card-header bg-white"><h2 className="h6 mb-0">Assign a task</h2></div><div className="card-body">
        {!team.length ? <p className="text-secondary mb-0">No people are in your assigned branch/team scope.</p> : <form className="d-grid gap-3" onSubmit={submitTask}>
          <label className="form-label mb-0">Team member<select className="form-select mt-1" required value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}><option value="">Choose an assignee</option>{team.map((person) => <option key={person.user_id} value={person.user_id}>{person.full_name}{person.employment_type === 'Intern' ? ' (Intern)' : ''} · {person.department_name || 'Division unassigned'}</option>)}</select></label>
          <label className="form-label mb-0">Task and instructions<textarea className="form-control mt-1" required maxLength={5000} rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="row g-2"><label className="col form-label mb-0">Deadline<input className="form-control mt-1" type="date" required min={today()} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label><label className="col form-label mb-0">Priority<select className="form-select mt-1" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['LOW','MEDIUM','HIGH','CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select></label></div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Assign task'}</button>
        </form>}
      </div></section></div>

      <div className="col-12 col-xl-8"><section className="card shadow-sm"><div className="card-header bg-white"><h2 className="h6 mb-0">Authorized team and today’s attendance · Asia/Kolkata</h2></div><div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead><tr><th>Name</th><th>ID</th><th>Type</th><th>Branch</th><th>Division</th><th>Sub-role</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th></tr></thead><tbody>{team.map((person) => <tr key={person.user_id}><td><button className="btn btn-link p-0 text-start" type="button" onClick={() => setSelectedPerson(person)}>{person.full_name}</button></td><td><button className="btn btn-link p-0" type="button" onClick={() => setSelectedPerson(person)}>{person.employee_code || '—'}</button></td><td>{person.employment_type === 'Intern' ? <span className="badge text-bg-info">Intern</span> : 'Employee'}</td><td>{person.branch_name || '—'}</td><td>{person.department_name || '—'}</td><td>{person.sub_role || '—'}</td><td>{person.attendance_status || 'Not recorded'}</td><td>{clockIST(person.check_in_time)}</td><td>{clockIST(person.check_out_time)}</td><td>{person.worked_minutes != null ? `${Math.floor(Number(person.worked_minutes) / 60)}h ${String(Number(person.worked_minutes) % 60).padStart(2, '0')}m` : person.total_hours != null ? `${person.total_hours}h` : '—'}</td></tr>)}</tbody></table></div></section></div>
    </div>

    <section className="card shadow-sm mt-4"><div className="card-header bg-white"><h2 className="h6 mb-0">Team tasks</h2></div>
      <div className="card-body border-bottom"><div className="row g-2">
        <div className="col-sm-6 col-lg"><select className="form-select" aria-label="Filter by team member" value={filter.employee} onChange={(e) => setFilter({ ...filter, employee: e.target.value })}><option value="">All team members</option>{team.map((p) => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}</select></div>
        <div className="col-sm-6 col-lg"><select className="form-select" aria-label="Filter by division" value={filter.department} onChange={(e) => setFilter({ ...filter, department: e.target.value })}><option value="">All divisions</option>{divisions.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div className="col-sm-6 col-lg"><select className="form-select" aria-label="Filter by status" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}><option value="">All statuses</option>{['PENDING','IN_PROGRESS','UNDER_REVIEW','COMPLETED','BLOCKED','CANCELLED'].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="col-sm-6 col-lg"><select className="form-select" aria-label="Filter by priority" value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}><option value="">All priorities</option>{['LOW','MEDIUM','HIGH','CRITICAL'].map((s) => <option key={s}>{s}</option>)}</select></div>
      </div></div>
      <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Task</th><th>Assigned to</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Review</th></tr></thead><tbody>{filteredTasks.map((task) => <tr key={task.id}><td>{task.description}</td><td>{team.find((p) => p.user_id === task.assigned_to)?.full_name || 'Team member'}</td><td>{task.priority}</td><td>{String(task.due_date || '').slice(0,10)}</td><td>{task.status}</td><td>{task.status === 'UNDER_REVIEW' && <div className="d-flex gap-1"><button className="btn btn-sm btn-success" onClick={() => openReview(task, 'COMPLETED')}>Approve</button><button className="btn btn-sm btn-outline-warning" onClick={() => openReview(task, 'IN_PROGRESS')}>Request correction</button></div>}{task.status === 'BLOCKED' ? (
  <div className="d-flex gap-1">
    <button className="btn btn-sm btn-outline-success" onClick={() => openReview(task, 'UNBLOCKED')}>Unblock Task</button>
    <button className="btn btn-sm btn-outline-secondary" onClick={() => openReview(task, 'CANCELLED')}>Cancel Task</button>
  </div>
) : ['PENDING','IN_PROGRESS'].includes(task.status) ? (
  <div className="d-flex gap-1">
    <button className="btn btn-sm btn-outline-danger" onClick={() => openReview(task, 'BLOCKED')}>Mark Blocked</button>
    <button className="btn btn-sm btn-outline-secondary" onClick={() => openReview(task, 'CANCELLED')}>Cancel Task</button>
  </div>
) : null}</td></tr>)}</tbody></table>{!filteredTasks.length && !loading && <div className="p-3 text-secondary">No tasks match these filters.</div>}</div>
    </section>
    {selectedPerson && <PersonMonitoringModal person={selectedPerson} onClose={() => setSelectedPerson(null)} canAssignCoverage={false} />}
    {reviewModal && reviewTask && (
      <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={closeReview}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{reviewStatus === 'IN_PROGRESS' && reviewTask.status === 'BLOCKED' ? 'Unblock Task' : reviewStatus === 'IN_PROGRESS' ? 'Request Task Correction' : reviewStatus === 'BLOCKED' ? 'Block Task' : reviewStatus === 'UNBLOCKED' ? 'Unblock Task' : reviewStatus === 'CANCELLED' ? 'Cancel Task' : 'Approve Task'}</h5>
              <button className="btn-close" onClick={closeReview}></button>
            </div>
            <div className="modal-body">
              <p><strong>Task:</strong> {reviewTask.description}</p>
              <p><strong>Employee:</strong> {team.find((p) => p.user_id === reviewTask.assigned_to)?.full_name || 'Team member'} (ID: {reviewTask.assigned_to})</p>
              {reviewStatus === 'IN_PROGRESS' ? (
                <>
                  <label className="form-label">Correction instructions (required)</label>
                  <textarea className="form-control" rows={4} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} required />
                  <label className="form-label mt-2">Additional remark (optional)</label>
                  <textarea className="form-control" rows={2} value={appreciationMsg} onChange={(e) => setAppreciationMsg(e.target.value)} />
                </>
              ) : reviewStatus === 'BLOCKED' ? (
                <>
                  <label className="form-label">Reason for blocking (optional)</label>
                  <textarea className="form-control" rows={3} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                </>
              ) : reviewStatus === 'UNBLOCKED' ? (
                <>
                  <label className="form-label">Reason for unblocking (required)</label>
                  <textarea className="form-control" rows={3} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} required />
                </>
              ) : reviewStatus === 'CANCELLED' ? (
                <p className="text-muted">This task will be cancelled. This action cannot be undone.</p>
              ) : (
                <>
                  <label className="form-label">Review remark (optional)</label>
                  <textarea className="form-control" rows={3} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                  <label className="form-label mt-2">Appreciation message (optional)</label>
                  <textarea className="form-control" rows={2} value={appreciationMsg} onChange={(e) => setAppreciationMsg(e.target.value)} />
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeReview}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview}>{reviewStatus === 'IN_PROGRESS' && reviewTask.status === 'BLOCKED' ? 'Confirm Unblock' : reviewStatus === 'IN_PROGRESS' ? 'Send Correction' : reviewStatus === 'BLOCKED' ? 'Confirm Block' : reviewStatus === 'UNBLOCKED' ? 'Confirm Unblock' : reviewStatus === 'CANCELLED' ? 'Confirm Cancellation' : 'Confirm Approval'}</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </AdminPage>;
}
