// TODO: E-Signature controller
// requestSignature()   - Update doc status to 'pending_approval', notify approver via email
// getPendingApprovals()- Fetch docs pending for current approver
// sendOtp()            - Generate 6-digit OTP, store hashed in DB (expires 5 min), email/SMS
// verifyOtp()          - Compare OTP hash, max 3 attempts, lockout 15 min
// approveDocument()    - After OTP verify: append signature block + HMAC to PDF, update status 'e_signed'
// rejectDocument()     - Update status back to 'draft', store rejection reason, notify generator
