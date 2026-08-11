# Functional Requirements Checklist
## Automated Dynamic PDF / Report Generation Engine
### ProjID: 01311CIS2026

> Mark each FR as:
> - [ ] Not started
> - [~] In progress
> - [x] Done & tested
> - [-] Deferred / Out of scope

---

## Module 1 — Template Management

- [x] FR-001 Admin can create template with Name, Category, Description, Version
- [x] FR-002 Template editor with {{placeholder}} syntax in header/body/footer
- [x] FR-003 Auto-fetch DB fields for drag-and-drop field mapping (schema introspection)
- [x] FR-004 Conditional blocks — {{#if salary > 5000}} Senior Staff {{/if}}
- [x] FR-005 Looping blocks — {{#each leave_history}} rows {{/each}}
- [x] FR-006 Template versioning — edit creates new version (v1, v2...)
- [x] FR-007 Active / Archived status — archived cannot generate
- [x] FR-008 Upload custom logo / signature image embedded in header/footer

---

## Module 2 — Data Source & Field Mapping

- [ ] FR-009 Admin defines "Data Source" per template (employees, students, suppliers)
- [x] FR-010 Single Record generation (by ID) + Bulk Batch (CSV / multi-select)
- [x] FR-011 Pre-generation HTML preview before final PDF
- [ ] FR-012 Bulk validation report — "3 out of 10 missing salary field — skip or proceed?"
- [x] FR-013 Auto-fill {{generation_date}}, {{effective_date}} at generation time

---

## Module 3 — PDF Generation Engine

- [x] FR-014 pdfmake PDF generation (JSON→PDF) with Unicode font support
- [x] FR-015 Unique Document ID — format DOC-YYYYMMDD-XXXXX
- [x] FR-016 Tamper-proof footer — QR code + SHA-256 hash + Doc ID
- [x] FR-017 Watermarking — DRAFT / CONFIDENTIAL / FINAL per template config
- [x] FR-018 File naming — [TemplateName]_[RecordID]_[Date].pdf
- [ ] FR-019 Bulk background job (100+ docs) with real-time progress "45/100 completed"

---

## Module 4 — E-Signature Workflow

- [x] FR-020 Status lifecycle — Draft → Pending → E-Signed → Delivered (or Rejected)
- [x] FR-021 Generator selects Approver and sends signing request
- [x] FR-022 Approver receives email notification with secure link
- [x] FR-023 Approver reviews PDF, enters 6-digit OTP to confirm identity
- [x] FR-024 OTP validation adds visual signature block + HMAC-SHA256 to PDF
- [x] FR-025 Rejection workflow — reason required, doc reverts to Draft, Generator notified
- [ ] FR-026 E-Sign timestamped by NTP-synced server for legal defensibility
- [ ] FR-027 Auto-escalation reminder after 72 hours of unsigned document

---

## Module 5 — Delivery & Distribution

- [x] FR-028a Download PDF manually
- [x] FR-028b Deliver via email — branded email with PDF attached
- [x] FR-028c Generate secure download link (expires 7 days)
- [x] FR-029 Log recipient IP, browser, timestamp on link click
- [ ] FR-030 Email notifications for: Doc Ready, Doc Signed, Doc Rejected, 24hr Reminder, 72hr Escalation
- [x] FR-031 Admin can mark doc as "Hand Delivered"
- [-] FR-032 Not legible — deferred

---

## Module 6 — Verification & Trust

- [x] FR-033 Public Verify page — upload PDF or paste Doc ID → Authentic or Forged
- [x] FR-034 PDF footer contains "Verify at [url]/verify with ID: XXXXX"
- [x] FR-035 Hash persists in DB even if file is deleted

---

## Module 7 — Audit & Reports

- [x] FR-036 Full audit trail per Doc ID — all lifecycle events logged
- [x] FR-037 Admin dashboard KPIs — Docs Today, Avg Approval Time, Top 5 Templates
- [ ] FR-038 Monthly CSV export per department — count signed, time saved
- [x] FR-039 Search & filter documents by Template, Date, Status, Generator, Approver
- [ ] FR-040 Archive policy — docs older than 2 years move to cold storage

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Done [x] | 24 |
| 🔄 In Progress [~] | 0 |
| ⬜ Not Started [ ] | 14 |
| ➖ Deferred [-] | 1 |
| **Total FRs** | **39** |

---

## How to use this checklist daily

1. Open this file every morning
2. Pick the next `[ ]` item to work on
3. While coding — change it to `[~]`
4. After testing in Postman or browser — change it to `[x]`
5. Save the file

### Remaining priority order (recommended):

**Week 1 — Core missing features:**
1. FR-008 — Logo upload on templates
2. FR-018 — File naming convention
3. FR-030 — Email notifications (all types)
4. FR-027 — 72hr auto-escalation reminder

**Week 2 — Advanced features:**
5. FR-003 — DB schema introspection
6. FR-004 — Conditional blocks in templates
7. FR-005 — Looping blocks
8. FR-019 — Bulk job with progress

**Week 3 — Reports & Polish:**
9. FR-012 — Bulk validation report
10. FR-038 — Monthly CSV export
11. FR-040 — Archive policy
12. FR-026 — NTP timestamp
