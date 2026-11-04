import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPage from '../../../common/components/AdminPage/AdminPage.jsx';
import { checkIn, listAttendance, listEmployees, listInterns, updateAttendance } from '../../../services/api/hrApi.standardized.js';
import SelfAttendancePanel, { selfAttendanceApi } from '../../../common/components/Attendance/SelfAttendancePanel.jsx';
import PersonMonitoringModal from '../../../common/components/Attendance/PersonMonitoringModal.jsx';

const today = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
};

const apiData = (response) => response?.data?.data ?? response?.data ?? response;
const asList = (response) => {
  const data = apiData(response);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
};

export default function HRAttendance() {
  const [records, setRecords] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState('');
  const [workMode, setWorkMode] = useState('OFFICE');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [attendanceResponse, employeesResponse, internsResponse] = await Promise.all([
        listAttendance({ start_date: selectedDate, end_date: selectedDate, limit: 250 }),
        listEmployees(),
        listInterns(),
      ]);
      setRecords(asList(attendanceResponse));
      const employees = asList(employeesResponse).map((person) => ({
        id: person.user_id,
        name: person.full_name || person.name || person.email || 'Employee',
        role: 'EMPLOYEE',
      })).filter((person) => person.id);
      const interns = asList(internsResponse).map((person) => ({
        id: person.user_id,
        name: person.full_name || person.name || person.email || 'Intern',
        role: 'INTERN',
      })).filter((person) => person.id);
      setPeople([...employees, ...interns]);
    } catch (loadError) {
      setError(loadError.message || 'Could not load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleRecords = useMemo(() => records.filter((record) => {
    const role = String(record.user_role || record.role || '').toUpperCase();
    const status = String(record.status || '').toUpperCase();
    const name = String(record.full_name || record.employee_name || record.user_name || '').toLowerCase();
    return (roleFilter === 'ALL' || role === roleFilter)
      && (statusFilter === 'ALL' || status === statusFilter)
      && name.includes(search.trim().toLowerCase());
  }), [records, roleFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: records.length,
    employees: records.filter((record) => String(record.user_role || record.role).toUpperCase() === 'EMPLOYEE').length,
    interns: records.filter((record) => String(record.user_role || record.role).toUpperCase() === 'INTERN').length,
    absent: records.filter((record) => String(record.status).toUpperCase() === 'ABSENT').length,
  }), [records]);

  const recordCheckIn = async (event) => {
    event.preventDefault();
    if (!selectedUser) {
      setError('Choose an employee or intern before recording a check-in.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await checkIn({ user_id: selectedUser, date: today(), status: 'PRESENT', work_mode: workMode });
      setNotice('Check-in recorded for today.');
      await load();
    } catch (submitError) {
      setError(submitError.message || 'Could not record the check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (record, status) => {
    setError('');
    setNotice('');
    try {
      await updateAttendance(record.id, { status });
      setNotice(`Attendance updated to ${status.replace('_', ' ').toLowerCase()}.`);
      await load();
    } catch (updateError) {
      setError(updateError.message || 'Could not update attendance.');
    }
  };

  const exportCsv = () => {
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['Date', 'Name', 'Role', 'Check in', 'Check out', 'Hours', 'Status'],
      ...visibleRecords.map((record) => [
        record.date || selectedDate,
        record.full_name || record.employee_name || record.user_name,
        record.user_role || record.role,
        record.clock_in || record.check_in_time,
        record.clock_out || record.check_out_time,
        record.hours ?? record.total_hours,
        record.status,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ethiroli-attendance-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPage
      title="Workforce Attendance"
      subtitle="Review employee and intern attendance records, and record today’s check-ins."
      loading={loading}
      error={error}
      onRetry={load}
      actions={<button className="btn btn-outline-primary" type="button" onClick={exportCsv} disabled={!visibleRecords.length}>Export CSV</button>}
    >
      {/* Same live punch clock, KPI tiles, and daily records as the Employee portal. */}
      <div className="emp-portal"><SelfAttendancePanel api={selfAttendanceApi} embedded /></div>
      {notice && <p role="status" className="alert alert-success">{notice}</p>}
      {error && <p role="alert" className="alert alert-danger">{error}</p>}

      <section className="row g-3 mb-4" aria-label="Attendance summary">
        {[
          ['Records on selected date', stats.total],
          ['Employee records', stats.employees],
          ['Intern records', stats.interns],
          ['Marked absent', stats.absent],
        ].map(([label, value]) => (
          <div className="col-6 col-xl-3" key={label}>
            <div className="card h-100"><div className="card-body">
              <div className="small text-muted">{label}</div>
              <div className="h3 mb-0">{value}</div>
            </div></div>
          </div>
        ))}
      </section>


      <div className="row g-2 mb-3">
        <div className="col-12 col-md-3"><label className="form-label" htmlFor="attendance-date">Date</label><input id="attendance-date" type="date" className="form-control" value={selectedDate} max={today()} onChange={(event) => setSelectedDate(event.target.value)} /></div>
        <div className="col-12 col-md-3"><label className="form-label" htmlFor="attendance-search">Search</label><input id="attendance-search" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name" /></div>
        <div className="col-6 col-md-3"><label className="form-label" htmlFor="attendance-role">Role</label><select id="attendance-role" className="form-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="ALL">All</option><option value="EMPLOYEE">Employees</option><option value="INTERN">Interns</option></select></div>
        <div className="col-6 col-md-3"><label className="form-label" htmlFor="attendance-status">Status</label><select id="attendance-status" className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="HALF_DAY">Half day</option></select></div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead><tr><th>Name</th><th>Role</th><th>Check in</th><th>Check out</th><th>Hours</th><th>Status</th><th>Update status</th></tr></thead>
          <tbody>
            {visibleRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.user_id ? <button className="btn btn-link p-0 text-start" type="button" onClick={() => setSelectedPerson({ user_id: record.user_id, full_name: record.full_name || record.employee_name || record.user_name, selected_date: selectedDate })}>{record.full_name || record.employee_name || record.user_name || 'Unknown'}</button> : (record.full_name || record.employee_name || record.user_name || 'Unknown')}</td>
                <td>{record.user_role || record.role || '—'}</td>
                <td>{record.clock_in || '—'}</td><td>{record.clock_out || '—'}</td><td>{record.hours ?? '—'}</td>
                <td>{String(record.status || '').replace('_', ' ')}</td>
                <td><div className="d-flex gap-1 flex-wrap">
                  {['PRESENT', 'ABSENT', 'HALF_DAY'].map((status) => <button key={status} type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || String(record.status).toUpperCase() === status} onClick={() => changeStatus(record, status)}>{status.replace('_', ' ')}</button>)}
                </div></td>
              </tr>
            ))}
            {!loading && visibleRecords.length === 0 && <tr><td colSpan="7" className="text-center py-4">No attendance records were recorded for this date and filter.</td></tr>}
          </tbody>
        </table>
      </div>
      {selectedPerson && <PersonMonitoringModal person={selectedPerson} onClose={() => setSelectedPerson(null)} canAssignCoverage />}
    </AdminPage>
  );
}
