import { apiFetch } from './client';
import type { CartItem, CartSummary } from '../types';

interface CartSummaryApi extends Omit<CartSummary, 'items' | 'subtotal' | 'igv' | 'total'> {
  items: (Omit<CartItem, 'precio'> & { precio: string | number })[];
  subtotal: string | number;
  igv: string | number;
  total: string | number;
}

function normalizar(data: CartSummaryApi): CartSummary {
  return {
    id_carrito: data.id_carrito,
    items: data.items.map(i => ({ ...i, precio: Number(i.precio) })),
    subtotal: Number(data.subtotal),
    igv: Number(data.igv),
    total: Number(data.total),
  };
}

export async function ver(): Promise<CartSummary> {
  return normalizar(await apiFetch<CartSummaryApi>('/carrito'));
}

export async function agregarItem(id_producto: number, cantidad: number): Promise<CartSummary> {
  return normalizar(
    await apiFetch<CartSummaryApi>('/carrito/items', { method: 'POST', body: { id_producto, cantidad } })
  );
}

export async function actualizarItem(idProducto: number, cantidad: number): Promise<CartSummary> {
  return normalizar(
    await apiFetch<CartSummaryApi>(`/carrito/items/${idProducto}`, { method: 'PUT', body: { cantidad } })
  );
}

export async function quitarItem(idProducto: number): Promise<CartSummary> {
  return normalizar(await apiFetch<CartSummaryApi>(`/carrito/items/${idProducto}`, { method: 'DELETE' }));
}

export async function vaciar(): Promise<void> {
  await apiFetch<{ mensaje: string }>('/carrito', { method: 'DELETE' });
}
