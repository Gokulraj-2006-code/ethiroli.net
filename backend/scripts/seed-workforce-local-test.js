import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../src/config/database.js';
import { encrypt, encryptDeterministic } from '../src/config/encryption.js';

const safeHosts = new Set(['127.0.0.1', 'localhost', '::1']);
if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_SCHEMA_ONLY !== 'true' ||
    process.env.DB_NAME !== 'ethiroli_local_test' || !safeHosts.has(process.env.DB_HOST) ||
    Number(process.env.DB_PORT) !== 3307 || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  throw new Error('Refusing to seed accounts unless connected to the disposable loopback ethiroli_local_test database on port 3307.');
}

const personnel = [
  { email: 'gokulrajkumar2006@gmail.com', name: 'K. Gokulraj', username: 'gokulraje', role: 'EMPLOYEE', title: 'AI Automation Employee', department: 'Technical', departmentId: 2, subRole: 'AI & Automation', code: 'ETH-EMP-2026-001', joined: '2026-10-07' },
  { email: 'sloganathan0105@gmail.com', name: 'S. Loganathan', username: 'loganathan', role: 'EMPLOYEE', title: 'AI Automation Employee', department: 'Technical', departmentId: 2, subRole: 'AI & Automation', code: 'ETH-EMP-2026-002', joined: '2026-09-24' },
  { email: 'stephen862k7@gmail.com', name: 'K. Stephen', username: 'stephen', role: 'EMPLOYEE', title: 'Web Developer', department: 'Technical', departmentId: 2, subRole: 'Full-Stack Developer', code: 'ETH-EMP-2026-003', joined: '2026-09-24' },
  { email: 'srinithikumar54@gmail.com', name: 'K. Srinithi', username: 'srinithi', role: 'EMPLOYEE', title: 'Video Editor', department: 'Content Creator', departmentId: 3, subRole: 'Video Editor', code: 'ETH-EMP-2026-004', joined: '2026-10-06' },
  { email: 'knandhinivnr@gmail.com', name: 'K. Nandhini', username: 'nandhini', role: 'EMPLOYEE', title: 'Content Writer', department: 'Content Creator', departmentId: 3, subRole: 'Content Writer', code: 'ETH-EMP-2026-005', joined: '2026-10-12' },
  { email: 'mathishree008@gmail.com', name: 'S. Mathishree', username: 'mathishree', role: 'EMPLOYEE', title: 'BDA', department: 'Marketing', departmentId: 4, subRole: 'Business Development / Lead Generation', code: 'ETH-EMP-2026-006', joined: '2026-10-12' },
  { email: 'Barathappu777@gmail.com', name: 'Bharath G', username: 'bharathappu', role: 'HR', title: 'HR', department: 'Human Resources', departmentId: null, subRole: null, code: 'ETH-HR-2026-001', joined: '2026-09-24' },
];

// date;username;check-in;check-out. A missing time stays NULL when the source
// register marks it unknown, approximate, or not entered.
const attendanceRegister = `
2026-09-24;stephen;10:30;15:30
2026-09-24;bharathappu;10:40;15:30
2026-09-24;loganathan;11:00;15:30
2026-09-25;loganathan;10:00;15:30
2026-09-25;stephen;10:20;15:30
2026-09-25;bharathappu;10:45;15:30
2026-09-26;stephen;10:20;15:20
2026-09-26;loganathan;10:20;15:20
2026-09-26;bharathappu;10:20;15:20
2026-09-28;stephen;10:15;15:30
2026-09-28;loganathan;10:15;15:30
2026-09-28;bharathappu;10:35;15:30
2026-09-29;loganathan;09:45;15:30
2026-09-30;loganathan;09:45;15:30
2026-09-30;stephen;10:15;15:30
2026-10-01;loganathan;10:00;15:30
2026-10-01;stephen;10:20;15:30
2026-10-02;loganathan;09:40;15:30
2026-10-02;bharathappu;10:10;15:30
2026-10-02;stephen;10:10;15:30
2026-10-03;loganathan;09:50;15:37
2026-10-03;bharathappu;10:10;15:38
2026-10-03;stephen;10:15;15:38
2026-10-05;stephen;10:05;15:30
2026-10-05;bharathappu;10:15;15:30
2026-10-06;loganathan;09:30;15:50
2026-10-06;srinithi;10:20;15:50
2026-10-07;loganathan;10:00;15:30
2026-10-07;srinithi;10:00;15:30
2026-10-07;gokulraje;10:30;15:30
2026-10-08;loganathan;10:00;15:30
2026-10-08;gokulraje;10:00;15:30
2026-10-08;srinithi;10:10;15:30
2026-10-09;srinithi;10:03;16:00
2026-10-09;loganathan;10:03;16:00
2026-10-09;stephen;10:15;16:00
2026-10-09;gokulraje;10:15;16:00
2026-10-12;nandhini;09:00;?
2026-10-12;mathishree;?;?
2026-10-12;srinithi;10:00;15:00
2026-10-12;gokulraje;10:00;?
2026-10-12;loganathan;10:05;15:30
2026-10-13;mathishree;09:28;15:00
2026-10-13;nandhini;09:28;15:00
2026-10-13;stephen;10:15;15:40
2026-10-13;gokulraje;10:15;15:40
2026-10-13;loganathan;10:15;15:40
2026-10-13;srinithi;10:00;15:30
2026-10-14;mathishree;09:20;15:00
2026-10-14;nandhini;09:20;15:00
2026-10-14;srinithi;?;15:00
2026-10-14;stephen;10:00;15:00
2026-10-14;bharathappu;10:00;15:00
2026-10-14;loganathan;10:00;15:10
2026-10-14;gokulraje;10:00;15:00
2026-10-15;nandhini;09:25;15:05
2026-10-15;mathishree;09:25;15:05
2026-10-15;srinithi;10:00;15:38
2026-10-15;gokulraje;10:00;15:38
2026-10-15;stephen;10:20;15:38
2026-10-15;bharathappu;10:20;15:38
2026-10-16;mathishree;09:35;?
2026-10-16;nandhini;09:35;?
2026-10-16;srinithi;10:00;?
2026-10-16;loganathan;10:00;?
2026-10-16;gokulraje;10:00;?
`.trim().split(/\r?\n/).map((line) => line.trim().split(';'));

const connection = await pool.getConnection();
const created = [];
try {
  await connection.beginTransaction();
  const [existing] = await connection.execute(
    `SELECT email FROM users WHERE email IN (${personnel.map(() => '?').join(',')})`,
    personnel.map(({ email }) => encryptDeterministic(email.toLowerCase()))
  );
  if (existing.length) throw new Error(`Refusing to overwrite existing account(s): ${existing.map(({ email }) => email).join(', ')}`);

  const [branches] = await connection.execute("SELECT id FROM branches WHERE name='Salem' AND is_active=1 LIMIT 1");
  if (!branches.length) throw new Error('Required Salem branch is missing; apply local migration 023 first.');

  const subRoleIds = new Map();
  for (const person of personnel.filter(({ subRole }) => subRole)) {
    const [rows] = await connection.execute(
      'SELECT id FROM organizational_sub_roles WHERE department_id=? AND name=? AND is_active=1 LIMIT 1',
      [person.departmentId, person.subRole]
    );
    if (!rows.length) throw new Error(`Missing organization mapping for ${person.department}/${person.subRole}`);
    subRoleIds.set(person.username, rows[0].id);
  }

  for (const person of personnel) {
    const userId = crypto.randomUUID();
    const password = crypto.randomBytes(15).toString('base64url');
    const passwordHash = await bcrypt.hash(password, 12);
    await connection.execute(
      'INSERT INTO users (id,email,password_hash,full_name,role,is_active) VALUES (?,?,?,?,?,1)',
      [userId, encryptDeterministic(person.email.toLowerCase()), passwordHash, encrypt(person.name), person.role]
    );
    await connection.execute(
      `INSERT INTO employees (id,user_id,employee_code,department,designation,date_of_joining,branch_id,department_id,sub_role_id,account_status)
       VALUES (?,?,?,?,?,?,?,?,?,'ACTIVE')`,
      [crypto.randomUUID(), userId, person.code, person.department, person.title, person.joined,
        branches[0].id, person.departmentId, subRoleIds.get(person.username) || null]
    );
    await connection.execute(
      `INSERT INTO user_credentials (user_id,password_hash,password_algo,password_history,requires_password_change)
       VALUES (?,?,'BCRYPT',?,0)`, [userId, passwordHash, JSON.stringify([passwordHash])]
    );
    created.push({ ...person, userId, password });
  }

  const userIds = new Map(created.map(({ username, userId }) => [username, userId]));
  let attendanceRows = 0;
  for (const [date, username, checkIn, checkOut] of attendanceRegister) {
    const userId = userIds.get(username);
    if (!userId) throw new Error(`Attendance entry references an unknown account: ${username}`);
    const at = (time) => time === '?' ? null : `${date} ${time}:00`;
    await connection.execute(
      `INSERT INTO attendance (id,user_id,date,check_in_time,check_out_time,status,is_late)
       VALUES (?,?,?,?,?,'PRESENT',0)`,
      [crypto.randomUUID(), userId, date, at(checkIn), at(checkOut)]
    );
    attendanceRows += 1;
  }
  await connection.commit();

  console.log(JSON.stringify({ accounts: created.map(({ email, name, title, role, joined, password }) => ({ email, name, role, jobTitle: title, joiningDate: joined, password })), attendanceRows }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await pool.end();
}
