export const usersData = [
  { id: 1,  full_name: "Admin User",    email: "admin@company.com",    phone: "+251911000001", role: "admin",     is_active: true,  created_at: "2026-01-01T08:00:00" },
  { id: 2,  full_name: "Sara Ahmed",    email: "sara@company.com",     phone: "+251911000002", role: "generator", is_active: true,  created_at: "2026-02-15T09:00:00" },
  { id: 3,  full_name: "John Mekonen",  email: "john@company.com",     phone: "+251911000003", role: "approver",  is_active: true,  created_at: "2026-02-20T10:00:00" },
  { id: 4,  full_name: "Marta Bekele",  email: "marta@company.com",    phone: "+251911000004", role: "approver",  is_active: true,  created_at: "2026-03-01T08:30:00" },
  { id: 5,  full_name: "Liya Tesfaye",  email: "liya@company.com",     phone: "+251911000005", role: "generator", is_active: true,  created_at: "2026-03-10T11:00:00" },
  { id: 6,  full_name: "Dawit Hailu",   email: "dawit@company.com",    phone: "+251911000006", role: "recipient", is_active: true,  created_at: "2026-04-01T09:00:00" },
  { id: 7,  full_name: "Helen Girma",   email: "helen@company.com",    phone: "+251911000007", role: "generator", is_active: false, created_at: "2026-04-15T08:00:00" },
  { id: 8,  full_name: "Yonas Tadesse", email: "yonas@company.com",    phone: "+251911000008", role: "recipient", is_active: false, created_at: "2026-05-01T10:00:00" },
  { id: 9,  full_name: "Selam Worku",   email: "selam@company.com",    phone: "+251911000009", role: "generator", is_active: true,  created_at: "2026-05-20T09:30:00" },
  { id: 10, full_name: "Bereket Abebe", email: "bereket@company.com",  phone: "+251911000010", role: "approver",  is_active: true,  created_at: "2026-06-01T08:00:00" },
];

export const ROLES = ["admin", "generator", "approver", "recipient"];

export const ROLE_META = {
  admin:     { bg: "bg-purple-100", text: "text-purple-700", label: "Admin"     },
  generator: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Generator" },
  approver:  { bg: "bg-yellow-100", text: "text-yellow-700", label: "Approver"  },
  recipient: { bg: "bg-gray-100",   text: "text-gray-600",   label: "Recipient" },
};
