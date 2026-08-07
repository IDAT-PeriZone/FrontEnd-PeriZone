import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import { getToken, setToken } from '../api/client';
import type { Usuario } from '../types';

const USER_KEY = 'perizone_user';

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  login: (correo: string, contrasenia: string) => Promise<void>;
  registrar: (datos: authApi.DatosRegistro) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): Usuario | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(readStoredUser);
  const [loading, setLoading] = useState(true);

  const persist = (u: Usuario, token: string) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUsuario(u);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time auth check on mount
      setLoading(false);
      return;
    }
    authApi
      .perfil()
      .then(u => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUsuario(u);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem(USER_KEY);
        setUsuario(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (correo: string, contrasenia: string) => {
    const { usuario, token } = await authApi.login(correo, contrasenia);
    persist(usuario, token);
  }, []);

  const registrar = useCallback(async (datos: authApi.DatosRegistro) => {
    const { usuario, token } = await authApi.registrar(datos);
    persist(usuario, token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  return <AuthContext.Provider value={{ usuario, loading, login, registrar, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives alongside its provider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
