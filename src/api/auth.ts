import { apiFetch } from './client';
import type { Usuario } from '../types';

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export function login(correo: string, contrasenia: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { correo, contrasenia }, auth: false });
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  contrasenia: string;
  telefono?: string;
}

export function registrar(datos: DatosRegistro): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/registro', { method: 'POST', body: datos, auth: false });
}

export function perfil(): Promise<Usuario> {
  return apiFetch<Usuario>('/auth/perfil');
}
