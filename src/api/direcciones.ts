import { apiFetch } from './client';
import type { Direccion } from '../types';

export function listar(): Promise<Direccion[]> {
  return apiFetch<Direccion[]>('/direcciones');
}

export interface NuevaDireccion {
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  referencia?: string;
  predeterminada?: boolean;
}

export async function crear(datos: NuevaDireccion): Promise<number> {
  const res = await apiFetch<{ id: number }>('/direcciones', { method: 'POST', body: datos });
  return res.id;
}
