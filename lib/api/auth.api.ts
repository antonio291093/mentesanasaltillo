import { apiClient } from './client';
import type { ApiResponse, AuthResponse, User, UserRole } from '../types/api.types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<AuthResponse>>('/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
  return res.data!;
}

export async function register(
  email:    string,
  password: string,
  nombre:   string,
  apellido: string,
  role:     UserRole = 'usuario',
): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<AuthResponse>>('/auth/register', {
    method: 'POST',
    body:   JSON.stringify({ email, password, nombre, apellido, role }),
  });
  return res.data!;
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const res = await apiClient<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
    method: 'POST',
    body:   JSON.stringify({ refreshToken: token }),
  });
  return res.data!;
}

export async function getMe(): Promise<User> {
  const res = await apiClient<ApiResponse<User>>('/users/me');
  return res.data!;
}
