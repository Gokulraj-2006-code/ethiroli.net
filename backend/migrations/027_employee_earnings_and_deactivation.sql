-- ============================================================================
-- 027_employee_earnings_and_deactivation.sql
--
-- The Employee Income page and the HR/Super Admin deactivation workflow call
-- endpoints backed by tables that were never created by any numbered migration
-- or base schema. On a database built from the migration chain those SELECTs
-- returned "Table 'ethiroli.<name>' doesn't exist" (500) on:
--   GET /api/v1/earnings/salary
--   GET /api/v1/earnings/extra-duty
--   GET /api/v1/earnings/referrals
--   GET /api/v1/earnings/investments
--   GET /api/v1/deactivation-requests
--
-- CREATE TABLE IF NOT EXISTS keeps this safe to re-run. Columns match every
-- field read or written by earningsController.js and deactivationController.js.
-- ============================================================================

CREATE TABLE IF NOT EXISTS deactivation_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  requested_by CHAR(36) DEFAULT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  reviewed_by CHAR(36) DEFAULT NULL,
  review_note TEXT DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_deactivation_user (user_id),
  INDEX idx_deactivation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS salary_configs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  stipend DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  effective_from DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_salary_user_effective (user_id, effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS extra_duty_payments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  work_date DATE NOT NULL,
  hours DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_extra_duty_user_date (user_id, work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS referral_commissions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  project_value DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  commission_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  approved_by CHAR(36) DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_referral_user_created (user_id, created_at),
  INDEX idx_referral_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS investment_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  request_type VARCHAR(20) NOT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  notice_months INT NOT NULL DEFAULT 0,
  withdrawal_eligible_date DATE DEFAULT NULL,
  terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  approved_by CHAR(36) DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_investment_user_created (user_id, created_at),
  INDEX idx_investment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS investment_config (
  id CHAR(36) NOT NULL PRIMARY KEY,
  proposed_rate DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  rate_period VARCHAR(50) NOT NULL DEFAULT 'DISABLED',
  rate_enabled TINYINT(1) NOT NULL DEFAULT 0,
  terms_text TEXT DEFAULT NULL,
  updated_by CHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
