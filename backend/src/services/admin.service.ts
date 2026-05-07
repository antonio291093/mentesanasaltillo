import pool from '../config/database';
import { VerificationStatus, ReviewStatus } from '../types';
import { AppError } from '../middlewares/error.middleware';
import { sendProfessionalApproved, sendProfessionalRejected } from './email.service';

export async function getPendingProfessionals() {
  return getProfessionalsByStatus('pendiente');
}

export async function getProfessionalsByStatus(status?: VerificationStatus) {
  const hasFilter = status !== undefined;
  const where     = hasFilter ? 'WHERE pp.estado_verificacion = $1' : '';
  const params    = hasFilter ? [status] : [];

  const { rows } = await pool.query(
    `SELECT pp.id, pp.cedula_profesional, pp.cedula_especialidad,
            pp.descripcion, pp.modalidad,
            pp.precio_sesion_min, pp.precio_sesion_max,
            pp.estado_verificacion, pp.motivo_rechazo, pp.created_at,
            up.nombre, up.apellido, u.email
     FROM professional_profiles pp
     JOIN users u          ON u.id        = pp.user_id
     JOIN user_profiles up ON up.user_id  = pp.user_id
     ${where}
     ORDER BY pp.created_at DESC`,
    params,
  );
  return rows;
}

export async function verifyProfessional(
  professionalId: number,
  status: VerificationStatus,
  adminUserId: number,
  motivo?: string,
) {
  const allowed: VerificationStatus[] = ['aprobado', 'rechazado', 'pendiente'];
  if (!allowed.includes(status)) {
    throw new AppError('Estado inválido', 400);
  }
  if (status === 'rechazado' && !motivo?.trim()) {
    throw new AppError('El motivo es obligatorio para rechazar un perfil', 400);
  }

  const aprobadoAt = status === 'aprobado' ? new Date() : null;
  const finalMotivo = status === 'pendiente' ? null : (motivo ?? null);

  const { rows } = await pool.query(
    `UPDATE professional_profiles
     SET estado_verificacion = $1,
         aprobado_por        = $2,
         aprobado_at         = $3,
         motivo_rechazo      = $4
     WHERE id = $5
     RETURNING *`,
    [status, adminUserId, aprobadoAt, finalMotivo, professionalId],
  );
  if (!rows[0]) throw new AppError('Perfil profesional no encontrado', 404);

  // Notificar al profesional por email
  const { rows: userRows } = await pool.query(
    `SELECT u.email, up.nombre
     FROM users u JOIN user_profiles up ON up.user_id = u.id
     WHERE u.id = $1`,
    [rows[0].user_id],
  );
  if (userRows[0]) {
    const { email, nombre } = userRows[0];
    if (status === 'aprobado') {
      sendProfessionalApproved(email, nombre).catch(
        (err) => console.error('[Email] sendProfessionalApproved error:', err),
      );
    } else if (status === 'rechazado') {
      sendProfessionalRejected(email, nombre, motivo!).catch(
        (err) => console.error('[Email] sendProfessionalRejected error:', err),
      );
    }
  }

  return rows[0];
}

export async function getAllReviews(estado?: ReviewStatus) {
  const validStatuses: ReviewStatus[] = ['pendiente', 'aprobado', 'rechazado'];
  if (estado && !validStatuses.includes(estado)) {
    throw new AppError('Filtro de estado inválido', 400);
  }

  const conditions = estado ? 'WHERE r.estado = $1' : '';
  const params     = estado ? [estado] : [];

  const { rows } = await pool.query(
    `SELECT r.id, r.calificacion, r.comentario, r.estado, r.created_at,
            up.nombre       AS usuario_nombre,
            up.apellido     AS usuario_apellido,
            prof_up.nombre  AS prof_nombre,
            prof_up.apellido AS prof_apellido
     FROM reviews r
     JOIN user_profiles up       ON up.user_id      = r.user_id
     JOIN professional_profiles pp ON pp.id          = r.professional_id
     JOIN user_profiles prof_up  ON prof_up.user_id  = pp.user_id
     ${conditions}
     ORDER BY r.created_at DESC`,
    params,
  );
  return rows;
}

export async function getStats() {
  const [usersByRole, profsByStatus, reviewsByStatus, newProfessionals] = await Promise.all([
    pool.query(
      `SELECT role, COUNT(*)::int AS total
       FROM users GROUP BY role ORDER BY role`,
    ),
    pool.query(
      `SELECT estado_verificacion AS estado, COUNT(*)::int AS total
       FROM professional_profiles GROUP BY estado_verificacion ORDER BY estado`,
    ),
    pool.query(
      `SELECT estado, COUNT(*)::int AS total
       FROM reviews GROUP BY estado ORDER BY estado`,
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM professional_profiles
       WHERE created_at >= DATE_TRUNC('month', NOW())`,
    ),
  ]);

  return {
    usuarios:                 usersByRole.rows,
    profesionales:            profsByStatus.rows,
    reviews:                  reviewsByStatus.rows,
    profesionales_nuevos_mes: newProfessionals.rows[0].total,
  };
}
