import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import Layout           from './components/Layout';

import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import TemplatesPage      from './pages/TemplatesPage';
import TemplateEditorPage from './pages/TemplateEditorPage';
import GenerateDocPage    from './pages/GenerateDocPage';
import DocumentsPage      from './pages/DocumentsPage';
import ApprovalsPage      from './pages/ApprovalsPage';
import VerifyPage         from './pages/VerifyPage';
import UsersPage          from './pages/UsersPage';
import AuditPage          from './pages/AuditPage';
import DeliveryLogsPage   from './pages/DeliveryLogsPage';
import SettingsPage       from './pages/SettingsPage';
import NotFoundPage       from './pages/NotFoundPage';

const SA  = 'super_admin';
const SYS = 'system_admin';
const GEN = 'generator';
const APP = 'approver';
const REC = 'recipient';

const Guard = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          {/* Protected layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* All roles */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Admins only */}
            <Route path="/templates"          element={<Guard roles={[SA,SYS]}><TemplatesPage /></Guard>} />
            <Route path="/templates/new"      element={<Guard roles={[SA,SYS]}><TemplateEditorPage /></Guard>} />
            <Route path="/templates/:id/edit" element={<Guard roles={[SA,SYS]}><TemplateEditorPage /></Guard>} />
            <Route path="/users"              element={<Guard roles={[SA,SYS]}><UsersPage /></Guard>} />
            <Route path="/audit"              element={<Guard roles={[SA,SYS]}><AuditPage /></Guard>} />
            <Route path="/delivery-logs"      element={<Guard roles={[SA,SYS]}><DeliveryLogsPage /></Guard>} />

            {/* Generate — admins + generator + approver */}
            <Route path="/generate"  element={<Guard roles={[SA,SYS,GEN,APP]}><GenerateDocPage /></Guard>} />

            {/* Documents — all except blocked by backend */}
            <Route path="/documents" element={<Guard roles={[SA,SYS,GEN,APP,REC]}><DocumentsPage /></Guard>} />

            {/* Approvals — admins + approver */}
            <Route path="/approvals" element={<Guard roles={[SA,SYS,APP]}><ApprovalsPage /></Guard>} />

            {/* Verify — all roles */}
            <Route path="/verify-doc" element={<Guard roles={[SA,SYS,GEN,APP,REC]}><VerifyPage /></Guard>} />

            {/* System settings — super_admin only */}
            <Route path="/settings/system"   element={<Guard roles={[SA]}><SettingsPage /></Guard>} />

            {/* Password settings — all roles */}
            <Route path="/settings/password" element={<Guard roles={[SA,SYS,GEN,APP,REC]}><SettingsPage /></Guard>} />

          </Route>

          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
