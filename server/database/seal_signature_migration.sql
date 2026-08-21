USE pdf_engine_db;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS signature_url VARCHAR(500) DEFAULT NULL;
SELECT 'Seal & signature migration complete' AS result;
