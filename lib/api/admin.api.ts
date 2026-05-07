import { apiClient } from './client';
import type {
  ApiResponse,
  AdminProfessional,
  AdminReview,
  AdminStats,
  ReviewStatus,
  User,
  VerificationStatus,
} from '../types/api.types';

export async function getProfessionals(status?: VerificationStatus): Promise<AdminProfessional[]> {
  const query = status ? `?estado=${status}` : '';
  const res = await apiClient<ApiResponse<AdminProfessional[]>>(`/admin/professionals${query}`);
  return res.data!;
}

export async function getPendingProfessionals(): Promise<AdminProfessional[]> {
  return getProfessionals('pendiente');
}

export async function verifyProfessional(
  id:      number,
  status:  VerificationStatus,
  motivo?: string,
): Promise<AdminProfessional> {
  const res = await apiClient<ApiResponse<AdminProfessional>>(
    `/admin/professionals/${id}/verify`,
    {
      method: 'PUT',
      body:   JSON.stringify({ status, motivo }),
    },
  );
  return res.data!;
}

export async function getAllReviews(estado?: ReviewStatus): Promise<AdminReview[]> {
  const query = estado ? `?estado=${estado}` : '';
  const res = await apiClient<ApiResponse<AdminReview[]>>(`/admin/reviews${query}`);
  return res.data!;
}

export async function getStats(): Promise<AdminStats> {
  const res = await apiClient<ApiResponse<AdminStats>>('/admin/stats');
  return res.data!;
}

export async function getUsers(): Promise<User[]> {
  const res = await apiClient<ApiResponse<User[]>>('/admin/users');
  return res.data!;
}

export async function toggleUserActive(id: number): Promise<Pick<User, 'id' | 'email' | 'is_active'>> {
  const res = await apiClient<ApiResponse<Pick<User, 'id' | 'email' | 'is_active'>>>(
    `/admin/users/${id}/toggle-active`,
    { method: 'PATCH' },
  );
  return res.data!;
}
