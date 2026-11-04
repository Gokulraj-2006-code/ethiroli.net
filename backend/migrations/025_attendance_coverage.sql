CREATE TABLE IF NOT EXISTS attendance_coverage (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  work_date DATE NOT NULL,
  absent_user_id CHAR(36) NOT NULL,
  replacement_user_id CHAR(36) NOT NULL,
  task_id CHAR(36) NULL,
  assigned_by CHAR(36) NOT NULL,
  note VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_coverage_date (work_date, replacement_user_id),
  KEY idx_coverage_absent (absent_user_id, work_date),
  CONSTRAINT fk_coverage_absent_user FOREIGN KEY (absent_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_coverage_replacement_user FOREIGN KEY (replacement_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_coverage_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  CONSTRAINT fk_coverage_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
