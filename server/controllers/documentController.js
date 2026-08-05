// TODO: Document controller
// previewDocument()    - Fetch DB record, render HTML with template engine (replace {{fields}})
// generateDocument()   - Render HTML → PDF via pdfmake, compute SHA-256 hash, embed QR code, save file
// bulkGenerate()       - Queue background job for 100+ docs, track progress
// getDocuments()       - List with filters (template, date, status, generator)
// getDocumentById()    - Single doc info + audit trail
// downloadDocument()   - Validate JWT download token, stream PDF file
// deleteDocument()     - Remove file + DB record (keep hash for verification)
