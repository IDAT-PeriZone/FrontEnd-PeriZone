import { useLocation } from 'react-router-dom';
import { NAV_ITEMS, ROL_LABEL } from '../roles';
import type { RolNombre, Usuario } from '../../types';

interface TopbarProps {
  rol: RolNombre;
  usuario: Usuario;
}

export default function Topbar({ rol, usuario }: TopbarProps) {
  const location = useLocation();
  const activo = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
  const titulo = activo?.label ?? (location.pathname.includes('/ordenes/') ? 'Detalle de orden' : 'Panel');

  return (
    <header className="adm-topbar">
      <span className="adm-topbar-title">{titulo}</span>
      <div className="adm-topbar-user">
        <span>{usuario.nombre} {usuario.apellido}</span>
        <span className="adm-badge adm-badge-accent">{ROL_LABEL[rol]}</span>
      </div>
    </header>
  );
}
