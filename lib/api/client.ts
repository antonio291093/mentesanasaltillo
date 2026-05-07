// Cliente HTTP base para toda la capa de API del frontend.
// Gestiona tokens, reintentos en 401 y errores HTTP.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

// ─── Gestión de tokens (localStorage, solo cliente) ───────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ─── Refresco de token ────────────────────────────────────────────────────────

// Variable para evitar múltiples llamadas de refresco simultáneas
let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const json = await res.json();
    const newToken: string = json.data.accessToken;
    saveTokens(newToken, refreshToken);
    return newToken;
  } catch {
    clearTokens();
    return null;
  }
}

// ─── Cliente principal ────────────────────────────────────────────────────────

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const buildHeaders = (token: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // Primera llamada
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(getAccessToken()),
  });

  // Token expirado: intentar refrescar una sola vez
  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = doRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.');
    }

    // Reintentar la solicitud original con el nuevo token
    const retryRes = await fetch(url, {
      ...options,
      headers: buildHeaders(newToken),
    });

    if (!retryRes.ok) {
      const body = await retryRes.json().catch(() => ({}));
      throw new Error(body.error ?? `Error ${retryRes.status}`);
    }

    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Mostrar el primer mensaje de validación si viene del express-validator
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      throw new Error(body.errors[0].mensaje ?? body.errors[0].msg ?? 'Error de validación');
    }
    throw new Error(body.error ?? `Error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
