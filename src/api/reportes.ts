import { apiFetch, apiDownload } from './client';
import { normalizarProducto } from './productos';
import type { ProductoApi } from './productos';
import type { Product, ProductoMasVendido, ResumenDashboard, VentaPorDia } from '../types';

export function dashboard(): Promise<ResumenDashboard> {
  return apiFetch<ResumenDashboard>('/reportes/dashboard');
}

/** total_vendido es SUM(DECIMAL) en MySQL: mysql2 lo devuelve como string, se normaliza aquí. */
export async function ventas(desde: string, hasta: string): Promise<VentaPorDia[]> {
  const data = await apiFetch<(Omit<VentaPorDia, 'total_vendido'> & { total_vendido: string | number })[]>(
    `/reportes/ventas?desde=${desde}&hasta=${hasta}`
  );
  return data.map(v => ({ ...v, cantidad_ordenes: Number(v.cantidad_ordenes), total_vendido: Number(v.total_vendido) }));
}

export function descargarVentasCsv(desde: string, hasta: string): Promise<void> {
  return apiDownload(`/reportes/ventas?desde=${desde}&hasta=${hasta}&formato=csv`, 'reporte-ventas.csv');
}

export async function productosMasVendidos(limite = 10): Promise<ProductoMasVendido[]> {
  const data = await apiFetch<(Omit<ProductoMasVendido, 'unidades_vendidas' | 'total_generado'> & {
    unidades_vendidas: string | number;
    total_generado: string | number;
  })[]>(`/reportes/productos-mas-vendidos?limite=${limite}`);
  return data.map(p => ({ ...p, unidades_vendidas: Number(p.unidades_vendidas), total_generado: Number(p.total_generado) }));
}

export async function stockCritico(): Promise<Product[]> {
  const data = await apiFetch<ProductoApi[]>('/reportes/stock-critico');
  return data.map(normalizarProducto);
}
