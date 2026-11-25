import crypto from 'crypto';
import pool from '../config/database.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { createNotification } from './notificationController.js';
import { assertSalesBudgetAvailable } from '../services/budgetService.js';
import { generateProjectCode, listManagers, validateManager, logProjectActivity } from '../services/companyProjectService.js';
import { notifyOversight } from '../services/notificationTargets.js';

const isAdmin = (user) => ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
const num = (value, label, { positive = false } = {}) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || (positive && parsed <= 0)) {
    throw new ValidationError(`${label} must be ${positive ? 'greater than' : 'at least'} zero.`);
  }
  return Math.round(parsed * 100) / 100;
};

const audit = (req, action, entityType, entityId, oldValue, newValue) => AuditLog.create({
  user_id: req.user?.id,
  action,
  entity_type: entityType,
  entity_id: entityId,
  old_value: oldValue,
  new_value: newValue,
  ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  user_agent: req.headers['user-agent']
});

const fetchOrder = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT o.*, COALESCE(o.client_name, c.name) AS client_name, c.email AS client_email, c.phone AS client_phone,
            p.name AS project_name, p.project_code
       FROM client_orders o
       LEFT JOIN clients c ON c.id = o.client_id
       LEFT JOIN student_projects p ON p.id = o.converted_project_id
      WHERE o.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const assertOrderOwner = (user, order) => {
  if (!order) throw new NotFoundError('Client order not found');
  if (!isAdmin(user) && order.sales_owner_id !== user.id) {
    throw new AuthorizationError('You can only access your own client orders.');
  }
};

const nextOrderNumber = async (connection) => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const number = `CO-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const [rows] = await connection.execute('SELECT 1 FROM client_orders WHERE order_number = ? LIMIT 1', [number]);
    if (!rows.length) return number;
  }
  throw new ValidationError('Unable to allocate a unique order number. Please retry.');
};

const normalizeItems = (items) => {
  if (items === undefined) return null;
  if (!Array.isArray(items)) throw new ValidationError('Items must be an array.');
  return items.map((item) => {
    const description = String(item.description || '').trim();
    if (!description) throw new ValidationError('Every order item needs a description.');
    const quantity = num(item.quantity, 'Item quantity', { positive: true });
    const unitPrice = num(item.unit_price, 'Item unit price');
    return { description, quantity, unit_price: unitPrice, total_price: Math.round(quantity * unitPrice * 100) / 100 };
  });
};

export const listClientOrders = asyncHandler(async (req, res) => {
  const values = [];
  let sql = `SELECT o.*, COALESCE(o.client_name, c.name) AS client_name, p.name AS project_name, p.project_code,
                    u.full_name AS sales_owner_name
               FROM client_orders o
               LEFT JOIN clients c ON c.id = o.client_id
               LEFT JOIN student_projects p ON p.id = o.converted_project_id
               LEFT JOIN users u ON u.id = o.sales_owner_id
              WHERE 1 = 1`;
  if (!isAdmin(req.user)) {
    sql += ' AND o.sales_owner_id = ?';
    values.push(req.user.id);
  }
  if (req.query.status) {
    sql += ' AND o.status = ?';
    values.push(String(req.query.status).toUpperCase());
  }
  if (req.query.client_id) {
    sql += ' AND o.client_id = ?';
    values.push(req.query.client_id);
  }
  if (req.query.search) {
    sql += ' AND (o.title LIKE ? OR o.order_number LIKE ? OR c.name LIKE ?)';
    const term = `%${String(req.query.search).trim()}%`;
    values.push(term, term, term);
  }
  sql += ' ORDER BY o.order_date DESC, o.created_at DESC LIMIT 200';
  const [rows] = await pool.execute(sql, values);
  return success(res, 200, rows);
});

export const getClientOrder = asyncHandler(async (req, res) => {
  const order = await fetchOrder(req.params.id);
  assertOrderOwner(req.user, order);
  const [items] = await pool.execute('SELECT * FROM client_order_items WHERE order_id = ? ORDER BY created_at ASC', [req.params.id]);
  return success(res, 200, { ...order, items });
});

const withTransaction = async (work) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const createClientOrder = asyncHandler(async (req, res) => {
  const title = String(req.body.title || '').trim();
  if (!title) throw new ValidationError('An order title is required.');
  const items = normalizeItems(req.body.items) || [];
  const clientId = req.body.client_id || null;
  let clientName = String(req.body.client_name || '').trim() || null;
  let clientEmail = String(req.body.client_email || '').trim() || null;
  let clientPhone = String(req.body.client_phone || '').trim() || null;
  if (clientId) {
    const [clients] = await pool.execute('SELECT * FROM clients WHERE id = ? LIMIT 1', [clientId]);
    if (!clients.length) throw new ValidationError('Selected client does not exist.');
    clientName = clients[0].company_name || clients[0].name;
    clientEmail = clients[0].email || clientEmail;
    clientPhone = clients[0].phone || clientPhone;
  }
  if (!clientName) throw new ValidationError('Choose a client or enter a client name.');

  const id = crypto.randomUUID();
  await withTransaction(async (connection) => {
    const orderNumber = await nextOrderNumber(connection);
    const orderValue = items.length
      ? Math.round(items.reduce((sum, item) => sum + item.total_price, 0) * 100) / 100
      : num(req.body.order_value, 'Order value');
    const ownerId = isAdmin(req.user) && req.body.sales_owner_id ? req.body.sales_owner_id : req.user.id;
    const [ownerRows] = await connection.execute('SELECT id FROM users WHERE id = ? AND role = ? AND is_active = 1', [ownerId, 'SALES']);
    if (!ownerRows.length) throw new ValidationError('Choose an active Sales owner for this order.');
    await connection.execute(
      `INSERT INTO client_orders
         (id, order_number, client_id, client_name, title, description, order_value, currency, status,
          order_date, expected_delivery_date, sales_owner_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)`,
      [
        id, orderNumber, clientId, clientName, title, String(req.body.description || '').trim() || null,
        orderValue, String(req.body.currency || 'INR').trim().slice(0, 10),
        String(req.body.order_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
        req.body.expected_delivery_date || null, ownerId, String(req.body.notes || '').trim() || null
      ]
    );
    for (const item of items) {
      await connection.execute(
        `INSERT INTO client_order_items (id, order_id, description, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), id, item.description, item.quantity, item.unit_price, item.total_price]
      );
    }
  });
  await audit(req, 'CREATE_CLIENT_ORDER', 'CLIENT_ORDER', id, null, req.body);
  return success(res, 201, { id }, 'Client order created');
});

export const updateClientOrder = asyncHandler(async (req, res) => {
  const existing = await fetchOrder(req.params.id);
  assertOrderOwner(req.user, existing);
  if (existing.status === 'CONVERTED') throw new ConflictError('A converted order cannot be edited.');
  const allowed = ['client_name', 'title', 'description', 'order_value', 'currency', 'order_date', 'expected_delivery_date', 'notes', 'status'];
  const values = [];
  const parts = [];
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      parts.push(`${field} = ?`);
      values.push(field === 'order_value' ? num(req.body[field], 'Order value') : req.body[field]);
    }
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(req.params.id);
  await pool.execute(`UPDATE client_orders SET ${parts.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
  await audit(req, 'UPDATE_CLIENT_ORDER', 'CLIENT_ORDER', req.params.id, existing, req.body);
  return success(res, 200, null, 'Client order updated');
});

export const deleteClientOrder = asyncHandler(async (req, res) => {
  const order = await fetchOrder(req.params.id);
  assertOrderOwner(req.user, order);
  if (order.status !== 'DRAFT') throw new ConflictError('Only draft orders can be deleted.');
  await pool.execute('DELETE FROM client_orders WHERE id = ?', [req.params.id]);
  await audit(req, 'DELETE_CLIENT_ORDER', 'CLIENT_ORDER', req.params.id, order, null);
  return success(res, 200, null, 'Client order deleted');
});

/** Convert a real client order into a company project inside one transaction. */
export const convertOrderToProject = asyncHandler(async (req, res) => {
  // Notifications that reference the new project are sent only after commit:
  // inserting them inside the transaction would wait on the project row's own
  // foreign-key lock until the transaction ends.
  const pendingNotifications = [];
  const result = await withTransaction(async (connection) => {
    const [rows] = await connection.execute('SELECT * FROM client_orders WHERE id = ? FOR UPDATE', [req.params.id]);
    const order = rows[0];
    assertOrderOwner(req.user, order);
    if (!order || order.status === 'CONVERTED') throw new ConflictError('This order has already been converted.');
    if (order.status === 'CANCELLED') throw new ConflictError('A cancelled order cannot be converted.');

    const estimatedCost = num(req.body.estimated_cost, 'Estimated cost', { positive: true });
    const manager = await validateManager(req.body.manager_id, connection);
    await assertSalesBudgetAvailable(estimatedCost, connection);
    const projectId = crypto.randomUUID();
    const projectCode = await generateProjectCode(connection);
    const projectValue = Number(order.order_value) || 0;
    const startDate = String(req.body.start_date || order.order_date).slice(0, 10);
    let clientEmail = null;
    let clientPhone = null;
    if (order.client_id) {
      const [clientRows] = await connection.execute(
        'SELECT email, phone FROM clients WHERE id = ? LIMIT 1', [order.client_id]
      );
      clientEmail = clientRows[0]?.email || null;
      clientPhone = clientRows[0]?.phone || null;
    }
    await connection.execute(
      `INSERT INTO student_projects
         (id, name, description, is_active, manager_id, priority, due_date, status, project_code,
          project_type, client_id, client_name, client_email, client_phone, category, project_value,
          estimated_cost, start_date, expected_end_date, sales_owner_id, updated_by)
       VALUES (?, ?, ?, 1, ?, ?, ?, 'AWAITING_MANAGER_ACCEPTANCE', ?, 'COMPANY', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        String(req.body.project_name || order.title).trim(),
        String(req.body.description || order.description || '').trim() || null,
        manager.id,
        String(req.body.priority || 'MEDIUM').toUpperCase(),
        req.body.expected_end_date || order.expected_delivery_date || null,
        projectCode,
        order.client_id,
        order.client_name,
        clientEmail,
        clientPhone,
        String(req.body.category || '').trim() || null,
        projectValue,
        estimatedCost,
        startDate,
        req.body.expected_end_date || order.expected_delivery_date || null,
        order.sales_owner_id,
        req.user.id
      ]
    );
    await connection.execute(
      `INSERT INTO task_lists (id, project_id, name, description, created_by, is_shared)
       VALUES (?, ?, 'General', 'Project delivery tasks', ?, 1)`,
      [crypto.randomUUID(), projectId, manager.id]
    );
    await connection.execute(
      `UPDATE client_orders SET status = 'CONVERTED', converted_project_id = ?, updated_at = NOW() WHERE id = ?`,
      [projectId, order.id]
    );
    await logProjectActivity(
      projectId, req.user.id, 'PROJECT_CREATED',
      `Project created from client order ${order.order_number} and assigned to ${manager.full_name}.`,
      { connection }
    );
    pendingNotifications.push({
      recipient: manager.id,
      type: 'PROJECT_ASSIGNED',
      title: 'New company project assigned',
      message: `You have been assigned to lead ${projectCode}. Please accept the project.`,
      entityType: 'PROJECT',
      entityId: projectId,
      options: { senderUserId: req.user.id, actionUrl: `/app/manager/projects/${projectId}`, projectId }
    });
    pendingNotifications.push({
      oversight: {
        type: 'COMPANY_PROJECT_CREATED',
        title: 'New company project',
        message: `${projectCode} was created from ${order.order_number} for ${order.client_name}.`,
        entityType: 'PROJECT',
        entityId: projectId,
        senderUserId: req.user.id,
        actionUrl: `/app/super-admin/projects/${projectId}`,
        projectId,
        excludeUserId: req.user.id
      }
    });
    return { projectId, projectCode, orderId: order.id };
  });
  for (const notification of pendingNotifications) {
    if (notification.oversight) {
      await notifyOversight(createNotification, notification.oversight);
    } else {
      await createNotification(
        notification.recipient, notification.type, notification.title, notification.message,
        notification.entityType, notification.entityId, notification.options
      );
    }
  }
  await audit(req, 'CONVERT_ORDER_TO_PROJECT', 'CLIENT_ORDER', req.params.id, null, result);
  return success(res, 201, result, 'Client order converted into a company project');
});

export const listAvailableManagers = asyncHandler(async (req, res) => {
  return success(res, 200, await listManagers());
});

export default {
  listClientOrders,
  getClientOrder,
  createClientOrder,
  updateClientOrder,
  deleteClientOrder,
  convertOrderToProject,
  listAvailableManagers
};
