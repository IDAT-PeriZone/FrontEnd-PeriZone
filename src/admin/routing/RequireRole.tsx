import type { ReactNode } from 'react';
import type { RolNombre } from '../../types';
import { ROL_LABEL } from '../roles';

interface RequireRoleProps {
  rol: RolNombre | null;
  allowed: RolNombre[];
  children: ReactNode;
}

/** Refleja en el UI los mismos requireRole(...) que ya exige el backend por endpoint. */
export default function RequireRole({ rol, allowed, children }: RequireRoleProps) {
  if (!rol || !allowed.includes(rol)) {
    return (
      <div className="adm-denied">
        <h2>Acceso denegado</h2>
        <p>
          Tu rol{rol ? ` (${ROL_LABEL[rol]})` : ''} no tiene permiso para ver esta sección. Roles permitidos:{' '}
          {allowed.map(r => ROL_LABEL[r]).join(', ')}.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
