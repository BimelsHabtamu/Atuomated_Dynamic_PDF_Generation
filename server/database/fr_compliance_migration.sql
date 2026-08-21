
USE pdf_engine_db;

ALTER TABLE users
  MODIFY COLUMN role
    ENUM('super_admin','system_admin','admin','generator','approver','recipient')
    NOT NULL;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT NULL;

-- ────────────────────────────────────────────────────────────
-- 3. templates.category ENUM — add Procurement, General
--    (was: 'HR','Finance','Academic')
-- ────────────────────────────────────────────────────────────
ALTER TABLE templates
  MODIFY COLUMN category
    ENUM('HR','Finance','Academic','Procurement','General')
    NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 4. signature_requests — add otp_verified flag
--    Enforces OTP must be verified before approve is allowed
-- ────────────────────────────────────────────────────────────
ALTER TABLE signature_requests
  ADD COLUMN IF NOT EXISTS otp_verified TINYINT(1) NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────
-- 5. signature_requests — add escalation tracking columns
--    Prevents repeat escalation emails every hour (FR-027 bug)
-- ────────────────────────────────────────────────────────────
ALTER TABLE signature_requests
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at  DATETIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS escalation_72h_sent_at DATETIME DEFAULT NULL;

-- ────────────────────────────────────────────────────────────
-- 6. generated_docs.status ENUM — add hand_delivered (FR-031)
--    (was: 'draft','pending','signed','rejected','delivered')
-- ────────────────────────────────────────────────────────────
ALTER TABLE generated_docs
  MODIFY COLUMN status
    ENUM('draft','pending','signed','rejected','delivered','hand_delivered')
    NOT NULL DEFAULT 'draft';

-- ────────────────────────────────────────────────────────────
-- 7. audit_logs.action ENUM — add PREVIEW if missing
--    (current enum already has PREVIEW but confirm it)
-- ────────────────────────────────────────────────────────────
ALTER TABLE audit_logs
  MODIFY COLUMN action
    ENUM('PREVIEW','GENERATE','SIGN','DELIVER','VERIFY','DOWNLOAD','BULK_GENERATE')
    NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 8. bulk_jobs table — for FR-019 background bulk generation
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulk_jobs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  job_uuid        VARCHAR(100) NOT NULL UNIQUE,
  template_id     INT NOT NULL,
  created_by      INT NOT NULL,
  total           INT NOT NULL DEFAULT 0,
  completed       INT NOT NULL DEFAULT 0,
  failed          INT NOT NULL DEFAULT 0,
  status          ENUM('queued','processing','done','error') NOT NULL DEFAULT 'queued',
  error_log       JSON DEFAULT NULL,
  zip_path        VARCHAR(500) DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE RESTRICT
);


UPDATE users SET role = 'super_admin' WHERE role = 'admin';

-- Done
SELECT 'FR compliance migration complete' AS result;
