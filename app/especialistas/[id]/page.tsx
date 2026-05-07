'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProfessional } from '@/lib/hooks/useProfessionals'
import { useAuth } from '@/lib/hooks/useAuth'
import type { DayOfWeek, Schedule } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#5E8B61', '#BE6044', '#6B8BAE', '#9B6B8A', '#7A8B5E', '#B08B5A']

const DAY_LABELS: Record<DayOfWeek, string> = {
  lunes:     'Lunes',
  martes:    'Martes',
  miercoles: 'Miércoles',
  jueves:    'Jueves',
  viernes:   'Viernes',
  sabado:    'Sábado',
  domingo:   'Domingo',
}
const DAY_ORDER: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online:     'En línea',
  ambas:      'Presencial y en línea',
}

function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }
function initials(nombre: string, apellido: string) { return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() }
function formatTime(t: string) { return t.slice(0, 5) }

function groupSchedules(schedules: Schedule[]): { day: DayOfWeek; slots: string[] }[] {
  const map = new Map<DayOfWeek, string[]>()
  for (const s of schedules) {
    const slot = `${formatTime(s.hora_inicio)} – ${formatTime(s.hora_fin)}`
    if (!map.has(s.dia_semana)) map.set(s.dia_semana, [])
    map.get(s.dia_semana)!.push(slot)
  }
  return DAY_ORDER.filter(d => map.has(d)).map(d => ({ day: d, slots: map.get(d)! }))
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${d.getUTCDate()} de ${months[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const dim = { sm: 14, md: 18, lg: 26 }[size]
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={dim} height={dim} viewBox="0 0 20 20" aria-hidden>
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

// ─── CredentialCard ───────────────────────────────────────────────────────────

function CredentialCard({ label, value, variant }: { label: string; value: string; variant: 'doc' | 'badge' }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {variant === 'doc' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--sage)" strokeWidth="1.5" />
              <path d="M7 8H17M7 12H14M7 16H11" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2l2.39 6.26L21 9.27l-5 4.87 1.18 6.88L12 17.77l-5.18 3.25L8 14.14 3 9.27l6.61-1.01L12 2z" stroke="var(--sage)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div>
          <p
            className="mb-0.5"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}
          >
            {label}
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', fontWeight: 600 }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: 'var(--background)' }}>
      <section style={{ backgroundColor: 'var(--cream-alt)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-16 pt-10 pb-16">
          <div className="h-4 w-36 rounded mb-10" style={{ backgroundColor: 'var(--border)' }} />
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="w-40 h-40 lg:w-52 lg:h-52 rounded-3xl shrink-0" style={{ backgroundColor: 'var(--border)' }} />
            <div className="flex-1 space-y-4 pt-2">
              <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-10 w-72 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
              <div className="flex gap-2">
                <div className="h-6 w-28 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                <div className="h-6 w-24 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
              </div>
              <div className="pt-4 flex gap-8">
                <div className="h-8 w-24 rounded" style={{ backgroundColor: 'var(--border)' }} />
                <div className="h-8 w-24 rounded" style={{ backgroundColor: 'var(--border)' }} />
              </div>
              <div className="h-12 w-56 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EspecialistaPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const { professional: s, isLoading, error } = useProfessional(id || null)
  const { isAuthenticated } = useAuth()

  if (isLoading) return <HeroSkeleton />

  if (error || !s) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center px-6">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontStyle: 'italic', color: 'var(--warm-mid)' }}>
            Especialista no encontrado
          </p>
          <Link
            href="/especialistas"
            className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-foreground transition-colors"
            style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)' }}
          >
            Ver todos los especialistas
          </Link>
        </div>
      </div>
    )
  }

  const color         = avatarColor(s.id)
  const inits         = initials(s.nombre, s.apellido)
  const modalityLabel = MODALITY_LABELS[s.modalidad] ?? s.modalidad
  const avgRating     = s.avg_rating !== null ? Number(s.avg_rating) : null
  const grouped       = groupSchedules(s.schedules)
  const primarySpec   = s.specialties[0]?.nombre ?? 'Especialista en salud mental'

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--cream-alt)' }}>
        <div
          className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full"
          aria-hidden
          style={{ background: 'radial-gradient(circle, var(--sage-light) 0%, transparent 70%)', opacity: 0.4, filter: 'blur(60px)', transform: 'translate(30%, -30%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-16 pt-10 pb-16">

          {/* Volver */}
          <Link
            href="/especialistas"
            className="inline-flex items-center gap-1.5 mb-10 text-sm transition-colors hover:text-foreground"
            style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Todos los especialistas
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative">
                <div
                  className="w-40 h-40 lg:w-52 lg:h-52 rounded-3xl flex items-center justify-center shadow-xl"
                  style={{ backgroundColor: color }}
                  aria-hidden
                >
                  <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 6vw, 4.2rem)', fontWeight: 600, color: '#fff', letterSpacing: '0.03em' }}>
                    {inits}
                  </span>
                </div>
                <div
                  className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md"
                  style={{ backgroundColor: 'var(--sage)', color: '#fff' }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em' }}>
                    Verificado
                  </span>
                </div>
              </div>

              {/* Rating móvil */}
              {avgRating !== null && (
                <div className="lg:hidden mt-5 flex items-center gap-2">
                  <Stars rating={Math.round(avgRating)} size="sm" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>
                    {avgRating.toFixed(1)} ({s.review_count} reseñas)
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="mb-2"
                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}
              >
                {primarySpec}
              </p>
              <h1
                className="mb-4"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}
              >
                {s.nombre} {s.apellido}
              </h1>

              {/* Rating desktop */}
              {avgRating !== null && (
                <div className="hidden lg:flex items-center gap-2.5 mb-5">
                  <Stars rating={Math.round(avgRating)} size="sm" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--warm-mid)' }}>
                    {avgRating.toFixed(1)} · {s.review_count} {s.review_count === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </div>
              )}

              {/* Especialidades */}
              <div className="flex flex-wrap gap-2 mb-7">
                {s.specialties.map((sp) => (
                  <span
                    key={sp.id}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'var(--sage-light)', color: 'var(--foreground)', fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.02em' }}
                  >
                    {sp.nombre}
                  </span>
                ))}
              </div>

              {/* Fila de datos clave */}
              <div
                className="flex flex-wrap items-start gap-x-8 gap-y-4 py-5 mb-8 border-t border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <p className="mb-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
                    Modalidad
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', fontWeight: 500 }}>
                    {modalityLabel}
                  </p>
                </div>
                {(s.precio_sesion_min !== null || s.precio_sesion_max !== null) && (
                  <div>
                    <p className="mb-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
                      Precio por sesión
                    </p>
                    <p>
                      <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.55rem', fontWeight: 600, lineHeight: 1 }}>
                        ${s.precio_sesion_min ?? '?'}–${s.precio_sesion_max ?? '?'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--warm-mid)', marginLeft: '4px' }}>
                        MXN
                      </span>
                    </p>
                  </div>
                )}
                {s.colonia && (
                  <div>
                    <p className="mb-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
                      Consultorio
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', fontWeight: 500 }}>
                      {s.colonia}, {s.ciudad}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA de contacto */}
              {isAuthenticated ? (
                <div
                  className="inline-flex items-center gap-3 rounded-2xl px-6 py-4"
                  style={{ backgroundColor: 'var(--sage-light)', border: '1px solid var(--border)' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 5H21V17C21 17.55 20.55 18 20 18H4C3.45 18 3 17.55 3 17V5Z" stroke="var(--sage)" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M3 5L12 13L21 5" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                    Contacta directamente al especialista para agendar tu cita.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', fontWeight: 500, padding: '0.9rem 2rem', cursor: 'pointer' }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M3 5H21V17C21 17.55 20.55 18 20 18H4C3.45 18 3 17.55 3 17V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M3 5L12 13L21 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Ver información de contacto
                  </button>
                  <p className="mt-3 text-sm" style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)' }}>
                    <Link href="/auth/login" className="underline underline-offset-2 hover:text-foreground transition-colors">
                      Inicia sesión
                    </Link>
                    {' '}o{' '}
                    <Link href="/auth/registro" className="underline underline-offset-2 hover:text-foreground transition-colors">
                      regístrate
                    </Link>
                    {' '}para ver el teléfono y dirección.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sobre mí ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 lg:px-16 lg:py-20" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* Biografía */}
          <div className="lg:col-span-2">
            <p className="mb-5" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Sobre mí
            </p>
            {s.descripcion ? (
              s.descripcion.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className="mb-5 last:mb-0"
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', lineHeight: 1.85, color: 'var(--warm-mid)' }}
                >
                  {para}
                </p>
              ))
            ) : (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', lineHeight: 1.85, color: 'var(--warm-mid)', fontStyle: 'italic' }}>
                Información próximamente.
              </p>
            )}
          </div>

          {/* Credenciales */}
          <div>
            <p className="mb-5" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Datos profesionales
            </p>
            <div className="space-y-4">
              <CredentialCard label="Cédula profesional" value={s.cedula_profesional} variant="doc" />
              {s.cedula_especialidad && (
                <CredentialCard label="Cédula de especialidad" value={s.cedula_especialidad} variant="badge" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Horarios ──────────────────────────────────────────────────────── */}
      {grouped.length > 0 && (
        <section className="px-6 py-16 lg:px-16 lg:py-20" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="max-w-6xl mx-auto">
            <p className="mb-3" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Horarios de atención
            </p>
            <h2 className="mb-10" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2 }}>
              Disponibilidad semanal
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {grouped.map(({ day, slots }) => (
                <div
                  key={day}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <p className="mb-3" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 600 }}>
                    {DAY_LABELS[day]}
                  </p>
                  <div className="space-y-1.5">
                    {slots.map((slot) => (
                      <span
                        key={slot}
                        className="block px-2.5 py-1.5 rounded-lg text-xs text-center"
                        style={{ backgroundColor: 'var(--sage-light)', color: 'var(--foreground)', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 lg:px-16 lg:py-20" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="mb-2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
                Reseñas de pacientes
              </p>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 500, fontStyle: 'italic' }}>
                Lo que dicen quienes le conocen
              </h2>
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-3 shrink-0">
                <Stars rating={Math.round(avgRating)} size="lg" />
                <div>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.2rem', fontWeight: 600, lineHeight: 1 }}>
                    {avgRating.toFixed(1)}
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--warm-mid)' }}>
                    {s.review_count} {s.review_count === 1 ? 'reseña' : 'reseñas'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {s.reviews.length === 0 ? (
            <div
              className="text-center py-16 rounded-3xl"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--sage-light)' }}
                aria-hidden
              >
                <svg width="28" height="24" viewBox="0 0 36 28" fill="none">
                  <path d="M0 28V16.8C0 7.47 4.27 1.87 12.8 0L14.4 2.8C10.4 3.87 8 6.93 8 11.2H14.4V28H0ZM21.6 28V16.8C21.6 7.47 25.87 1.87 34.4 0L36 2.8C32 3.87 29.6 6.93 29.6 11.2H36V28H21.6Z" fill="var(--sage)" fillOpacity="0.5" />
                </svg>
              </div>
              <p className="mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem', fontStyle: 'italic' }}>
                Aún no hay reseñas
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--warm-mid)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.7 }}>
                ¿Ya tuviste una consulta con este especialista? Tu opinión puede ayudar a otras personas a dar el primer paso.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {s.reviews.map((review) => {
                const userName = `${review.nombre} ${review.apellido.charAt(0)}.`
                const dateStr  = formatDate(review.created_at)
                return (
                  <article
                    key={review.id}
                    className="flex flex-col rounded-3xl p-6"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                  >
                    <Stars rating={review.calificacion} size="sm" />
                    <p
                      className="flex-1 mt-4 mb-5"
                      style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--warm-mid)' }}
                    >
                      &ldquo;{review.comentario}&rdquo;
                    </p>
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--sage-light)', fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 600 }}
                          aria-hidden
                        >
                          {review.nombre.charAt(0)}
                        </div>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', fontWeight: 500 }}>
                          {userName}
                        </p>
                      </div>
                      <time dateTime={review.created_at} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--warm-mid)' }}>
                        {dateStr}
                      </time>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
