export const stats = [
  {
    label:  "Documents Generated Today",
    value:  "12",
    sub:    "Across all templates",
    iconBg: "bg-blue-50",
    trend:  { up: true, label: "+3", sub: "vs yesterday" },
    icon:   "doc",
  },
  {
    label:  "Pending Approvals",
    value:  "5",
    sub:    "Awaiting signature",
    iconBg: "bg-yellow-50",
    trend:  { up: false, label: "2 overdue", sub: "need attention" },
    icon:   "clock",
  },
  {
    label:  "Total Documents",
    value:  "284",
    sub:    "All time",
    iconBg: "bg-indigo-50",
    trend:  { up: true, label: "+18", sub: "this week" },
    icon:   "folder",
  },
  {
    label:  "Active Users",
    value:  "8",
    sub:    "In the system",
    iconBg: "bg-green-50",
    trend:  { up: true, label: "2 new", sub: "this month" },
    icon:   "users",
  },
];

export const recentActivity = [
  { doc_id: "DOC-20260807-A1B2", template: "Payslip",             action: "GENERATE", status: "draft",     user: "Sara Ahmed",   date: "2026-08-07T09:14:00" },
  { doc_id: "DOC-20260807-C3D4", template: "Employment Contract", action: "SIGN",     status: "signed",    user: "John Mekonen", date: "2026-08-07T08:55:00" },
  { doc_id: "DOC-20260806-E5F6", template: "Purchase Order",      action: "DELIVER",  status: "delivered", user: "Admin User",   date: "2026-08-06T16:30:00" },
  { doc_id: "DOC-20260806-G7H8", template: "Academic Transcript", action: "VERIFY",   status: "signed",    user: "Liya Tesfaye", date: "2026-08-06T14:10:00" },
  { doc_id: "DOC-20260806-I9J0", template: "Payslip",             action: "GENERATE", status: "pending",   user: "Sara Ahmed",   date: "2026-08-06T11:45:00" },
  { doc_id: "DOC-20260805-K1L2", template: "Certificate",         action: "SIGN",     status: "rejected",  user: "John Mekonen", date: "2026-08-05T17:20:00" },
  { doc_id: "DOC-20260805-M3N4", template: "Employment Contract", action: "PREVIEW",  status: "draft",     user: "Admin User",   date: "2026-08-05T09:05:00" },
  { doc_id: "DOC-20260804-O5P6", template: "Purchase Order",      action: "DELIVER",  status: "delivered", user: "Liya Tesfaye", date: "2026-08-04T13:50:00" },
];

export const quickActions = [
  {
    label: "Generate Document",
    desc:  "Create a new PDF from a template",
    to:    "/generate",
    iconBg:"bg-blue-100",
    icon:  "plus-doc",
  },
  {
    label: "Manage Templates",
    desc:  "Create, edit or archive templates",
    to:    "/templates",
    iconBg:"bg-indigo-100",
    icon:  "template",
  },
  {
    label: "Pending Approvals",
    desc:  "Review and sign documents",
    to:    "/approvals",
    iconBg:"bg-yellow-100",
    icon:  "check-circle",
  },
  {
    label: "Verify Document",
    desc:  "Check authenticity via hash or QR",
    to:    "/verify",
    iconBg:"bg-green-100",
    icon:  "shield",
  },
];
