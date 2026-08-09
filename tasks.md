# Implementation Task List
## Automated Dynamic PDF / Report Generation Engine (with E-Sign)

**Project ID:** 01311CIS2026  
**Based on:** requirements.md (approved) + design.md (approved)  
**Status Legend:** [ ] Not Started · [x] Done · [~] In Progress

---

## Module 0 — Foundation (Pre-requisite for all modules)

| ID | Task | Layer | FR / NFR / BR |
|---|---|---|---|
| T-000 | Create MySQL database `pdf_engine_db` and run full DDL from `pdf_engine_db.sql` | DB | — |
| T-001 | Configure `config/db.js` — mysql2 connection pool using `.env` values | Backend | NFR-002 |
| T-002 | Configure `config/mailer.js` — Nodemailer transporter using `.env` SMTP values | Backend | FR-012, FR-016 |
| T-003 | Write `authMiddleware.js` — verify JWT Bearer token, attach `req.user` | Backend | NFR-002 |
| T-004 | Write `roleMiddleware.js` — reject request if `req.user.role` not in allowed list | Backend | RBAC Matrix |
| T-005 | Write `authController.js` — `login()` with bcrypt compare + JWT sign | Backend | — |
| T-006 | Write `authController.js` — `getMe()` returning current user from DB | Backend | — |
| T-007 | Write `authRoutes.js` — mount POST `/login` and GET `/me` | Backend | — |
| T-008 | Write `userController.js` — getUsers, createUser (bcrypt hash), updateUser, deleteUser, changeRole | Backend | RBAC Matrix |
| T-009 | Write `userRoutes.js` — all user CRUD routes, admin-only | Backend | RBAC Matrix |
| T-010 | Configure `axiosInstance.js` — base URL `/api`, JWT interceptor, 401 → redirect to login | Frontend | NFR-002 |
| T-011 | Write `AuthContext.jsx` — user, token, login(), logout(), localStorage sync | Frontend | — |
| T-012 | Write `ProtectedRoute.jsx` — redirect to `/login` if not authenticated, optional role check | Frontend | RBAC Matrix |
| T-013 | Write `Layout.jsx` — sidebar + navbar + `<Outlet>` wrapper for all protected pages | Frontend | — |
| T-014 | Write `Sidebar.jsx` — filter nav links by `user.role` | Frontend | RBAC Matrix |
| T-015 | Write `Navbar.jsx` — display full_name, role badge, logout | Frontend | — |
| T-016 | Write `App.jsx` — all routes with ProtectedRoute wrappers and role restrictions | Frontend | RBAC Matrix |
| T-017 | Write `LoginPage.jsx` — form calls POST `/api/auth/login`, stores token, redirects | Frontend | — |
| T-018 | Write `UsersPage.jsx` — list, create, update, delete users (admin only) | Frontend | RBAC Matrix |
| T-019 | Seed first admin user via `scripts/createAdmin.js` | DB | — |

---

## Module 1 — Template Management

**FR covered:** FR-001, FR-002, FR-003, FR-004, FR-005

| ID | Task | Layer | FR |
|---|---|---|---|
| T-100 | Write `templateController.js` — `getTemplates()` fetch all with version and status | Backend | FR-001 |
| T-101 | Write `templateController.js` — `getTemplateById()` fetch template + its placeholders | Backend | FR-002 |
| T-102 | Write `templateController.js` — `createTemplate()` insert into `templates` (version = 1), validate category is one of 5 allowed values | Backend | FR-001 |
| T-103 | Write `templateController.js` — `updateTemplate()` increment `version`, update HTML fields — BR-005 does not allow reusing same doc; versioning here is template-level | Backend | FR-003 |
| T-104 | Write `templateController.js` — `setTemplateStatus()` toggle `is_active` between 1 and 0 | Backend | FR-004 |
| T-105 | Write `templateController.js` — `deleteTemplate()` hard delete if no generated_docs reference it | Backend | FR-001 |
| T-106 | Write `uploadMiddleware.js` — Multer config: store to `storage/uploads/`, accept image types only, limit 2MB | Backend | FR-005 |
| T-107 | Add `POST /api/templates/:id/logo` route — save uploaded file path to template record | Backend | FR-005 |
| T-108 | Write `templateRoutes.js` — mount all template routes with correct role guards | Backend | FR-001–FR-005 |
| T-109 | Write `TemplatesPage.jsx` — list all templates in a table: name, category, version, status, actions | Frontend | FR-001, FR-004 |
| T-110 | Write `TemplateEditorPage.jsx` — form for name, category, watermark_text + textarea for header/body/footer HTML | Frontend | FR-001, FR-003 |
| T-111 | Add placeholder manager in `TemplateEditorPage.jsx` — add/remove field_path rows with data_type and is_loopable | Frontend | FR-002 |
| T-112 | Add logo upload input in `TemplateEditorPage.jsx` — POST to `/api/templates/:id/logo` | Frontend | FR-005 |
| T-113 | Add archive/activate toggle button in `TemplatesPage.jsx` — PATCH `/api/templates/:id/status` | Frontend | FR-004 |

---

## Module 2 — Data Source & Field Mapping

**FR covered:** FR-002, FR-006 (preview step)

| ID | Task | Layer | FR |
|---|---|---|---|
| T-200 | Write `POST /api/documents/preview` in `documentController.js` — fetch template, replace `{{field}}` tokens with submitted data, return rendered HTML string | Backend | FR-006 |
| T-201 | Enforce BR-001 in preview: return 400 if `template.is_active = 0` | Backend | BR-001 |
| T-202 | Write placeholder insertion helper in `pdfService.js` — `renderTemplate(html, data)` replaces all `{{key}}` occurrences from data object | Backend | FR-002 |
| T-203 | Handle loopable fields in `renderTemplate()` — if `is_loopable = 1`, iterate array and render repeated block | Backend | FR-002 |
| T-204 | Add `GenerateDocPage.jsx` — step 1: select active template from dropdown | Frontend | FR-006 |
| T-205 | Add record identifier input field in `GenerateDocPage.jsx` — maps to `record_identifier` in `generated_docs` | Frontend | FR-006 |
| T-206 | Add data fields form in `GenerateDocPage.jsx` — dynamically render inputs for each placeholder from selected template | Frontend | FR-002 |
| T-207 | Add "Preview" button in `GenerateDocPage.jsx` — POST to `/api/documents/preview`, render returned HTML in a panel | Frontend | FR-006 |

---

## Module 3 — PDF Generation Engine

**FR covered:** FR-006, FR-007, FR-008, FR-009, FR-010  
**NFR covered:** NFR-001, NFR-002, NFR-003  
**BR covered:** BR-001, BR-005

| ID | Task | Layer | FR |
|---|---|---|---|
| T-300 | Write `pdfService.js` — `generatePDF(template, data, docUuid, verifyBaseUrl, outputDir)` builds pdfmake doc definition and writes file to `storage/pdfs/` | Backend | FR-006, NFR-002 |
| T-301 | Implement `computeSHA256(buffer)` in `pdfService.js` using Node built-in `crypto` module — returns hex string | Backend | FR-008, NFR-003 |
| T-302 | Implement QR code generation in `pdfService.js` — `QRCode.toDataURL(verifyUrl)` where verifyUrl = `{CLIENT_URL}/verify?id={doc_uuid}`, embed base64 image in PDF footer | Backend | FR-009 |
| T-303 | Apply `watermark_text` from template in pdfmake doc definition — only if `watermark_text` is not null | Backend | FR-010 |
| T-304 | Write `documentController.js` — `generateDocument()`: validate template active (BR-001), generate doc_uuid (format DOC-{timestamp}-{random}), call `pdfService.generatePDF`, store hash and file_path in `generated_docs`, insert GENERATE audit log | Backend | FR-006, FR-008, BR-001, BR-005 |
| T-305 | Enforce BR-005 in `generateDocument()` — doc_uuid is always newly generated; no check for re-generation of same record needed since uuid is always unique | Backend | BR-005 |
| T-306 | Write `documentController.js` — `bulkGenerate()`: accept array of record identifiers, loop generatePDF for each, ZIP all output files using `archiver` or `jszip`, return ZIP download path | Backend | FR-007, NFR-001 |
| T-307 | Write `documentRoutes.js` — mount preview, generate, bulk, list, detail routes with role guards | Backend | FR-006–FR-010 |
| T-308 | Write `documentController.js` — `getDocuments()` with JOIN to templates and users, ordered by generated_at DESC | Backend | FR-021 |
| T-309 | Write `documentController.js` — `getDocumentById()` single doc with template name and generator name | Backend | FR-021 |
| T-310 | Add "Generate" button in `GenerateDocPage.jsx` — POST to `/api/documents/generate`, show success with doc_uuid | Frontend | FR-006 |
| T-311 | Add bulk generate option in `GenerateDocPage.jsx` — textarea for multiple record identifiers, POST to `/api/documents/bulk`, provide ZIP download | Frontend | FR-007 |
| T-312 | Write `DocumentsPage.jsx` — table of generated docs: doc_uuid, template, status, generated_at, actions | Frontend | FR-021 |
| T-313 | Add filter inputs in `DocumentsPage.jsx` — filter by status, template, date range | Frontend | FR-021 |

---

## Module 4 — E-Signature Workflow

**FR covered:** FR-011, FR-012, FR-013, FR-014, FR-015  
**BR covered:** BR-002, BR-003, BR-004

| ID | Task | Layer | FR |
|---|---|---|---|
| T-400 | Write `esignController.js` — `requestSignature()`: validate doc status = 'draft', check approver_id ≠ generated_by (BR-003), insert `signature_requests` (status = 'pending'), update doc status = 'pending', insert SIGN audit log | Backend | FR-011, BR-003 |
| T-401 | Enforce BR-002 in `requestSignature()` — check `file_size` of PDF; reject if > 5MB. Note: file_size is not a column in SRS schema — read actual file size from disk using `fs.statSync(file_path).size` | Backend | BR-002 |
| T-402 | Write `esignController.js` — `sendOtp()`: generate 6-digit OTP with `Math.random`, hash with `bcrypt.hash(otp, 10)`, store in `otp_code`, set `otp_expiry = NOW() + 5 min`, reset `otp_attempts = 0`, call `sendOtpEmail()` | Backend | FR-012 |
| T-403 | Write `esignController.js` — `verifyOtp()`: check `otp_attempts < 3` (BR-004), check `otp_expiry > NOW()`, `bcrypt.compare(input, otp_code)`, increment attempts on failure | Backend | FR-013, BR-004 |
| T-404 | Write `esignController.js` — `approveDocument()`: call `computeHMAC(file_hash, JWT_SECRET)`, insert `digital_signatures`, update `signature_requests.status = 'approved'`, update `generated_docs.status = 'signed'`, insert SIGN audit log | Backend | FR-014 |
| T-405 | Write `esignController.js` — `rejectDocument()`: require `rejection_reason`, update `signature_requests.status = 'rejected'`, revert `generated_docs.status = 'draft'`, call `sendRejectionEmail()`, insert SIGN audit log | Backend | FR-015 |
| T-406 | Write `esignController.js` — `getPendingRequests()`: fetch all pending signature_requests for current approver with doc and template details | Backend | FR-011 |
| T-407 | Write `emailService.js` — `sendOtpEmail(toEmail, name, otp, docUuid)` using Nodemailer | Backend | FR-012 |
| T-408 | Write `emailService.js` — `sendRejectionEmail(toEmail, generatorName, docUuid, reason)` | Backend | FR-015 |
| T-409 | Write `esignRoutes.js` — mount all esign routes with correct role guards | Backend | FR-011–FR-015 |
| T-410 | Add "Request Signature" button in `DocumentsPage.jsx` — opens approver selector, POST to `/api/esign/request` | Frontend | FR-011 |
| T-411 | Write `ApprovalsPage.jsx` — list pending requests with doc_uuid, template name, generator name | Frontend | FR-011 |
| T-412 | Add "Send OTP" button in `ApprovalsPage.jsx` — POST to `/api/esign/otp/send` | Frontend | FR-012 |
| T-413 | Add OTP input form in `ApprovalsPage.jsx` — 6-digit input, POST to `/api/esign/otp/verify` then `/api/esign/approve` | Frontend | FR-013, FR-014 |
| T-414 | Add "Reject" button with reason textarea in `ApprovalsPage.jsx` — POST to `/api/esign/reject` | Frontend | FR-015 |
| T-415 | Show lockout message in `ApprovalsPage.jsx` when API returns 429 (3 failed OTP attempts, BR-004) | Frontend | BR-004 |

---

## Module 5 — Delivery & Distribution

**FR covered:** FR-016, FR-017  
**NFR covered:** NFR-002

| ID | Task | Layer | FR |
|---|---|---|---|
| T-500 | Write `deliveryController.js` — `deliverDocument()`: validate doc status = 'signed', sign JWT download token (`DOWNLOAD_TOKEN_SECRET`, 7-day expiry), insert `delivery_logs`, call `sendDeliveryEmail()`, update `email_status = 'sent'`, update doc status = 'delivered', insert DELIVER audit log | Backend | FR-016, NFR-002 |
| T-501 | Write `deliveryController.js` — `downloadDocument()`: verify JWT token from query param, check `token_expiry`, serve PDF via `res.download()`, update `downloaded_at` and `downloaded_ip` in `delivery_logs`, insert DELIVER audit log | Backend | FR-017 |
| T-502 | Write `emailService.js` — `sendDeliveryEmail(toEmail, name, docUuid, downloadLink, pdfPath)` with PDF attached and download link in body | Backend | FR-016 |
| T-503 | Write `deliveryRoutes.js` — POST `/deliver` (auth required), GET `/download` (public, token-gated) | Backend | FR-016, FR-017 |
| T-504 | Add "Deliver" button in `DocumentsPage.jsx` — shown only for signed docs, opens recipient email input, POST to `/api/delivery/deliver` | Frontend | FR-016 |
| T-505 | Write download handler in `client` — when recipient navigates to `/download?token=...` redirect to `GET /api/delivery/download?token=...` | Frontend | FR-017 |

---

## Module 6 — Verification & Trust

**FR covered:** FR-018, FR-019  
**NFR covered:** NFR-003

| ID | Task | Layer | FR |
|---|---|---|---|
| T-600 | Write `verifyController.js` — `verifyByDocUuid()`: fetch `generated_docs` by doc_uuid, read PDF from `file_path`, `computeSHA256(buffer)`, compare with `file_hash`, insert VERIFY audit log, return `{ authentic, message, stored_hash, recomputed_hash }` | Backend | FR-018, NFR-003 |
| T-601 | Handle missing file in `verifyByDocUuid()` — if file does not exist on disk, return authentic = false with note that hash is preserved in DB | Backend | FR-018 |
| T-602 | Write `verifyController.js` — `verifyByUpload()`: receive PDF via multer memoryStorage, `computeSHA256(buffer)`, SELECT from `generated_docs` WHERE `file_hash = ?`, insert VERIFY audit log | Backend | FR-019 |
| T-603 | Write `verifyRoutes.js` — GET `/:doc_uuid` (public, no auth), POST `/upload` (public, multer middleware) | Backend | FR-018, FR-019 |
| T-604 | Write `VerifyPage.jsx` — public page with two options: enter Doc ID (GET verify) or upload PDF file (POST verify/upload) | Frontend | FR-018, FR-019 |
| T-605 | Display verification result in `VerifyPage.jsx` — green "Authentic & Untampered" with doc details, or red "Corrupt or Forged" | Frontend | FR-018 |
| T-606 | Show original signing timestamp and doc_uuid in result if authentic | Frontend | FR-018 |

---

## Module 7 — Audit & Reports

**FR covered:** FR-020, FR-021  
**NFR covered:** NFR-003

| ID | Task | Layer | FR |
|---|---|---|---|
| T-700 | Insert GENERATE audit log in `documentController.generateDocument()` | Backend | FR-020 |
| T-701 | Insert PREVIEW audit log in `documentController.previewDocument()` | Backend | FR-020 |
| T-702 | Insert SIGN audit log (requested / approved / rejected steps) in `esignController` | Backend | FR-020 |
| T-703 | Insert DELIVER audit log in `deliveryController.deliverDocument()` and `downloadDocument()` | Backend | FR-020 |
| T-704 | Insert VERIFY audit log in `verifyController.verifyByDocUuid()` and `verifyByUpload()` | Backend | FR-020 |
| T-705 | Write `auditController.js` — `getAuditLogs()` with query filters: doc_id, user_id, action, from date, to date | Backend | FR-021 |
| T-706 | Write `auditController.js` — `getDashboard()` returning: docs generated today, pending approvals count, total documents, active users, top 5 templates by usage, avg approval time in minutes | Backend | FR-021 |
| T-707 | Write `auditRoutes.js` — GET `/` (admin only), GET `/dashboard` (all authenticated) | Backend | FR-021 |
| T-708 | Write `AuditPage.jsx` — log viewer table with filters for action, date range, user | Frontend | FR-021 |
| T-709 | Write `DashboardPage.jsx` — KPI cards: docs today, pending approvals, total docs, active users; top 5 templates table | Frontend | FR-021 |

---

## Summary

| Module | Tasks | Backend | Frontend |
|---|---|---|---|
| 0 — Foundation | T-000 to T-019 | 10 | 9 |
| 1 — Template Management | T-100 to T-113 | 8 | 5 |
| 2 — Data Source & Field Mapping | T-200 to T-207 | 4 | 4 |
| 3 — PDF Generation Engine | T-300 to T-313 | 10 | 4 |
| 4 — E-Signature Workflow | T-400 to T-415 | 10 | 6 |
| 5 — Delivery & Distribution | T-500 to T-505 | 4 | 2 |
| 6 — Verification & Trust | T-600 to T-606 | 4 | 3 |
| 7 — Audit & Reports | T-700 to T-709 | 8 | 2 |
| **Total** | **81 tasks** | **58** | **35** |

---

## FR Traceability Matrix

| FR | Task IDs |
|---|---|
| FR-001 | T-100, T-101, T-102, T-105, T-109, T-110 |
| FR-002 | T-111, T-200, T-202, T-203, T-206 |
| FR-003 | T-103, T-110 |
| FR-004 | T-104, T-109, T-113 |
| FR-005 | T-106, T-107, T-112 |
| FR-006 | T-200, T-201, T-204, T-205, T-207, T-300, T-304, T-310 |
| FR-007 | T-306, T-311 |
| FR-008 | T-301, T-304 |
| FR-009 | T-302 |
| FR-010 | T-303 |
| FR-011 | T-400, T-406, T-410, T-411 |
| FR-012 | T-402, T-407, T-412 |
| FR-013 | T-403, T-413 |
| FR-014 | T-404, T-413 |
| FR-015 | T-405, T-408, T-414 |
| FR-016 | T-500, T-502, T-504 |
| FR-017 | T-501, T-505 |
| FR-018 | T-600, T-601, T-604, T-605, T-606 |
| FR-019 | T-602, T-603, T-604 |
| FR-020 | T-700, T-701, T-702, T-703, T-704 |
| FR-021 | T-308, T-309, T-312, T-313, T-705, T-706, T-708, T-709 |

---

## BR Traceability Matrix

| BR | Task IDs |
|---|---|
| BR-001 | T-201, T-304 |
| BR-002 | T-401 |
| BR-003 | T-400 |
| BR-004 | T-402, T-403, T-415 |
| BR-005 | T-304, T-305 |

---

*All tasks trace to requirements.md. No task implements a feature outside the approved scope.*
