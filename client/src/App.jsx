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

const Admin    = ({ children }) => <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
const Workflow = ({ children }) => <ProtectedRoute allowedRoles={['admin','approver']}>{children}</ProtectedRoute>;

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
            <Route path="/dashboard"          element={<DashboardPage />} />
            <Route path="/generate"           element={<GenerateDocPage />} />
            <Route path="/documents"          element={<DocumentsPage />} />
            <Route path="/approvals"          element={<Workflow><ApprovalsPage /></Workflow>} />
            <Route path="/templates"          element={<Admin><TemplatesPage /></Admin>} />
            <Route path="/templates/new"      element={<Admin><TemplateEditorPage /></Admin>} />
            <Route path="/templates/:id/edit" element={<Admin><TemplateEditorPage /></Admin>} />
            <Route path="/users"              element={<Admin><UsersPage /></Admin>} />
            <Route path="/audit"              element={<Admin><AuditPage /></Admin>} />
            <Route path="/delivery-logs"      element={<Admin><DeliveryLogsPage /></Admin>} />
            <Route path="/settings"           element={<Admin><SettingsPage /></Admin>} />
          </Route>

          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
