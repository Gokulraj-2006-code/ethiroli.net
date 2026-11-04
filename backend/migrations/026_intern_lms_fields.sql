-- ============================================================================
-- 026_intern_lms_fields.sql
--
-- The intern directory / onboarding endpoints select the intern's project
-- target and progress. These columns exist in the production schema file but
-- were never added by a numbered migration, so a database built from the
-- sequential migrations alone returned "Unknown column 'project_target'".
-- ============================================================================

ALTER TABLE interns
  ADD COLUMN project_target VARCHAR(255) DEFAULT 'Full Stack Development',
  ADD COLUMN progress INT DEFAULT 10;
