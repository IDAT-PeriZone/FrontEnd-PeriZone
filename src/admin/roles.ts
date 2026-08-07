import type { RolNombre } from '../types';

/**
 * Mapea id_rol -> nombre de rol. No hay endpoint GET /api/roles y la tabla
 * es fija; este mapa refleja el orden de inserción en database/seed.sql.
 */
export const ROLES: Record<number, RolNombre> = {
  1: 'administrador',
  2: 'finanzas',
  3: 'almacen',
  4: 'marketing',
  5: 'cliente',
};

export const ROL_LABEL: Record<RolNombre, string> = {
  administrador: 'Administrador',
  finanzas: 'Finanzas',
  almacen: 'Almacén',
  marketing: 'Marketing',
  cliente: 'Cliente',
};

export type SeccionAdmin = 'dashboard' | 'usuarios' | 'ordenes' | 'productos' | 'inventario' | 'reportes';

/** Debe reflejar exactamente los requireRole(...) de cada módulo en BackEnd-PeriZone/src/routes/. */
export const ACCESO_SECCION: Record<SeccionAdmin, RolNombre[]> = {
  dashboard: ['administrador', 'finanzas', 'almacen', 'marketing'],
  usuarios: ['administrador', 'marketing'],
  ordenes: ['administrador', 'finanzas', 'almacen'],
  productos: ['administrador', 'almacen'],
  inventario: ['administrador', 'almacen'],
  reportes: ['administrador', 'finanzas', 'marketing'],
};

export const NAV_ITEMS: { seccion: SeccionAdmin; label: string; path: string; icon: string }[] = [
  { seccion: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { seccion: 'usuarios', label: 'Usuarios', path: '/admin/usuarios', icon: '👥' },
  { seccion: 'ordenes', label: 'Órdenes', path: '/admin/ordenes', icon: '📦' },
  { seccion: 'productos', label: 'Productos', path: '/admin/productos', icon: '🛒' },
  { seccion: 'inventario', label: 'Inventario', path: '/admin/inventario', icon: '📋' },
  { seccion: 'reportes', label: 'Reportes', path: '/admin/reportes', icon: '📈' },
];

export function esRolInterno(rol: RolNombre | null): boolean {
  return !!rol && rol !== 'cliente';
}

export function tieneAcceso(rol: RolNombre | null, seccion: SeccionAdmin): boolean {
  if (!rol) return false;
  return ACCESO_SECCION[seccion].includes(rol);
}
