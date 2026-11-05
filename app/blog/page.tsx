import Link from 'next/link'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { fetchPosts, formatPostDate, tagLabel } from '@/lib/api/posts.server'
import type { PostSummary } from '@/lib/types/api.types'

export const metadata: Metadata = {
  title: 'Blog — Mente Sana Saltillo',
  description:
    'Lecturas breves sobre salud mental, emociones y autocuidado, escritas para las personas de Saltillo.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — Mente Sana Saltillo',
    description: 'Lecturas breves sobre salud mental, emociones y autocuidado.',
    url: '/blog',
    type: 'website',
  },
}

type Props = { searchParams: Promise<{ page?: string; tag?: string }> }

// ─── Piezas ───────────────────────────────────────────────────────────────────

function Thumb({ post, size }: { post: PostSummary; size: 'lg' | 'sm' }) {
  const radius = size === 'lg' ? '1.75rem' : '1rem'
  if (!post.imagen_url) {
    return (
      <div
        aria-hidden
        className="aspect-square w-full flex items-center justify-center"
        style={{ borderRadius: radius, backgroundColor: 'var(--sage-light)' }}
      >
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: size === 'lg' ? '5rem' : '2.4rem', fontStyle: 'italic', color: 'var(--sage)' }}>
          {post.titulo.charAt(0)}
        </span>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.imagen_url}
      alt={post.imagen_alt ?? ''}
      loading={size === 'lg' ? 'eager' : 'lazy'}
      className="aspect-square w-full object-cover"
      style={{ borderRadius: radius, backgroundColor: 'var(--cream-alt)' }}
    />
  )
}

function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 md:gap-14 items-center rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--sage)]">
      <Thumb post={post} size="lg" />
      <div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--warm-mid)' }}>
          {formatPostDate(post.publicado_at)}
        </p>
        <h2
          className="mt-3 transition-colors group-hover:text-[var(--sage)]"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.015em' }}
        >
          {post.titulo}
        </h2>
        {post.resumen && (
          <p className="mt-5 max-w-[52ch]" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--warm-mid)' }}>
            {post.resumen}
          </p>
        )}
        <span
          className="mt-7 inline-block pb-0.5"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--terracotta)', borderBottom: '1.5px solid currentColor' }}
        >
          Leer completo
        </span>
      </div>
    </Link>
  )
}

function PostRow({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[8.5rem_minmax(0,1fr)] gap-5 sm:gap-6 items-start rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sage)]"
    >
      <Thumb post={post} size="sm" />
      <div className="pt-1">
        <h3
          className="transition-colors group-hover:text-[var(--sage)]"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.15 }}
        >
          {post.titulo}
        </h3>
        {post.resumen && (
          <p
            className="mt-2 line-clamp-2"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--warm-mid)' }}
          >
            {post.resumen}
          </p>
        )}
        <p className="mt-2.5" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)', opacity: 0.85 }}>
          {formatPostDate(post.publicado_at)}
        </p>
      </div>
    </Link>
  )
}

function pageHref(page: number, tag?: string) {
  const p = new URLSearchParams()
  if (tag) p.set('tag', tag)
  if (page > 1) p.set('page', String(page))
  const qs = p.toString()
  return qs ? `/blog?${qs}` : '/blog'
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function BlogPage({ searchParams }: Props) {
  await connection()
  const { page: rawPage, tag } = await searchParams
  const page = Math.max(1, Number(rawPage) || 1)

  let posts: PostSummary[] = []
  let totalPages = 1
  let failed = false
  try {
    const res = await fetchPosts({ page, tag, limit: 13 })
    posts = res.data
    totalPages = res.pagination.totalPages
  } catch {
    failed = true
  }

  const showFeatured = page === 1 && posts.length > 0
  const [featured, ...rest] = showFeatured ? posts : [undefined, ...posts]

  return (
    <div className="px-6 lg:px-16">
      <header className="max-w-6xl mx-auto pt-16 pb-12 lg:pt-24 lg:pb-16">
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.025em' }}>
          Para leer con calma
        </h1>
        <p className="mt-6 max-w-[58ch]" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1.1rem', lineHeight: 1.75, color: 'var(--warm-mid)' }}>
          Ideas breves sobre emociones, ansiedad, relaciones y autocuidado. Lo mismo que compartimos en Instagram y Facebook, con un poco más de espacio.
        </p>

        {tag && (
          <p className="mt-6" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', color: 'var(--foreground)' }}>
            Mostrando publicaciones sobre <strong style={{ fontWeight: 600 }}>{tagLabel(tag)}</strong>.{' '}
            <Link href="/blog" className="underline underline-offset-4" style={{ color: 'var(--sage)' }}>
              Ver todas
            </Link>
          </p>
        )}
      </header>

      <div className="max-w-6xl mx-auto pb-24">
        {failed && (
          <p className="rounded-2xl px-6 py-5" style={{ backgroundColor: 'var(--cream-alt)', fontFamily: 'var(--font-dm-sans)', color: 'var(--foreground)' }}>
            No pudimos cargar las publicaciones en este momento. Recarga la página en unos minutos.
          </p>
        )}

        {!failed && posts.length === 0 && (
          <div className="rounded-3xl px-8 py-14 text-center" style={{ backgroundColor: 'var(--cream-alt)' }}>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.9rem', fontStyle: 'italic' }}>
              {tag ? 'Aún no hay publicaciones con este tema.' : 'Pronto publicaremos la primera lectura.'}
            </p>
            <p className="mt-3" style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)' }}>
              Mientras tanto, puedes conocer a los especialistas de Saltillo.
            </p>
            <Link
              href="/especialistas"
              className="mt-7 inline-block rounded-full px-6 py-3 transition-colors hover:bg-[var(--terracotta-hover)]"
              style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}
            >
              Ver especialistas
            </Link>
          </div>
        )}

        {featured && <FeaturedPost post={featured} />}

        {rest.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-12 ${featured ? 'mt-20 pt-16' : ''}`}
               style={featured ? { borderTop: '1px solid var(--border)' } : undefined}>
            {rest.map((p) => p && <PostRow key={p.id} post={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Paginación" className="mt-20 flex items-center justify-between" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            {page > 1 ? (
              <Link href={pageHref(page - 1, tag)} className="underline underline-offset-4" style={{ color: 'var(--sage)' }}>
                Publicaciones más recientes
              </Link>
            ) : <span />}
            <span style={{ fontSize: '0.9rem', color: 'var(--warm-mid)' }}>
              Página {page} de {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={pageHref(page + 1, tag)} className="underline underline-offset-4" style={{ color: 'var(--sage)' }}>
                Publicaciones anteriores
              </Link>
            ) : <span />}
          </nav>
        )}
      </div>
    </div>
  )
}
