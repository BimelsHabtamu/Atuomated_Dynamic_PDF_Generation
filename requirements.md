# Software Requirements Specification (SRS)
## Automated Dynamic PDF / Report Generation Engine (with E-Sign)

**Project ID:** 01311CIS2026  
**Version:** 1.0  
**Organization:** App Factory Academy  
**Specification Format:** EARS (Easy Approach to Requirements Syntax)

---

## 1. Problem Statement

Staff manually fill out MS Word/Excel templates, convert to PDF, physically sign or scan, and email them — leading to data entry errors, version control chaos, forgery risks, and administrative overhead.

---

## 2. Objectives

- WYSIWYG template builder with dynamic field mapping
- One-click single or bulk PDF generation from database records
- Secure internal e-signature workflow with OTP
- Tamper-proof verification QR code embedded in every PDF
- Automated secure delivery to recipients

---

## 3. Scope

### In Scope
- Web application
- 5 pre-built template categories (HR, Finance, Academic, Procurement, General)
- Dynamic field mapping (JSON to DB)
- Single & bulk generation (ZIP)
- E-signature with OTP
- Watermarking (Draft/Confidential/Final)
- Audit trail
- Auto-email delivery
- Secure download links

### Out of Scope
- Legally binding third-party e-signature integration (DocuSign, Adobe Sign)
- OCR image-to-text
- Native mobile apps
- Complex nested dynamic tables (deferred to V2)

---

## 4. Stakeholders & Roles

| Stakeholder | Role |
|---|---|
| Document Generators | HR, Finance, Admin Officers |
| Approvers | Directors, Heads |
| Recipients | Employees, Suppliers, Students |
| System Admin | Manages system settings & DB connections |
| Super Admin | Full system access |
| IT Support | Technical troubleshooting |
| Developers | Build & maintain system |
| QA | Test & validate |
| DBA | Database management |

---

## 5. User Roles & Permissions (RBAC Matrix)

| Module / Action | Super Admin | System Admin | Document Generator (HR/Fin) | Approver (Director) | Recipient (Read-Only) |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage System Settings & DB Connections | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create/Edit/Delete Document Templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Generate a PDF (Single/Bulk) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Initiate an E-Signature Request | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve/Reject & Apply E-Sign | ✅ | ✅ | ❌ | ✅ | ❌ |
| Download Own Generated Docs | ✅ | ✅ | ✅ | ❌ | ✅ (own only) |
| Verify Document Integrity (Check Hash) | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Full Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 6. Functional Requirements (EARS Format)

### FR-001: Template Creation
**WHEN** an admin creates a new template,  
**THE SYSTEM SHALL** allow entry of name, category (HR/Finance/Academic/Procurement/General), header HTML, body HTML, footer HTML, and watermark text.

### FR-002: Template Field Mapping
**WHEN** an admin defines template placeholders,  
**THE SYSTEM SHALL** map dynamic field paths (e.g., employee.salary) to database fields with data type (string/number/date) and loopable flag.

### FR-003: Template Versioning
**WHEN** an admin edits an existing template,  
**THE SYSTEM SHALL** increment the version number and preserve the previous version.

### FR-004: Template Status
**WHEN** an admin changes a template status,  
**THE SYSTEM SHALL** allow toggling between Active and Archived states.

### FR-005: Logo Upload
**WHEN** an admin uploads a logo/signature image,  
**THE SYSTEM SHALL** store the file in storage/uploads and save the path to the template record.

### FR-006: Single Document Generation
**WHEN** a generator selects a template and provides a record identifier,  
**THE SYSTEM SHALL** fetch data from the database, render the HTML with placeholder values, generate a PDF, and assign a unique doc_uuid.

### FR-007: Bulk Document Generation
**WHEN** a generator requests bulk generation with multiple record identifiers,  
**THE SYSTEM SHALL** generate PDFs for all records, ZIP the output, and provide a download link.

### FR-008: PDF Hash Generation
**WHEN** the system generates a PDF,  
**THE SYSTEM SHALL** compute a SHA-256 hash of the file content and store it in generated_docs.file_hash.

### FR-009: QR Code Embedding
**WHEN** the system generates a PDF,  
**THE SYSTEM SHALL** embed a QR code in the footer containing the verify URL with doc_uuid.

### FR-010: Watermark Application
**WHEN** the system generates a PDF,  
**THE SYSTEM SHALL** apply the watermark text (Draft/Confidential/Final) based on document status.

### FR-011: Signature Request
**WHEN** a generator requests e-signature,  
**THE SYSTEM SHALL** create a signature_requests record with status 'pending' and notify the selected approver.

### FR-012: OTP Generation
**WHEN** an approver initiates the signing process,  
**THE SYSTEM SHALL** generate a 6-digit OTP, hash it with bcrypt, store it in signature_requests.otp_code, set expiry to 5 minutes, and send it via email.

### FR-013: OTP Validation
**WHEN** an approver enters an OTP,  
**THE SYSTEM SHALL** verify the hash, check expiry, increment otp_attempts, and lock the request for 15 minutes after 3 failed attempts.

### FR-014: Digital Signature Application
**WHEN** an approver successfully validates OTP,  
**THE SYSTEM SHALL** compute an HMAC-SHA256 signature using the approver's secret key, store it in digital_signatures.crypto_hmac, append visual signature text to the PDF, and update document status to 'signed'.

### FR-015: Signature Rejection
**WHEN** an approver rejects a document,  
**THE SYSTEM SHALL** update signature_requests.status to 'rejected', store the rejection reason, revert document status to 'draft', and notify the generator.

### FR-016: Email Delivery
**WHEN** a generator triggers email delivery,  
**THE SYSTEM SHALL** create a delivery_logs record, generate a JWT download token with 7-day expiry, send an email with the PDF attached or a secure link, and update email_status to 'sent'.

### FR-017: Secure Download Link
**WHEN** a recipient clicks a download link,  
**THE SYSTEM SHALL** validate the JWT token, check expiry, serve the PDF file, log the download with IP address and timestamp, and mark the token as used.

### FR-018: Public Document Verification
**WHEN** a user accesses the verify page with a doc_uuid,  
**THE SYSTEM SHALL** retrieve the document record, recompute the SHA-256 hash, compare with stored file_hash, and display "Authentic" or "Tampered".

### FR-019: Upload Verification
**WHEN** a user uploads a PDF for verification,  
**THE SYSTEM SHALL** extract the embedded doc_uuid, retrieve the original hash from the database, compute the hash of the uploaded file, and compare.

### FR-020: Audit Log Creation
**WHEN** any user performs an action (PREVIEW/GENERATE/SIGN/DELIVER/VERIFY),  
**THE SYSTEM SHALL** create an immutable audit_logs record with user_id, doc_id, action, action_details JSON, ip_address, user_agent, and timestamp.

### FR-021: Audit Trail View
**WHEN** an admin views audit logs,  
**THE SYSTEM SHALL** display all logged actions with filters for user, document, date range, and action type.

---

## 7. Non-Functional Requirements

### NFR-001: Performance
Single PDF generated in under 2 seconds. Bulk generation of 100 documents completes in under 60 seconds via background job.

### NFR-002: Security
PDFs stored outside public webroot with randomized filenames. Download tokens are JWT-based, single-use, and expire in 7 days.

### NFR-003: Integrity
SHA-256 hashing with zero-tamper tolerance. The verification page flags any external edit immediately.

### NFR-004: Availability
99.5% uptime. Offline queueing for bulk jobs with retry if DB is down.

### NFR-005: Compliance
PII in PDFs must be redactable via template filters.

---

## 8. Business Rules

### BR-001
Only "Active" templates can generate documents.

### BR-002
A document cannot be signed if its file size exceeds 5MB.

### BR-003
An approver cannot approve their own generated document. Self-approval is blocked.

### BR-004
OTP expires in 5 minutes and is invalidated after 3 failed attempts. Lockout lasts 15 minutes.

### BR-005
A document cannot be re-generated with the same Doc ID. A new generation always creates a new ID and version.

---

## 9. User Stories

### US-001
As an HR Officer, I want to select 50 employees, choose the "Payslip" template, and generate all PDFs at once, so I don't spend hours manually copying data.

### US-002
As a Finance Director, I want to receive an OTP on my phone to approve high-value Purchase Orders remotely.

### US-003
As an Admin, I want to create a conditional template that hides salary details for junior staff.

### US-004
As a Student, I want to download my digital transcript and scan the QR code to verify its authenticity.

---

## 10. Use Cases (High-Level)

### UC-01: Generate and E-Sign a Salary Certificate
HR selects employee → chooses template → generates → previews → sends to Director → Director reviews with OTP → system applies hash and signature → emails PDF to employee.

### UC-02: Verify a Supplier Contract
Supplier uploads PDF on public page → system extracts embedded hash → compares to DB → shows "Authentic" with original signing timestamp.

---

## End of Requirements Specification
