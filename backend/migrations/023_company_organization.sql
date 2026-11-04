-- Company organization relationships. Prepared for explicit local/development
-- migration only; do not run on a live database without an approved backup.
CREATE TABLE IF NOT EXISTS branches (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_branches_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO branches (name) VALUES ('Salem'), ('Erode'), ('Namakkal')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO departments (department_name, description, is_active)
VALUES ('Social Media', 'Company division', 1),
       ('Technical', 'Company division', 1),
       ('Content Creator', 'Company division', 1),
       ('Marketing', 'Company division', 1)
ON DUPLICATE KEY UPDATE is_active = 1;

CREATE TABLE IF NOT EXISTS organizational_sub_roles (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  department_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subrole_department_name (department_id, name),
  CONSTRAINT fk_subrole_department FOREIGN KEY (department_id)
    REFERENCES departments (department_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO organizational_sub_roles (department_id, name)
SELECT d.department_id, s.name
FROM departments d
JOIN (
  SELECT 'Social Media' department_name, 'Social Media Manager / Coordinator' name UNION ALL
  SELECT 'Social Media', 'Social Media Executive' UNION ALL
  SELECT 'Social Media', 'Social Media Designer / Video Editor' UNION ALL
  SELECT 'Technical', 'Frontend Developer' UNION ALL
  SELECT 'Technical', 'Backend Developer' UNION ALL
  SELECT 'Technical', 'AI & Automation' UNION ALL
  SELECT 'Technical', 'Full-Stack Developer' UNION ALL
  SELECT 'Technical', 'QA / Software Tester' UNION ALL
  SELECT 'Technical', 'Technical Support' UNION ALL
  SELECT 'Content Creator', 'Content Writer' UNION ALL
  SELECT 'Content Creator', 'Video Content Creator' UNION ALL
  SELECT 'Content Creator', 'Video Editor' UNION ALL
  SELECT 'Content Creator', 'Graphic / Visual Content Creator' UNION ALL
  SELECT 'Marketing', 'Digital Marketing Executive' UNION ALL
  SELECT 'Marketing', 'SEO / Content Marketing' UNION ALL
  SELECT 'Marketing', 'Campaign and Performance Marketing' UNION ALL
  SELECT 'Marketing', 'Business Development / Lead Generation'
) s ON s.department_name = d.department_name
ON DUPLICATE KEY UPDATE is_active = 1;

ALTER TABLE employees
  ADD COLUMN branch_id CHAR(36) NULL,
  ADD COLUMN department_id INT NULL,
  ADD COLUMN sub_role_id CHAR(36) NULL,
  ADD COLUMN reporting_manager_id CHAR(36) NULL,
  ADD COLUMN account_status ENUM('ACTIVE','INACTIVE','ON_LEAVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  ADD KEY idx_employee_branch_dept (branch_id, department),
  ADD KEY idx_employee_department_id (department_id),
  ADD KEY idx_employee_subrole (sub_role_id),
  ADD KEY idx_employee_manager (reporting_manager_id),
  ADD CONSTRAINT fk_employee_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_employee_subrole FOREIGN KEY (sub_role_id) REFERENCES organizational_sub_roles (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_employee_manager FOREIGN KEY (reporting_manager_id) REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE interns
  ADD COLUMN employee_code VARCHAR(50) NULL,
  ADD COLUMN branch_id CHAR(36) NULL,
  ADD COLUMN department_id INT NULL,
  ADD COLUMN sub_role_id CHAR(36) NULL,
  ADD COLUMN reporting_manager_id CHAR(36) NULL,
  ADD COLUMN account_status ENUM('ACTIVE','INACTIVE','COMPLETED','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  ADD UNIQUE KEY uq_intern_employee_code (employee_code),
  ADD KEY idx_intern_branch_department (branch_id, department_id),
  ADD KEY idx_intern_subrole (sub_role_id),
  ADD KEY idx_intern_manager (reporting_manager_id),
  ADD CONSTRAINT fk_intern_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_intern_department FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_intern_subrole FOREIGN KEY (sub_role_id) REFERENCES organizational_sub_roles (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_intern_manager FOREIGN KEY (reporting_manager_id) REFERENCES users (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS manager_scopes (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  manager_user_id CHAR(36) NOT NULL,
  branch_id CHAR(36) NOT NULL,
  department_id INT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_manager_scope (manager_user_id, branch_id, department_id),
  KEY idx_scope_branch_department (branch_id, department_id),
  CONSTRAINT fk_scope_manager FOREIGN KEY (manager_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_scope_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT,
  CONSTRAINT fk_scope_department FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NULL subscription IDs identify internal company tasks; legacy client tasks
-- continue using their existing subscription and relationships.
ALTER TABLE tasks MODIFY COLUMN subscription_id CHAR(36) NULL;
ALTER TABLE tasks
  ADD COLUMN created_by CHAR(36) NULL,
  ADD COLUMN submitted_at DATETIME NULL,
  ADD COLUMN submission_note TEXT NULL,
  ADD COLUMN review_note TEXT NULL,
  ADD COLUMN reviewed_by CHAR(36) NULL,
  ADD COLUMN reviewed_at DATETIME NULL,
  ADD KEY idx_task_creator (created_by),
  ADD KEY idx_task_review (status, assigned_to, due_date),
  ADD CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_task_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE tasks MODIFY COLUMN status
  ENUM('PENDING','IN_PROGRESS','UNDER_REVIEW','COMPLETED','BLOCKED','CANCELLED') DEFAULT 'PENDING';

CREATE TABLE IF NOT EXISTS task_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  task_id CHAR(36) NOT NULL,
  actor_user_id CHAR(36) NULL,
  event_type VARCHAR(40) NOT NULL,
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NULL,
  note TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_task_history (task_id, created_at),
  CONSTRAINT fk_task_history_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT fk_task_history_actor FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_invitations (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invitation_token_hash (token_hash),
  KEY idx_invitation_user_expiry (user_id, expires_at, consumed_at),
  CONSTRAINT fk_invitation_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
