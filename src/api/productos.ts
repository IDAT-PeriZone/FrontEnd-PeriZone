import { apiFetch, apiDownload } from './client';
import type { Product } from '../types';

export interface ProductoApi extends Omit<Product, 'precio' | 'activo'> {
  precio: string | number;
  activo: number | boolean;
}

export function normalizarProducto(p: ProductoApi): Product {
  return { ...p, precio: Number(p.precio), activo: Boolean(p.activo) };
}

export interface FiltrosProducto {
  categoria?: number;
  precioMin?: number;
  precioMax?: number;
  buscar?: string;
}

function construirQueryString(filtros: FiltrosProducto): string {
  const params = new URLSearchParams();
  if (filtros.categoria) params.set('categoria', String(filtros.categoria));
  if (filtros.precioMin !== undefined) params.set('precioMin', String(filtros.precioMin));
  if (filtros.precioMax !== undefined) params.set('precioMax', String(filtros.precioMax));
  if (filtros.buscar) params.set('buscar', filtros.buscar);
  return params.toString();
}

export async function listar(filtros: FiltrosProducto = {}): Promise<Product[]> {
  const qs = construirQueryString(filtros);
  const data = await apiFetch<ProductoApi[]>(`/productos${qs ? `?${qs}` : ''}`, { auth: false });
  return data.map(normalizarProducto);
}

export async function obtener(id: number): Promise<Product> {
  const data = await apiFetch<ProductoApi>(`/productos/${id}`, { auth: false });
  return normalizarProducto(data);
}

/** Panel admin: incluye productos inactivos (dados de baja). */
export async function listarAdmin(filtros: FiltrosProducto = {}): Promise<Product[]> {
  const qs = construirQueryString(filtros);
  const data = await apiFetch<ProductoApi[]>(`/productos/admin${qs ? `?${qs}` : ''}`);
  return data.map(normalizarProducto);
}

export function descargarCsv(filtros: FiltrosProducto = {}): Promise<void> {
  const qs = construirQueryString(filtros);
  return apiDownload(`/productos/admin?formato=csv${qs ? `&${qs}` : ''}`, 'productos.csv');
}

export interface DatosProducto {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stock_minimo?: number;
  imagen_url?: string;
}

export async function crear(datos: DatosProducto): Promise<Product> {
  const data = await apiFetch<ProductoApi>('/productos', { method: 'POST', body: datos });
  return normalizarProducto(data);
}

export async function actualizar(id: number, datos: Partial<DatosProducto> & { activo?: boolean }): Promise<Product> {
  const data = await apiFetch<ProductoApi>(`/productos/${id}`, { method: 'PUT', body: datos });
  return normalizarProducto(data);
}

export async function eliminar(id: number): Promise<void> {
  await apiFetch<{ mensaje: string }>(`/productos/${id}`, { method: 'DELETE' });
}

export async function agregarImagen(id: number, imagen_url: string, orden = 0): Promise<{ id: number }> {
  return apiFetch<{ id: number }>(`/productos/${id}/imagenes`, { method: 'POST', body: { imagen_url, orden } });
}
