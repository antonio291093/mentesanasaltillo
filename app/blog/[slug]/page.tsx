import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fetchPost, formatPostDate, tagLabel } from '@/lib/api/posts.server'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection()
  const { slug } = await params
  const post = await fetchPost(slug).catch(() => null)
  if (!post) return { title: 'Publicación no encontrada — Mente Sana Saltillo' }

  const description = post.resumen ?? post.contenido.replace(/[#*_>`\[\]()]/g, '').slice(0, 160)
  return {
    title: `${post.titulo} — Mente Sana Saltillo`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.titulo,
      description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publicado_at,
      modifiedTime: post.updated_at,
      tags: post.tags,
      ...(post.imagen_url ? { images: [{ url: post.imagen_url, alt: post.imagen_alt ?? post.titulo }] } : {}),
    },
    twitter: {
      card: post.imagen_url ? 'summary_large_image' : 'summary',
      title: post.titulo,
      description,
    },
  }
}

export default async function PostPage({ params }: Props) {
  await connection()
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.resumen ?? undefined,
    image: post.imagen_url ?? undefined,
    datePublished: post.publicado_at,
    dateModified: post.updated_at,
    keywords: post.tags.join(', ') || undefined,
    mainEntityOfPage: `https://mentesanasaltillo.com/blog/${post.slug}`,
    publisher: { '@type': 'Organization', name: 'Mente Sana Saltillo' },
  }

  return (
    <article className="px-6 lg:px-16 pt-12 pb-24 lg:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-[42rem] mx-auto">
        <Link
          href="/blog"
          className="inline-block underline-offset-4 hover:underline"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.92rem', color: 'var(--warm-mid)' }}
        >
          Volver al blog
        </Link>

        <header className="mt-10">
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.92rem', color: 'var(--warm-mid)' }}>
            <time dateTime={post.publicado_at}>{formatPostDate(post.publicado_at)}</time>
          </p>
          <h1
            className="mt-3"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.6rem, 6vw, 4.1rem)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            {post.titulo}
          </h1>
          {post.resumen && (
            <p className="mt-6" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.45rem', fontStyle: 'italic', lineHeight: 1.5, color: 'var(--warm-mid)' }}>
              {post.resumen}
            </p>
          )}
        </header>

        {post.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imagen_url}
            alt={post.imagen_alt ?? ''}
            className="mt-10 w-full max-w-[34rem] aspect-square object-cover"
            style={{ borderRadius: '1.75rem', backgroundColor: 'var(--cream-alt)' }}
          />
        )}

        <div className="post-body mt-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.contenido}</ReactMarkdown>
        </div>

        {post.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Temas">
            {post.tags.map((t) => (
              <li key={t}>
                <Link
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className="inline-block rounded-full px-3.5 py-1.5 transition-colors hover:bg-[var(--sage-light)]"
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                >
                  {tagLabel(t)}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <aside className="mt-16 rounded-3xl p-8 sm:p-10" style={{ backgroundColor: 'var(--sage)', color: '#F9F4ED' }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.9rem', fontWeight: 500, lineHeight: 1.2 }}>
            Si algo de esto te resonó, no tienes que resolverlo a solas.
          </p>
          <p className="mt-3" style={{ fontFamily: 'var(--font-dm-sans)', lineHeight: 1.7, opacity: 0.9 }}>
            En Saltillo hay especialistas verificados que pueden acompañarte, en persona o en línea.
          </p>
          <Link
            href="/especialistas"
            className="mt-6 inline-block rounded-full px-6 py-3 transition-colors hover:bg-[var(--terracotta-hover)]"
            style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}
          >
            Buscar un especialista
          </Link>
        </aside>
      </div>
    </article>
  )
}
