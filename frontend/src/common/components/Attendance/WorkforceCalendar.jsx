import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (response) => response?.data?.data ?? response?.data;
const localMonth = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()).slice(0, 7);
const dateFromMonth = (month) => new Date(`${month}-01T00:00:00Z`);
const shiftMonth = (month, amount) => {
  const date = dateFromMonth(month);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};
const statusClass = (status) => ({
  PRESENT: 'attendance-day-present', ABSENT: 'attendance-day-absent', SUNDAY: 'attendance-day-sunday',
  LEAVE: 'attendance-day-leave', APPROVED_LEAVE: 'attendance-day-leave', HOLIDAY: 'attendance-day-holiday',
  FUTURE: 'attendance-day-future', NOT_JOINED: 'attendance-day-future'
}[status] || 'attendance-day-future');

export default function WorkforceCalendar({ onSelectPerson, title = 'Attendance calendar' }) {
  const [month, setMonth] = useState(localMonth);
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = unwrap(await axiosInstance.get('/v1/org/attendance/month', { params: { month } }));
      setData(result);
      setSelectedId((previous) => result.people?.some((person) => person.user_id === previous)
        ? previous : result.people?.[0]?.user_id || '');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load the attendance calendar.');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const person = useMemo(() => data?.people?.find((item) => item.user_id === selectedId) || null, [data, selectedId]);
  const firstWeekday = data?.days?.length ? dateFromMonth(month).getUTCDay() : 0;
  const leadingCells = (firstWeekday + 6) % 7;
  const selectedToday = person?.calendar?.find((day) => day.date === new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()));

  return <section className="card shadow-sm">
    <div className="card-header bg-white d-flex flex-wrap align-items-center justify-content-between gap-2">
      <h2 className="h6 mb-0">{title}</h2>
      <div className="d-flex gap-2 align-items-center">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setMonth((value) => shiftMonth(value, -1))} aria-label="Previous month">‹</button>
        <input className="form-control form-control-sm" type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Attendance month" />
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setMonth((value) => shiftMonth(value, 1))} aria-label="Next month">›</button>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={load} disabled={loading}>Refresh</button>
      </div>
    </div>
    <div className="card-body">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row g-3 align-items-end mb-3">
        <div className="col-12 col-md-7"><label className="form-label" htmlFor="attendance-person-select">Employee, intern, or manager</label>
          <select id="attendance-person-select" className="form-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={loading || !data?.people?.length}>
            {data?.people?.map((item) => <option key={item.user_id} value={item.user_id}>{item.full_name} · {item.employment_type}</option>)}
          </select>
        </div>
        {person && <div className="col-12 col-md-5 d-flex align-items-end justify-content-between gap-2">
          <div><div className="small text-secondary">Present days this month</div><strong>{person.present_days}</strong></div>
          {selectedToday && <div><div className="small text-secondary">Today</div><strong className={selectedToday.status === 'PRESENT' ? 'text-success' : selectedToday.status === 'ABSENT' ? 'text-danger' : ''}>{selectedToday.status.replace('_', ' ')}</strong></div>}
          {onSelectPerson && <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onSelectPerson(person)}>View details</button>}
        </div>}
      </div>
      <div className="attendance-calendar-grid" role="grid" aria-label={`${month} attendance for ${person?.full_name || 'staff'}`}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div className={`attendance-calendar-weekday ${day === 'Sun' ? 'text-danger' : ''}`} role="columnheader" key={day}>{day}</div>)}
        {Array.from({ length: leadingCells }, (_, index) => <div className="attendance-calendar-empty" role="gridcell" key={`empty-${index}`} />)}
        {person?.calendar?.map((day) => <button type="button" role="gridcell" key={day.date}
          className={`attendance-calendar-day ${statusClass(day.status)} ${new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0 ? 'attendance-calendar-sunday' : ''}`}
          title={`${day.date}: ${day.status}${day.check_in_time ? ` · In ${new Date(day.check_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })}` : ''}${day.check_out_time ? ` · Out ${new Date(day.check_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })}` : ''}${day.worked_minutes ? ` · ${Math.floor(day.worked_minutes / 60)}h ${day.worked_minutes % 60}m` : ''}`}
          onClick={() => onSelectPerson?.({ ...person, selected_date: day.date })}>
          <span className="attendance-calendar-date">{Number(day.date.slice(-2))}</span>
          <span className="attendance-calendar-status">{day.status === 'PRESENT' ? 'P' : day.status === 'ABSENT' ? 'A' : day.status === 'SUNDAY' ? 'Sun' : day.status === 'LEAVE' ? 'L' : day.status === 'HOLIDAY' ? 'H' : ''}</span>
          {day.check_in_time && <span className="attendance-calendar-time">{new Date(day.check_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })}</span>}
        </button>)}
      </div>
      <div className="d-flex flex-wrap gap-3 small mt-3" aria-label="Attendance legend">
        <span><i className="attendance-legend attendance-day-present" /> Present</span><span><i className="attendance-legend attendance-day-absent" /> Absent / unavailable</span><span><i className="attendance-legend attendance-day-sunday" /> Sunday</span><span><i className="attendance-legend attendance-day-leave" /> Approved leave</span>
      </div>
      {loading && <div className="small text-secondary mt-2" role="status">Loading calendar…</div>}
    </div>
    <style>{`
      .attendance-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
      .attendance-calendar-weekday{text-align:center;font-size:.75rem;font-weight:700;padding:.25rem}
      .attendance-calendar-empty{min-height:64px}
      .attendance-calendar-day{min-height:64px;border:1px solid #dce3e2;border-radius:8px;background:#fff;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;padding:5px;color:#244e47;text-align:left}
      .attendance-calendar-date{font-weight:700}.attendance-calendar-status{font-size:.7rem;font-weight:800}.attendance-calendar-time{font-size:.65rem;color:#526662}
      .attendance-day-present{background:#e2f5e8!important;color:#176b35!important;border-color:#95d5a8!important}
      .attendance-day-absent{background:#fff0f0!important;color:#a62020!important;border-color:#efaaaa!important}
      .attendance-day-sunday{background:#fde7e7!important;color:#ab2020!important;border-color:#e88a8a!important}
      .attendance-day-leave{background:#fff6d8!important;color:#805d00!important;border-color:#e9d27a!important}
      .attendance-day-holiday{background:#f4eaff!important;color:#663399!important;border-color:#d5b8ec!important}
      .attendance-day-future{background:#f6f8f8!important;color:#65716e!important}
      .attendance-calendar-sunday{outline:1px solid #d95050}.attendance-legend{display:inline-block;width:12px;height:12px;border:1px solid #ccd5d2;border-radius:3px;vertical-align:-2px;margin-right:4px}
      @media(max-width:575px){.attendance-calendar-empty,.attendance-calendar-day{min-height:48px;padding:3px}.attendance-calendar-time{display:none}}
    `}</style>
  </section>;
}
