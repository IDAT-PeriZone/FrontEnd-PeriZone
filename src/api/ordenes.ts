import { apiFetch } from './client';
import type { Comprobante, DetalleOrden, EstadoOrden, HistorialEstadoOrden, MetodoPago, Orden, OrdenDetalleCompleto, Pago } from '../types';

function normalizarOrden(o: Orden): Orden {
  return { ...o, subtotal: Number(o.subtotal), igv: Number(o.igv), total: Number(o.total) };
}

function normalizarDetalle(items: DetalleOrden[]): DetalleOrden[] {
  return items.map(i => ({ ...i, precio_unitario: Number(i.precio_unitario), subtotal: Number(i.subtotal) }));
}

function normalizarPagos(pagos: Pago[]): Pago[] {
  return pagos.map(p => ({ ...p, monto: Number(p.monto) }));
}

function normalizarComprobante(c: Comprobante | null): Comprobante | null {
  return c ? { ...c, monto_total: Number(c.monto_total), igv: Number(c.igv) } : null;
}

export interface CheckoutBody {
  id_direccion: number;
  metodo_pago: MetodoPago;
  numero_tarjeta?: string;
  cvv?: string;
  fecha_expiracion?: string;
  ruc_razon_social?: string;
  simular_rechazo?: boolean;
}

export interface CheckoutResponse {
  id_orden: number;
  subtotal: number;
  igv: number;
  total: number;
  comprobante: string;
}

export function checkout(body: CheckoutBody): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>('/ordenes', { method: 'POST', body });
}

export async function misOrdenes(): Promise<Orden[]> {
  const data = await apiFetch<Orden[]>('/ordenes/mias');
  return data.map(normalizarOrden);
}

export async function obtener(id: number): Promise<OrdenDetalleCompleto> {
  const data = await apiFetch<OrdenDetalleCompleto>(`/ordenes/${id}`);
  return {
    orden: normalizarOrden(data.orden),
    detalle: normalizarDetalle(data.detalle),
    historial: data.historial as HistorialEstadoOrden[],
    pagos: normalizarPagos(data.pagos),
    comprobante: normalizarComprobante(data.comprobante),
  };
}

/** Panel admin (administrador/finanzas/almacen): todas las órdenes, no solo las propias. */
export async function listarTodas(estado?: EstadoOrden): Promise<Orden[]> {
  const qs = estado ? `?estado=${estado}` : '';
  const data = await apiFetch<Orden[]>(`/ordenes${qs}`);
  return data.map(normalizarOrden);
}

export async function cambiarEstado(id: number, estado: EstadoOrden): Promise<void> {
  await apiFetch<{ mensaje: string }>(`/ordenes/${id}/estado`, { method: 'PATCH', body: { estado } });
}
