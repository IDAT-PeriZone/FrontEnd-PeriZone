import { apiFetch, apiDownload } from './client';
import type { MovimientoInventario, TipoMovimiento } from '../types';

export function listar(idProducto?: number): Promise<MovimientoInventario[]> {
  const qs = idProducto ? `?id_producto=${idProducto}` : '';
  return apiFetch<MovimientoInventario[]>(`/inventario${qs}`);
}

export function descargarCsv(idProducto?: number): Promise<void> {
  const qs = idProducto ? `&id_producto=${idProducto}` : '';
  return apiDownload(`/inventario?formato=csv${qs}`, 'kardex.csv');
}

export interface AjusteManual {
  id_producto: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
}

export function ajusteManual(datos: AjusteManual): Promise<{ id: number; stock_resultante: number }> {
  return apiFetch<{ id: number; stock_resultante: number }>('/inventario/ajustes', { method: 'POST', body: datos });
}
