import 'dotenv/config';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import { decrypt } from '../src/config/encryption.js';

// This one-time source import is deliberately limited to the safe local test DB.
// It writes only 2026-09-24 through 2026-10-29; November and other dates are out of scope.
// Duplicate daily attendance rows are checked before any transaction begins.
const EXPECTED_DATABASE = 'ethiroli_local_test';
const IMPORT_MIN_DATE = '2026-09-24';
const IMPORT_MAX_DATE = '2026-10-29';
// Optional staged test: IMPORT_EMPLOYEE=loganathan IMPORT_START_DATE=2026-10-01
// IMPORT_END_DATE=2026-10-31 is intentionally not allowed; the source ends Oct 29.
const START_DATE = process.env.IMPORT_START_DATE || IMPORT_MIN_DATE;
const END_DATE = process.env.IMPORT_END_DATE || IMPORT_MAX_DATE;
const JOINING_DATES = {
  stephen: '2026-09-24',
  loganathan: '2026-09-24',
  bharath: '2026-09-24',
  srinithi: '2026-10-06',
  gokulraj: '2026-10-07',
  mathishree: '2026-10-12',
  nandhini: '2026-10-12',
};

const STAFF = {
  stephen: 'stephen862k7@gmail.com',
  loganathan: 'sloganathan0105@gmail.com',
  bharath: 'barathappu777@gmail.com',
  srinithi: 'srinithikumar54@gmail.com',
  gokulraj: 'gokulrajkumar2006@gmail.com',
  nandhini: 'knandhinivnr@gmail.com',
  mathishree: 'mathishree008@gmail.com',
};

// [YYYY-MM-DD, roster key, Login Time, Logout Time]. A blank logout is retained
// as blank; no checkout time or working duration is fabricated.
const PRESENT = [
  ['2026-09-24','stephen','10:30 AM','3:30 PM'], ['2026-09-24','bharath','10:40 AM','3:30 PM'], ['2026-09-24','loganathan','11:00 AM','3:30 PM'],
  ['2026-09-25','loganathan','10:00 AM','3:30 PM'], ['2026-09-25','stephen','10:20 AM','3:30 PM'], ['2026-09-25','bharath','10:45 AM','3:30 PM'],
  ['2026-09-26','stephen','10:20 AM','3:20 PM'], ['2026-09-26','loganathan','10:20 AM','3:20 PM'], ['2026-09-26','bharath','10:20 AM','3:20 PM'],
  ['2026-09-28','stephen','10:15 AM','3:30 PM'], ['2026-09-28','loganathan','10:15 AM','3:30 PM'], ['2026-09-28','bharath','10:35 AM','3:30 PM'],
  ['2026-09-29','loganathan','9:45 AM','3:30 PM'],
  ['2026-09-30','loganathan','9:45 AM','3:30 PM'], ['2026-09-30','stephen','10:15 AM','3:30 PM'],
  ['2026-10-01','loganathan','10:00 AM','3:30 PM'], ['2026-10-01','stephen','10:20 AM','3:30 PM'],
  ['2026-10-02','loganathan','9:40 AM','3:30 PM'], ['2026-10-02','bharath','10:10 AM','3:30 PM'], ['2026-10-02','stephen','10:10 AM','3:30 PM'],
  ['2026-10-03','loganathan','9:50 AM','3:37 PM'], ['2026-10-03','bharath','10:10 AM','3:38 PM'], ['2026-10-03','stephen','10:15 AM','3:38 PM'],
  ['2026-10-05','stephen','10:05 AM','3:30 PM'], ['2026-10-05','bharath','10:15 AM','3:30 PM'],
  ['2026-10-06','loganathan','9:30 AM','3:50 PM'], ['2026-10-06','srinithi','10:20 AM','3:50 PM'],
  ['2026-10-07','loganathan','10:00 AM','3:30 PM'], ['2026-10-07','srinithi','10:00 AM','3:30 PM'], ['2026-10-07','gokulraj','10:30 AM','3:30 PM'],
  ['2026-10-08','loganathan','10:00 AM','3:30 PM'], ['2026-10-08','gokulraj','10:00 AM','3:30 PM'], ['2026-10-08','srinithi','10:10 AM','3:30 PM'],
  ['2026-10-09','srinithi','10:03 AM','4:00 PM'], ['2026-10-09','loganathan','10:03 AM','4:00 PM'], ['2026-10-09','stephen','10:15 AM','4:00 PM'], ['2026-10-09','gokulraj','10:15 AM','4:00 PM'],
  ['2026-10-12','nandhini','9:00 AM','3:30 PM'], ['2026-10-12','mathishree','9:00 AM','3:30 PM'], ['2026-10-12','srinithi','10:00 AM','3:00 PM'], ['2026-10-12','gokulraj','10:00 AM','3:30 PM'], ['2026-10-12','loganathan','10:05 AM','3:30 PM'],
  ['2026-10-13','mathishree','9:28 AM','3:00 PM'], ['2026-10-13','nandhini','9:28 AM','3:00 PM'], ['2026-10-13','stephen','10:15 AM','3:40 PM'], ['2026-10-13','gokulraj','10:15 AM','3:40 PM'], ['2026-10-13','loganathan','10:15 AM','3:40 PM'], ['2026-10-13','srinithi','10:00 AM','3:30 PM'],
  ['2026-10-14','mathishree','9:20 AM','3:00 PM'], ['2026-10-14','nandhini','9:20 AM','3:00 PM'], ['2026-10-14','srinithi','9:00 AM','3:30 PM'], ['2026-10-14','stephen','10:00 AM','3:00 PM'], ['2026-10-14','bharath','10:00 AM','3:00 PM'], ['2026-10-14','loganathan','10:00 AM','3:10 PM'], ['2026-10-14','gokulraj','10:00 AM','3:00 PM'],
  ['2026-10-15','nandhini','9:25 AM','3:05 PM'], ['2026-10-15','mathishree','9:25 AM','3:05 PM'], ['2026-10-15','srinithi','10:00 AM','3:38 PM'], ['2026-10-15','gokulraj','10:00 AM','3:38 PM'], ['2026-10-15','stephen','10:20 AM','3:38 PM'], ['2026-10-15','bharath','10:20 AM','3:38 PM'],
  ['2026-10-16','mathishree','9:35 AM','3:10 PM'], ['2026-10-16','nandhini','9:35 AM','3:10 PM'], ['2026-10-16','srinithi','10:00 AM','5:00 PM'], ['2026-10-16','loganathan','10:00 AM','3:33 PM'], ['2026-10-16','gokulraj','10:00 AM','3:33 PM'],
  ['2026-10-17','nandhini','9:20 AM','3:00 PM'], ['2026-10-17','srinithi','10:00 AM','3:00 PM'],
  ['2026-10-20','nandhini','9:30 AM','2:40 PM'], ['2026-10-20','srinithi','9:30 AM',''],
  ['2026-10-21','mathishree','9:30 AM','3:10 PM'], ['2026-10-21','nandhini','9:30 AM','3:10 PM'], ['2026-10-21','stephen','10:10 AM','3:35 PM'], ['2026-10-21','gokulraj','10:10 AM','3:35 PM'], ['2026-10-21','srinithi','10:30 AM',''],
  ['2026-10-22','nandhini','9:20 AM','3:00 PM'], ['2026-10-22','srinithi','9:30 AM','3:00 PM'], ['2026-10-22','gokulraj','9:20 AM','3:00 PM'], ['2026-10-22','stephen','10:20 AM','3:00 PM'], ['2026-10-22','bharath','10:20 AM','3:00 PM'],
  ['2026-10-23','nandhini','9:20 AM',''], ['2026-10-23','srinithi','9:30 AM',''],
  ['2026-10-24','mathishree','9:20 AM','3:00 PM'], ['2026-10-24','nandhini','9:20 AM','3:00 PM'], ['2026-10-24','srinithi','10:00 AM',''], ['2026-10-24','stephen','10:15 AM','3:25 PM'],
  ['2026-10-26','nandhini','9:20 AM','3:00 PM'],
  ['2026-10-27','nandhini','9:20 AM','3:00 PM'], ['2026-10-27','srinithi','10:00 AM','4:00 PM'], ['2026-10-27','loganathan','10:35 AM','3:40 PM'],
  ['2026-10-28','nandhini','9:20 AM','3:10 PM'], ['2026-10-28','loganathan','10:15 AM','3:30 PM'], ['2026-10-28','srinithi','10:15 AM','3:30 PM'],
  ['2026-10-29','nandhini','9:30 AM',''], ['2026-10-29','srinithi','10:00 AM',''], ['2026-10-29','loganathan','10:30 AM',''],
];

const HOLIDAYS = [
  ['2026-09-27', 'Weekly Holiday - Sunday'],
  ['2026-10-04', 'Weekly Holiday - Sunday'],
  ['2026-10-10', 'Saturday Holiday'],
  ['2026-10-11', 'Weekly Holiday - Sunday'],
  ['2026-10-18', 'Weekly Holiday - Sunday'],
  ['2026-10-19', 'General Holiday'],
  ['2026-10-25', 'Weekly Holiday - Sunday'],
];

const parseTime = (date, value) => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time ${value} on ${date}`);
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${date} ${String(hour).padStart(2, '0')}:${match[2]}:00`;
};

const makeStableUuid = (text) => {
  const bytes = crypto.createHash('sha256').update(text).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};

const main = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    connectionLimit: 2,
  });
  const connection = await pool.getConnection();
  try {
    const [[target]] = await connection.query('SELECT DATABASE() database_name');
    if (target.database_name !== EXPECTED_DATABASE) throw new Error(`Refusing to import into ${target.database_name}; expected ${EXPECTED_DATABASE}.`);

    const [users] = await connection.query("SELECT id, full_name, email, role FROM users WHERE role IN ('EMPLOYEE','INTERN','HR') AND is_active=1");
    const usersByEmail = new Map(users.map((user) => [String(decrypt(user.email) || '').toLowerCase(), user]));
    const people = new Map();
    for (const [key, email] of Object.entries(STAFF)) {
      const user = usersByEmail.get(email.toLowerCase());
      if (!user) throw new Error(`Could not find active local staff account ${email}.`);
      if (!['EMPLOYEE', 'INTERN', 'HR'].includes(user.role)) throw new Error(`Unexpected role for ${email}: ${user.role}`);
      people.set(key, user);
    }
    // The first supplied attendance date is the agreed joining date for each person.
    // Do not infer joining dates from mutable employee-profile metadata.
    const requestedEmployee = String(process.env.IMPORT_EMPLOYEE || '').trim().toLowerCase();
    if (requestedEmployee && !people.has(requestedEmployee)) {
      throw new Error(`Unknown IMPORT_EMPLOYEE '${requestedEmployee}'. Use one of: ${[...people.keys()].join(', ')}`);
    }
    if (requestedEmployee) {
      for (const key of [...people.keys()]) {
        if (key !== requestedEmployee) people.delete(key);
      }
    }
    if (START_DATE < IMPORT_MIN_DATE || END_DATE > IMPORT_MAX_DATE || START_DATE > END_DATE) {
      throw new Error(`Import date range must stay within ${IMPORT_MIN_DATE} and ${IMPORT_MAX_DATE}; received ${START_DATE} through ${END_DATE}.`);
    }

    const joinedDate = new Map(
      [...people.entries()].map(([key, user]) => [user.id, JOINING_DATES[key]])
    );
    for (const [key, date] of Object.entries(JOINING_DATES)) {
      if (!date || date < IMPORT_MIN_DATE || date > IMPORT_MAX_DATE) {
        throw new Error(`Invalid joining date for ${key}: ${date}`);
      }
    }
    const byDayPerson = new Map();
    for (const [date, key, checkIn, checkOut] of PRESENT) {
      if (!people.has(key)) throw new Error(`Unknown roster key ${key}`);
      const user = people.get(key);
      const keyByDayPerson = `${date}:${user.id}`;
      if (byDayPerson.has(keyByDayPerson)) throw new Error(`Duplicate source attendance for ${date} and ${key}`);
      byDayPerson.set(keyByDayPerson, { date, key, user, checkIn: parseTime(date, checkIn), checkOut: parseTime(date, checkOut) });
    }

    // Refuse to proceed if the target attendance table already contains duplicate
    // daily rows for any imported person/date. This is a read-only preflight check.
    const personIds = [...people.values()].map((user) => user.id);
    const [duplicateDays] = await connection.execute(
      `SELECT user_id, DATE_FORMAT(date, '%Y-%m-%d') AS attendance_date, COUNT(*) AS row_count
       FROM attendance
       WHERE user_id IN (${personIds.map(() => '?').join(',')}) AND date BETWEEN ? AND ?
       GROUP BY user_id, date
       HAVING COUNT(*) > 1`,
      [...personIds, START_DATE, END_DATE]
    );
    if (duplicateDays.length) {
      throw new Error(`Duplicate attendance rows found; import stopped without changes: ${JSON.stringify(duplicateDays)}`);
    }

    const holidayMap = new Map(HOLIDAYS);
    const shiftStart = process.env.SHIFT_START || '10:30:00';
    let presentCount = 0;
    let absentCount = 0;
    await connection.beginTransaction();
    try {
      for (const [date, name] of HOLIDAYS) {
        await connection.execute(
          `INSERT INTO holidays (id,name,date,is_restricted) VALUES (?,?,?,0)
           ON DUPLICATE KEY UPDATE name=VALUES(name), is_restricted=0`,
          [makeStableUuid(`ethiroli-holiday-${date}`), name, date]
        );
      }

      for (const date = new Date(`${START_DATE}T00:00:00Z`); date <= new Date(`${END_DATE}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1)) {
        const day = date.toISOString().slice(0, 10);
        const isSunday = date.getUTCDay() === 0;
        const holiday = holidayMap.has(day);
        for (const [key, user] of people) {
          const joined = joinedDate.get(user.id);
          if (joined && day < joined) continue;
          const source = byDayPerson.get(`${day}:${user.id}`);
          if (!source && (isSunday || holiday)) continue;
          const checkIn = source?.checkIn || null;
          const checkOut = source?.checkOut || null;
          const workedMinutes = checkIn && checkOut
            ? Math.max(0, Math.floor((new Date(`${checkOut.replace(' ', 'T')}Z`) - new Date(`${checkIn.replace(' ', 'T')}Z`)) / 60000))
            : 0;
          const [shiftHour, shiftMinute] = shiftStart.slice(0, 5).split(':').map(Number);
          const [checkHour, checkMinute] = checkIn ? checkIn.slice(11, 16).split(':').map(Number) : [0, 0];
          const isLate = checkIn && (checkHour * 60 + checkMinute > shiftHour * 60 + shiftMinute) ? 1 : 0;
          const status = source ? 'PRESENT' : 'ABSENT';
          await connection.execute(
            `INSERT INTO attendance (id,user_id,date,check_in_time,check_out_time,is_late,status,worked_minutes,session_count)
             VALUES (?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE check_in_time=VALUES(check_in_time),check_out_time=VALUES(check_out_time),
               is_late=VALUES(is_late),status=VALUES(status),worked_minutes=VALUES(worked_minutes),session_count=VALUES(session_count)`,
            [crypto.randomUUID(), user.id, day, checkIn, checkOut, isLate, status, workedMinutes, source ? 1 : 0]
          );
          if (source) {
            const sessionId = makeStableUuid(`ethiroli-source-attendance-${user.id}-${day}`);
            await connection.execute(
              `INSERT INTO attendance_sessions (id,user_id,work_date,check_in_time,check_out_time,status)
               VALUES (?,?,?,?,?,'COMPLETED')
               ON DUPLICATE KEY UPDATE check_in_time=VALUES(check_in_time),check_out_time=VALUES(check_out_time),status='COMPLETED'`,
              [sessionId, user.id, day, checkIn, checkOut]
            );
            presentCount += 1;
          } else {
            absentCount += 1;
          }
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    console.log(`Imported/updated ${presentCount} supplied present records for ${[...people.keys()].join(', ')}.`);
    console.log(`Recorded ${absentCount} missing-person absences on working days from ${START_DATE} through ${END_DATE}, respecting confirmed joining dates and holidays.`);
    console.log(`Registered ${HOLIDAYS.length} supplied holiday dates.`);
    console.log('No other user accounts or live test punches were changed.');
  } finally {
    connection.release();
    await pool.end();
  }
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
