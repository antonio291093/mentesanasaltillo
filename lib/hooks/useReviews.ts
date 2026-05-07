'use client';

import { useState, useEffect } from 'react';
import * as profApi from '../api/professionals.api';
import type { Review } from '../types/api.types';

interface ReviewsState {
  reviews:   Review[];
  isLoading: boolean;
  error:     string | null;
}

// Las reviews aprobadas vienen embebidas en el perfil del profesional.
// Este hook obtiene el perfil completo y extrae solo las reviews.
export function useReviews(professionalId: number | null): ReviewsState {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) return;

    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await profApi.getById(professionalId);
        if (!cancelled) setReviews(profile.reviews ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar las reseñas');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [professionalId]);

  return { reviews, isLoading, error };
}
