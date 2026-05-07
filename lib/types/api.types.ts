// Tipos que reflejan las respuestas reales de la API del backend.
// Actualizar aquí si cambia el schema de la base de datos.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole          = 'admin' | 'psicologo' | 'usuario';
export type Modality          = 'presencial' | 'online' | 'ambas';
export type VerificationStatus = 'pendiente' | 'aprobado' | 'rechazado';
export type ReviewStatus      = 'pendiente' | 'aprobado' | 'rechazado';
export type DayOfWeek         = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface User {
  id:         number;
  email:      string;
  role:       UserRole;
  is_active:  boolean;
  created_at: string;
  nombre:     string;
  apellido:   string;
  foto_url:   string | null;
  telefono:   string | null;
  ciudad:     string;
}

export interface AuthUser {
  id:       number;
  email:    string;
  role:     UserRole;
  nombre:   string;
  apellido: string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user:   AuthUser;
}

export interface Specialty {
  id:          number;
  nombre:      string;
  descripcion: string | null;
}

export interface Schedule {
  dia_semana:  DayOfWeek;
  hora_inicio: string;
  hora_fin:    string;
}

export interface Review {
  id:           number;
  calificacion: number;
  comentario:   string | null;
  created_at:   string;
  nombre:       string;
  apellido:     string;
  estado?:      ReviewStatus;
}

// Tarjeta en el listado público de profesionales
export interface ProfessionalSummary {
  id:                number;
  modalidad:         Modality;
  precio_sesion_min: number | null;
  precio_sesion_max: number | null;
  colonia:           string | null;
  ciudad:            string;
  created_at:        string;
  nombre:            string;
  apellido:          string;
  foto_url:          string | null;
  avg_rating:        number | null;
  review_count:      number;
  specialties:       string[];
}

// Perfil completo retornado por GET /professionals/:id
export interface ProfessionalProfile {
  id:                   number;
  user_id:              number;
  descripcion:          string | null;
  cedula_profesional:   string;
  cedula_especialidad:  string | null;
  titulo_url:           string | null;
  precio_sesion_min:    number | null;
  precio_sesion_max:    number | null;
  modalidad:            Modality;
  direccion:            string | null;
  colonia:              string | null;
  ciudad:               string;
  estado_verificacion:  VerificationStatus;
  motivo_rechazo:       string | null;
  is_active:            boolean;
  created_at:           string;
  nombre:               string;
  apellido:             string;
  perfil_foto:          string | null;
  specialties:          Array<{ id: number; nombre: string }>;
  schedules:            Schedule[];
  reviews:              Review[];
  avg_rating:           number | null;
  review_count:         number;
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface ProfessionalsFilter {
  especialidad?: number;
  modalidad?:    Modality;
  precio_max?:   number;
  ciudad?:       string;
  page?:         number;
  limit?:        number;
}

// ─── Respuestas de la API ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
  errors?: Array<{ campo: string; mensaje: string }>;
}

export interface Pagination {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> {
  success:    boolean;
  data:       T[];
  pagination: Pagination;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminProfessional {
  id:                  number;
  cedula_profesional:  string;
  cedula_especialidad: string | null;
  descripcion:         string | null;
  modalidad:           Modality;
  precio_sesion_min:   number | null;
  precio_sesion_max:   number | null;
  estado_verificacion: VerificationStatus;
  motivo_rechazo:      string | null;
  created_at:          string;
  nombre:              string;
  apellido:            string;
  email:               string;
}

export interface AdminReview {
  id:              number;
  calificacion:    number;
  comentario:      string | null;
  estado:          ReviewStatus;
  created_at:      string;
  usuario_nombre:  string;
  usuario_apellido: string;
  prof_nombre:     string;
  prof_apellido:   string;
}

export interface AdminStats {
  usuarios:                 Array<{ role: UserRole; total: number }>;
  profesionales:            Array<{ estado: VerificationStatus; total: number }>;
  reviews:                  Array<{ estado: ReviewStatus; total: number }>;
  profesionales_nuevos_mes: number;
}
