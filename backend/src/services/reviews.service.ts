import pool from '../config/database';
import { Review, ReviewStatus } from '../types';
import { AppError } from '../middlewares/error.middleware';

export async function getByProfessional(professionalId: number) {
  const { rows } = await pool.query(
    `SELECT r.id, r.calificacion, r.comentario, r.created_at,
            up.nombre, up.apellido
     FROM reviews r
     JOIN user_profiles up ON up.user_id = r.user_id
     WHERE r.professional_id = $1 AND r.estado = 'aprobado'
     ORDER BY r.created_at DESC`,
    [professionalId],
  );
  return rows;
}

export async function create(
  userId: number,
  professionalId: number,
  data: { calificacion: number; comentario?: string },
): Promise<Review> {
  // Doble verificación de rol (la primera capa es el middleware de ruta)
  const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (!userResult.rows[0] || userResult.rows[0].role !== 'usuario') {
    throw new AppError('Solo los usuarios registrados pueden dejar reseñas', 403);
  }

  // El profesional debe existir y estar aprobado
  const profResult = await pool.query(
    `SELECT id FROM professional_profiles
     WHERE id = $1 AND estado_verificacion = 'aprobado' AND is_active = true`,
    [professionalId],
  );
  if (!profResult.rows[0]) {
    throw new AppError('El especialista no existe o no está disponible', 404);
  }

  if (data.calificacion < 1 || data.calificacion > 5) {
    throw new AppError('La calificación debe estar entre 1 y 5', 400);
  }

  const existing = await pool.query(
    'SELECT id FROM reviews WHERE professional_id = $1 AND user_id = $2',
    [professionalId, userId],
  );
  if ((existing.rowCount ?? 0) > 0) {
    throw new AppError('Ya dejaste una reseña para este especialista', 409);
  }

  const { rows } = await pool.query(
    `INSERT INTO reviews (professional_id, user_id, calificacion, comentario)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [professionalId, userId, data.calificacion, data.comentario ?? null],
  );
  return rows[0];
}

export async function update(
  userId: number,
  reviewId: number,
  data: { calificacion?: number; comentario?: string },
): Promise<Review> {
  const current = await pool.query(
    'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
    [reviewId, userId],
  );
  if (!current.rows[0]) throw new AppError('Reseña no encontrada', 404);

  const prev = current.rows[0];

  // Guardar versión anterior en bitácora antes de modificar
  await pool.query(
    'INSERT INTO review_edits (review_id, comentario_anterior, calificacion_anterior) VALUES ($1, $2, $3)',
    [reviewId, prev.comentario, prev.calificacion],
  );

  const { rows } = await pool.query(
    `UPDATE reviews
     SET calificacion = COALESCE($1, calificacion),
         comentario   = COALESCE($2, comentario),
         estado       = 'pendiente'
     WHERE id = $3
     RETURNING *`,
    [data.calificacion ?? null, data.comentario ?? null, reviewId],
  );
  return rows[0];
}

// Solo el psicólogo dueño del perfil puede aprobar o rechazar reseñas
export async function updateStatus(
  reviewId: number,
  status: ReviewStatus,
  professionalId: number,
): Promise<Review> {
  const allowed: ReviewStatus[] = ['aprobado', 'rechazado'];
  if (!allowed.includes(status)) {
    throw new AppError('Estado inválido. Usa aprobado o rechazado', 400);
  }

  // Verificar que la reseña pertenece al perfil del psicólogo que hace la solicitud
  const current = await pool.query(
    'SELECT * FROM reviews WHERE id = $1 AND professional_id = $2',
    [reviewId, professionalId],
  );
  if (!current.rows[0]) {
    throw new AppError('Reseña no encontrada o no pertenece a tu perfil', 404);
  }

  const { rows } = await pool.query(
    'UPDATE reviews SET estado = $1 WHERE id = $2 RETURNING *',
    [status, reviewId],
  );
  return rows[0];
}
