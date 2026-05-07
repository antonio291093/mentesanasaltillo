'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import * as adminApi from '@/lib/api/admin.api'
import type { AdminReview, ReviewStatus } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5`}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="12" height="12" viewBox="0 0 20 20" aria-hidden>
          <path
            d="M10 1.5l2.39 5.26 5.79.88-4.09 3.98.97 5.79L10 14.77l-5.07 2.64.97-5.79L1.82 7.64l5.79-.88L10 1.5z"
            fill={n <= rating ? 'var(--terracotta)' : 'var(--border)'}
            stroke={n <= rating ? 'var(--terracotta)' : 'var(--border)'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </span>
  )
}

const STATUS_BADGE: Record<ReviewStatus, { label: string; bg: string; color: string }> = {
  pendiente: { label: 'Pendiente', bg: 'rgba(176,139,90,0.12)', color: '#B08B5A' },
  aprobado:  { label: 'Aprobada',  bg: 'rgba(94,139,97,0.1)',   color: 'var(--sage)' },
  rechazado: { label: 'Rechazada', bg: 'rgba(190,96,68,0.1)',   color: 'var(--terracotta)' },
}

function Spinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--terracotta)' }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
        <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// ─── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: AdminReview }) {
  const badge = STATUS_BADGE[review.estado]
  return (
    <article className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 500 }}>
            {review.usuario_nombre} {review.usuario_apellido}
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--warm-mid)' }}>
            para <span style={{ color: 'var(--foreground)' }}>{review.prof_nombre} {review.prof_apellido}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Stars rating={review.calificacion} />
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: badge.bg, color: badge.color, fontFamily: 'var(--font-dm-sans)' }}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {review.comentario && (
        <p
          className="mb-2 mt-3"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--warm-mid)' }}
        >
          &ldquo;{review.comentario}&rdquo;
        </p>
      )}

      <time style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--warm-mid)' }}>
        {formatDate(review.created_at)}
      </time>
    </article>
  )
}

// ─── Tab list config ───────────────────────────────────────────────────────────

type Tab = ReviewStatus | 'todas'

const TABS: { key: Tab; label: string }[] = [
  { key: 'todas',     label: 'Todas'      },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado',  label: 'Aprobadas'  },
  { key: 'rechazado', label: 'Rechazadas' },
]

// ─── Inner content (needs useSearchParams → Suspense) ─────────────────────────

function ResenasContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const estadoParam = searchParams.get('estado') as ReviewStatus | null
  const activeTab: Tab = estadoParam ?? 'todas'

  const [reviews, setReviews]     = useState<AdminReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    adminApi.getAllReviews(estadoParam ?? undefined)
      .then(setReviews)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar reseñas'))
      .finally(() => setIsLoading(false))
  }, [estadoParam])

  const goToTab = (key: Tab) => {
    if (key === 'todas') router.push('/admin/resenas')
    else                 router.push(`/admin/resenas?estado=${key}`)
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-4xl mx-auto">

      {/* Cabecera */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
          Admin
        </p>
        <h1 className="mt-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2 }}>
          Gestión de reseñas
        </h1>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit flex-wrap"
        style={{ backgroundColor: 'var(--cream-alt)', border: '1px solid var(--border)' }}
        role="tablist"
      >
        {TABS.map(({ key, label }) => {
          const active = activeTab === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => goToTab(key)}
              className="px-4 py-2 rounded-xl text-sm transition-all"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: active ? 600 : 400,
                backgroundColor: active ? 'var(--card-bg)' : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--warm-mid)',
                boxShadow: active ? '0 1px 4px rgba(35,26,20,0.08)' : 'none',
              }}
            >
              {label}
              {!isLoading && active && reviews.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'var(--terracotta)', color: '#fff' }}
                >
                  {reviews.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {isLoading ? (
        <Spinner />
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl px-6 py-14 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--warm-mid)' }}>
            No hay reseñas en esta categoría.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResenasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[40vh] flex items-center justify-center">
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--terracotta)' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
          <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    }>
      <ResenasContent />
    </Suspense>
  )
}
