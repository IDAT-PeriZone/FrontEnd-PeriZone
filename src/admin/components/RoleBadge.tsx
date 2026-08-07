import type { RolNombre } from '../../types';
import { ROL_LABEL } from '../roles';

export default function RoleBadge({ rol }: { rol: RolNombre }) {
  return <span className="adm-badge adm-badge-accent">{ROL_LABEL[rol]}</span>;
}
