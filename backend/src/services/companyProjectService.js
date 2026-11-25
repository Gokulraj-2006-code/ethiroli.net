import crypto from 'crypto';
import pool from '../config/database.js';
import { decrypt } from '../config/encryption.js';
import { looksLikeEncryptedValue } from '../models/User.js';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors.js';

const isAdmin = (user) => ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

const safeName = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    const out = decrypt(value);
    if (!out || looksLikeEncryptedValue(out)) return fallback;
    return out;
  } catch (_) {
    return fallback;
  }
};

export const parseAssignedIds = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_) {
    return [];
  }
};

export const getProject = async (id, connection = pool) => {
  const [rows] = await connection.execute('SELECT * FROM student_projects WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

/**
 * Role-aware access to a company project. HR and unrelated roles get nothing:
 * monitoring is handled by the dedicated panel links, not by project reads.
 */
export const assertProjectAccess = async (user, project, { write = false } = {}) => {
  if (!project) throw new NotFoundError('Project not found');
  if (isAdmin(user)) return { role: 'ADMIN', canWrite: true, canManage: true };

  const team = parseAssignedIds(project.assigned_user_ids);
  if (user.role === 'PROJECT_MANAGER') {
    const isOwner = project.manager_id === user.id;
    const isTeamMember = team.includes(user.id);
    if (!isOwner && !isTeamMember) throw new AuthorizationError('This project is not assigned to you.');
    return { role: 'MANAGER', canWrite: isOwner || isTeamMember, canManage: isOwner };
  }

  if (user.role === 'SALES') {
    if (project.project_type !== 'COMPANY' || project.sales_owner_id !== user.id) {
      throw new AuthorizationError('You can only access projects you created.');
    }
    return { role: 'SALES', canWrite: true, canManage: false };
  }

  if (['EMPLOYEE', 'INTERN'].includes(user.role)) {
    if (!team.includes(user.id)) {
      const [rows] = await pool.execute(
        'SELECT 1 FROM tasks WHERE project_id = ? AND assigned_to = ? LIMIT 1',
        [project.id, user.id]
      );
      if (!rows.length) throw new AuthorizationError('You are not assigned to this project.');
    }
    return { role: 'EMPLOYEE', canWrite: false, canManage: false };
  }

  throw new AuthorizationError('Your role cannot access company projects.');
};

/** Manager-only guard used by acceptance, delivery and review actions. */
export const assertProjectManager = (user, project) => {
  if (isAdmin(user)) return;
  if (user.role !== 'PROJECT_MANAGER' || project.manager_id !== user.id) {
    throw new AuthorizationError('Only the assigned manager can perform this action.');
  }
};

export const logProjectActivity = async (
  projectId,
  actorId,
  eventType,
  message,
  { taskId = null, metadata = null, connection = pool } = {}
) => {
  await connection.execute(
    `INSERT INTO project_activity_log (id, project_id, task_id, actor_id, event_type, message, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), projectId, taskId, actorId || null, eventType, message,
      metadata ? JSON.stringify(metadata) : null]
  );
};

/**
 * Project progress is always derived from real work items. Task completion
 * and milestone sign-off each contribute half when both exist; otherwise the
 * available signal is used. A project can never be marked complete here -
 * reaching 100% only moves an active project to READY_FOR_DELIVERY.
 */
export const recomputeProjectProgress = async (projectId, connection = pool) => {
  const [[taskRow], [milestoneRow]] = await Promise.all([
    connection.execute(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS done
         FROM tasks
        WHERE project_id = ? AND is_checklist_item = 0 AND parent_task_id IS NULL
          AND status <> 'CANCELLED'`,
      [projectId]
    ),
    connection.execute(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS done
         FROM project_milestones WHERE project_id = ?`,
      [projectId]
    )
  ]);

  const taskTotal = Number(taskRow[0]?.total || 0);
  const taskDone = Number(taskRow[0]?.done || 0);
  const milestoneTotal = Number(milestoneRow[0]?.total || 0);
  const milestoneDone = Number(milestoneRow[0]?.done || 0);

  const taskPct = taskTotal ? (taskDone / taskTotal) * 100 : 0;
  let percent;
  if (milestoneTotal > 0 && taskTotal > 0) {
    percent = (taskPct + (milestoneDone / milestoneTotal) * 100) / 2;
  } else if (milestoneTotal > 0) {
    percent = (milestoneDone / milestoneTotal) * 100;
  } else {
    percent = taskPct;
  }
  percent = Math.min(100, Math.max(0, Math.round(percent * 100) / 100));

  await connection.execute(
    `UPDATE student_projects
        SET progress_percent = ?,
            status = CASE
              WHEN ? = 100 AND status IN ('ACTIVE','READY_FOR_DELIVERY','IN_PROGRESS') THEN 'READY_FOR_DELIVERY'
              WHEN ? < 100 AND status = 'READY_FOR_DELIVERY' THEN 'ACTIVE'
              ELSE status
            END
      WHERE id = ?`,
    [percent, percent, percent, projectId]
  );
  return percent;
};

export const generateProjectCode = async (connection = pool) => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = `CP-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const [rows] = await connection.execute(
      'SELECT 1 FROM student_projects WHERE project_code = ? LIMIT 1',
      [code]
    );
    if (!rows.length) return code;
  }
  throw new ValidationError('Unable to allocate a unique project code. Please retry.');
};

/** Active PROJECT_MANAGER accounts for the Sales assignment picker. */
export const listManagers = async () => {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, avatar_url FROM users
      WHERE role = 'PROJECT_MANAGER' AND is_active = 1 ORDER BY id ASC`
  );
  return rows.map((row) => ({
    id: row.id,
    full_name: safeName(row.full_name, 'Manager'),
    email: safeName(row.email, ''),
    avatar_url: row.avatar_url || null
  }));
};

export const validateManager = async (managerId, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT id, full_name, email, role, is_active FROM users WHERE id = ? LIMIT 1`,
    [managerId]
  );
  const manager = rows[0];
  if (!manager || manager.role !== 'PROJECT_MANAGER' || !manager.is_active) {
    throw new ValidationError('Choose an active Manager to own the project.');
  }
  return { id: manager.id, full_name: safeName(manager.full_name, 'Manager') };
};

export { isAdmin, safeName };
export default {
  parseAssignedIds,
  getProject,
  assertProjectAccess,
  assertProjectManager,
  logProjectActivity,
  recomputeProjectProgress,
  generateProjectCode,
  listManagers,
  validateManager,
  isAdmin,
  safeName
};
