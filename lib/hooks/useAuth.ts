'use client';

import { useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';
import { saveTokens, clearTokens } from '../api/client';
import type { AuthUser, UserRole } from '../types/api.types';

// ─── Canal de sincronización entre instancias del hook ────────────────────────
// Todas las instancias de useAuth() escuchan este evento para mantenerse
// en sync cuando otra instancia hace login/logout.

const AUTH_EVENT = 'auth-change';

function broadcastAuth(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AuthUser | null>(AUTH_EVENT, { detail: user }));
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AuthState {
  user:            AuthUser | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  error:           string | null;
}

interface AuthActions {
  login:    (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, nombre: string, apellido: string, role?: UserRole) => Promise<AuthUser>;
  logout:   () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState & AuthActions {
  const [user, setUser]           = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const restore = async () => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        setUser({ id: userData.id, email: userData.email, role: userData.role, nombre: userData.nombre, apellido: userData.apellido });
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  // Escuchar cambios de auth emitidos por otras instancias del hook
  // (ej.: la página de login hace login → el Navbar se actualiza)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const incoming = (e as CustomEvent<AuthUser | null>).detail;
      setUser(incoming);
      setIsLoading(false);
    };

    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const { tokens, user: authUser } = await authApi.login(email, password);
      saveTokens(tokens.accessToken, tokens.refreshToken);
      setUser(authUser);
      broadcastAuth(authUser);
      return authUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    email:    string,
    password: string,
    nombre:   string,
    apellido: string,
    role:     UserRole = 'usuario',
  ): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const { tokens, user: authUser } = await authApi.register(email, password, nombre, apellido, role);
      saveTokens(tokens.accessToken, tokens.refreshToken);
      setUser(authUser);
      broadcastAuth(authUser);
      return authUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setError(null);
    broadcastAuth(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    error,
    login,
    register,
    logout,
  };
}
