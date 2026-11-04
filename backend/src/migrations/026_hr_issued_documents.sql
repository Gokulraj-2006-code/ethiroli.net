CREATE TABLE IF NOT EXISTS hr_issued_documents (
  id CHAR(36) PRIMARY KEY,
  recipient_user_id CHAR(36) NOT NULL,
  recipient_role ENUM('EMPLOYEE','INTERN') NOT NULL,
  title VARCHAR(255) NOT NULL,
  document_type ENUM('OFFER_LETTER','APPOINTMENT_LETTER','INTERNSHIP_CERTIFICATE','EMPLOYMENT_CERTIFICATE','EXPERIENCE_LETTER','OTHER') NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_key VARCHAR(100) NOT NULL UNIQUE,
  file_size_bytes BIGINT UNSIGNED NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hr_docs_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_hr_docs_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_hr_docs_recipient (recipient_user_id, created_at)
);
