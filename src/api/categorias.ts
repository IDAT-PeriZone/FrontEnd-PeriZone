import { apiFetch } from './client';
import type { Category } from '../types';

export function listar(): Promise<Category[]> {
  return apiFetch<Category[]>('/categorias', { auth: false });
}

export function obtener(id: number): Promise<Category> {
  return apiFetch<Category>(`/categorias/${id}`, { auth: false });
}

export interface DatosCategoria {
  nombre: string;
  descripcion?: string;
}

export function crear(datos: DatosCategoria): Promise<Category> {
  return apiFetch<Category>('/categorias', { method: 'POST', body: datos });
}

export function actualizar(id: number, datos: DatosCategoria): Promise<Category> {
  return apiFetch<Category>(`/categorias/${id}`, { method: 'PUT', body: datos });
}

export async function eliminar(id: number): Promise<void> {
  await apiFetch<{ mensaje: string }>(`/categorias/${id}`, { method: 'DELETE' });
}
