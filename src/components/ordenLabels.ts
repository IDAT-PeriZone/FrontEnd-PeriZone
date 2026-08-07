import type { EstadoOrden, MetodoPago } from '../types';

export const METODO_LABEL: Record<MetodoPago, string> = {
  yape: 'Yape',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export const ESTADO_CLASS: Record<EstadoOrden, string> = {
  pendiente: 'low-stock',
  procesando: 'low-stock',
  enviado: 'low-stock',
  entregado: 'in-stock',
  cancelado: 'out-stock',
};
