export const auditData = [
  { id: 1,  user: "Sara Ahmed",    role: "generator", action: "GENERATE", doc_uuid: "DOC-20260807-A1B2", template: "Employee Payslip",      ip_address: "192.168.1.10", user_agent: "Chrome/126 Windows",  timestamp: "2026-08-07T09:14:00", action_details: { record_identifier: "EMP-001" } },
  { id: 2,  user: "John Mekonen",  role: "approver",  action: "SIGN",     doc_uuid: "DOC-20260807-A1B2", template: "Employee Payslip",      ip_address: "192.168.1.11", user_agent: "Firefox/127 Windows", timestamp: "2026-08-07T14:30:00", action_details: { step: "approved" } },
  { id: 3,  user: "Admin User",    role: "admin",     action: "DELIVER",  doc_uuid: "DOC-20260807-A1B2", template: "Employee Payslip",      ip_address: "192.168.1.1",  user_agent: "Chrome/126 Windows",  timestamp: "2026-08-07T15:00:00", action_details: { recipient: "emp@company.com" } },
  { id: 4,  user: "Liya Tesfaye",  role: "generator", action: "GENERATE", doc_uuid: "DOC-20260807-C3D4", template: "Purchase Order",        ip_address: "192.168.1.12", user_agent: "Edge/126 Windows",    timestamp: "2026-08-07T09:00:00", action_details: { record_identifier: "PO-099" } },
  { id: 5,  user: "Liya Tesfaye",  role: "generator", action: "PREVIEW",  doc_uuid: "DOC-20260807-C3D4", template: "Purchase Order",        ip_address: "192.168.1.12", user_agent: "Edge/126 Windows",    timestamp: "2026-08-07T08:50:00", action_details: {} },
  { id: 6,  user: "Sara Ahmed",    role: "generator", action: "SIGN",     doc_uuid: "DOC-20260806-E5F6", template: "Employment Contract",   ip_address: "192.168.1.10", user_agent: "Chrome/126 Windows",  timestamp: "2026-08-06T10:00:00", action_details: { step: "requested", approver_id: 3 } },
  { id: 7,  user: "Marta Bekele",  role: "approver",  action: "SIGN",     doc_uuid: "DOC-20260806-E5F6", template: "Employment Contract",   ip_address: "192.168.1.13", user_agent: "Safari/17 macOS",     timestamp: "2026-08-06T14:30:00", action_details: { step: "approved" } },
  { id: 8,  user: "Admin User",    role: "admin",     action: "DELIVER",  doc_uuid: "DOC-20260806-E5F6", template: "Employment Contract",   ip_address: "192.168.1.1",  user_agent: "Chrome/126 Windows",  timestamp: "2026-08-06T16:00:00", action_details: { recipient: "contractor@mail.com" } },
  { id: 9,  user: null,            role: null,        action: "VERIFY",   doc_uuid: "DOC-20260806-E5F6", template: "Employment Contract",   ip_address: "41.204.55.12",  user_agent: "Chrome/125 Android",  timestamp: "2026-08-06T17:45:00", action_details: { result: "authentic" } },
  { id: 10, user: "Sara Ahmed",    role: "generator", action: "GENERATE", doc_uuid: "DOC-20260806-G7H8", template: "Academic Transcript",   ip_address: "192.168.1.10", user_agent: "Chrome/126 Windows",  timestamp: "2026-08-06T11:00:00", action_details: { record_identifier: "STU-20241234" } },
  { id: 11, user: "Marta Bekele",  role: "approver",  action: "SIGN",     doc_uuid: "DOC-20260806-G7H8", template: "Academic Transcript",   ip_address: "192.168.1.13", user_agent: "Safari/17 macOS",     timestamp: "2026-08-06T11:30:00", action_details: { step: "rejected", rejection_reason: "Incorrect GPA" } },
  { id: 12, user: "Liya Tesfaye",  role: "generator", action: "GENERATE", doc_uuid: "DOC-20260805-I9J0", template: "Monthly Finance Report", ip_address: "192.168.1.12", user_agent: "Edge/126 Windows",   timestamp: "2026-08-05T14:00:00", action_details: { record_identifier: "FIN-2026-08" } },
  { id: 13, user: "Selam Worku",   role: "generator", action: "PREVIEW",  doc_uuid: "DOC-20260805-K1L2", template: "General Memo",          ip_address: "192.168.1.14", user_agent: "Chrome/126 Linux",    timestamp: "2026-08-05T10:30:00", action_details: {} },
  { id: 14, user: "Selam Worku",   role: "generator", action: "GENERATE", doc_uuid: "DOC-20260805-K1L2", template: "General Memo",          ip_address: "192.168.1.14", user_agent: "Chrome/126 Linux",    timestamp: "2026-08-05T10:45:00", action_details: { record_identifier: "MEMO-005" } },
  { id: 15, user: null,            role: null,        action: "VERIFY",   doc_uuid: "DOC-20260807-A1B2", template: "Employee Payslip",      ip_address: "41.204.55.99",  user_agent: "Firefox/127 Android", timestamp: "2026-08-07T20:10:00", action_details: { result: "authentic" } },
  { id: 16, user: "Admin User",    role: "admin",     action: "GENERATE", doc_uuid: "DOC-20260804-O5P6", template: "Employee Payslip",      ip_address: "192.168.1.1",  user_agent: "Chrome/126 Windows",  timestamp: "2026-08-04T08:00:00", action_details: { record_identifier: "EMP-015" } },
  { id: 17, user: "Bereket Abebe", role: "approver",  action: "SIGN",     doc_uuid: "DOC-20260804-O5P6", template: "Employee Payslip",      ip_address: "192.168.1.15", user_agent: "Chrome/126 Windows",  timestamp: "2026-08-04T10:00:00", action_details: { step: "approved" } },
  { id: 18, user: "Admin User",    role: "admin",     action: "DELIVER",  doc_uuid: "DOC-20260804-O5P6", template: "Employee Payslip",      ip_address: "192.168.1.1",  user_agent: "Chrome/126 Windows",  timestamp: "2026-08-04T11:30:00", action_details: { recipient: "emp15@company.com" } },
  { id: 19, user: null,            role: null,        action: "VERIFY",   doc_uuid: "TAMPERED-DOC-001",  template: "Purchase Order",        ip_address: "102.89.33.15",  user_agent: "Chrome/124 Windows",  timestamp: "2026-08-04T18:00:00", action_details: { result: "tampered" } },
  { id: 20, user: "Liya Tesfaye",  role: "generator", action: "PREVIEW",  doc_uuid: "DOC-20260805-I9J0", template: "Monthly Finance Report", ip_address: "192.168.1.12", user_agent: "Edge/126 Windows",   timestamp: "2026-08-05T13:50:00", action_details: {} },
];

export const ACTION_META = {
  GENERATE: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Generate" },
  SIGN:     { bg: "bg-purple-100", text: "text-purple-700", label: "Sign"     },
  DELIVER:  { bg: "bg-emerald-100",text: "text-emerald-700",label: "Deliver"  },
  VERIFY:   { bg: "bg-yellow-100", text: "text-yellow-700", label: "Verify"   },
  PREVIEW:  { bg: "bg-gray-100",   text: "text-gray-600",   label: "Preview"  },
};

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
