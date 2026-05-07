import pool from '../config/database';
import {
  ProfessionalProfile,
  CreateProfessionalDto,
  UpdateProfessionalDto,
  ProfessionalsFilter,
  SetSchedulesDto,
} from '../types';
import { AppError } from '../middlewares/error.middleware';

export async function getProfessionals(filter: ProfessionalsFilter = {}) {
  const { especialidad, modalidad, precio_max, ciudad = 'Saltillo', page = 1, limit = 12 } = filter;
  const offset = (page - 1) * limit;

  const conditions: string[] = [
    "pp.estado_verificacion = 'aprobado'",
    'pp.is_active = true',
    'pp.ciudad ILIKE $1',
  ];
  const params: unknown[] = [ciudad];

  if (modalidad) {
    params.push(modalidad);
    conditions.push(`(pp.modalidad = $${params.length} OR pp.modalidad = 'ambas')`);
  }

  if (precio_max) {
    params.push(precio_max);
    conditions.push(`(pp.precio_sesion_min IS NULL OR pp.precio_sesion_min <= $${params.length})`);
  }

  if (especialidad) {
    params.push(especialidad);
    conditions.push(
      `EXISTS (SELECT 1 FROM professional_specialties ps WHERE ps.professional_id = pp.id AND ps.specialty_id = $${params.length})`,
    );
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM professional_profiles pp WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT pp.id, pp.modalidad, pp.precio_sesion_min, pp.precio_sesion_max,
            pp.colonia, pp.ciudad, pp.created_at,
            up.nombre, up.apellido, up.foto_url,
            ROUND(AVG(r.calificacion)::numeric, 1) AS avg_rating,
            COUNT(DISTINCT r.id)::int AS review_count,
            COALESCE(json_agg(DISTINCT s.nombre) FILTER (WHERE s.id IS NOT NULL), '[]') AS specialties
     FROM professional_profiles pp
     JOIN user_profiles up ON up.user_id = pp.user_id
     LEFT JOIN professional_specialties ps ON ps.professional_id = pp.id
     LEFT JOIN specialties s ON s.id = ps.specialty_id
     LEFT JOIN reviews r ON r.professional_id = pp.id AND r.estado = 'aprobado'
     WHERE ${where}
     GROUP BY pp.id, up.nombre, up.apellido, up.foto_url
     ORDER BY pp.aprobado_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProfessionalById(id: number) {
  const { rows } = await pool.query(
    `SELECT pp.*,
            up.nombre, up.apellido, up.foto_url AS perfil_foto,
            COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'nombre', s.nombre))
                     FILTER (WHERE s.id IS NOT NULL), '[]') AS specialties,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
              'dia_semana', sch.dia_semana,
              'hora_inicio', sch.hora_inicio::text,
              'hora_fin',    sch.hora_fin::text))
                     FILTER (WHERE sch.id IS NOT NULL), '[]') AS schedules,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
              'id',          r.id,
              'calificacion', r.calificacion,
              'comentario',  r.comentario,
              'created_at',  r.created_at,
              'nombre',      reviewer.nombre,
              'apellido',    reviewer.apellido))
                     FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews,
            ROUND(AVG(r.calificacion)::numeric, 1) AS avg_rating,
            COUNT(DISTINCT r.id)::int AS review_count
     FROM professional_profiles pp
     JOIN user_profiles up ON up.user_id = pp.user_id
     LEFT JOIN professional_specialties ps ON ps.professional_id = pp.id
     LEFT JOIN specialties s ON s.id = ps.specialty_id
     LEFT JOIN schedules sch ON sch.professional_id = pp.id
     LEFT JOIN reviews r ON r.professional_id = pp.id AND r.estado = 'aprobado'
     LEFT JOIN user_profiles reviewer ON reviewer.user_id = r.user_id
     WHERE pp.id = $1 AND pp.estado_verificacion = 'aprobado' AND pp.is_active = true
     GROUP BY pp.id, up.nombre, up.apellido, up.foto_url`,
    [id],
  );

  if (!rows[0]) throw new AppError('Especialista no encontrado', 404);
  return rows[0];
}

export async function createProfessionalProfile(
  userId: number,
  dto: CreateProfessionalDto,
): Promise<ProfessionalProfile> {
  // Verificar que el usuario existe y tiene rol psicologo
  const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (!userResult.rows[0] || userResult.rows[0].role !== 'psicologo') {
    throw new AppError('Solo los psicólogos pueden crear un perfil profesional', 403);
  }

  const existing = await pool.query(
    'SELECT id FROM professional_profiles WHERE user_id = $1',
    [userId],
  );
  if ((existing.rowCount ?? 0) > 0) {
    throw new AppError('Ya existe un perfil profesional para este usuario', 409);
  }

  const { rows } = await pool.query(
    `INSERT INTO professional_profiles
       (user_id, descripcion, cedula_profesional, cedula_especialidad, titulo_url,
        precio_sesion_min, precio_sesion_max, modalidad, direccion, colonia, ciudad)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      userId,
      dto.descripcion ?? null,
      dto.cedula_profesional,
      dto.cedula_especialidad ?? null,
      dto.titulo_url ?? null,
      dto.precio_sesion_min ?? null,
      dto.precio_sesion_max ?? null,
      dto.modalidad,
      dto.direccion ?? null,
      dto.colonia ?? null,
      dto.ciudad ?? 'Saltillo',
    ],
  );
  return rows[0];
}

export async function updateProfessionalProfile(
  userId: number,
  dto: UpdateProfessionalDto,
): Promise<ProfessionalProfile> {
  const fields = Object.keys(dto) as (keyof UpdateProfessionalDto)[];
  if (fields.length === 0) throw new AppError('No hay campos para actualizar', 400);

  const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const values = fields.map((f) => dto[f]);

  const { rows } = await pool.query(
    `UPDATE professional_profiles SET ${setClauses} WHERE user_id = $1 RETURNING *`,
    [userId, ...values],
  );

  if (!rows[0]) throw new AppError('Perfil profesional no encontrado', 404);
  return rows[0];
}

export async function addSpecialty(professionalId: number, specialtyId: number) {
  await pool.query(
    'INSERT INTO professional_specialties (professional_id, specialty_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [professionalId, specialtyId],
  );
}

// Versión batch: asigna múltiples especialidades en una sola operación
export async function addSpecialties(professionalId: number, specialtyIds: number[]) {
  if (!specialtyIds.length) return;
  const placeholders = specialtyIds.map((_, i) => `($1, $${i + 2})`).join(', ');
  await pool.query(
    `INSERT INTO professional_specialties (professional_id, specialty_id) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
    [professionalId, ...specialtyIds],
  );
}

export async function removeSpecialty(professionalId: number, specialtyId: number) {
  await pool.query(
    'DELETE FROM professional_specialties WHERE professional_id = $1 AND specialty_id = $2',
    [professionalId, specialtyId],
  );
}

export async function setSchedules(professionalId: number, dto: SetSchedulesDto) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM schedules WHERE professional_id = $1', [professionalId]);

    for (const s of dto.schedules) {
      await client.query(
        'INSERT INTO schedules (professional_id, dia_semana, hora_inicio, hora_fin) VALUES ($1,$2,$3,$4)',
        [professionalId, s.dia_semana, s.hora_inicio, s.hora_fin],
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getMyProfile(userId: number) {
  const { rows } = await pool.query(
    `SELECT pp.*,
            up.nombre, up.apellido, up.foto_url AS perfil_foto,
            COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'nombre', s.nombre))
                     FILTER (WHERE s.id IS NOT NULL), '[]') AS specialties,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
              'dia_semana',  sch.dia_semana,
              'hora_inicio', sch.hora_inicio::text,
              'hora_fin',    sch.hora_fin::text))
                     FILTER (WHERE sch.id IS NOT NULL), '[]') AS schedules,
            COALESCE(json_agg(DISTINCT jsonb_build_object(
              'id',           r.id,
              'calificacion', r.calificacion,
              'comentario',   r.comentario,
              'created_at',   r.created_at,
              'nombre',       reviewer.nombre,
              'apellido',     reviewer.apellido,
              'estado',       r.estado))
                     FILTER (WHERE r.id IS NOT NULL), '[]') AS reviews,
            ROUND(AVG(CASE WHEN r.estado = 'aprobado' THEN r.calificacion END)::numeric, 1) AS avg_rating,
            COUNT(DISTINCT CASE WHEN r.estado = 'aprobado' THEN r.id END)::int AS review_count
     FROM professional_profiles pp
     JOIN user_profiles up ON up.user_id = pp.user_id
     LEFT JOIN professional_specialties ps ON ps.professional_id = pp.id
     LEFT JOIN specialties s ON s.id = ps.specialty_id
     LEFT JOIN schedules sch ON sch.professional_id = pp.id
     LEFT JOIN reviews r ON r.professional_id = pp.id
     LEFT JOIN user_profiles reviewer ON reviewer.user_id = r.user_id
     WHERE pp.user_id = $1
     GROUP BY pp.id, up.nombre, up.apellido, up.foto_url`,
    [userId],
  );
  if (!rows[0]) throw new AppError('Perfil profesional no encontrado', 404);
  return rows[0];
}
