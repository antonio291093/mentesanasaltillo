#!/usr/bin/env node
/**
 * MCP server de Mente Sana Saltillo.
 * Permite a Claude subir imágenes y crear, programar y editar publicaciones del blog.
 *
 * Variables de entorno:
 *   MENTESANA_API_KEY   (requerida) misma que CONTENT_API_KEY del backend
 *   MENTESANA_SITE_URL  (opcional)  default https://mentesanasaltillo.com
 *   MENTESANA_API_URL   (opcional)  default <SITE_URL>/api/v1
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const SITE_URL = (process.env.MENTESANA_SITE_URL ?? 'https://mentesanasaltillo.com').replace(/\/$/, '');
const API_URL  = (process.env.MENTESANA_API_URL ?? `${SITE_URL}/api/v1`).replace(/\/$/, '');
const API_KEY  = process.env.MENTESANA_API_KEY ?? '';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

if (!API_KEY) {
  console.error('Falta MENTESANA_API_KEY en el entorno del MCP server.');
  process.exit(1);
}

// ─── Cliente de la API ────────────────────────────────────────────────────────

interface Post {
  id: number;
  slug: string;
  titulo: string;
  resumen: string | null;
  contenido?: string;
  imagen_url: string | null;
  imagen_alt: string | null;
  tags: string[];
  estado: 'borrador' | 'publicado';
  publicado_at: string | null;
  programado?: boolean;
}

async function api<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('x-api-key', API_KEY);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const res  = await fetch(`${API_URL}${endpoint}`, { ...init, headers });
  const body = await res.json().catch(() => ({})) as { success?: boolean; data?: T; error?: string };
  if (!res.ok || body.success === false) {
    throw new Error(body.error ?? `La API respondió ${res.status} ${res.statusText}`);
  }
  return body.data as T;
}

function postUrl(p: Post) {
  return `${SITE_URL}/blog/${p.slug}`;
}

function describe(p: Post): string {
  const estado =
    p.estado === 'borrador' ? 'borrador (no visible en el sitio)'
    : p.programado          ? `programado para ${p.publicado_at}`
    :                         `publicado (${p.publicado_at})`;
  return [
    `#${p.id} — ${p.titulo}`,
    `Estado: ${estado}`,
    `URL: ${postUrl(p)}`,
    p.imagen_url ? `Imagen: ${p.imagen_url}` : 'Imagen: (sin imagen)',
    p.tags.length ? `Tags: ${p.tags.join(', ')}` : null,
  ].filter(Boolean).join('\n');
}

const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });
const fail = (err: unknown) => ({
  content: [{ type: 'text' as const, text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
  isError: true,
});

// ─── Esquemas compartidos ─────────────────────────────────────────────────────

const fechaISO = z
  .string()
  .describe(
    'Fecha y hora ISO 8601 con zona horaria, p. ej. 2026-11-12T19:00:00-06:00 (hora de Saltillo). ' +
    'Si es futura, el post queda programado y aparece en el sitio a esa hora.',
  );

const postFields = {
  titulo:     z.string().min(1).max(200).describe('Título del artículo'),
  contenido:  z.string().min(1).describe(
    'Cuerpo del artículo en Markdown (## subtítulos, listas, **negritas**, > citas). ' +
    'Para la web conviene una versión más amplia que el copy de Instagram, sin hashtags.',
  ),
  resumen:    z.string().max(500).optional().describe('1–2 frases para el listado y para SEO (meta description)'),
  imagen_url: z.string().url().optional().describe('URL pública de la imagen; usa upload_image para obtenerla'),
  imagen_alt: z.string().max(300).optional().describe('Texto alternativo que describe la imagen'),
  tags:       z.array(z.string()).max(12).optional().describe('Temas, p. ej. ["ansiedad", "autocuidado"]'),
  slug:       z.string().max(100).optional().describe('Slug de la URL; se genera del título si se omite'),
};

// ─── Servidor ─────────────────────────────────────────────────────────────────

const server = new McpServer({ name: 'mentesana', version: '1.0.0' });

server.registerTool(
  'upload_image',
  {
    title: 'Subir imagen',
    description:
      'Sube una imagen (JPG, PNG, WEBP o GIF, máx. 8 MB) al servidor de mentesanasaltillo.com y devuelve su URL pública. ' +
      'Esa URL sirve para imagen_url del blog y también para programar el post en Instagram/Facebook con Metricool o Buffer. ' +
      'Indica file_path (ruta local) o url (imagen ya publicada en otra parte).',
    inputSchema: {
      file_path: z.string().optional().describe('Ruta local de la imagen, p. ej. C:\\Users\\antonio\\Downloads\\post.png'),
      url:       z.string().url().optional().describe('URL de una imagen para descargarla y alojarla en el sitio'),
      nombre:    z.string().optional().describe('Nombre descriptivo para el archivo, p. ej. "ansiedad-respiracion"'),
    },
    annotations: { destructiveHint: false, openWorldHint: true },
  },
  async ({ file_path, url, nombre }) => {
    try {
      if (!file_path === !url) throw new Error('Indica exactamente uno: file_path o url');

      let bytes: Buffer;
      let filename: string;
      if (file_path) {
        const info = await stat(file_path);
        if (info.size > MAX_IMAGE_BYTES) throw new Error('La imagen excede 8 MB');
        bytes = await readFile(file_path);
        filename = path.basename(file_path);
      } else {
        const res = await fetch(url!);
        if (!res.ok) throw new Error(`No se pudo descargar la imagen (${res.status})`);
        const len = Number(res.headers.get('content-length') ?? 0);
        if (len > MAX_IMAGE_BYTES) throw new Error('La imagen excede 8 MB');
        bytes = Buffer.from(await res.arrayBuffer());
        if (bytes.length > MAX_IMAGE_BYTES) throw new Error('La imagen excede 8 MB');
        filename = path.basename(new URL(url!).pathname) || 'imagen';
      }
      if (nombre) filename = `${nombre}${path.extname(filename)}`;

      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(bytes)]), filename);
      const data = await api<{ url: string; bytes: number }>('/uploads', { method: 'POST', body: form });

      return text(`Imagen subida: ${data.url}\n(${Math.round(data.bytes / 1024)} KB)`);
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'create_post',
  {
    title: 'Crear publicación del blog',
    description:
      'Crea un artículo en mentesanasaltillo.com/blog. Por defecto queda como borrador; ' +
      "usa estado 'publicado' solo cuando el usuario pida publicarlo, y publicado_at futuro para programarlo.",
    inputSchema: {
      ...postFields,
      estado:       z.enum(['borrador', 'publicado']).default('borrador'),
      publicado_at: fechaISO.optional(),
    },
    annotations: { destructiveHint: false, openWorldHint: true },
  },
  async (input) => {
    try {
      const post = await api<Post>('/posts', { method: 'POST', body: JSON.stringify(input) });
      return text(`Publicación creada.\n${describe(post)}`);
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'update_post',
  {
    title: 'Editar publicación del blog',
    description:
      'Modifica una publicación existente por id. Solo se cambian los campos enviados. ' +
      "Sirve para publicar un borrador (estado 'publicado'), reprogramarlo (publicado_at) o despublicarlo (estado 'borrador').",
    inputSchema: {
      id:           z.number().int().positive().describe('ID de la publicación (lo da list_posts)'),
      titulo:       postFields.titulo.optional(),
      contenido:    postFields.contenido.optional(),
      resumen:      postFields.resumen,
      imagen_url:   postFields.imagen_url,
      imagen_alt:   postFields.imagen_alt,
      tags:         postFields.tags,
      slug:         postFields.slug,
      estado:       z.enum(['borrador', 'publicado']).optional(),
      publicado_at: fechaISO.optional(),
    },
    annotations: { destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  async ({ id, ...changes }) => {
    try {
      const post = await api<Post>(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      return text(`Publicación actualizada.\n${describe(post)}`);
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'list_posts',
  {
    title: 'Listar publicaciones',
    description: 'Lista las publicaciones del blog (borradores, programadas y publicadas), de la más reciente a la más antigua.',
    inputSchema: {
      estado: z.enum(['borrador', 'publicado']).optional().describe('Filtrar por estado'),
      buscar: z.string().optional().describe('Texto a buscar en título o slug'),
      limit:  z.number().int().min(1).max(100).default(20),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ estado, buscar, limit }) => {
    try {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (estado) qs.set('estado', estado);
      if (buscar) qs.set('q', buscar);
      const posts = await api<Post[]>(`/posts/manage?${qs}`);
      if (!posts.length) return text('No hay publicaciones con esos filtros.');
      return text(posts.map(describe).join('\n\n'));
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'get_post',
  {
    title: 'Ver publicación',
    description: 'Devuelve una publicación completa por id, incluido su contenido en Markdown.',
    inputSchema: { id: z.number().int().positive() },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ id }) => {
    try {
      const post = await api<Post>(`/posts/manage/${id}`);
      return text(`${describe(post)}\n\nResumen: ${post.resumen ?? '(sin resumen)'}\n\n---\n${post.contenido ?? ''}`);
    } catch (err) {
      return fail(err);
    }
  },
);

await server.connect(new StdioServerTransport());
console.error(`MCP Mente Sana conectado a ${API_URL}`);
