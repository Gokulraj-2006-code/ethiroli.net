-- ============================================================================
-- 028_company_projects_budgets_orders.sql
--
-- Adds the company-project, annual-budget, client-order, task-collaboration
-- and collaborative-to-do domain on top of the existing HR/Employee schema.
--
-- Design notes:
--   * `student_projects` remains the single project table (legacy name) so the
--     existing HR Projects, Manager and Employee project links keep working.
--   * New company projects set project_type='COMPANY'; existing rows are
--     backfilled as 'STUDENT'.
--   * All new tables use CHAR(36) UUID primary keys and utf8mb4_unicode_ci to
--     stay portable on MariaDB 10.4.
--   * Every statement is safe to re-run. The migration runner guards ADD COLUMN
--     and ADD INDEX, and treats duplicate constraint names as already applied.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Projects: company-project fields
-- ---------------------------------------------------------------------------
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS project_code VARCHAR(50) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(20) NOT NULL DEFAULT 'STUDENT';
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS client_id CHAR(36) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS client_name VARCHAR(255) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS client_email VARCHAR(255) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS project_value DECIMAL(14,2) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(14,2) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS expected_end_date DATE DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS sales_owner_id CHAR(36) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS manager_accepted_at DATETIME DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS delivery_submitted_at DATETIME DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS delivery_submitted_by CHAR(36) DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS sales_confirmed_at DATETIME DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS admin_confirmed_at DATETIME DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS completed_at DATETIME DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS cancelled_at DATETIME DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS cancellation_reason TEXT DEFAULT NULL;
ALTER TABLE student_projects ADD COLUMN IF NOT EXISTS updated_by CHAR(36) DEFAULT NULL;

-- Company projects do not have a student owner or a GitHub repository. MySQL/
-- MariaDB unique indexes allow multiple NULL values, so the existing unique
-- key on (student_id, github_repo_url) is preserved.
ALTER TABLE student_projects MODIFY COLUMN student_id CHAR(36) NULL;
ALTER TABLE student_projects MODIFY COLUMN github_repo_url VARCHAR(500) NULL;

UPDATE student_projects
SET project_type = 'STUDENT'
WHERE project_type IS NULL OR project_type = '';

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_code ON student_projects (project_code);
CREATE INDEX IF NOT EXISTS idx_projects_type_status ON student_projects (project_type, status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON student_projects (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_sales_owner ON student_projects (sales_owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_expected_end ON student_projects (expected_end_date);

ALTER TABLE student_projects
  ADD CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE student_projects
  ADD CONSTRAINT fk_projects_sales_owner FOREIGN KEY (sales_owner_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE student_projects
  ADD CONSTRAINT fk_projects_delivery_submitter FOREIGN KEY (delivery_submitted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE student_projects
  ADD CONSTRAINT fk_projects_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2. Task collaboration tables (task_lists must exist before tasks FK)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_lists (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  created_by CHAR(36) NOT NULL,
  is_shared TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_task_lists_project (project_id),
  KEY idx_task_lists_creator (created_by),
  CONSTRAINT fk_task_lists_project FOREIGN KEY (project_id) REFERENCES student_projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_lists_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_comments (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  task_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_task_comments_task (task_id, created_at),
  KEY idx_task_comments_author (author_id),
  CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_attachments (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  task_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/octet-stream',
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_task_attachments_task (task_id, created_at),
  KEY idx_task_attachments_uploader (uploaded_by),
  CONSTRAINT fk_task_attachments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_attachments_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_checklist_items (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  task_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_task_checklist_task (task_id, sort_order),
  CONSTRAINT fk_task_checklist_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_reminders (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  task_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  remind_at DATETIME NOT NULL,
  sent_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_task_reminders_due (remind_at, sent_at),
  KEY idx_task_reminders_user (user_id),
  CONSTRAINT fk_task_reminders_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_activity_log (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  task_id CHAR(36) DEFAULT NULL,
  actor_id CHAR(36) DEFAULT NULL,
  event_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  metadata LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_project_activity_project (project_id, created_at),
  KEY idx_project_activity_task (task_id, created_at),
  KEY idx_project_activity_actor (actor_id),
  CONSTRAINT fk_project_activity_project FOREIGN KEY (project_id) REFERENCES student_projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_activity_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  CONSTRAINT fk_project_activity_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_approvals (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  approval_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  requested_by CHAR(36) DEFAULT NULL,
  acted_by CHAR(36) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acted_at DATETIME DEFAULT NULL,
  KEY idx_project_approvals_project (project_id, approval_type, status),
  KEY idx_project_approvals_status (status),
  CONSTRAINT fk_project_approvals_project FOREIGN KEY (project_id) REFERENCES student_projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_approvals_requester FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_project_approvals_actor FOREIGN KEY (acted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. Tasks: collaboration and review lifecycle
-- ---------------------------------------------------------------------------
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_list_id CHAR(36) DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id CHAR(36) DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_checklist_item TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at DATETIME DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at DATETIME DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rejection_count INT NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_rejected_at DATETIME DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cancelled_at DATETIME DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks (project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_task_list ON tasks (task_list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks (parent_task_id);

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_task_list FOREIGN KEY (task_list_id) REFERENCES task_lists(id) ON DELETE SET NULL;
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- 4. Project expenses: vendor/reference/idempotency and wider categories
-- ---------------------------------------------------------------------------
ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS vendor VARCHAR(255) DEFAULT NULL;
ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100) DEFAULT NULL;
ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) DEFAULT NULL;
ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS updated_by CHAR(36) DEFAULT NULL;
ALTER TABLE project_expenses ADD COLUMN IF NOT EXISTS rejection_note TEXT DEFAULT NULL;

ALTER TABLE project_expenses
  MODIFY COLUMN category ENUM(
    'CLOUD_INFRA','SOFTWARE_LICENSE','HARDWARE','CONTRACTOR_FEE','TRAVEL','MISC',
    'EQUIPMENT','MARKETING','OFFICE','SUBCONTRACTOR','UTILITIES','OTHER'
  ) NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_expense_idempotency ON project_expenses (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_expenses_project_date ON project_expenses (project_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON project_expenses (vendor);

ALTER TABLE project_expenses
  ADD CONSTRAINT fk_expenses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. Notifications: sender, deep link and domain references
-- ---------------------------------------------------------------------------
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_user_id CHAR(36) DEFAULT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS project_id CHAR(36) DEFAULT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS task_id CHAR(36) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_project ON notifications (project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_task ON notifications (task_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications (sender_user_id);

ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_project FOREIGN KEY (project_id) REFERENCES student_projects(id) ON DELETE CASCADE;
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- 6. Annual budgets, allocations and revisions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS annual_budgets (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  fiscal_year VARCHAR(10) NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  description TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  created_by CHAR(36) NOT NULL,
  approved_by CHAR(36) DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_annual_budget_year (fiscal_year),
  KEY idx_annual_budget_status (status),
  CONSTRAINT fk_annual_budget_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_annual_budget_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS budget_allocations (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  annual_budget_id CHAR(36) NOT NULL,
  panel VARCHAR(20) NOT NULL,
  allocated_amount DECIMAL(14,2) NOT NULL,
  allocation_date DATE NOT NULL,
  description TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  allocated_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_budget_allocations_budget (annual_budget_id, status),
  KEY idx_budget_allocations_panel (panel, status),
  CONSTRAINT fk_budget_allocations_budget FOREIGN KEY (annual_budget_id) REFERENCES annual_budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_budget_allocations_creator FOREIGN KEY (allocated_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS budget_revisions (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  annual_budget_id CHAR(36) NOT NULL,
  old_total DECIMAL(14,2) NOT NULL,
  new_total DECIMAL(14,2) NOT NULL,
  reason TEXT NOT NULL,
  revised_by CHAR(36) NOT NULL,
  approved_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_budget_revisions_budget (annual_budget_id, created_at),
  CONSTRAINT fk_budget_revisions_budget FOREIGN KEY (annual_budget_id) REFERENCES annual_budgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_budget_revisions_reviser FOREIGN KEY (revised_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_budget_revisions_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS budget_allocation_revisions (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  allocation_id CHAR(36) NOT NULL,
  old_amount DECIMAL(14,2) NOT NULL,
  new_amount DECIMAL(14,2) NOT NULL,
  reason TEXT NOT NULL,
  revised_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_budget_allocation_revisions_allocation (allocation_id, created_at),
  CONSTRAINT fk_budget_allocation_revisions_allocation FOREIGN KEY (allocation_id) REFERENCES budget_allocations(id) ON DELETE CASCADE,
  CONSTRAINT fk_budget_allocation_revisions_reviser FOREIGN KEY (revised_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. Client orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_orders (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  order_number VARCHAR(50) NOT NULL,
  client_id CHAR(36) DEFAULT NULL,
  client_name VARCHAR(255) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  order_value DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  order_date DATE NOT NULL,
  expected_delivery_date DATE DEFAULT NULL,
  sales_owner_id CHAR(36) NOT NULL,
  converted_project_id CHAR(36) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_order_number (order_number),
  KEY idx_client_orders_client (client_id),
  KEY idx_client_orders_status (status),
  KEY idx_client_orders_owner (sales_owner_id),
  CONSTRAINT fk_client_orders_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  CONSTRAINT fk_client_orders_owner FOREIGN KEY (sales_owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_client_orders_project FOREIGN KEY (converted_project_id) REFERENCES student_projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_order_items (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_client_order_items_order (order_id),
  CONSTRAINT fk_client_order_items_order FOREIGN KEY (order_id) REFERENCES client_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. Collaborative to-do lists (Microsoft To Do style)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo_lists (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  owner_id CHAR(36) NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'PERSONAL',
  color VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_todo_lists_owner (owner_id),
  KEY idx_todo_lists_visibility (visibility),
  CONSTRAINT fk_todo_lists_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS todo_list_members (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  list_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  permission VARCHAR(10) NOT NULL DEFAULT 'VIEW',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_todo_list_member (list_id, user_id),
  KEY idx_todo_list_members_user (user_id),
  CONSTRAINT fk_todo_list_members_list FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE,
  CONSTRAINT fk_todo_list_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS todo_items (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  list_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  due_date DATE DEFAULT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  assigned_to CHAR(36) DEFAULT NULL,
  created_by CHAR(36) NOT NULL,
  completed_at DATETIME DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_todo_items_list (list_id, sort_order),
  KEY idx_todo_items_assigned (assigned_to, status),
  CONSTRAINT fk_todo_items_list FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE,
  CONSTRAINT fk_todo_items_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_todo_items_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS todo_item_subtasks (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  item_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_todo_item_subtasks_item (item_id, sort_order),
  CONSTRAINT fk_todo_item_subtasks_item FOREIGN KEY (item_id) REFERENCES todo_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS todo_item_comments (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  item_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_todo_item_comments_item (item_id, created_at),
  CONSTRAINT fk_todo_item_comments_item FOREIGN KEY (item_id) REFERENCES todo_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_todo_item_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. Seed one manager scope for active managers that have none.
--    HR can replace these assignments from Organization Settings; without a
--    scope the Manager task list is intentionally empty.
-- ---------------------------------------------------------------------------
INSERT INTO manager_scopes (id, manager_user_id, branch_id, department_id)
SELECT UUID(), u.id,
       (SELECT b.id FROM branches b WHERE b.is_active = 1 ORDER BY b.name ASC LIMIT 1),
       NULL
FROM users u
WHERE u.role = 'PROJECT_MANAGER'
  AND u.is_active = 1
  AND NOT EXISTS (SELECT 1 FROM manager_scopes s WHERE s.manager_user_id = u.id);
