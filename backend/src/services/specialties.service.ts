import pool from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export async function getAll() {
  const { rows } = await pool.query('SELECT * FROM specialties ORDER BY nombre');
  return rows;
}

export async function create(nombre: string) {
  if (!nombre.trim()) throw new AppError('El nombre es requerido', 400);
  const { rows } = await pool.query(
    'INSERT INTO specialties (nombre) VALUES ($1) RETURNING *',
    [nombre.trim()],
  );
  return rows[0];
}

export async function remove(id: number) {
  const result = await pool.query('DELETE FROM specialties WHERE id = $1', [id]);
  if (!result.rowCount) throw new AppError('Especialidad no encontrada', 404);
}
