import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import type { RolNombre, Usuario } from '../../types';

interface AdminLayoutProps {
  rol: RolNombre;
  usuario: Usuario;
  onLogout: () => void;
}

export default function AdminLayout({ rol, usuario, onLogout }: AdminLayoutProps) {
  return (
    <div className="adm-shell">
      <Sidebar rol={rol} onLogout={onLogout} />
      <div className="adm-content">
        <Topbar rol={rol} usuario={usuario} />
        <main className="adm-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
