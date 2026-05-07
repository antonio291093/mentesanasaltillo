// Tipos derivados de database/schema.sql
// Actualizar aquí cuando cambie el schema de la base de datos.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole          = 'admin' | 'psicologo' | 'usuario';
export type Modality          = 'presencial' | 'online' | 'ambas';
export type VerificationStatus = 'pendiente' | 'aprobado' | 'rechazado';
export type DayOfWeek         = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type ReviewStatus      = 'pendiente' | 'aprobado' | 'rechazado';

// ─── Entidades de base de datos ───────────────────────────────────────────────

export interface User {
  id:            number;
  email:         string;
  password_hash: string;
  role:          UserRole;
  created_at:    Date;
  is_active:     boolean;
}

export interface UserProfile {
  id:         number;
  user_id:    number;
  nombre:     string;
  apellido:   string;
  foto_url:   string | null;
  telefono:   string | null;
  ciudad:     string;
  created_at: Date;
}

export interface ProfessionalProfile {
  id:                   number;
  user_id:              number;
  descripcion:          string | null;
  foto_url:             string | null;
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
  aprobado_por:         number | null;
  aprobado_at:          Date | null;
  is_active:            boolean;
  created_at:           Date;
  updated_at:           Date;
}

export interface Specialty {
  id:          number;
  nombre:      string;
  descripcion: string | null;
}

export interface ProfessionalSpecialty {
  id:              number;
  professional_id: number;
  specialty_id:    number;
}

export interface Schedule {
  id:              number;
  professional_id: number;
  dia_semana:      DayOfWeek;
  hora_inicio:     string;
  hora_fin:        string;
}

export interface Review {
  id:              number;
  professional_id: number;
  user_id:         number;
  calificacion:    number;
  comentario:      string | null;
  estado:          ReviewStatus;
  created_at:      Date;
  updated_at:      Date;
}

export interface ReviewEdit {
  id:                   number;
  review_id:            number;
  comentario_anterior:  string | null;
  calificacion_anterior: number;
  editado_at:           Date;
}

export interface ContactView {
  id:              number;
  user_id:         number;
  professional_id: number;
  viewed_at:       Date;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id:    number;
  email: string;
  role:  UserRole;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthUser {
  id:       number;
  email:    string;
  role:     UserRole;
  nombre:   string;
  apellido: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user:   AuthUser;
}

// ─── DTOs (cuerpos de request) ────────────────────────────────────────────────

export interface RegisterDto {
  email:    string;
  password: string;
  nombre:   string;
  apellido: string;
  role?:    UserRole;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface UpdateUserProfileDto {
  nombre?:   string;
  apellido?: string;
  foto_url?: string;
  telefono?: string;
  ciudad?:   string;
}

export interface CreateProfessionalDto {
  descripcion?:        string;
  cedula_profesional:  string;
  cedula_especialidad?: string;
  titulo_url?:         string;
  precio_sesion_min?:  number;
  precio_sesion_max?:  number;
  modalidad:           Modality;
  direccion?:          string;
  colonia?:            string;
  ciudad?:             string;
}

export type UpdateProfessionalDto = Partial<CreateProfessionalDto>;

export interface CreateReviewDto {
  professional_id: number;
  calificacion:    number;
  comentario?:     string;
}

export interface UpdateReviewDto {
  calificacion?: number;
  comentario?:   string;
}

export interface SetSchedulesDto {
  schedules: Array<{
    dia_semana:  DayOfWeek;
    hora_inicio: string;
    hora_fin:    string;
  }>;
}

export interface ProfessionalsFilter {
  especialidad?: number;
  modalidad?:    Modality;
  precio_max?:   number;
  ciudad?:       string;
  page?:         number;
  limit?:        number;
}

// ─── Respuestas de API ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  message?: string;
  error?:  string;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}
