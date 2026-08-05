import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public routes */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          {/* Protected routes — shared layout (sidebar + navbar) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/generate"   element={<GenerateDocPage />} />
            <Route path="/documents"  element={<DocumentsPage />} />
            <Route path="/approvals"  element={<ApprovalsPage />} />

            {/* Admin only */}
            <Route path="/templates"          element={<ProtectedRoute allowedRoles={['super_admin','system_admin']}><TemplatesPage /></ProtectedRoute>} />
            <Route path="/templates/new"      element={<ProtectedRoute allowedRoles={['super_admin','system_admin']}><TemplateEditorPage /></ProtectedRoute>} />
            <Route path="/templates/:id/edit" element={<ProtectedRoute allowedRoles={['super_admin','system_admin']}><TemplateEditorPage /></ProtectedRoute>} />
            <Route path="/users"              element={<ProtectedRoute allowedRoles={['super_admin','system_admin']}><UsersPage /></ProtectedRoute>} />
            <Route path="/audit"              element={<ProtectedRoute allowedRoles={['super_admin','system_admin']}><AuditPage /></ProtectedRoute>} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
