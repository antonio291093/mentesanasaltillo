import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedApiResponse,
  ProfessionalSummary,
  ProfessionalProfile,
  ProfessionalsFilter,
  Schedule,
} from '../types/api.types';

export async function getAll(
  filters?: ProfessionalsFilter,
): Promise<PaginatedApiResponse<ProfessionalSummary>> {
  const params = new URLSearchParams();
  if (filters?.especialidad) params.set('especialidad', String(filters.especialidad));
  if (filters?.modalidad)    params.set('modalidad',    filters.modalidad);
  if (filters?.precio_max)   params.set('precio_max',   String(filters.precio_max));
  if (filters?.ciudad)       params.set('ciudad',       filters.ciudad);
  if (filters?.page)         params.set('page',         String(filters.page));
  if (filters?.limit)        params.set('limit',        String(filters.limit));

  const query = params.toString();
  return apiClient<PaginatedApiResponse<ProfessionalSummary>>(
    `/professionals${query ? `?${query}` : ''}`,
  );
}

export async function getById(id: number): Promise<ProfessionalProfile> {
  const res = await apiClient<ApiResponse<ProfessionalProfile>>(`/professionals/${id}`);
  return res.data!;
}

export async function getMyProfile(): Promise<ProfessionalProfile> {
  const res = await apiClient<ApiResponse<ProfessionalProfile>>('/professionals/me/profile');
  return res.data!;
}

export async function createProfile(
  data: Partial<ProfessionalProfile>,
): Promise<ProfessionalProfile> {
  const res = await apiClient<ApiResponse<ProfessionalProfile>>('/professionals/me/profile', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
  return res.data!;
}

export async function updateProfile(
  data: Partial<ProfessionalProfile>,
): Promise<ProfessionalProfile> {
  const res = await apiClient<ApiResponse<ProfessionalProfile>>('/professionals/me/profile', {
    method: 'PUT',
    body:   JSON.stringify(data),
  });
  return res.data!;
}

export async function updateSchedules(schedules: Schedule[]): Promise<void> {
  await apiClient<ApiResponse>('/professionals/me/schedules', {
    method: 'PUT',
    body:   JSON.stringify({ schedules }),
  });
}

export async function updateSpecialties(specialtyIds: number[]): Promise<void> {
  await apiClient<ApiResponse>('/professionals/me/specialties', {
    method: 'PUT',
    body:   JSON.stringify({ specialtyIds }),
  });
}
