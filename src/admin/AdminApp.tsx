import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { getRolFromToken } from '../api/client';
import { esRolInterno } from './roles';
import AdminLayout from './layout/AdminLayout';
import RequireRole from './routing/RequireRole';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import OrdenesPage from './pages/OrdenesPage';
import OrdenDetallePage from './pages/OrdenDetallePage';
import ProductosPage from './pages/ProductosPage';
import InventarioPage from './pages/InventarioPage';
import ReportesPage from './pages/ReportesPage';
import './admin.css';

function AdminAppContent() {
  const { usuario, loading, logout } = useAuth();
  const rol = getRolFromToken();

  if (loading) {
    return (
      <div className="adm-root">
        <p className="adm-loading">Cargando…</p>
      </div>
    );
  }

  if (!usuario || !esRolInterno(rol)) {
    return (
      <div className="adm-root">
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="adm-root">
      <Routes>
        <Route path="login" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<AdminLayout rol={rol!} usuario={usuario} onLogout={logout} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage rol={rol!} />} />
          <Route
            path="usuarios"
            element={
              <RequireRole rol={rol} allowed={['administrador', 'marketing']}>
                <UsuariosPage rol={rol!} />
              </RequireRole>
            }
          />
          <Route
            path="ordenes"
            element={
              <RequireRole rol={rol} allowed={['administrador', 'finanzas', 'almacen']}>
                <OrdenesPage />
              </RequireRole>
            }
          />
          <Route
            path="ordenes/:id"
            element={
              <RequireRole rol={rol} allowed={['administrador', 'finanzas', 'almacen']}>
                <OrdenDetallePage rol={rol!} />
              </RequireRole>
            }
          />
          <Route
            path="productos"
            element={
              <RequireRole rol={rol} allowed={['administrador', 'almacen']}>
                <ProductosPage />
              </RequireRole>
            }
          />
          <Route
            path="inventario"
            element={
              <RequireRole rol={rol} allowed={['administrador', 'almacen']}>
                <InventarioPage />
              </RequireRole>
            }
          />
          <Route
            path="reportes"
            element={
              <RequireRole rol={rol} allowed={['administrador', 'finanzas', 'marketing']}>
                <ReportesPage />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminAppContent />
    </AuthProvider>
  );
}
