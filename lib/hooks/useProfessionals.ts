'use client';

import { useState, useEffect } from 'react';
import * as profApi from '../api/professionals.api';
import type {
  ProfessionalSummary,
  ProfessionalProfile,
  ProfessionalsFilter,
  Pagination,
} from '../types/api.types';

interface ProfessionalsState {
  professionals: ProfessionalSummary[];
  pagination:    Pagination | null;
  isLoading:     boolean;
  error:         string | null;
}

interface ProfessionalState {
  professional: ProfessionalProfile | null;
  isLoading:    boolean;
  error:        string | null;
}

export function useProfessionals(filters?: ProfessionalsFilter): ProfessionalsState {
  const [professionals, setProfessionals] = useState<ProfessionalSummary[]>([]);
  const [pagination, setPagination]       = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // JSON.stringify permite que useEffect detecte cambios en el objeto de filtros
  const filtersKey = JSON.stringify(filters ?? {});

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await profApi.getAll(filters);
        if (!cancelled) {
          setProfessionals(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar especialistas');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return { professionals, pagination, isLoading, error };
}

export function useProfessional(id: number | null): ProfessionalState {
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await profApi.getById(id);
        if (!cancelled) setProfessional(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { professional, isLoading, error };
}
