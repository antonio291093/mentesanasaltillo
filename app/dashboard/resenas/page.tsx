'use client'

import { useEffect, useState } from 'react'
import * as profApi from '@/lib/api/professionals.api'
import * as reviewApi from '@/lib/api/reviews.api'
import type { Review, ReviewStatus } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="13" height="13" viewBox="0 0 20 20" aria-hidden>
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

function Spinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--sage)' }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
        <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

const TABS: { key: ReviewStatus | 'todas'; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado',  label: 'Aprobadas' },
  { key: 'rechazado', label: 'Rechazadas' },
]

// ─── Tarjeta de reseña ────────────────────────────────────────────────────────

function ReviewCard({
  review, onApprove, onReject, isActing,
}: {
  review: Review
  onApprove?: () => void
  onReject?:  () => void
  isActing:   boolean
}) {
  const isPending = review.estado === 'pendiente'
  const userName  = `${review.nombre} ${review.apellido.charAt(0)}.`

  return (
    <article
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--sage-light)', fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 600 }}
            aria-hidden
          >
            {review.nombre.charAt(0)}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 500 }}>
              {userName}
            </p>
            <time dateTime={review.created_at} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--warm-mid)' }}>
              {formatDate(review.created_at)}
            </time>
          </div>
        </div>
        <Stars rating={review.calificacion} />
      </div>

      {review.comentario && (
        <p
          className="mb-4"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--warm-mid)' }}
        >
          &ldquo;{review.comentario}&rdquo;
        </p>
      )}

      {/* Acciones para pendientes */}
      {isPending && onApprove && onReject && (
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onApprove}
            disabled={isActing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: 'rgba(94,139,97,0.1)', color: 'var(--sage)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(94,139,97,0.25)' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Aprobar
          </button>
          <button
            onClick={onReject}
            disabled={isActing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: 'rgba(190,96,68,0.08)', color: 'var(--terracotta)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(190,96,68,0.2)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Rechazar
          </button>
        </div>
      )}
    </article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResenasPage() {
  const [reviews, setReviews]     = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingId, setActingId]   = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pendiente')
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    profApi.getMyProfile()
      .then(p => setReviews(p.reviews ?? []))
      .catch(err => {
        const msg = err instanceof Error ? err.message : ''
        if (!msg.includes('404') && !msg.includes('perfil')) {
          setError(msg || 'Error al cargar reseñas')
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleStatus = async (id: number, status: ReviewStatus) => {
    setActingId(id)
    try {
      await reviewApi.updateStatus(id, status)
      setReviews(prev => prev.map(r => r.id === id ? { ...r, estado: status } : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setActingId(null)
    }
  }

  if (isLoading) return <Spinner />

  const filtered = (reviews ?? []).filter(r => (r.estado ?? 'pendiente') === activeTab)

  const countByStatus = (s: ReviewStatus) =>
    (reviews ?? []).filter(r => (r.estado ?? 'pendiente') === s).length

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-3xl mx-auto">

      {/* Cabecera */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
          Dashboard
        </p>
        <h1
          className="mt-1"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2 }}
        >
          Reseñas de pacientes
        </h1>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit"
        style={{ backgroundColor: 'var(--cream-alt)', border: '1px solid var(--border)' }}
        role="tablist"
      >
        {TABS.map(({ key, label }) => {
          if (key === 'todas') return null
          const count  = countByStatus(key as ReviewStatus)
          const active = activeTab === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(key as ReviewStatus)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: active ? 600 : 400,
                backgroundColor: active ? 'var(--card-bg)' : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--warm-mid)',
                boxShadow: active ? '0 1px 4px rgba(35,26,20,0.08)' : 'none',
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: key === 'pendiente' ? 'var(--terracotta)' : 'var(--sage)',
                    color: '#fff',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-3xl"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
        >
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--warm-mid)' }}>
            No hay reseñas {activeTab === 'pendiente' ? 'pendientes' : activeTab === 'aprobado' ? 'aprobadas' : 'rechazadas'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              isActing={actingId === review.id}
              onApprove={activeTab === 'pendiente' ? () => handleStatus(review.id, 'aprobado')  : undefined}
              onReject= {activeTab === 'pendiente' ? () => handleStatus(review.id, 'rechazado') : undefined}
            />
          ))}
        </div>
      )}

    </div>
  )
}
