
CREATE DATABASE IF NOT EXISTS pdf_engine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pdf_engine_db;

CREATE TABLE  users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(191)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    full_name     VARCHAR(150)  NOT NULL,
    role          ENUM('admin','generator','approver','recipient') NOT NULL,
    phone         VARCHAR(20)   DEFAULT NULL,
    avatar_url    VARCHAR(500)  DEFAULT NULL,
    language      VARCHAR(20)   NOT NULL DEFAULT 'en',
    theme         VARCHAR(20)   NOT NULL DEFAULT 'system',
    notification_email TINYINT(1) NOT NULL DEFAULT 1,
    session_timeout_minutes INT NOT NULL DEFAULT 60,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    config_key  VARCHAR(100) NOT NULL UNIQUE,
    config_json JSON NOT NULL,
    updated_by  INT DEFAULT NULL,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS templates (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200)  NOT NULL,
    category      ENUM('HR','Finance','Academic') NOT NULL,
    version       INT           NOT NULL DEFAULT 1,
    header_html   LONGTEXT      DEFAULT NULL,
    body_html     LONGTEXT      NOT NULL,
    footer_html   LONGTEXT      DEFAULT NULL,
    watermark_text VARCHAR(100) DEFAULT NULL,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS template_placeholders (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    template_id   INT           NOT NULL,
    field_path    VARCHAR(200)  NOT NULL,   
    data_type     ENUM('string','number','date') NOT NULL DEFAULT 'string',
    is_loopable   TINYINT(1)    NOT NULL DEFAULT 0,
    default_value VARCHAR(255)  DEFAULT NULL,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS generated_docs (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    doc_uuid            VARCHAR(100)  NOT NULL UNIQUE,
    template_id         INT           NOT NULL,
    generated_by        INT           NOT NULL,
    record_identifier   VARCHAR(100)  DEFAULT NULL,   
    file_path           VARCHAR(500)  DEFAULT NULL,
    file_hash           VARCHAR(64)   DEFAULT NULL,   
    status              ENUM('draft','pending','signed','rejected','delivered') NOT NULL DEFAULT 'draft',
    metadata            JSON          DEFAULT NULL,
    generated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id)   REFERENCES templates(id) ON DELETE RESTRICT,
    FOREIGN KEY (generated_by)  REFERENCES users(id)     ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS signature_requests (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    doc_id           INT           NOT NULL,
    approver_id      INT           NOT NULL,
    otp_code         VARCHAR(255)  DEFAULT NULL,   
    otp_expiry       DATETIME      DEFAULT NULL,
    otp_attempts     INT           NOT NULL DEFAULT 0,  
    status           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    rejection_reason TEXT          DEFAULT NULL,
    approved_at      DATETIME      DEFAULT NULL,
    FOREIGN KEY (doc_id)      REFERENCES generated_docs(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id)          ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS digital_signatures (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    doc_id               INT           NOT NULL,
    signer_id            INT           NOT NULL,
    signature_timestamp  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    crypto_hmac          VARCHAR(500)  NOT NULL,  
    visual_signature_text TEXT         DEFAULT NULL,
    FOREIGN KEY (doc_id)    REFERENCES generated_docs(id) ON DELETE CASCADE,
    FOREIGN KEY (signer_id) REFERENCES users(id)          ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS delivery_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    doc_id          INT           NOT NULL,
    recipient_email VARCHAR(191)  NOT NULL,
    sent_at         DATETIME      DEFAULT NULL,
    download_token  VARCHAR(500)  NOT NULL UNIQUE,  
    token_expiry    DATETIME      NOT NULL,           
    downloaded_at   DATETIME      DEFAULT NULL,
    downloaded_ip   VARCHAR(45)   DEFAULT NULL,
    email_status    ENUM('queued','sent','failed','opened') NOT NULL DEFAULT 'queued',
    FOREIGN KEY (doc_id) REFERENCES generated_docs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           DEFAULT NULL,
    doc_id         INT           DEFAULT NULL,
    action         ENUM('PREVIEW','GENERATE','SIGN','DELIVER','VERIFY') NOT NULL,
    action_details JSON          DEFAULT NULL,   
    ip_address     VARCHAR(45)   DEFAULT NULL,
    user_agent     VARCHAR(255)  DEFAULT NULL,
    timestamp      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)          ON DELETE SET NULL,
    FOREIGN KEY (doc_id)  REFERENCES generated_docs(id) ON DELETE SET NULL
);
