import type { RolNombre } from '../types';

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'perizone_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Lee el rol directamente del payload del JWT guardado ({ id, correo, rol },
 * ver BackEnd-PeriZone/src/utils/jwt.ts). Es solo para decidir qué mostrar
 * en el panel admin (sidebar, botones) — la autorización real la hace el
 * backend en cada request, esto NO valida la firma del token.
 */
export function getRolFromToken(): RolNombre | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { rol?: RolNombre };
    return payload.rol ?? null;
  } catch {
    return null;
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Adjunta el header Authorization si hay token guardado. Por defecto true. */
  auth?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.', 0);
  }

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(json?.message || `Error ${res.status}`, res.status);
  }

  return json.data as T;
}

/**
 * Descarga un CSV protegido por Authorization (usuarios/productos/inventario/
 * reportes con ?formato=csv). apiFetch no sirve porque siempre parsea JSON;
 * aquí se lee la respuesta como Blob y se dispara la descarga en el navegador.
 */
export async function apiDownload(path: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { headers });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.', 0);
  }

  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as ApiEnvelope<unknown> | null;
    throw new ApiError(json?.message || `Error ${res.status}`, res.status);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
