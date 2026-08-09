# System Design Document
## Automated Dynamic PDF / Report Generation Engine (with E-Sign)

**Project ID:** 01311CIS2026  
**Version:** 1.0  
**Phase:** Design  
**Based on:** requirements.md (approved)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Design](#2-database-design)
3. [Schema Change Log](#3-schema-change-log)
4. [API Design](#4-api-design)
5. [Folder Structure](#5-folder-structure)
6. [Component Breakdown — Frontend](#6-component-breakdown--frontend)
7. [Service Layer Design](#7-service-layer-design)
8. [Security Design](#8-security-design)
9. [PDF Generation Flow](#9-pdf-generation-flow)
10. [E-Signature Flow](#10-e-signature-flow)
11. [Verification Flow](#11-verification-flow)
12. [RBAC Enforcement Map](#12-rbac-enforcement-map)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser (React)                   │
│  Login → Dashboard → Templates → Generate → Verify  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / REST (JSON)
                        │ Axios + JWT Bearer token
┌───────────────────────▼─────────────────────────────┐
│              Node.js / Express API                   │
│  authMiddleware → roleMiddleware → controller        │
│  pdfService (pdfmake) │ emailService (Nodemailer)    │
│  hashService (crypto) │ qrService (qrcode)           │
└───────────────────────┬─────────────────────────────┘
                        │ mysql2 pool
┌───────────────────────▼─────────────────────────────┐
│               MySQL — pdf_engine_db                  │
│  8 tables (schema locked per SRS)                   │
└─────────────────────────────────────────────────────┘

Storage (outside public webroot):
  server/storage/pdfs/      ← generated PDFs (randomized filenames, NFR-002)
  server/storage/uploads/   ← logo / signature images
```

**Pattern:** MVC on the server. React pages call REST endpoints. No GraphQL, no WebSocket (not in SRS). JWT stored in localStorage on client.

---

## 2. Database Design

### Exact schema from approved SRS — 8 tables

---

### Table 1: users

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| email | VARCHAR(191) | UNIQUE, NOT NULL | 191 = utf8mb4 index limit |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt, min cost 10 |
| full_name | VARCHAR(150) | NOT NULL | |
| role | ENUM | NOT NULL | admin / generator / approver / recipient |
| phone | VARCHAR(20) | NULL | Used for OTP SMS (future) |
| is_active | TINYINT(1) | DEFAULT 1 | Soft disable without delete |
| created_at | DATETIME | DEFAULT NOW() | |

**Relationships:** Referenced by templates (created_by — see Schema Change Log), generated_docs (generated_by), signature_requests (approver_id), digital_signatures (signer_id), audit_logs (user_id).

---

### Table 2: templates

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| name | VARCHAR(200) | NOT NULL | |
| category | ENUM | NOT NULL | HR / Finance / Academic / Procurement / General |
| version | INT | DEFAULT 1 | Incremented on every edit (FR-003) |
| header_html | LONGTEXT | NULL | |
| body_html | LONGTEXT | NOT NULL | Contains {{placeholders}} |
| footer_html | LONGTEXT | NULL | |
| watermark_text | VARCHAR(100) | NULL | Draft / Confidential / Final (FR-010) |
| is_active | TINYINT(1) | DEFAULT 1 | BR-001: only active templates generate docs |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |

---

### Table 3: template_placeholders

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| template_id | INT | FK → templates.id CASCADE | |
| field_path | VARCHAR(200) | NOT NULL | e.g. employee.salary, leave_history |
| data_type | ENUM | NOT NULL | string / number / date |
| is_loopable | TINYINT(1) | DEFAULT 0 | 1 = array field rendered in loop (FR-002) |
| default_value | VARCHAR(255) | NULL | Fallback if field is null in data |

---

### Table 4: generated_docs

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| doc_uuid | VARCHAR(100) | UNIQUE, NOT NULL | DOC-{timestamp}-{random} format |
| template_id | INT | FK → templates.id | |
| generated_by | INT | FK → users.id | |
| record_identifier | VARCHAR(100) | NULL | Employee ID, Student ID, etc. |
| file_path | VARCHAR(500) | NULL | Relative path, outside webroot (NFR-002) |
| file_hash | VARCHAR(64) | NULL | SHA-256 hex (FR-008, NFR-003) |
| status | ENUM | DEFAULT 'draft' | draft / pending / signed / rejected / delivered |
| metadata | JSON | NULL | Snapshot of data used at generation time |
| generated_at | DATETIME | DEFAULT NOW() | |

---

### Table 5: signature_requests

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| doc_id | INT | FK → generated_docs.id CASCADE | |
| approver_id | INT | FK → users.id | Must have role = approver |
| otp_code | VARCHAR(255) | NULL | bcrypt hash of 6-digit OTP (FR-012) |
| otp_expiry | DATETIME | NULL | NOW() + 5 minutes (BR-004) |
| otp_attempts | INT | DEFAULT 0 | Max 3, then 15-min lockout (BR-004) |
| status | ENUM | DEFAULT 'pending' | pending / approved / rejected |
| rejection_reason | TEXT | NULL | Required on rejection (FR-015) |
| approved_at | DATETIME | NULL | Set when OTP validated and HMAC applied |
| created_at | DATETIME | DEFAULT NOW() | Added — needed for avg approval time KPI |

---

### Table 6: digital_signatures

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| doc_id | INT | FK → generated_docs.id CASCADE | |
| signer_id | INT | FK → users.id | |
| signature_timestamp | DATETIME | DEFAULT NOW() | NTP-aligned timestamp (FR-014) |
| crypto_hmac | VARCHAR(500) | NOT NULL | HMAC-SHA256 of file_hash + signer secret |
| visual_signature_text | TEXT | NULL | "Digitally Approved by [Name] on [Date]" |

---

### Table 7: delivery_logs

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | |
| doc_id | INT | FK → generated_docs.id CASCADE | |
| recipient_email | VARCHAR(191) | NOT NULL | |
| sent_at | DATETIME | NULL | Set when Nodemailer confirms send |
| download_token | VARCHAR(500) | UNIQUE, NOT NULL | JWT signed with DOWNLOAD_TOKEN_SECRET |
| token_expiry | DATETIME | NOT NULL | sent_at + 7 days (NFR-002) |
| downloaded_at | DATETIME | NULL | Set on first download |
| downloaded_ip | VARCHAR(45) | NULL | IPv4 or IPv6 |
| email_status | ENUM | DEFAULT 'queued' | queued / sent / failed / opened |

---

### Table 8: audit_logs

| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | BIGINT — high-volume append-only table |
| user_id | INT | FK → users.id SET NULL | NULL for public actions (verify, download) |
| doc_id | INT | FK → generated_docs.id SET NULL | NULL for login/system actions |
| action | ENUM | NOT NULL | PREVIEW / GENERATE / SIGN / DELIVER / VERIFY |
| action_details | JSON | NULL | Full snapshot at time of action |
| ip_address | VARCHAR(45) | NULL | |
| user_agent | VARCHAR(255) | NULL | |
| timestamp | DATETIME | DEFAULT NOW() | Immutable — no UPDATE ever on this table |

---

## 3. Schema Change Log

Every deviation from the SRS schema is documented here with justification.

| Table | Change | Reason |
|---|---|---|
| `signature_requests` | Added `created_at DATETIME DEFAULT NOW()` | Required to compute `avg_approval_time` KPI in audit dashboard. Without it, there is no start time to diff against `approved_at`. Not a new feature — supports FR-021 (audit trail view). |
| `templates.category` | ENUM includes Procurement and General in addition to HR/Finance/Academic | SRS scope section lists 5 categories. The schema image only shows 3 in the ENUM example but the scope text is authoritative. |

No other fields were renamed, added, or removed.

---

## 4. API Design

All endpoints follow `REST` conventions. Protected routes require `Authorization: Bearer <jwt>` header.

### Auth
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| POST | `/api/auth/login` | None | Any | — |
| GET | `/api/auth/me` | JWT | Any | — |

### Users
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| GET | `/api/users` | JWT | admin | — |
| POST | `/api/users` | JWT | admin | — |
| PUT | `/api/users/:id` | JWT | admin | — |
| DELETE | `/api/users/:id` | JWT | admin | — |
| PATCH | `/api/users/:id/role` | JWT | admin | — |

### Templates
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| GET | `/api/templates` | JWT | admin, generator, approver | FR-001 |
| GET | `/api/templates/:id` | JWT | admin, generator, approver | FR-002 |
| POST | `/api/templates` | JWT | admin | FR-001 |
| PUT | `/api/templates/:id` | JWT | admin | FR-003 |
| PATCH | `/api/templates/:id/status` | JWT | admin | FR-004 |
| DELETE | `/api/templates/:id` | JWT | admin | FR-001 |

### Documents
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| POST | `/api/documents/preview` | JWT | admin, generator, approver | FR-006 |
| POST | `/api/documents/generate` | JWT | admin, generator, approver | FR-006, FR-008, FR-009, FR-010 |
| POST | `/api/documents/bulk` | JWT | admin, generator | FR-007 |
| GET | `/api/documents` | JWT | admin, generator | FR-021 |
| GET | `/api/documents/:id` | JWT | admin, generator | FR-021 |

### E-Signature
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| POST | `/api/esign/request` | JWT | admin, generator | FR-011 |
| POST | `/api/esign/otp/send` | JWT | approver, admin | FR-012 |
| POST | `/api/esign/otp/verify` | JWT | approver, admin | FR-013 |
| POST | `/api/esign/approve` | JWT | approver, admin | FR-014 |
| POST | `/api/esign/reject` | JWT | approver, admin | FR-015 |
| GET | `/api/esign/pending` | JWT | approver, admin | FR-011 |

### Delivery
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| POST | `/api/delivery/deliver` | JWT | admin, generator | FR-016 |
| GET | `/api/delivery/download` | Token (query param) | Public (token-gated) | FR-017 |

### Verification (Public)
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| GET | `/api/verify/:doc_uuid` | None | Public | FR-018 |
| POST | `/api/verify/upload` | None | Public | FR-019 |

### Audit
| Method | Endpoint | Auth | Role | FR |
|---|---|---|---|---|
| GET | `/api/audit` | JWT | admin | FR-021 |
| GET | `/api/audit/dashboard` | JWT | admin | FR-021 |

---

## 5. Folder Structure

```
Report Generation Engine/
│
├── requirements.md                  ← approved SRS
├── design.md                        ← this document
│
├── server/                          ← Node.js / Express
│   ├── config/
│   │   ├── db.js                    ← mysql2 connection pool
│   │   └── mailer.js                ← Nodemailer transporter
│   ├── controllers/
│   │   ├── authController.js        ← login, getMe
│   │   ├── userController.js        ← user CRUD
│   │   ├── templateController.js    ← FR-001 to FR-005
│   │   ├── documentController.js    ← FR-006 to FR-010
│   │   ├── esignController.js       ← FR-011 to FR-015
│   │   ├── deliveryController.js    ← FR-016 to FR-017
│   │   ├── verifyController.js      ← FR-018 to FR-019
│   │   └── auditController.js       ← FR-020 to FR-021
│   ├── middlewares/
│   │   ├── authMiddleware.js        ← JWT verification
│   │   └── roleMiddleware.js        ← RBAC enforcement
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── templateRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── esignRoutes.js
│   │   ├── deliveryRoutes.js
│   │   ├── verifyRoutes.js
│   │   └── auditRoutes.js
│   ├── services/
│   │   ├── pdfService.js            ← pdfmake, SHA-256, QR code, watermark
│   │   └── emailService.js          ← Nodemailer — OTP, delivery, rejection emails
│   ├── storage/
│   │   ├── pdfs/                    ← generated PDFs (outside webroot, NFR-002)
│   │   └── uploads/                 ← logo / signature images
│   ├── database/
│   │   └── pdf_engine_db.sql        ← full schema DDL
│   ├── scripts/
│   │   └── createAdmin.js           ← seed first admin user
│   ├── .env                         ← secrets (never committed)
│   └── server.js                    ← Express entry point
│
└── client/                          ← React (Vite)
    └── src/
        ├── api/
        │   └── axiosInstance.js     ← base URL + JWT interceptor + 401 redirect
        ├── context/
        │   └── AuthContext.jsx      ← user, token, login(), logout()
        ├── components/
        │   ├── Layout.jsx           ← sidebar + navbar + <Outlet>
        │   ├── Sidebar.jsx          ← role-filtered nav links
        │   ├── Navbar.jsx           ← user info, role badge, logout
        │   └── ProtectedRoute.jsx   ← auth guard + role guard
        ├── pages/
        │   ├── LoginPage.jsx        ← public
        │   ├── DashboardPage.jsx    ← KPI cards (FR-021)
        │   ├── TemplatesPage.jsx    ← list, create, edit, archive (FR-001–004)
        │   ├── TemplateEditorPage.jsx ← HTML editor + placeholder mapper (FR-002)
        │   ├── GenerateDocPage.jsx  ← single + bulk generate (FR-006, FR-007)
        │   ├── DocumentsPage.jsx    ← list, filter, request sign (FR-011)
        │   ├── ApprovalsPage.jsx    ← pending list, OTP entry, approve/reject
        │   ├── VerifyPage.jsx       ← public verify by ID or upload (FR-018, FR-019)
        │   ├── UsersPage.jsx        ← user CRUD (admin only)
        │   └── AuditPage.jsx        ← log viewer + dashboard (FR-021)
        ├── App.jsx                  ← all routes with ProtectedRoute wrappers
        └── main.jsx                 ← React root mount
```

---

## 6. Component Breakdown — Frontend

### Pages and what each one does

| Page | Route | Allowed Roles | FR Covered |
|---|---|---|---|
| LoginPage | `/login` | Public | — |
| DashboardPage | `/dashboard` | All authenticated | FR-021 |
| TemplatesPage | `/templates` | admin | FR-001, FR-004 |
| TemplateEditorPage | `/templates/new`, `/templates/:id/edit` | admin | FR-001, FR-002, FR-003, FR-005 |
| GenerateDocPage | `/generate` | admin, generator, approver | FR-006, FR-007 |
| DocumentsPage | `/documents` | admin, generator | FR-011, FR-016 |
| ApprovalsPage | `/approvals` | admin, approver | FR-012, FR-013, FR-014, FR-015 |
| VerifyPage | `/verify` | Public | FR-018, FR-019 |
| UsersPage | `/users` | admin | — |
| AuditPage | `/audit` | admin | FR-021 |

### Shared Components

| Component | Purpose |
|---|---|
| `Layout` | Wraps all protected pages. Renders Sidebar + Navbar + page content via `<Outlet>` |
| `Sidebar` | Filters nav links based on `user.role` from AuthContext |
| `Navbar` | Shows full_name, role badge, logout button |
| `ProtectedRoute` | Redirects unauthenticated users to `/login`. Optionally checks allowed roles |
| `AuthContext` | Stores user object and token in state + localStorage. Exposes login(), logout() |
| `axiosInstance` | All API calls go through this. Attaches JWT. On 401 clears token and redirects |

---

## 7. Service Layer Design

### pdfService.js
Responsible for FR-006, FR-008, FR-009, FR-010.

```
generatePDF(template, data, docUuid, verifyBaseUrl, outputDir)
  → renderTemplate(html, data)       — replaces {{field}} tokens
  → buildDocDefinition(...)          — pdfmake JSON definition
       → QRCode.toDataURL(verifyUrl) — QR in footer (FR-009)
       → watermark from template     — watermark_text (FR-010)
  → PdfPrinter.createPdfKitDocument  — produces PDF buffer
  → fs.writeFileSync(filePath)       — stores outside webroot (NFR-002)
  → computeSHA256(buffer)            — SHA-256 hash (FR-008)
  → returns { filePath, hash }
```

### emailService.js
Responsible for FR-012, FR-015, FR-016.

```
sendOtpEmail(toEmail, name, otp, docUuid)
sendDeliveryEmail(toEmail, name, docUuid, downloadLink, pdfPath)
sendRejectionEmail(toEmail, generatorName, docUuid, reason)
```

All use the same Nodemailer transporter configured from `.env`.

---

## 8. Security Design

| Threat | Mitigation | NFR / BR |
|---|---|---|
| Password brute force | bcrypt cost 10 on all password_hash fields | NFR-002 |
| Token theft | JWT expires in 1 day (auth), 7 days (download). HTTPS in production | NFR-002 |
| PDF tampering | SHA-256 hash stored at generation time; recomputed on every verify request | NFR-003 |
| Self-approval fraud | BR-003 enforced in esignController: generated_by === approver_id → 403 | BR-003 |
| OTP brute force | otp_attempts tracked per request; locked after 3 failures for 15 min | BR-004 |
| File exposure | PDFs stored in server/storage/pdfs/ — not served as static files. Only via authenticated download endpoint | NFR-002 |
| IDOR on downloads | Download token is a signed JWT containing doc_id. Token is single-session (7-day expiry) | FR-017 |
| Audit tampering | audit_logs table has no UPDATE route. Append-only by design | FR-020 |

---

## 9. PDF Generation Flow

```
POST /api/documents/generate
        │
        ▼
Validate template is active (BR-001)
        │
        ▼
Render HTML — replace {{placeholders}} with data
        │
        ▼
Build pdfmake doc definition
  ├── Apply watermark_text from template (FR-010)
  ├── Generate QR code → embed in footer (FR-009)
  └── Add doc_uuid + verify URL in footer
        │
        ▼
Write PDF to storage/pdfs/{doc_uuid}.pdf (NFR-002)
        │
        ▼
Compute SHA-256 hash of PDF buffer (FR-008)
        │
        ▼
INSERT into generated_docs (status = 'draft')
        │
        ▼
INSERT into audit_logs (action = 'GENERATE') (FR-020)
        │
        ▼
Return { doc_uuid, id }
```

---

## 10. E-Signature Flow

```
POST /api/esign/request
  → Check doc status = 'draft'
  → Check approver_id ≠ generated_by  (BR-003)
  → INSERT signature_requests (status = 'pending')
  → UPDATE generated_docs status = 'pending'
  → INSERT audit_logs (SIGN / step: requested)

POST /api/esign/otp/send
  → Generate 6-digit OTP
  → bcrypt.hash(otp)
  → Store otp_code, otp_expiry = NOW() + 5 min
  → sendOtpEmail() via Nodemailer

POST /api/esign/otp/verify
  → Check otp_attempts < 3  (BR-004)
  → Check otp_expiry > NOW()
  → bcrypt.compare(input, stored hash)
  → If fail: increment otp_attempts
  → If pass: return verified

POST /api/esign/approve
  → computeHMAC(file_hash, JWT_SECRET)
  → INSERT digital_signatures (crypto_hmac, visual_signature_text)
  → UPDATE signature_requests status = 'approved', approved_at = NOW()
  → UPDATE generated_docs status = 'signed'
  → INSERT audit_logs (SIGN / step: approved)

POST /api/esign/reject
  → UPDATE signature_requests status = 'rejected', rejection_reason
  → UPDATE generated_docs status = 'draft'
  → sendRejectionEmail() to generator
  → INSERT audit_logs (SIGN / step: rejected)
```

---

## 11. Verification Flow

```
GET /api/verify/:doc_uuid  (public — no auth)
  → SELECT from generated_docs WHERE doc_uuid = ?
  → Read PDF file from file_path
  → computeSHA256(file buffer)
  → Compare recomputed hash with stored file_hash
  → INSERT audit_logs (action = 'VERIFY')
  → Return { authentic: true/false, message, stored_hash, recomputed_hash }

POST /api/verify/upload  (public — no auth)
  → Receive PDF via multipart/form-data (multer memoryStorage)
  → computeSHA256(uploaded buffer)
  → SELECT from generated_docs WHERE file_hash = ?
  → INSERT audit_logs (action = 'VERIFY')
  → Return { authentic: true/false, doc_uuid if found }
```

---

## 12. RBAC Enforcement Map

| Route | Middleware Stack |
|---|---|
| `POST /api/auth/login` | none |
| `GET /api/verify/*` | none |
| `GET /api/delivery/download` | JWT in query param only |
| `GET /api/templates` | authMiddleware |
| `POST /api/templates` | authMiddleware → roleMiddleware('admin') |
| `POST /api/documents/generate` | authMiddleware → roleMiddleware('admin','generator','approver') |
| `POST /api/esign/request` | authMiddleware → roleMiddleware('admin','generator') |
| `POST /api/esign/approve` | authMiddleware → roleMiddleware('admin','approver') |
| `POST /api/delivery/deliver` | authMiddleware → roleMiddleware('admin','generator') |
| `GET /api/audit` | authMiddleware → roleMiddleware('admin') |
| `GET /api/audit/dashboard` | authMiddleware |

Self-approval block (BR-003) is enforced inside `esignController.requestSignature` — not at middleware level, because middleware has no access to document ownership. This is a deliberate controller-level business rule check.

---

*Design document generated from requirements.md v1.0. Any change to this design must be traced back to an FR, NFR, or BR in requirements.md.*
