-- Persistent public enquiry lifecycle. Requires baseline schema / migration 008.
-- Apply to a disposable local database only unless separately approved.
-- Keep the legacy contact_messages table for its old dashboard/report readers,
-- then copy its historical rows once into the canonical contact_inquiries inbox.
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(255) NOT NULL DEFAULT 'Website Inquiry',
  message TEXT NULL,
  source VARCHAR(100) DEFAULT 'WEBSITE',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'NEW';

ALTER TABLE contact_inquiries
  ADD COLUMN IF NOT EXISTS category VARCHAR(80) NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS status ENUM('NEW','IN_PROGRESS','AWAITING_RESPONSE','MEETING_REQUESTED','RESOLVED','CLOSED') NOT NULL DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS meeting_preference DATETIME NULL,
  ADD COLUMN IF NOT EXISTS assigned_to CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS legacy_message_id INT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_legacy_message ON contact_inquiries (legacy_message_id);

-- Existing requests are preserved and assigned their prior read/resolved state.
UPDATE contact_inquiries SET status = CASE
  WHEN is_resolved = 1 THEN 'RESOLVED'
  WHEN is_read = 1 THEN 'IN_PROGRESS'
  ELSE 'NEW'
END WHERE status='NEW' AND (is_read=1 OR is_resolved=1);

INSERT INTO contact_inquiries (inquiry_id,first_name,last_name,email,phone,subject,message,inquiry_source,is_read,is_resolved,notes,created_at,updated_at,category,status,legacy_message_id)
SELECT UUID(), LEFT(SUBSTRING_INDEX(TRIM(m.name),' ',1),100), LEFT(TRIM(SUBSTRING(TRIM(m.name),CHAR_LENGTH(SUBSTRING_INDEX(TRIM(m.name),' ',1))+1)),100),
       m.email,m.phone,COALESCE(NULLIF(m.subject,''),'Website Inquiry'),COALESCE(m.message,''),'WEBSITE',m.is_read,0,NULL,m.created_at,m.created_at,
       COALESCE(NULLIF(m.category,''),'General'),
       CASE UPPER(COALESCE(m.status,'NEW')) WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS' WHEN 'AWAITING_RESPONSE' THEN 'AWAITING_RESPONSE'
         WHEN 'MEETING_REQUESTED' THEN 'MEETING_REQUESTED' WHEN 'RESOLVED' THEN 'RESOLVED' WHEN 'CLOSED' THEN 'CLOSED' WHEN 'PROCESSED' THEN 'RESOLVED' ELSE 'NEW' END,
       m.id
FROM contact_messages m LEFT JOIN contact_inquiries i ON i.legacy_message_id=m.id WHERE i.inquiry_id IS NULL;

-- Leave decisions remain on the existing leaves table and preserve every row.
ALTER TABLE leaves MODIFY COLUMN status ENUM('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING';
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS review_note VARCHAR(500) NULL DEFAULT NULL AFTER approval_chain_step;
