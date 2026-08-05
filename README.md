# Automated Dynamic PDF / Report Generation Engine (with E-Sign)

**Project ID:** 013I1CIS2026  
**Organization:** App Factory Academy  
**Version:** 1.0  

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Document Status Lifecycle](#document-status-lifecycle)
9. [Getting Started](#getting-started)
10. [Environment Variables](#environment-variables)
11. [Folder Reference](#folder-reference)

---

## Overview

A centralized, role-based document automation platform that replaces manual PDF generation for repetitive organizational documents — payslips, employment contracts, purchase orders, academic transcripts, and certificates.

Key capabilities:
- WYSIWYG template builder with dynamic field mapping (`{{placeholders}}`)
- Single & bulk PDF generation from database records
- Secure internal e-signature workflow with OTP/2FA
- Cryptographic tamper-proof SHA-256 hash embedded in every PDF
- QR code footer for public document verification
- Automated email delivery to recipients

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL (via XAMPP) |
| PDF Engine | pdfmake |
| E-Sign / Hash | Node.js `crypto` (SHA-256, HMAC-SHA256) |
| OTP | bcryptjs (hash & verify) |
| Email | Nodemailer |
| QR Code | qrcode |
| Auth | JWT (jsonwebtoken) |

---

## Features

### Module 1 — Template Management
- Create templates with Name, Category (HR / Finance / Academic / Procurement / General), Description
- Rich-text editor: header, body, footer with `{{placeholder}}` syntax
- Conditional blocks: `{{#if salary > 5000}} Senior Staff {{/if}}`
- Loop blocks: `{{#each leave_history}} ... {{/each}}`
- Auto-fetch available DB fields from data source table
- Template versioning — every edit creates a new version (v1, v2 …)
- Active / Archived status — archived templates cannot generate new docs
- Upload custom logo and signature images

### Module 2 — Data Source & Field Mapping
- Define a "Data Source" per template (e.g., `employees`, `students`, `suppliers`)
- Single record generation (input one ID) or Bulk Batch (CSV upload / multi-select)
- Pre-generation HTML preview before final PDF output
- Auto-fill dynamic placeholders: `{{generation_date}}`, `{{effective_date}}`

### Module 3 — PDF Generation Engine
- Core generation: pdfmake (JSON → PDF)
- Unique Document ID per PDF — format: `DOC-YYYYMMDD-XXXXX`
- SHA-256 hash embedded in PDF footer + QR code
- Watermarking: `DRAFT` (red diagonal), `CONFIDENTIAL`, or `FINAL`
- File naming: `[TemplateName]_[RecordID]_[Date].pdf`
- Bulk (100+ docs): background job with real-time progress (`45/100 completed`)

### Module 4 — E-Signature Workflow *(Critical)*
- Status lifecycle: `Draft → Pending Approval → E-Signed → Delivered`
- Generator selects an Approver and sends a signing request
- Approver receives email with a secure one-time review link
- 6-digit OTP sent to approver's email to confirm identity
- OTP: 5-minute expiry, max 3 attempts, 15-minute lockout
- On approval: visual signature block + HMAC-SHA256 appended to PDF
- Rejection: mandatory reason, document reverts to Draft, generator notified
- Auto-escalation reminder at 24h and 72h if document remains unsigned

### Module 5 — Delivery & Distribution
- Download PDF manually
- Email PDF as branded attachment to recipient(s)
- Generate secure download link (JWT-based, expires 7 days, single-use)
- Download access logs: IP address, browser, timestamp
- Admin can mark document as "Hand Delivered"

### Module 6 — Verification & Trust
- Public `/verify` page — no login required
- Verify by Doc ID or by uploading the PDF
- System recomputes SHA-256 hash and compares with stored hash
- Result: **Document is Authentic & Untampered** or **Document is Corrupt/Forged**
- Hash persists in DB even if the file is deleted

### Module 7 — Audit & Reports
- Full audit trail per document: Created, Previewed, Sent for Approval, Approved/Rejected, Downloaded, Delivered, Verified
- Admin dashboard KPIs: Docs Generated Today, Avg Approval Time, Top 5 Templates
- Monthly CSV export per department
- Search & filter documents by Template, Date Range, Status, Generator, Approver
- Archive policy: docs older than 2 years auto-move to cold storage

---

## Project Structure

```
Report Generation Engine/
│
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── api/
│       │   └── axiosInstance.js     # Axios with JWT interceptor
│       ├── assets/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── TemplatesPage.jsx
│       │   ├── TemplateEditorPage.jsx
│       │   ├── GenerateDocPage.jsx
│       │   ├── DocumentsPage.jsx
│       │   ├── ApprovalsPage.jsx
│       │   ├── VerifyPage.jsx
│       │   ├── UsersPage.jsx
│       │   └── AuditPage.jsx
│       ├── App.jsx
│       └── main.jsx
│
└── server/                          # Node.js / Express backend
    ├── config/
    │   ├── db.js                    # MySQL connection pool
    │   └── mailer.js                # Nodemailer transporter
    ├── controllers/
    │   ├── authController.js
    │   ├── templateController.js
    │   ├── documentController.js
    │   ├── esignController.js
    │   ├── deliveryController.js
    │   ├── verifyController.js
    │   ├── auditController.js
    │   └── userController.js
    ├── database/
    │   └── pdf_engine_db.sql        # Full DB schema (run once in XAMPP)
    ├── middlewares/
    │   ├── authMiddleware.js        # JWT verification
    │   ├── roleMiddleware.js        # RBAC checks
    │   └── uploadMiddleware.js      # Multer file uploads
    ├── routes/
    │   ├── authRoutes.js
    │   ├── templateRoutes.js
    │   ├── documentRoutes.js
    │   ├── esignRoutes.js
    │   ├── deliveryRoutes.js
    │   ├── verifyRoutes.js
    │   ├── auditRoutes.js
    │   └── userRoutes.js
    ├── services/
    │   ├── pdfService.js            # pdfmake, hash, QR, watermark
    │   ├── emailService.js          # Nodemailer email templates
    │   ├── otpService.js            # OTP generate / verify
    │   ├── hashService.js           # SHA-256 & HMAC
    │   ├── bulkJobService.js        # Background bulk generation
    │   └── tokenService.js          # JWT auth & download tokens
    ├── storage/
    │   ├── pdfs/                    # Generated PDF files
    │   ├── uploads/                 # Logos & signature images
    │   └── archive/                 # Cold storage (2+ year old docs)
    ├── .env                         # Environment variables (do NOT commit)
    └── server.js                    # Express entry point
```

---

## Database Schema

Database name: `pdf_engine_db`

| Table | Description |
|---|---|
| `users` | All system users with roles and HMAC secret key |
| `templates` | Template metadata, category, data source, status |
| `template_versions` | Versioned header/body/footer HTML + field map JSON |
| `documents` | Generated PDFs — Doc ID, SHA-256 hash, watermark, status |
| `esign_requests` | OTP state, HMAC signature, approval/rejection per document |
| `download_tokens` | Single-use JWT download links with expiry |
| `audit_logs` | Full event trail: action, user, IP, browser, timestamp |
| `bulk_jobs` | Background job tracking for bulk PDF generation |
| `notifications` | In-app notifications (sign requests, approvals, reminders) |

To create the database, run in XAMPP MySQL:

```bash
mysql -u root < server/database/pdf_engine_db.sql
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user info |

### Users *(Admin only)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PATCH | `/api/users/:id/role` | Change user role |

### Templates
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create template |
| GET | `/api/templates/:id` | Get single template |
| PUT | `/api/templates/:id` | Update (new version) |
| DELETE | `/api/templates/:id` | Delete template |
| PATCH | `/api/templates/:id/status` | Set Active / Archived |
| POST | `/api/templates/:id/logo` | Upload logo / signature |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/documents/preview` | Preview rendered HTML |
| POST | `/api/documents/generate` | Single PDF generation |
| POST | `/api/documents/bulk` | Bulk PDF generation |
| GET | `/api/documents` | List documents (with filters) |
| GET | `/api/documents/:id` | Get document info |
| GET | `/api/documents/:id/download` | Download PDF (token-based) |
| DELETE | `/api/documents/:id` | Delete document |

### E-Signature
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/esign/request/:docId` | Request signature |
| GET | `/api/esign/pending` | Get pending approvals |
| POST | `/api/esign/otp/send` | Send OTP to approver |
| POST | `/api/esign/otp/verify` | Verify OTP |
| POST | `/api/esign/approve/:docId` | Approve document |
| POST | `/api/esign/reject/:docId` | Reject document |

### Delivery
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/delivery/email/:docId` | Email PDF to recipient |
| POST | `/api/delivery/link/:docId` | Generate secure download link |
| PATCH | `/api/delivery/hand-delivered/:docId` | Mark hand delivered |

### Verification *(Public — no auth)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/verify/:docId` | Verify by Doc ID |
| POST | `/api/verify/upload` | Verify by uploading PDF |

### Audit
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit/:docId` | Full audit trail for a document |
| GET | `/api/audit/dashboard` | KPI dashboard data |
| GET | `/api/audit/export` | Monthly CSV export |
| GET | `/api/audit/search` | Search & filter documents |

---

## User Roles & Permissions

| Action | Super Admin | System Admin | Doc Generator | Approver | Recipient |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage System Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create/Edit/Delete Templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Generate PDF (Single/Bulk) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Initiate E-Signature Request | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve / Reject & Apply E-Sign | ✅ | ✅ | ❌ | ✅ | ❌ |
| Download Own Generated Docs | ✅ | ✅ | ✅ | ❌ | ✅ (own) |
| Verify Document Integrity | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Full Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Document Status Lifecycle

```
Draft
  │
  ▼
Pending Approval  ◄──────── (Rejection reverts to Draft)
  │
  ▼
E-Signed
  │
  ▼
Delivered  ──or──  Hand Delivered
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- XAMPP (MySQL running)
- npm

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Setup Database

1. Start XAMPP and make sure MySQL is running
2. Open your terminal and run:

```bash
mysql -u root < server/database/pdf_engine_db.sql
```

### 3. Configure Environment

Copy `.env` in the `server/` folder and fill in your values:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pdf_engine_db
JWT_SECRET=your_secret_here
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

### 4. Run the Project

```bash
# Start backend (from server/)
npx nodemon server.js

# Start frontend (from client/)
npm run dev
```

Backend runs on: `http://localhost:5000`  
Frontend runs on: `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (`pdf_engine_db`) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | Auth token expiry (e.g. `1d`) |
| `DOWNLOAD_TOKEN_SECRET` | Secret for download link tokens |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | Sender email address |
| `MAIL_PASS` | Email app password |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:5173`) |

---

## Folder Reference

| Path | Purpose |
|---|---|
| `server/storage/pdfs/` | Generated PDF files (outside public web root) |
| `server/storage/uploads/` | Logo and signature images |
| `server/storage/archive/` | Cold storage for docs older than 2 years |
| `client/src/pages/` | One file per page/screen |
| `client/src/components/` | Reusable UI components |
| `client/src/context/` | React context (Auth state) |
| `client/src/api/` | Axios instance with interceptors |

---

> **Note:** `.env` file is excluded from version control. Never commit secrets.  
> PDF files are stored outside the public web root with randomized filenames for security (NFR-002).
