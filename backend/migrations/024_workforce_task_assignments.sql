-- Workforce tasks are independent of tenant subscription billing. Allow
-- managers to assign tasks to staff without inventing a subscription row.
ALTER TABLE tasks
  MODIFY COLUMN subscription_id CHAR(36) NULL DEFAULT NULL;

