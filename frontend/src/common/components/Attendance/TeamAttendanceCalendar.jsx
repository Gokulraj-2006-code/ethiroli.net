import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DynamicCalendarPage from '../../../modules/calendar/pages/DynamicCalendarPage.jsx';
import PersonMonitoringModal from './PersonMonitoringModal.jsx';
import axiosInstance from '../../../services/api/axiosInstance.js';

const unwrap = (response) => response?.data?.data ?? response?.data;
const todayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const currentMonth = () => todayKey().slice(0, 7);
const weekday = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
  weekday: 'long',
  timeZone: 'UTC',
});
const isSundayDate = (date) => new Date(`${date}T00:00:00Z`).getUTCDay() === 0;

/**
 * Normalise one org-calendar day into the shape the shared employee calendar
 * uses. The org endpoint already returns punch times, worked minutes, and a
 * status, but its status vocabulary is slightly different (SUNDAY, FUTURE),
 * and the shared calendar expects punchIn/punchOut, is_holiday, and the
 * employee-style HOLIDAY/PRESENT/ABSENT/LEAVE/IN_PROGRESS/UPCOMING states.
 */
function normaliseDay(raw, today) {
  const date = raw.date;
  const sunday = isSundayDate(date);
  const declaredHoliday = Boolean(raw.holiday_name);
  const holiday = sunday || declaredHoliday;
  const notJoined = raw.status === 'NOT_JOINED';
  const future = date > today;
  const hasAttendance = Boolean(raw.check_in_time || raw.check_out_time || Number(raw.worked_minutes) > 0 || raw.status === 'PRESENT');
  const onLeave = raw.status === 'LEAVE';

  let status;
  if (holiday) status = 'HOLIDAY';
  else if (hasAttendance) status = 'PRESENT';
  else if (notJoined) status = 'NOT_JOINED';
  else if (onLeave) status = 'LEAVE';
  else if (future) status = 'UPCOMING';
  else if (date === today) status = 'IN_PROGRESS';
  else status = 'ABSENT';

  const workingDay = !holiday && !notJoined;
  const workedMinutes = status === 'PRESENT' ? Number(raw.worked_minutes || 0) : 0;

  return {
    ...raw,
    date,
    day: weekday(date),
    day_of_week: new Date(`${date}T00:00:00Z`).getUTCDay(),
    type: holiday ? 'HOLIDAY' : 'WORKING_DAY',
    status,
    is_working_day: workingDay,
    is_sunday: sunday,
    is_holiday: holiday,
    is_today: date === today,
    punchIn: raw.check_in_time || null,
    punchOut: raw.check_out_time || null,
    worked_minutes: workedMinutes,
    worked_hours: Number((workedMinutes / 60).toFixed(2)),
    session_count: status === 'PRESENT' ? Number(raw.session_count || 0) : 0,
    first_check_in: raw.check_in_time || null,
    last_check_out: raw.check_out_time || null,
  };
}

function summarise(days, today) {
  const summary = {
    working_days: 0,
    elapsed_working_days: 0,
    present_days: 0,
    absent_days: 0,
    leave_days: 0,
    sunday_holidays: 0,
    holiday_days: 0,
    total_holidays: 0,
    not_joined_days: 0,
    in_progress_days: 0,
    upcoming_days: 0,
    present_on_holidays: 0,
    late_days: 0,
    total_worked_minutes: 0,
  };

  for (const day of days) {
    const future = day.date > today;
    const hasAttendance = Boolean(day.punchIn || day.worked_minutes > 0 || day.status === 'PRESENT');

    if (day.is_working_day) {
      summary.working_days += 1;
      if (!future) summary.elapsed_working_days += 1;
    }

    if (day.is_holiday) {
      summary.total_holidays += 1;
      if (day.is_sunday) summary.sunday_holidays += 1;
      else summary.holiday_days += 1;
      if (hasAttendance) summary.present_on_holidays += 1;
    } else if (day.status === 'NOT_JOINED') {
      summary.not_joined_days += 1;
    } else if (day.status === 'PRESENT') {
      summary.present_days += 1;
      summary.total_worked_minutes += Number(day.worked_minutes || 0);
      if (day.is_late) summary.late_days += 1;
    } else if (day.status === 'ABSENT') {
      summary.absent_days += 1;
    } else if (day.status === 'LEAVE') {
      summary.leave_days += 1;
    } else if (day.status === 'IN_PROGRESS') {
      summary.in_progress_days += 1;
    } else if (day.status === 'UPCOMING') {
      summary.upcoming_days += 1;
    }
  }

  const rate = (denominator) => (denominator > 0
    ? Number(((summary.present_days / denominator) * 100).toFixed(2))
    : null);
  summary.total_worked_hours = Number((summary.total_worked_minutes / 60).toFixed(2));
  summary.attendance_rate = rate(summary.elapsed_working_days);
  summary.attendance_rate_full_month = rate(summary.working_days);
  return summary;
}

function buildMonth(person, month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const today = todayKey();
  const days = (person.calendar || [])
    .map((day) => normaliseDay(day, today))
    .sort((a, b) => a.date.localeCompare(b.date));
  const label = new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return {
    month,
    label: `${label} · ${person.full_name}`,
    today,
    timezone: 'Asia/Kolkata',
    joining_date: person.start_date || null,
    weekly_holiday: 'SUNDAY',
    days,
    summary: summarise(days, today),
  };
}

/**
 * TeamAttendanceCalendar - the Employee portal premium calendar, reused for HR
 * and Manager with a team-member selector. The selected person's month is
 * transformed into the same days/summary payload the employee calendar already
 * renders, so the grid, attendance chips, day detail, and summary tiles are the
 * same design and behaviour.
 */
export default function TeamAttendanceCalendar({
  role,
  pageTitle,
  pageSubtitle,
  canAssignCoverage = false,
}) {
  const authUser = useSelector((state) => state.auth?.user || state.auth?.currentUser);
  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [error, setError] = useState('');
  const [detailsPerson, setDetailsPerson] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingPeople(true);
      setError('');
      try {
        const result = unwrap(await axiosInstance.get('/v1/org/attendance/month', {
          params: { month: currentMonth() },
        }));
        if (cancelled) return;
        const list = Array.isArray(result?.people) ? result.people : [];
        setPeople(list);
        setSelectedId((previous) => {
          // Prefer the signed-in person once auth has resolved, then preserve a
          // valid manual selection, then fall back to the first team member.
          const own = list.find((person) => person.user_id === authUser?.id);
          if (own) return own.user_id;
          if (previous && list.some((person) => person.user_id === previous)) return previous;
          return list[0]?.user_id || '';
        });
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.response?.data?.message || 'Could not load the team attendance roster.');
        }
      } finally {
        if (!cancelled) setLoadingPeople(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authUser?.id]);

  const selectedPerson = useMemo(
    () => people.find((person) => person.user_id === selectedId) || null,
    [people, selectedId]
  );

  const attendanceLoader = useCallback(async (month) => {
    const result = unwrap(await axiosInstance.get('/v1/org/attendance/month', {
      params: { month },
    }));
    const list = Array.isArray(result?.people) ? result.people : [];
    const requestedId = selectedId || authUser?.id;
    const person = list.find((item) => item.user_id === requestedId) || list[0] || null;
    if (!person) return { data: null };
    return { data: buildMonth(person, month) };
  }, [authUser?.id, selectedId]);

  const todayStatus = useMemo(() => {
    const day = selectedPerson?.calendar?.find((item) => item.date === todayKey());
    return day?.status || '';
  }, [selectedPerson]);

  const statusTone = todayStatus === 'PRESENT'
    ? 'text-success'
    : todayStatus === 'ABSENT'
      ? 'text-danger'
      : todayStatus === 'LEAVE'
        ? 'text-warning'
        : 'text-secondary';

  const headerContent = (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex flex-wrap align-items-end gap-3">
        <div className="flex-grow-1" style={{ minWidth: '250px' }}>
          <label className="form-label small fw-bold text-uppercase text-muted mb-1" htmlFor="team-calendar-person">
            Team member
          </label>
          <select
            id="team-calendar-person"
            className="form-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={loadingPeople || !people.length}
          >
            {!people.length && <option value="">{loadingPeople ? 'Loading team…' : 'No team members found'}</option>}
            {people.map((person) => (
              <option key={person.user_id} value={person.user_id}>
                {person.full_name} · {person.employment_type || person.role || 'Team member'}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-4">
          <div>
            <div className="small text-muted">Present this month</div>
            <div className="h5 mb-0">{selectedPerson?.present_days ?? '—'}</div>
          </div>
          <div>
            <div className="small text-muted">Today</div>
            <div className={`fw-bold ${statusTone}`}>{todayStatus ? todayStatus.replace(/_/g, ' ') : '—'}</div>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => selectedPerson && setDetailsPerson(selectedPerson)}
            disabled={!selectedPerson}
          >
            <i className="bi bi-journal-text"></i>
            Daily records
          </button>
        </div>
      </div>
      {error && <div className="alert alert-danger m-3 mb-0" role="alert">{error}</div>}
    </div>
  );

  return (
    <>
      <DynamicCalendarPage
        defaultRole={role}
        attendanceLoader={attendanceLoader}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        headerContent={headerContent}
        attendanceSummarySubtitle="Based on the selected team member's punch records"
        attendancePerspective="team"
      />
      {detailsPerson && (
        <PersonMonitoringModal
          person={detailsPerson}
          onClose={() => setDetailsPerson(null)}
          canAssignCoverage={canAssignCoverage}
        />
      )}
    </>
  );
}
