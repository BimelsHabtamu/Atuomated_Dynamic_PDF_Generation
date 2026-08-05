# PDF Engine — Frontend (React + Vite)

This is the frontend for the **Automated Dynamic PDF / Report Generation Engine**.  
Built with React 19, Vite, React Router, and Axios.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| Axios | HTTP client (with JWT interceptor) |

---

## Pages

| Page | Route | Role Access |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | All authenticated |
| Templates | `/templates` | Admin only |
| Template Editor | `/templates/new`, `/templates/:id/edit` | Admin only |
| Generate Document | `/generate` | Generator, Admin |
| Documents | `/documents` | Generator, Admin |
| Approvals | `/approvals` | Approver, Admin |
| Verify Document | `/verify` | Public |
| Users | `/users` | Admin only |
| Audit & Reports | `/audit` | Admin only |

---

## Folder Structure

```
src/
├── api/
│   └── axiosInstance.js     # Base URL + JWT interceptor
├── assets/                  # Images and static files
├── components/
│   ├── Navbar.jsx           # Top nav with user info & notifications
│   ├── Sidebar.jsx          # Role-based sidebar navigation
│   └── ProtectedRoute.jsx   # Auth + role guard for routes
├── context/
│   └── AuthContext.jsx      # Global auth state (user, token, login/logout)
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── TemplatesPage.jsx
│   ├── TemplateEditorPage.jsx
│   ├── GenerateDocPage.jsx
│   ├── DocumentsPage.jsx
│   ├── ApprovalsPage.jsx
│   ├── VerifyPage.jsx
│   ├── UsersPage.jsx
│   └── AuditPage.jsx
├── App.jsx                  # Router setup
└── main.jsx                 # Entry point
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`  
Backend must be running on: `http://localhost:5000`

---

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

> See the root `README.md` for the full project documentation.
