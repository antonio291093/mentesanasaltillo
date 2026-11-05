// Lecturas del blog desde Server Components (SEO: el contenido llega renderizado).
// En Docker usa la red interna (API_INTERNAL_URL=http://backend:4000/api/v1).

import type { PaginatedApiResponse, Post, PostSummary, ApiResponse } from '@/lib/types/api.types'

function apiBase(): string {
  const internal = process.env.API_INTERNAL_URL
  if (internal) return internal.replace(/\/$/, '')
  const pub = process.env.NEXT_PUBLIC_API_URL
  if (pub) return pub.replace(/\/$/, '')
  return 'http://localhost:4000/api/v1'
}

export async function fetchPosts(
  opts: { page?: number; tag?: string; limit?: number } = {},
): Promise<PaginatedApiResponse<PostSummary>> {
  const params = new URLSearchParams()
  if (opts.page)  params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  if (opts.tag)   params.set('tag', opts.tag)

  const res = await fetch(`${apiBase()}/posts?${params}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`No se pudieron cargar las publicaciones (${res.status})`)
  return res.json()
}

export async function fetchPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${apiBase()}/posts/${encodeURIComponent(slug)}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`No se pudo cargar la publicación (${res.status})`)
  const json: ApiResponse<Post> = await res.json()
  return json.data ?? null
}

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

// Fecha en hora de Saltillo, sin depender del locale ICU del servidor
export function formatPostDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Monterrey', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date(iso))
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
  return `${get('day')} de ${MONTHS[get('month') - 1]} de ${get('year')}`
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, ' ')
}
