import { Link, NavLink } from 'react-router-dom';
import { NAV_ITEMS, tieneAcceso } from '../roles';
import type { RolNombre } from '../../types';

interface SidebarProps {
  rol: RolNombre;
  onLogout: () => void;
}

export default function Sidebar({ rol, onLogout }: SidebarProps) {
  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-brand">
        <span className="brand-peri">PERI</span><span className="brand-zone">ZONE</span> Admin
      </div>
      <nav className="adm-nav">
        {NAV_ITEMS.filter(item => tieneAcceso(rol, item.seccion)).map(item => (
          <NavLink key={item.seccion} to={item.path} className={({ isActive }) => `adm-nav-item${isActive ? ' active' : ''}`}>
            <span>{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="adm-sidebar-footer">
        <Link to="/">← Volver a la tienda</Link>
        <button
          className="adm-btn adm-btn-outline adm-btn-sm"
          style={{ marginTop: '0.75rem', width: '100%' }}
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
