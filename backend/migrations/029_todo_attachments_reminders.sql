-- ============================================================================
-- 029_todo_attachments_reminders.sql
--
-- Completes the Microsoft To-Do-style collaboration surface with attachment
-- metadata and per-item reminders.  Like migration 028, every statement is
-- safe to re-run; MariaDB 10.4 supports IF NOT EXISTS for columns and indexes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS todo_item_attachments (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  item_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/octet-stream',
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_todo_item_attachments_item (item_id, created_at),
  KEY idx_todo_item_attachments_uploader (uploaded_by),
  CONSTRAINT fk_todo_item_attachments_item FOREIGN KEY (item_id) REFERENCES todo_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_todo_item_attachments_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS todo_item_reminders (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  item_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  remind_at DATETIME NOT NULL,
  sent_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_todo_item_reminders_due (remind_at, sent_at),
  KEY idx_todo_item_reminders_user (user_id),
  CONSTRAINT fk_todo_item_reminders_item FOREIGN KEY (item_id) REFERENCES todo_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_todo_item_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
