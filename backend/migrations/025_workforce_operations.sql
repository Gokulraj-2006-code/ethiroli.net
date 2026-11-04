-- Complete the columns used by the current attendance and calendar workflows.
-- The original base schema predates these app code paths, while the old
-- one-off migration files were never part of the documented local setup.

ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS work_mode ENUM('REMOTE', 'OFFICE') NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS worked_minutes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS session_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id CHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  work_date DATE NOT NULL,
  check_in_time DATETIME NOT NULL,
  check_out_time DATETIME DEFAULT NULL,
  worked_minutes INT GENERATED ALWAYS AS (
    IFNULL(TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time), 0)
  ) STORED,
  status ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user_date (user_id, work_date),
  INDEX idx_sessions_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE calendar_events
  MODIFY COLUMN event_type VARCHAR(50) NOT NULL DEFAULT 'MEETING';

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS event_type_id VARCHAR(36) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurrence_rule JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurrence_instance_count INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS index_key VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parent_event_id VARCHAR(36) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelled_instance_dates JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tags JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status ENUM('scheduled','completed','cancelled','postponed') DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT NULL;
