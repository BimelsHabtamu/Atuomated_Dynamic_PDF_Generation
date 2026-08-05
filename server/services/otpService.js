// TODO: OTP service
// generateOtp()   - Generate random 6-digit OTP
// hashOtp()       - Hash OTP with bcryptjs before storing in DB
// verifyOtp()     - Compare input OTP with stored hash
//                 - Check expiry (5 minutes), track failed attempts (max 3)
//                 - Lockout for 15 minutes after 3 failed attempts
