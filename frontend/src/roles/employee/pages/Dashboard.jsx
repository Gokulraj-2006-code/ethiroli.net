import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import employeePortalApi from '../../../services/api/employeePortalApi.js';
import NotificationBell from '../../../common/components/NotificationBell.jsx';
import { useAuth } from '../../../common/hooks/useAuth.js';
import {
  formatClock,
  formatDuration,
  openSessionElapsedSeconds,
  liveWorkedMinutes,
  punchStatusLabel,
  punchStatusClass,
} from '../utils/attendanceFormat.js';



export default function Dashboard() {
  const { user } = useAuth();
  const isIntern = user?.role === 'INTERN';
  const portalLabel = isIntern ? 'Intern' : 'Employee';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [punching, setPunching] = useState(false);
  const [punchMsg, setPunchMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Reference point for the live working-hours total: the server folded the
  // open session's elapsed time into worked_minutes as of this instant.
  const [fetchedAt, setFetchedAt] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeePortalApi.getDashboardOverview();
      const overview = res?.data || res;
      setData(overview);
      setFetchedAt(Date.now());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Same attendance source as the Attendance page, so both always agree.
  const todayAttendance = data?.todayAttendance || data?.attendance || null;
  const isCheckedIn = Boolean(todayAttendance?.is_punched_in);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(openSessionElapsedSeconds(todayAttendance));
    }, 1000);
    return () => clearInterval(timer);
  }, [todayAttendance]);

  const handlePunchIn = async () => {
    setPunching(true);
    setPunchMsg('');
    setError(null);
    try {
      await employeePortalApi.punchAttendance('CHECK_IN');
      setPunchMsg('Punched in successfully!');
      await fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to punch in');
    } finally {
      setPunching(false);
    }
  };

  // Punch Out only fires after the employee confirms in the modal.
  const handleConfirmPunchOut = async () => {
    if (punching) return;
    setPunching(true);
    setConfirmError('');
    try {
      await employeePortalApi.punchAttendance('CHECK_OUT');
      setShowConfirm(false);
      setPunchMsg('Punched out successfully!');
      await fetchOverview();
    } catch (err) {
      setConfirmError(err.response?.data?.message || err.message || 'Punch out failed. Please try again.');
    } finally {
      setPunching(false);
    }
  };

  const leaveBalances = data?.leaveBalances || [];
  const upcomingTasks = data?.upcomingTasks || [];
  const announcements = data?.recentAnnouncements || [];

  return (
    <AdminPage
      title={`${portalLabel} Self-Service Portal`}
      subtitle="Welcome back! Here is your daily work summary, attendance, and team updates."
      loading={loading}
      error={error}
      onRetry={fetchOverview}
      actions={null}
    >
      {punchMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-2" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{punchMsg}</div>
          <button type="button" className="btn-close" onClick={() => setPunchMsg('')}></button>
        </div>
      )}

      {/* Row 1: KPI Summary Cards */}
      <div className="row g-3 mb-2">
        {/* Clock In / Out Card */}
        <div className="col-md-6 col-lg-4">
          <div className="emp-stat emp-stat--olive h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="emp-stat__label">Attendance</span>
              <span className={`badge ${punchStatusClass(todayAttendance)}`}>
                {punchStatusLabel(todayAttendance)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-baseline mb-1">
              <span className="emp-stat__value">
                {formatDuration(liveWorkedMinutes(todayAttendance, fetchedAt))}
              </span>
              <small className="text-muted">
                {(todayAttendance?.session_count ?? 0)} session{(todayAttendance?.session_count ?? 0) === 1 ? '' : 's'}
              </small>
            </div>
            <div className="emp-stat__hint mb-2">
              {isCheckedIn
                ? `Since ${formatClock(todayAttendance?.current_session?.check_in_time)}`
                : (todayAttendance?.session_count
                  ? 'All sessions complete'
                  : 'Not punched today')}
            </div>
            <div className="mt-auto d-flex gap-2">
              {!isCheckedIn ? (
                <button
                  className="btn btn-sm btn-primary w-100"
                  disabled={punching}
                  onClick={handlePunchIn}
                >
                  {punching ? 'Punching In...' : 'Punch In'}
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-outline-danger w-100"
                  disabled={punching}
                  onClick={() => { setConfirmError(''); setShowConfirm(true); }}
                >
                  Punch Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 h-100 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small text-uppercase fw-semibold">Leave Balance</span>
              <i className="bi bi-calendar-check text-primary fs-5"></i>
            </div>
            <div className="d-flex justify-content-between align-items-baseline mb-1">
              {leaveBalances.length ? leaveBalances.slice(0, 3).map((b) => (
                <div key={b.leave_type} className="text-center">
                  <div className="fw-bold text-dark fs-5">{b.balance ?? b.total_credited}</div>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>{b.leave_type}</small>
                </div>
              )) : <span className="text-muted small">Leave balance not configured</span>}
            </div>
            <div className="mt-auto pt-2 border-top">
              <Link to="/app/employee/leaves" className="text-primary text-decoration-none small fw-semibold">
                Apply for leave &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Tasks Assigned Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 h-100 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small text-uppercase fw-semibold">Pending Tasks</span>
              <i className="bi bi-check2-square text-warning fs-5"></i>
            </div>
            <div className="fw-bold fs-3 text-dark mb-1">{upcomingTasks.length}</div>
            <div className="text-muted small mb-2">Deliverables assigned to you</div>
            <div className="mt-auto pt-2 border-top">
              <Link to="/app/employee/tasks" className="text-primary text-decoration-none small fw-semibold">
                View task list &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Upcoming tasks and recent announcements */}

      <div className="row g-4">
        {/* Tasks */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">My Next Tasks</h6>
              <Link to="/app/employee/tasks" className="small text-primary text-decoration-none">
                View All
              </Link>
            </div>
            <div className="card-body p-3">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-4 text-muted small">No pending tasks assigned!</div>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingTasks.map((t) => (
                    <div key={t.id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold text-dark small">{t.description}</div>
                        <small className="text-muted">
                          Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No deadline'}
                        </small>
                      </div>
                      <span className={`badge ${t.status === 'COMPLETED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Company Bulletins</h6>
            </div>
            <div className="card-body p-3">
              {announcements.length === 0 ? (
                <div className="text-center py-4 text-muted small">No recent announcements.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {announcements.map((a) => (
                    <div key={a.id} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="fw-semibold text-dark small">{a.subject}</div>
                        <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(a.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="text-muted small mb-0 text-truncate">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Punch Out Confirmation Modal (same flow as the Attendance page) */}
      {showConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashConfirmPunchOutTitle"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 id="dashConfirmPunchOutTitle" className="modal-title fw-bold">Confirm Punch Out</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
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
                      {formatClock(todayAttendance?.current_session?.check_in_time)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Current working time:</span>
                    <span className="fw-bold font-monospace text-success">
                      {formatDuration(Math.floor(elapsedSeconds / 60))}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Sessions completed today:</span>
                    <span className="fw-semibold text-dark">{todayAttendance?.session_count ?? 0}</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">
                  If you punch out now, your current work session will end. Breaks are not
                  counted as working time.
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
                  onClick={() => setShowConfirm(false)}
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
    </AdminPage>
  );
}
