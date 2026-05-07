'use client'

import Link from 'next/link'
import { useProfessionals } from '@/lib/hooks/useProfessionals'
import type { ProfessionalSummary } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#5E8B61', '#BE6044', '#6B8BAE', '#9B6B8A', '#7A8B5E', '#B08B5A']
const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online:     'En línea',
  ambas:      'Presencial y en línea',
}

function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }
function initials(nombre: string, apellido: string) { return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-3xl p-7 animate-pulse"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-14 h-14 rounded-2xl" style={{ backgroundColor: 'var(--border)' }} />
        <div className="w-24 h-7 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
      </div>
      <div className="h-5 rounded-lg mb-2" style={{ backgroundColor: 'var(--border)', width: '70%' }} />
      <div className="h-3 rounded mb-4" style={{ backgroundColor: 'var(--border)', width: '40%' }} />
      <div className="space-y-2 flex-1">
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--border)' }} />
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--border)', width: '85%' }} />
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--border)', width: '60%' }} />
      </div>
      <div className="h-4 rounded mt-5 mb-5" style={{ backgroundColor: 'var(--border)', width: '50%' }} />
      <div className="h-11 rounded-2xl" style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}

// ─── Tarjeta individual ───────────────────────────────────────────────────────

function SpecialistCard({ s }: { s: ProfessionalSummary }) {
  const color        = avatarColor(s.id)
  const inits        = initials(s.nombre, s.apellido)
  const primarySpec  = s.specialties[0] ?? 'Especialista en salud mental'
  const description  = s.specialties.length > 1
    ? s.specialties.join(' · ')
    : primarySpec

  const ratingLabel  = s.avg_rating !== null
    ? `★ ${Number(s.avg_rating).toFixed(1)} · ${s.review_count} ${s.review_count === 1 ? 'reseña' : 'reseñas'}`
    : 'Sin reseñas aún'

  return (
    <article
      className="flex flex-col rounded-3xl p-7 transition-shadow hover:shadow-xl"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
    >
      {/* Avatar + badge */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{ backgroundColor: color }}
          aria-hidden
        >
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 600, color: '#fff', letterSpacing: '0.03em' }}>
            {inits}
          </span>
        </div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs"
          style={{ backgroundColor: 'var(--sage-light)', color: 'var(--foreground)', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, letterSpacing: '0.02em' }}
        >
          {MODALITY_LABELS[s.modalidad] ?? s.modalidad}
        </span>
      </div>

      {/* Nombre */}
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
        {s.nombre} {s.apellido}
      </h2>

      {/* Especialidad principal */}
      <p
        className="mt-1 mb-4"
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: 500 }}
      >
        {primarySpec}
      </p>

      {/* Descripción / especialidades */}
      <p
        className="flex-1"
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--warm-mid)' }}
      >
        {description}
      </p>

      {/* Rating */}
      <p
        className="mt-4 mb-5"
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--warm-mid)' }}
      >
        {ratingLabel}
      </p>

      {/* CTA */}
      <Link
        href={`/especialistas/${s.id}`}
        className="w-full rounded-2xl py-3 text-sm font-medium transition-all hover:opacity-90 text-center block"
        style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', fontFamily: 'var(--font-dm-sans)' }}
      >
        Ver perfil completo
      </Link>
    </article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EspecialistasPage() {
  const { professionals, isLoading, error } = useProfessionals()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden px-6 pt-14 pb-16 lg:px-16 lg:pt-20"
        style={{ backgroundColor: 'var(--cream-alt)' }}
      >
        <div
          className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full"
          aria-hidden
          style={{ background: 'radial-gradient(circle, var(--sage-light) 0%, transparent 70%)', opacity: 0.4, filter: 'blur(50px)', transform: 'translate(30%, -30%)' }}
        />
        <div className="relative max-w-3xl">
          <p className="mb-4" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
            Nuestros especialistas
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Profesionales listos
            <br />
            <span style={{ fontWeight: 600, fontStyle: 'normal' }}>para acompañarte.</span>
          </h1>
          <p className="mt-5 max-w-lg" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', lineHeight: 1.75, color: 'var(--warm-mid)' }}>
            Todos nuestros especialistas están certificados y con experiencia
            comprobada. Elige el perfil que mejor se adapte a lo que necesitas.
          </p>
        </div>
      </header>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 lg:px-16 lg:py-20">
        <div className="max-w-6xl mx-auto">

          {/* Error */}
          {error && (
            <div
              className="mb-8 rounded-2xl px-6 py-5"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)' }}>
                No fue posible cargar los especialistas. Por favor intenta de nuevo más tarde.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeletons de carga */}
            {isLoading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

            {/* Sin resultados */}
            {!isLoading && !error && professionals.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--warm-mid)' }}>
                  No hay especialistas disponibles por el momento.
                </p>
              </div>
            )}

            {/* Resultados reales */}
            {!isLoading && professionals.map((s) => <SpecialistCard key={s.id} s={s} />)}
          </div>
        </div>
      </section>

    </div>
  )
}
