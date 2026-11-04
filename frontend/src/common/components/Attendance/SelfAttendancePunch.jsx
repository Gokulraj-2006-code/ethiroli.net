import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (response) => response?.data?.data ?? response?.data;
const formatTime = (value) => value ? new Date(value).toLocaleTimeString('en-IN', {
  timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit'
}) : '—';

export default function SelfAttendancePunch() {
  const [today, setToday] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [fetchedAt, setFetchedAt] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setToday(unwrap(await axiosInstance.get('/v1/attendance/today')));
      setFetchedAt(Date.now());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load today’s attendance.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const punch = async () => {
    setSaving(true); setError('');
    try {
      const action = today?.is_punched_in ? 'CHECK_OUT' : 'CHECK_IN';
      await axiosInstance.post('/v1/attendance/punch', { action, work_mode: 'OFFICE' });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Attendance punch could not be saved.');
    } finally { setSaving(false); }
  };

  const currentSession = today?.current_session;
  const sessions = today?.sessions || [];
  const currentSessionSeconds = currentSession?.is_active && currentSession.check_in_time
    ? Math.max(0, Math.floor((now - new Date(currentSession.check_in_time).getTime()) / 1000)) : 0;
  const elapsedSinceFetch = currentSession?.is_active ? Math.max(0, Math.floor((now - fetchedAt) / 60000)) : 0;
  const workedMinutes = Number(today?.worked_minutes || 0) + elapsedSinceFetch;
  const workedLabel = `${Math.floor(workedMinutes / 60)}h ${String(workedMinutes % 60).padStart(2, '0')}m`;
  const currentClock = new Date(now).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', second: '2-digit'
  });
  const currentDate = new Date(now).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
  });

  return <section className="emp-live-clock card shadow-sm mb-4" aria-label="My attendance punch clock">
    <div className="card-body">
      <div className="emp-live-clock__head">
        <div className="emp-live-clock__icon" aria-hidden="true"><i className="bi bi-clock-history" /></div>
        <div><h2 className="emp-live-clock__title">Live Work Clock</h2><div className="emp-live-clock__date">{currentDate} · <strong>{currentClock}</strong> · Tamil Nadu (Asia/Kolkata)</div></div>
        <span className={`emp-live-clock__badge ${today?.is_punched_in ? 'is-present' : 'is-idle'}`}>{loading ? 'LOADING' : today?.is_punched_in ? 'PUNCHED IN' : today?.check_in_time ? 'PUNCHED OUT' : 'NOT PUNCHED IN'}</span>
      </div>
      <div className="emp-live-clock__body">
        <div className="emp-live-clock__stats">
          <div><span>Status</span><strong>{today?.is_punched_in ? 'Present' : today?.check_in_time ? 'Work session ended' : 'Not recorded'}</strong></div>
          <div><span>Sessions today</span><strong>{today?.session_count ?? sessions.length}</strong></div>
          <div><span>Total working hours</span><strong className="is-green">{workedLabel}</strong></div>
          {currentSession?.is_active && <div><span>Current session</span><strong className="is-green">{Math.floor(currentSessionSeconds / 3600)}h {String(Math.floor(currentSessionSeconds / 60) % 60).padStart(2, '0')}m {String(currentSessionSeconds % 60).padStart(2, '0')}s</strong></div>}
        </div>
        <button className={`btn emp-live-clock__action ${today?.is_punched_in ? 'is-out' : 'is-in'}`} type="button" onClick={punch} disabled={loading || saving}>
          <i className={`bi ${today?.is_punched_in ? 'bi-box-arrow-right' : 'bi-box-arrow-in-right'}`} /> {saving ? 'Saving…' : today?.is_punched_in ? 'Punch Out' : 'Punch In'}
        </button>
      </div>
      <div className="emp-live-clock__sessions">
        <h3>Today’s sessions</h3>
        {sessions.length ? sessions.map((session, index) => <div className="emp-live-clock__session" key={session.id || `${session.check_in_time}-${index}`}>
          <span className="emp-live-clock__session-number">Session {index + 1}</span><span className="font-monospace">{formatTime(session.check_in_time)} – {session.is_active ? 'Running' : formatTime(session.check_out_time)}</span><strong>{session.is_active ? 'IN PROGRESS' : 'COMPLETE'}</strong>
        </div>) : <p className="text-secondary small mb-0">No punch session recorded today. Punch in to mark today as present.</p>}
      </div>
      {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
    </div>
  </section>;
}
