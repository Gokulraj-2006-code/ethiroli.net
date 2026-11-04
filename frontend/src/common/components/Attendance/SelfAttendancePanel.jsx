import React, { useCallback, useEffect, useState } from 'react';
import AdminPage from '../AdminPage/AdminPage.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';
import {
  formatClock,
  formatSessionRange,
  formatDuration,
  formatLiveDuration,
  formatDateLabel,
  openSessionElapsedSeconds,
  liveWorkedMinutes,
  punchStatusLabel,
  punchStatusClass,
} from '../../../roles/employee/utils/attendanceFormat.js';
import { LiveDot } from '../../../roles/employee/components/StatCard.jsx';

/**
 * SelfAttendancePanel - the Employee portal attendance experience.
 *
 * It is shared by the Employee, HR, and Manager portals so the punch-in/out
 * card, KPI tiles, and daily attendance records are identical everywhere.
 *
 * `api` must expose:
 *   - getTodayAttendance()
 *   - getAttendanceHistory({ limit })
 *   - punchAttendance('CHECK_IN' | 'CHECK_OUT')
 *
 * `embedded` renders only the page body (for a page that supplies its own
 * AdminPage wrapper). Without it the panel renders its own AdminPage.
 */
export const selfAttendanceApi = {
  getTodayAttendance: () => axiosInstance.get('/v1/attendance/today'),
  // The generic self history endpoint is scoped to req.user.id, so it is safe
  // for HR and Manager and returns the same session-enriched rows as the
  // Employee portal endpoint.
  getAttendanceHistory: (params) => axiosInstance.get('/v1/attendance/history', { params }),
  punchAttendance: (action) => axiosInstance.post('/v1/attendance/punch', { action, work_mode: 'OFFICE' }),
};

export default function SelfAttendancePanel({
  api,
  pageTitle = 'Attendance & Time Clock',
  pageSubtitle = 'Track your work sessions, punches, and daily working hours',
  embedded = false,
}) {
  const [history, setHistory] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [punching, setPunching] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Punch Out is only sent after the user confirms in the modal.
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  // Month navigation state
  const [selectedMonth, setSelectedMonth] = useState(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).slice(0, 7)); // YYYY-MM
  // Format a Date to YYYY-MM in local timezone (Asia/Kolkata), avoiding UTC conversion issues
  const formatYearMonth = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [selectedDate, setSelectedDate] = useState(null); // specific date YYYY-MM-DD

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.getTodayAttendance(),
        api.getAttendanceHistory({ 
          start_date: selectedMonth ? `${selectedMonth}-01` : undefined,
          // Build the calendar date as a date-only string. Converting local
          // midnight to ISO can shift it to the previous day in Asia/Kolkata.
          end_date: selectedMonth
            ? `${selectedMonth}-${String(new Date(Date.UTC(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)), 0)).getUTCDate()).padStart(2, '0')}`
            : undefined,
          limit: 365,
        }),
      ]);
      // `axiosInstance` unwraps to response.data, so these are the envelopes.
      setToday(todayRes?.data || null);
      // Reference point for the live "Total Working Hours" tick: the server
      // folded the open session's elapsed time into worked_minutes as of now.
      setFetchedAt(Date.now());
      const list = historyRes?.data || [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  }, [api, selectedMonth]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Live clock + ticking duration for the open session.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
      setElapsedSeconds(openSessionElapsedSeconds(today));
    }, 1000);
    return () => clearInterval(timer);
  }, [today]);

  const isPunchedIn = Boolean(today?.is_punched_in);

  // ---- Punch In: no confirmation required, sent immediately. ----
  const handlePunchIn = async () => {
    setPunching(true);
    setSuccessMsg('');
    setError(null);
    setConfirmError('');
    try {
      await api.punchAttendance('CHECK_IN');
      setSuccessMsg('Punched in successfully. Have a productive day!');
      await loadAttendance();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to punch in');
    } finally {
      setPunching(false);
    }
  };

  // ---- Punch Out: step 1, open the confirmation modal (no API call). ----
  const handlePunchOutClick = () => {
    setConfirmError('');
    setShowConfirm(true);
  };

  // ---- Punch Out: step 2, only called after Confirm. ----
  const handleConfirmPunchOut = async () => {
    if (punching) return; // guard against duplicate submissions
    setPunching(true);
    setConfirmError('');
    try {
      await api.punchAttendance('CHECK_OUT');
      setShowConfirm(false);
      setSuccessMsg('Punched out successfully. See you tomorrow!');
      await loadAttendance();
    } catch (err) {
      // Keep the modal open so the session state is never lost and the user
      // can retry; do not show a false success.
      setConfirmError(err.response?.data?.message || err.message || 'Punch out failed. Please try again.');
    } finally {
      setPunching(false);
    }
  };

  const cancelPunchOut = () => {
    if (punching) return;
    setShowConfirm(false);
    setConfirmError('');
  };

  const sessions = today?.sessions || [];
  const currentSession = today?.current_session || null;
  const totalWorked = liveWorkedMinutes(today, fetchedAt);
  const currentSessionMinutes = Math.floor(elapsedSeconds / 60);

  const stats = {
    total: history.length,
    present: history.filter((r) => r.status === 'PRESENT').length,
    late: history.filter((r) => r.is_late).length,
    halfDay: history.filter((r) => r.status === 'HALF_DAY').length,
    absent: history.filter((r) => r.status === 'ABSENT').length,
  };

  // null (not a fabricated 100%) when no days are on record.
  const rate = stats.total > 0
    ? Math.round(((stats.present + stats.halfDay * 0.5) / stats.total) * 100)
    : null;

  const totalHours = (history.reduce((s, r) => s + (Number(r.worked_hours) || 0), 0)).toFixed(1);

  const body = (
    <div className="container-fluid px-0">
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div className="flex-grow-1">{error}</div>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadAttendance} disabled={loading}>
            Retry
          </button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-2" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div className="flex-grow-1">{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {loading && !today ? (
        <div className="text-center py-5" role="status">
          <span className="spinner-border text-primary" aria-hidden="true"></span>
          <p className="text-muted mt-2 mb-0">Loading attendance…</p>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="row g-3 mb-2">
            <div className="col-6 col-md-3">
              <div className="emp-stat emp-stat--olive h-100 text-center">
                <span className="emp-stat__label d-block">Attendance Rate</span>
                <div className="emp-stat__value">{rate === null ? '—' : `${rate}%`}</div>
                <div className="emp-stat__hint">
                  {rate === null
                    ? 'No days recorded yet'
                    : rate >= 95
                      ? 'Meets the 95% target'
                      : 'Target: 95% minimum'}
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="emp-stat emp-stat--teal h-100 text-center">
                <span className="emp-stat__label d-block">Present Days</span>
                <div className="emp-stat__value">{stats.present}</div>
                <div className="emp-stat__hint">{stats.total} Logged Days</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="emp-stat emp-stat--gold h-100 text-center">
                <span className="emp-stat__label d-block">Total Hours Worked</span>
                <div className="emp-stat__value">{totalHours}h</div>
                <div className="emp-stat__hint">Excludes breaks</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="emp-stat emp-stat--clay h-100 text-center">
                <span className="emp-stat__label d-block">Punctuality</span>
                <div className={`emp-stat__value ${stats.late > 2 ? 'text-warning' : ''}`}>{stats.late} Late</div>
                <div className="emp-stat__hint">{stats.late === 0 ? 'Perfect timing' : 'Arrivals after 09:00'}</div>
              </div>
            </div>
          </div>

          {/* Punch Clock Card */}
          <div className="card shadow-sm border-0 mb-2 bg-light">
            <div className="card-body p-3">
              <div className="row align-items-center g-4">
                <div className="col-md-7 mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                      <i className="bi bi-clock-history fs-3"></i>
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">Live Work Clock</h5>
                      <p className="text-muted mb-0 small">
                        {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} • <strong className="text-dark">{currentTime}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-3 pt-2 border-top flex-wrap">
                    <div>
                      <span className="text-muted small d-block">Status</span>
                      <span className={`badge ${punchStatusClass(today)}`}>
                        {punchStatusLabel(today)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted small d-block">Sessions Today</span>
                      <span className="fw-semibold fs-6 text-dark">{today?.session_count ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-muted small d-block">Total Working Hours</span>
                      <span className="fw-bold fs-6 font-monospace text-success">
                        {formatDuration(totalWorked)}
                      </span>
                    </div>
                    {isPunchedIn && (
                      <div>
                        <span className="text-muted small d-block">Current Session</span>
                        <LiveDot />
                        <span className="fw-bold fs-6 font-monospace text-primary">
                          {formatLiveDuration(currentSessionMinutes, elapsedSeconds % 60)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-5 text-md-end">
                  <div className="d-flex gap-2 justify-content-md-end">
                    {!isPunchedIn ? (
                      <button
                        className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2"
                        disabled={punching}
                        onClick={handlePunchIn}
                      >
                        <i className="bi bi-box-arrow-in-right"></i>
                        {punching ? 'Punching In...' : 'Punch In'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-danger px-4 py-2 d-flex align-items-center gap-2"
                        disabled={punching}
                        onClick={handlePunchOutClick}
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        {punching ? 'Punching Out...' : 'Punch Out'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Today's session list */}
              {sessions.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <h6 className="mb-2 fw-bold text-dark small text-uppercase text-muted">Today's Sessions</h6>
                  <div className="list-group list-group-flush">
                    {sessions.map((s, idx) => (
                      <div key={s.id} className="list-group-item bg-transparent px-0 py-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge bg-light text-dark border">Session {idx + 1}</span>
                          <span className="font-monospace text-dark">{formatSessionRange(s)}</span>
                        </div>
                        <span className="d-flex align-items-center gap-2">
                          {s.is_active ? (
                            <span className="badge bg-success">
                              Running {formatDuration(currentSessionMinutes)}
                            </span>
                          ) : (
                            <span className="badge bg-light text-dark border">
                              {formatDuration(s.duration_minutes ?? s.worked_minutes)}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sessions.length > 1 && (
                    <small className="text-muted">
                      Breaks between sessions are excluded from your total working hours.
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Attendance History */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 fw-bold">Daily Attendance Records</h6>
                <span className="badge bg-light text-dark border">{history.length} Days</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 border rounded p-1 bg-white">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary p-0"
                    onClick={() => setSelectedMonth((prev) => {
                      const [y, m] = prev.split('-').map(Number);
                      const prevDate = new Date(y, m - 2, 1);
                      return formatYearMonth(prevDate);
                    })}
                    disabled={!selectedMonth}
                    aria-label="Previous month"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <span className="small fw-semibold text-dark border-0 bg-transparent px-2">
                    {selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '-'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary p-0"
                    onClick={() => setSelectedMonth((prev) => {
                      const [y, m] = prev.split('-').map(Number);
                      const nextDate = new Date(y, m, 1);
                      return formatYearMonth(nextDate);
                    })}
                    disabled={!selectedMonth || selectedMonth >= new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).slice(0, 7)}
                    aria-label="Next month"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0 small text-muted">Go to date:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={selectedDate || ''}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (e.target.value) {
                        setSelectedMonth(e.target.value.slice(0, 7));
                      }
                    }}
                    max={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())}
                  />
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th>Date</th>
                    <th>Sessions</th>
                    <th>Details</th>
                    <th>Total Worked</th>
                    <th>Status</th>
                    <th>Punctuality</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No attendance records found for this period.
                      </td>
                    </tr>
                  ) : (
                    history.map((record) => (
                      <tr key={record.id || record.work_date}>
                        <td className="fw-semibold text-dark">
                          {formatDateLabel(record.work_date || record.date)}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {record.session_count ?? 0}
                          </span>
                        </td>
                        <td>
                          {record.sessions && record.sessions.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {record.sessions.map((s, i) => (
                                <span key={s.id} className="font-monospace small text-muted">
                                  {i + 1}. {formatSessionRange(s)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-monospace small text-muted">
                              {formatClock(record.check_in_time)} – {formatClock(record.check_out_time)}
                            </span>
                          )}
                        </td>
                        <td className="fw-semibold text-success">
                          {formatDuration(record.worked_minutes ?? Math.round((record.worked_hours || 0) * 60))}
                        </td>
                        <td>
                          <span className={`badge ${record.status === 'PRESENT' ? 'bg-success' : record.status === 'LEAVE' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {record.status || 'ABSENT'}
                          </span>
                          {record.is_open && (
                            <span className="badge bg-info text-dark ms-1">In progress</span>
                          )}
                        </td>
                        <td>
                          {record.is_late ? (
                            <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1">
                              <i className="bi bi-exclamation-triangle-fill"></i> Late
                            </span>
                          ) : (
                            <span className="text-success small d-inline-flex align-items-center gap-1">
                              <i className="bi bi-check-circle"></i> On Time
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Punch Out Confirmation Modal */}
      {showConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmPunchOutTitle"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 id="confirmPunchOutTitle" className="modal-title fw-bold">Confirm Punch Out</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelPunchOut}
                  disabled={punching}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">Are you sure you want to punch out?</p>

                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Current session punch in:</span>
                    <span className="fw-semibold font-monospace text-dark">
                      {formatClock(currentSession?.check_in_time)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Current working time:</span>
                    <span className="fw-bold font-monospace text-success">
                      {formatDuration(currentSessionMinutes)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Sessions completed today:</span>
                    <span className="fw-semibold text-dark">{sessions.length}</span>
                  </div>
                </div>

                <p className="text-muted small mb-0">
                  If you punch out now, your current work session will end. You can punch in
                  again later to start a new session, and breaks are not counted as working time.
                </p>

                {confirmError && (
                  <div className="alert alert-danger mt-3 mb-0 d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{confirmError}</div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={cancelPunchOut}
                  disabled={punching}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={handleConfirmPunchOut}
                  disabled={punching}
                >
                  {punching ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Punching Out...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i>
                      <span>Confirm Punch Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <AdminPage title={pageTitle} subtitle={pageSubtitle}>
      {body}
    </AdminPage>
  );
}
