import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (response) => response?.data?.data ?? response?.data;
const currentMonth = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).slice(0, 7);
const clock = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }) : '—';
const statusTone = (status) => status === 'PRESENT' ? 'success' : status === 'ABSENT' ? 'danger' : status === 'SUNDAY' ? 'danger' : status === 'LEAVE' ? 'warning' : 'secondary';

export default function PersonMonitoringModal({ person, onClose, canAssignCoverage = false }) {
  const [month, setMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(person?.selected_date || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()));
  const [details, setDetails] = useState(null);
  const [roster, setRoster] = useState([]);
  const [replacementId, setReplacementId] = useState('');
  const [taskIds, setTaskIds] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!person?.user_id) return;
    setLoading(true);
    setError('');
    try {
      const [personResponse, rosterResponse] = await Promise.all([
        axiosInstance.get(`/v1/org/people/${encodeURIComponent(person.user_id)}`, { params: { month } }),
        axiosInstance.get('/v1/org/attendance/month', { params: { month } })
      ]);
      setDetails(unwrap(personResponse));
      setRoster(unwrap(rosterResponse)?.people || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load this personnel record.');
    } finally {
      setLoading(false);
    }
  }, [person?.user_id, month]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelectedDate(person?.selected_date || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())); }, [person?.user_id, person?.selected_date]);

  const monitored = details?.person;
  const selectedDay = useMemo(() => monitored?.calendar?.find((day) => day.date === selectedDate), [monitored, selectedDate]);
  const replacementOptions = useMemo(() => roster.filter((candidate) => candidate.user_id !== person?.user_id
    && candidate.calendar?.find((day) => day.date === selectedDate)?.status === 'PRESENT'
    && candidate.open_task_count === 0), [roster, person?.user_id, selectedDate]);
  const coverableTasks = useMemo(() => (details?.tasks || []).filter((task) => String(task.due_date).slice(0, 10) === selectedDate
    && !['COMPLETED', 'CANCELLED'].includes(task.status)), [details, selectedDate]);

  const assignCoverage = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = unwrap(await axiosInstance.post('/v1/org/attendance/coverage', {
        work_date: selectedDate,
        absent_user_id: person.user_id,
        replacement_user_id: replacementId,
        task_ids: taskIds,
        note
      }));
      setNotice(`Coverage saved. ${result.tasks_reassigned} task(s) reassigned.`);
      setReplacementId(''); setTaskIds([]); setNote('');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not assign coverage.');
    } finally {
      setSaving(false);
    }
  };

  if (!person) return null;
  return <div className="modal d-block" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} style={{ background: 'rgba(0,0,0,.45)', zIndex: 1080 }}>
    <div className="modal-dialog modal-xl modal-dialog-scrollable" role="dialog" aria-modal="true" aria-labelledby="person-monitor-title">
      <div className="modal-content">
        <div className="modal-header">
          <div><h2 id="person-monitor-title" className="modal-title h5 mb-1">{monitored?.full_name || person.full_name || 'Personnel details'}</h2>
            <div className="small text-secondary">{monitored?.employee_code || person.employee_code || 'No staff ID'} · {monitored?.employment_type || person.employment_type || 'Employee'}</div></div>
          <div className="d-flex align-items-center gap-2"><input type="month" className="form-control form-control-sm" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Choose attendance month" /><button type="button" className="btn-close" onClick={onClose} aria-label="Close" /></div>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {notice && <div className="alert alert-success" role="status">{notice}</div>}
          {loading ? <div role="status" className="text-secondary">Loading personnel record…</div> : monitored && <>
            <div className="row g-2 mb-3">
              <div className="col-6 col-lg-3"><div className="border rounded p-2 h-100"><small className="text-secondary">Role / division</small><div>{monitored.role} · {monitored.department_name || monitored.department || 'Unassigned'}</div><small>{monitored.sub_role || 'No sub-role'}</small></div></div>
              <div className="col-6 col-lg-3"><div className="border rounded p-2 h-100"><small className="text-secondary">Attendance days present</small><div className="h5 mb-0">{monitored.present_days || 0}</div><small>{month}</small></div></div>
              <div className="col-6 col-lg-3"><div className="border rounded p-2 h-100"><small className="text-secondary">Availability today</small><div className={`fw-bold ${monitored.availability === 'AVAILABLE' ? 'text-success' : monitored.availability === 'NOT_AVAILABLE' ? 'text-danger' : monitored.availability === 'BUSY' ? 'text-warning' : 'text-secondary'}`}>{monitored.availability === 'AVAILABLE' ? 'Available for work' : monitored.availability === 'BUSY' ? 'Busy with open tasks' : monitored.availability === 'NOT_AVAILABLE' ? 'Not available' : 'Not recorded'}</div><small>{monitored.branch_name || 'Branch unassigned'}</small></div></div>
              <div className="col-6 col-lg-3"><div className="border rounded p-2 h-100"><small className="text-secondary">Open tasks</small><div className="h5 mb-0">{(details.tasks || []).filter((task) => !['COMPLETED', 'CANCELLED'].includes(task.status)).length}</div><small>Current assigned work</small></div></div>
            </div>

            <h3 className="h6">Attendance calendar · {month}</h3>
            <div className="d-flex flex-wrap gap-1 mb-2">{monitored.calendar?.map((day) => <button type="button" key={day.date} onClick={() => setSelectedDate(day.date)}
              className={`btn btn-sm btn-outline-${statusTone(day.status)} ${selectedDate === day.date ? 'active' : ''}`} title={`${day.date} ${day.status}`}>
              {Number(day.date.slice(-2))}: {day.status === 'PRESENT' ? 'P' : day.status === 'ABSENT' ? 'A' : day.status === 'SUNDAY' ? 'Sun' : day.status === 'LEAVE' ? 'L' : day.status === 'HOLIDAY' ? 'H' : '·'}
            </button>)}</div>
            <div className="small mb-3"><strong>{selectedDate}</strong> · <span className={`text-${statusTone(selectedDay?.status)}`}>{selectedDay?.status || 'No data'}</span>
              {' · '}In: {clock(selectedDay?.check_in_time)} · Out: {selectedDay?.check_out_time ? clock(selectedDay.check_out_time) : selectedDay?.is_punched_in ? 'Still punched in' : selectedDay?.check_in_time ? 'Not entered' : clock(null)} · {Math.floor(Number(selectedDay?.worked_minutes || 0) / 60)}h {String(Number(selectedDay?.worked_minutes || 0) % 60).padStart(2, '0')}m · {selectedDay?.session_count || 0} session(s)
              {selectedDay?.status === 'ABSENT' && <strong className="text-danger"> · Not available</strong>}
            </div>

            {canAssignCoverage && selectedDay?.status === 'ABSENT' && <form className="border rounded p-3 mb-3" onSubmit={assignCoverage}>
              <h3 className="h6">Assign cover for {selectedDate}</h3>
              <div className="row g-2 align-items-end">
                <label className="col-12 col-md-4 form-label mb-0">Available replacement<select className="form-select mt-1" required value={replacementId} onChange={(event) => setReplacementId(event.target.value)}>
                  <option value="">Select someone present that day</option>{replacementOptions.map((candidate) => <option key={candidate.user_id} value={candidate.user_id}>{candidate.full_name} · {candidate.employment_type}</option>)}
                </select></label>
                <label className="col-12 col-md-5 form-label mb-0">Open tasks due that day<select className="form-select mt-1" multiple value={taskIds} onChange={(event) => setTaskIds(Array.from(event.target.selectedOptions, (option) => option.value))}>
                  {coverableTasks.map((task) => <option key={task.id} value={task.id}>{task.description} · {task.status}</option>)}
                </select><small className="text-secondary">Optional. Hold Ctrl to select several tasks.</small></label>
                <label className="col-12 col-md-3 form-label mb-0">Coverage note<input className="form-control mt-1" value={note} maxLength={1000} onChange={(event) => setNote(event.target.value)} /></label>
              </div>
              {!replacementOptions.length && <div className="small text-danger mt-2">No one is recorded present for this date, so there is no eligible replacement yet.</div>}
              <button className="btn btn-sm btn-primary mt-3" type="submit" disabled={saving || !replacementId}>{saving ? 'Saving…' : 'Assign coverage'}</button>
            </form>}

            <h3 className="h6 mt-3">Tasks and projects</h3><div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead><tbody>
              {details.tasks?.map((task) => <tr key={task.id}><td>{task.description}</td><td>{task.project_name || 'Unlinked'}</td><td>{task.status}</td><td>{task.priority}</td><td>{String(task.due_date).slice(0, 10)}</td></tr>)}
              {!details.tasks?.length && <tr><td colSpan="5" className="text-secondary">No tasks assigned.</td></tr>}
            </tbody></table></div>
            {details.coverage?.length > 0 && <><h3 className="h6 mt-3">Coverage history</h3><ul className="small">{details.coverage.map((row) => <li key={row.id}>{row.work_date}: {row.absent_name} covered by {row.replacement_name}{row.note ? ` · ${row.note}` : ''}</li>)}</ul></>}
          </>}
        </div>
      </div>
    </div>
  </div>;
}
