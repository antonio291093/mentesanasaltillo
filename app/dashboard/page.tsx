'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import * as profApi from '@/lib/api/professionals.api'
import type { ProfessionalProfile } from '@/lib/types/api.types'

// ─── Iconos ───────────────────────────────────────────────────────────────────

function IconCheck()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconClock()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconAlert()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8V12M12 16V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> }
function IconStar()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> }
function IconMessage() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M21 15C21 15.55 20.55 16 20 16H8L4 20V4C4 3.45 4.45 3 5 3H20C20.55 3 21 3.45 21 4V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> }
function IconArrow()   { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  aprobado:  { label: 'Aprobado',           bg: 'rgba(94,139,97,0.1)',  color: 'var(--sage)',      Icon: IconCheck },
  pendiente: { label: 'En revisión',         bg: 'rgba(176,139,90,0.12)', color: '#B08B5A',         Icon: IconClock },
  rechazado: { label: 'Rechazado',           bg: 'rgba(190,96,68,0.1)', color: 'var(--terracotta)', Icon: IconAlert },
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user }                    = useAuth()
  const [profile, setProfile]       = useState<ProfessionalProfile | null>(null)
  const [noProfile, setNoProfile]   = useState(false)
  const [isLoading, setIsLoading]   = useState(true)

  useEffect(() => {
    profApi.getMyProfile()
      .then(setProfile)
      .catch(err => {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('404') || msg.includes('no encontr') || msg.includes('perfil')) {
          setNoProfile(true)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Spinner />

  const pendingReviews = (profile?.reviews ?? []).filter(r => r.estado === 'pendiente').length

  const status = profile
    ? STATUS_CONFIG[profile.estado_verificacion]
    : null

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-4xl mx-auto">

      {/* Saludo */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
          Panel de especialista
        </p>
        <h1
          className="mt-1"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2 }}
        >
          Bienvenido, <span style={{ fontStyle: 'normal', fontWeight: 600 }}>{user?.nombre}</span>
        </h1>
      </div>

      {/* Sin perfil aún */}
      {noProfile && (
        <div
          className="mb-8 rounded-2xl px-6 py-5"
          style={{ backgroundColor: 'rgba(176,139,90,0.1)', border: '1px solid rgba(176,139,90,0.3)' }}
        >
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', color: 'var(--foreground)', fontWeight: 500 }}>
            Aún no tienes un perfil profesional configurado.
          </p>
          <p className="mt-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)' }}>
            Ve a{' '}
            <Link href="/dashboard/perfil" className="underline underline-offset-2" style={{ color: 'var(--terracotta)' }}>
              Mi Perfil
            </Link>
            {' '}para crear tu perfil y comenzar a recibir pacientes.
          </p>
        </div>
      )}

      {/* Banner: pendiente de revisión */}
      {profile?.estado_verificacion === 'pendiente' && (
        <div
          className="mb-6 flex items-start gap-3 rounded-2xl px-5 py-4"
          style={{ backgroundColor: 'rgba(176,139,90,0.1)', border: '1px solid rgba(176,139,90,0.3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" style={{ color: '#B08B5A' }} aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
              Tu perfil está en revisión
            </p>
            <p className="mt-0.5" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>
              Nuestro equipo está verificando tu información. Te notificaremos cuando sea aprobado.
            </p>
          </div>
        </div>
      )}

      {/* Banner: rechazado */}
      {profile?.estado_verificacion === 'rechazado' && (
        <div
          className="mb-6 flex items-start gap-3 rounded-2xl px-5 py-4"
          style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.25)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" style={{ color: 'var(--terracotta)' }} aria-hidden>
            <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8V12M12 16V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--terracotta)' }}>
              Tu perfil fue rechazado
            </p>
            {profile.motivo_rechazo && (
              <p className="mt-0.5" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>
                Motivo: {profile.motivo_rechazo}
              </p>
            )}
            <p className="mt-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>
              Actualiza tu perfil con la información correcta y vuelve a enviar.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      {profile && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          {/* Estado de verificación */}
          <div
            className="col-span-2 lg:col-span-1 rounded-2xl p-5"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: status?.bg, color: status?.color }}
            >
              {status && <status.Icon />}
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Verificación
            </p>
            <p className="mt-0.5" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: status?.color }}>
              {status?.label}
            </p>
          </div>

          {/* Total reseñas */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(94,139,97,0.1)', color: 'var(--sage)' }}
            >
              <IconMessage />
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Reseñas totales
            </p>
            <p className="mt-0.5" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 600, lineHeight: 1 }}>
              {profile.review_count}
            </p>
          </div>

          {/* Calificación promedio */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(190,96,68,0.1)', color: 'var(--terracotta)' }}
            >
              <IconStar />
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Calificación
            </p>
            <p className="mt-0.5" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 600, lineHeight: 1 }}>
              {(() => { const n = parseFloat(String(profile.avg_rating ?? '')); return isNaN(n) ? 'Sin reseñas' : n.toFixed(1) })()}
            </p>
          </div>

          {/* Reseñas pendientes */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: pendingReviews > 0 ? 'rgba(190,96,68,0.06)' : 'var(--card-bg)', border: `1px solid ${pendingReviews > 0 ? 'rgba(190,96,68,0.2)' : 'var(--border)'}` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(176,139,90,0.12)', color: '#B08B5A' }}
            >
              <IconClock />
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
              Por aprobar
            </p>
            <p className="mt-0.5" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 600, lineHeight: 1, color: pendingReviews > 0 ? 'var(--terracotta)' : 'var(--foreground)' }}>
              {pendingReviews}
            </p>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <p
          className="mb-4"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}
        >
          Accesos rápidos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/dashboard/perfil',   title: 'Mi Perfil',  desc: 'Actualiza tu información, especialidades y precio de consulta.' },
            { href: '/dashboard/horarios', title: 'Horarios',   desc: 'Configura tus días y horas de atención disponibles.' },
            { href: '/dashboard/resenas',  title: 'Reseñas',    desc: pendingReviews > 0 ? `Tienes ${pendingReviews} reseña${pendingReviews > 1 ? 's' : ''} pendiente${pendingReviews > 1 ? 's' : ''} de aprobar.` : 'Gestiona las reseñas de tus pacientes.' },
          ].map(({ href, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl p-5 transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 600 }}>
                {title}
              </p>
              <p
                className="mt-1.5 flex-1"
                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--warm-mid)' }}
              >
                {desc}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium transition-all group-hover:gap-2.5"
                style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--sage)' }}
              >
                Ir a {title} <IconArrow />
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
