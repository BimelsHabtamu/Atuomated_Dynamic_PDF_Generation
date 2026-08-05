create database if not exists pdf_engine_db character set utf8mb4 collate utf8mb4_unicode_ci;
use pdf_engine_db;
create table if not exists users(
    id int AUTO_INCREMENT primary key,
    full_name varchar(150) NOT NULL,
    email VARCHAR(191) NOT NULL
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('super_admin','system_admin','document_generator','approver','recipient') NOT NULL DEFAULT 'document_generator',
    department    VARCHAR(100)  DEFAULT NULL,
    secret_key    VARCHAR(255)  DEFAULT NULL,  
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table if not exists templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    category        ENUM('HR','Finance','Academic','Procurement','General') NOT NULL,
    description     TEXT          DEFAULT NULL,
    current_version INT           NOT NULL DEFAULT 1,
    data_source     VARCHAR(200)  DEFAULT NULL,  
    logo_path       VARCHAR(500)  DEFAULT NULL,
    signature_path  VARCHAR(500)  DEFAULT NULL,
    status          ENUM('active','archived') NOT NULL DEFAULT 'active',
    created_by      INT           NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);
create table if not exists template_versions (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    template_id  INT           NOT NULL,
    version      INT           NOT NULL,
    header_html  LONGTEXT      DEFAULT NULL,
    body_html    LONGTEXT      NOT NULL,
    footer_html  LONGTEXT      DEFAULT NULL,
    fields_json  JSON          DEFAULT NULL,   
    created_by   INT           NOT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE RESTRICT,
    UNIQUE KEY uq_template_version (template_id, version)
);

create table if not exists documents (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    doc_id           VARCHAR(50)   NOT NULL UNIQUE,  
    template_id      INT           NOT NULL,
    template_version INT           NOT NULL,
    record_id        VARCHAR(100)  DEFAULT NULL,      
    data_snapshot    JSON          DEFAULT NULL,       
    file_path        VARCHAR(500)  DEFAULT NULL,       
    file_size_kb     DECIMAL(10,2) DEFAULT NULL,
    sha256_hash      VARCHAR(64)   DEFAULT NULL,      
    watermark        ENUM('DRAFT','CONFIDENTIAL','FINAL') DEFAULT 'DRAFT',
    status           ENUM('draft','pending_approval','e_signed','delivered','rejected','hand_delivered') NOT NULL DEFAULT 'draft',
    generated_by     INT           NOT NULL,
    bulk_job_id      INT           DEFAULT NULL,       
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id)  REFERENCES templates(id) ON DELETE RESTRICT,
    FOREIGN KEY (generated_by) REFERENCES users(id)     ON DELETE RESTRICT
);


create table if not exists esign_requests (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    document_id     INT           NOT NULL,
    approver_id     INT           NOT NULL,
    requested_by    INT           NOT NULL,
    otp_hash        VARCHAR(255)  DEFAULT NULL,
    otp_expires_at  DATETIME      DEFAULT NULL,
    otp_attempts    INT           NOT NULL DEFAULT 0,
    otp_locked_until DATETIME     DEFAULT NULL,
    hmac_signature  VARCHAR(500)  DEFAULT NULL,       
    signed_at       DATETIME      DEFAULT NULL,
    rejection_reason TEXT         DEFAULT NULL,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id)  REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id)  REFERENCES users(id)     ON DELETE RESTRICT,
    FOREIGN KEY (requested_by) REFERENCES users(id)     ON DELETE RESTRICT
);

create table if not exists download_tokens (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    document_id  INT           NOT NULL,
    token        VARCHAR(500)  NOT NULL UNIQUE,
    recipient_email VARCHAR(191) DEFAULT NULL,
    is_used      TINYINT(1)    NOT NULL DEFAULT 0,
    expires_at   DATETIME      NOT NULL,
    created_by   INT           NOT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE RESTRICT
);

create table if not exists audit_logs (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    document_id  INT           DEFAULT NULL,
    user_id      INT           DEFAULT NULL,
    event        VARCHAR(100)  NOT NULL,   
    ip_address   VARCHAR(45)   DEFAULT NULL,
    browser      VARCHAR(255)  DEFAULT NULL,
    metadata     JSON          DEFAULT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE SET NULL
);

create table if not exists bulk_jobs (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    template_id   INT           NOT NULL,
    requested_by  INT           NOT NULL,
    total_records INT           NOT NULL DEFAULT 0,
    completed     INT           NOT NULL DEFAULT 0,
    failed        INT           NOT NULL DEFAULT 0,
    status        ENUM('queued','processing','done','failed') NOT NULL DEFAULT 'queued',
    zip_path      VARCHAR(500)  DEFAULT NULL,   
    started_at    DATETIME      DEFAULT NULL,
    finished_at   DATETIME      DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id)  REFERENCES templates(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by) REFERENCES users(id)     ON DELETE RESTRICT
);


create table if not exists notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    document_id INT           DEFAULT NULL,
    type        VARCHAR(100)  NOT NULL, 
    message     TEXT          NOT NULL,
    is_read     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);
