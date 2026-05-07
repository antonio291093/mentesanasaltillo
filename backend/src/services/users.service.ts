import pool from '../config/database';
import { UpdateUserProfileDto, UserProfile } from '../types';
import { AppError } from '../middlewares/error.middleware';

export async function getUserWithProfile(userId: number) {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role, u.created_at, u.is_active,
            up.nombre, up.apellido, up.foto_url, up.telefono, up.ciudad
     FROM users u
     LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE u.id = $1`,
    [userId],
  );

  if (!rows[0]) throw new AppError('Usuario no encontrado', 404);
  return rows[0];
}

export async function updateUserProfile(
  userId: number,
  dto: UpdateUserProfileDto,
): Promise<UserProfile> {
  const fields = Object.keys(dto) as (keyof UpdateUserProfileDto)[];
  if (fields.length === 0) throw new AppError('No hay campos para actualizar', 400);

  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = fields.map((f) => dto[f]);

  const { rows } = await pool.query(
    `UPDATE user_profiles SET ${setClauses} WHERE user_id = $1 RETURNING *`,
    [userId, ...values],
  );

  if (!rows[0]) throw new AppError('Perfil no encontrado', 404);
  return rows[0];
}
