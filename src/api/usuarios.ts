import { apiFetch, apiDownload } from './client';
import type { RolNombre, Usuario } from '../types';

export function listar(): Promise<Usuario[]> {
  return apiFetch<Usuario[]>('/usuarios');
}

export function obtener(id: number): Promise<Usuario> {
  return apiFetch<Usuario>(`/usuarios/${id}`);
}

export function descargarCsv(): Promise<void> {
  return apiDownload('/usuarios?formato=csv', 'usuarios.csv');
}

export interface NuevoUsuarioInterno {
  nombre: string;
  apellido: string;
  correo: string;
  contrasenia: string;
  telefono?: string;
  rol: RolNombre;
}

export function crearInterno(datos: NuevoUsuarioInterno): Promise<Usuario> {
  return apiFetch<Usuario>('/usuarios', { method: 'POST', body: datos });
}

export interface DatosActualizarUsuario {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo?: boolean;
}

export function actualizar(id: number, datos: DatosActualizarUsuario): Promise<Usuario> {
  return apiFetch<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: datos });
}

export async function desactivar(id: number): Promise<void> {
  await apiFetch<{ mensaje: string }>(`/usuarios/${id}`, { method: 'DELETE' });
}
