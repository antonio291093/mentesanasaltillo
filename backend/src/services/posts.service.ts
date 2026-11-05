import pool from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { CreatePostDto, Post, PostStatus, UpdatePostDto } from '../types';

const LIST_COLUMNS = `
  id, slug, titulo, resumen, imagen_url, imagen_alt, tags, estado,
  publicado_at, created_at, updated_at
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '');
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  const root = base || 'publicacion';
  let candidate = root;
  for (let i = 2; i < 100; i++) {
    const { rowCount } = await pool.query(
      'SELECT 1 FROM posts WHERE slug = $1 AND ($2::int IS NULL OR id <> $2)',
      [candidate, excludeId ?? null],
    );
    if (!rowCount) return candidate;
    candidate = `${root}-${i}`;
  }
  throw new AppError('No se pudo generar un slug único', 409);
}

function cleanText(value: unknown, field: string, max: number, required = false): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) throw new AppError(`El campo ${field} es requerido`, 400);
    return null;
  }
  if (typeof value !== 'string') throw new AppError(`El campo ${field} debe ser texto`, 400);
  const v = value.trim();
  if (required && !v) throw new AppError(`El campo ${field} es requerido`, 400);
  if (v.length > max) throw new AppError(`El campo ${field} excede ${max} caracteres`, 400);
  return v || null;
}

function cleanUrl(value: unknown): string | null {
  const v = cleanText(value, 'imagen_url', 2000);
  if (v && !/^https?:\/\//i.test(v)) {
    throw new AppError('imagen_url debe ser una URL http(s)', 400);
  }
  return v;
}

function cleanTags(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new AppError('tags debe ser una lista', 400);
  const tags = value
    .map((t) => (typeof t === 'string' ? slugify(t.replace(/^#/, '')) : ''))
    .filter(Boolean);
  const unique = [...new Set(tags)];
  if (unique.length > 12) throw new AppError('Máximo 12 tags por publicación', 400);
  return unique.map((t) => t.slice(0, 40));
}

function cleanStatus(value: unknown): PostStatus | undefined {
  if (value === undefined) return undefined;
  if (value !== 'borrador' && value !== 'publicado') {
    throw new AppError("estado debe ser 'borrador' o 'publicado'", 400);
  }
  return value;
}

function cleanDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new AppError('publicado_at debe ser una fecha ISO 8601', 400);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new AppError('publicado_at no es una fecha válida', 400);
  return d;
}

function withSchedule<T extends { estado: PostStatus; publicado_at: Date | null }>(row: T) {
  const programado =
    row.estado === 'publicado' && !!row.publicado_at && new Date(row.publicado_at) > new Date();
  return { ...row, programado };
}

// ─── Público ──────────────────────────────────────────────────────────────────

export async function listPublished(opts: { page?: number; limit?: number; tag?: string }) {
  const page  = Math.max(1, Math.floor(opts.page ?? 1));
  const limit = Math.min(50, Math.max(1, Math.floor(opts.limit ?? 12)));
  const tag   = opts.tag ? slugify(opts.tag) : null;

  const where = `
    estado = 'publicado' AND publicado_at <= NOW()
    AND ($1::text IS NULL OR $1 = ANY(tags))
  `;

  const [{ rows }, count] = await Promise.all([
    pool.query(
      `SELECT ${LIST_COLUMNS} FROM posts WHERE ${where}
       ORDER BY publicado_at DESC LIMIT $2 OFFSET $3`,
      [tag, limit, (page - 1) * limit],
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM posts WHERE ${where}`, [tag]),
  ]);

  const total = count.rows[0].total as number;
  return {
    posts: rows,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getPublishedBySlug(slug: string) {
  const { rows } = await pool.query(
    `SELECT * FROM posts
     WHERE slug = $1 AND estado = 'publicado' AND publicado_at <= NOW()`,
    [slug],
  );
  if (!rows[0]) throw new AppError('Publicación no encontrada', 404);
  return rows[0] as Post;
}

// ─── Gestión (API key / admin) ────────────────────────────────────────────────

export async function listAll(opts: { estado?: string; limit?: number; q?: string }) {
  const estado = opts.estado ? cleanStatus(opts.estado) : null;
  const limit  = Math.min(100, Math.max(1, Math.floor(opts.limit ?? 20)));
  const q      = opts.q?.trim() ? `%${opts.q.trim()}%` : null;

  const { rows } = await pool.query(
    `SELECT ${LIST_COLUMNS} FROM posts
     WHERE ($1::post_estado IS NULL OR estado = $1)
       AND ($2::text IS NULL OR titulo ILIKE $2 OR slug ILIKE $2)
     ORDER BY COALESCE(publicado_at, created_at) DESC
     LIMIT $3`,
    [estado, q, limit],
  );
  return rows.map(withSchedule);
}

export async function getById(id: number) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError('Publicación no encontrada', 404);
  return withSchedule(rows[0] as Post);
}

export async function create(dto: CreatePostDto) {
  const titulo    = cleanText(dto.titulo, 'titulo', 200, true)!;
  const contenido = cleanText(dto.contenido, 'contenido', 100_000, true)!;
  const estado    = cleanStatus(dto.estado) ?? 'borrador';
  let fecha       = cleanDate(dto.publicado_at) ?? null;
  if (estado === 'publicado' && !fecha) fecha = new Date();

  const slug = await uniqueSlug(slugify(dto.slug?.trim() || titulo));

  const { rows } = await pool.query(
    `INSERT INTO posts
       (slug, titulo, resumen, contenido, imagen_url, imagen_alt, tags, estado, publicado_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      slug,
      titulo,
      cleanText(dto.resumen, 'resumen', 500),
      contenido,
      cleanUrl(dto.imagen_url),
      cleanText(dto.imagen_alt, 'imagen_alt', 300),
      cleanTags(dto.tags),
      estado,
      fecha,
    ],
  );
  return withSchedule(rows[0] as Post);
}

export async function update(id: number, dto: UpdatePostDto) {
  const current = await getById(id);

  const sets: string[] = [];
  const values: unknown[] = [];
  const set = (col: string, val: unknown) => {
    values.push(val);
    sets.push(`${col} = $${values.length}`);
  };

  if (dto.titulo !== undefined)     set('titulo', cleanText(dto.titulo, 'titulo', 200, true));
  if (dto.contenido !== undefined)  set('contenido', cleanText(dto.contenido, 'contenido', 100_000, true));
  if (dto.resumen !== undefined)    set('resumen', cleanText(dto.resumen, 'resumen', 500));
  if (dto.imagen_url !== undefined) set('imagen_url', cleanUrl(dto.imagen_url));
  if (dto.imagen_alt !== undefined) set('imagen_alt', cleanText(dto.imagen_alt, 'imagen_alt', 300));
  if (dto.tags !== undefined)       set('tags', cleanTags(dto.tags));
  if (dto.slug !== undefined && dto.slug.trim()) {
    set('slug', await uniqueSlug(slugify(dto.slug), id));
  }

  const estado = cleanStatus(dto.estado) ?? current.estado;
  let fecha    = cleanDate(dto.publicado_at);
  if (estado === 'publicado' && fecha === null) {
    throw new AppError('Un post publicado necesita publicado_at', 400);
  }
  // Al pasar a publicado sin fecha: publicar ahora
  if (estado === 'publicado' && fecha === undefined && !current.publicado_at) fecha = new Date();

  if (dto.estado !== undefined) set('estado', estado);
  if (fecha !== undefined)      set('publicado_at', fecha);

  if (!sets.length) return current;

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE posts SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  return withSchedule(rows[0] as Post);
}

export async function remove(id: number) {
  const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  if (!result.rowCount) throw new AppError('Publicación no encontrada', 404);
}
