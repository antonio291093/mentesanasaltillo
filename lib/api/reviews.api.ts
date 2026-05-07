import { apiClient } from './client';
import type { ApiResponse, Review, ReviewStatus } from '../types/api.types';

export async function create(data: {
  professional_id: number;
  calificacion:    number;
  comentario?:     string;
}): Promise<Review> {
  const res = await apiClient<ApiResponse<Review>>('/reviews', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
  return res.data!;
}

export async function update(
  id:   number,
  data: { calificacion?: number; comentario?: string },
): Promise<Review> {
  const res = await apiClient<ApiResponse<Review>>(`/reviews/${id}`, {
    method: 'PUT',
    body:   JSON.stringify(data),
  });
  return res.data!;
}

export async function updateStatus(
  id:     number,
  status: ReviewStatus,
): Promise<Review> {
  const res = await apiClient<ApiResponse<Review>>(`/reviews/${id}/status`, {
    method: 'PUT',
    body:   JSON.stringify({ status }),
  });
  return res.data!;
}
