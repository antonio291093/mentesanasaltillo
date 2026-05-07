import { apiClient } from './client';
import type { ApiResponse, Specialty } from '../types/api.types';

export async function getAll(): Promise<Specialty[]> {
  const res = await apiClient<ApiResponse<Specialty[]>>('/specialties');
  return res.data!;
}
