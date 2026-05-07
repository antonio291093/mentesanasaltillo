'use client'

import { useEffect, useState } from 'react'
import * as adminApi from '@/lib/api/admin.api'
import type { AdminStats, AdminProfessional, VerificationStatus } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
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

const MODALITY_LABEL: Record<string, string> = {
  presencial: 'Presencial', online: 'En línea', ambas: 'Presencial y en línea',
}

const STATUS_BADGE: Record<VerificationStatus, { label: string; bg: string; color: string }> = {
  pendiente: { label: 'Pendiente', bg: 'rgba(176,139,90,0.12)', color: '#B08B5A' },
  aprobado:  { label: 'Aprobado',  bg: 'rgba(94,139,97,0.1)',   color: 'var(--sage)' },
  rechazado: { label: 'Rechazado', bg: 'rgba(190,96,68,0.1)',   color: 'var(--terracotta)' },
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
        {label}
      </p>
      <p className="mt-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, lineHeight: 1, color: accent ?? 'var(--foreground)' }}>
        {value}
      </p>
      {sub && (
        <p className="mt-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--warm-mid)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Distribution breakdown ────────────────────────────────────────────────────

function BreakdownCard({ title, rows }: { title: string; rows: Array<{ label: string; value: number; color: string }> }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
      <p className="mb-4" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
        {title}
      </p>
      <div className="space-y-2.5">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--foreground)' }}>{label}</span>
            <span
              className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-lg px-2 text-xs font-semibold"
              style={{ backgroundColor: color === 'var(--sage)' ? 'rgba(94,139,97,0.1)' : color === 'var(--terracotta)' ? 'rgba(190,96,68,0.1)' : 'rgba(176,139,90,0.12)', color }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({
  onConfirm, onCancel, isActing,
}: {
  onConfirm: (motivo: string) => void
  onCancel:  () => void
  isActing:  boolean
}) {
  const [motivo, setMotivo] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(35,26,20,0.45)' }}>
      <div className="w-full max-w-md rounded-3xl p-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <h3 className="mb-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 600 }}>
          Rechazar perfil
        </h3>
        <p className="mb-4" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)' }}>
          Indica el motivo del rechazo. El profesional recibirá esta información.
        </p>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          rows={3}
          placeholder="Ej. La cédula profesional no corresponde al nombre registrado."
          className="w-full rounded-xl px-4 py-3 outline-none resize-none mb-4"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', backgroundColor: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm"
            style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)', border: '1px solid var(--border)', backgroundColor: 'transparent' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => motivo.trim() && onConfirm(motivo.trim())}
            disabled={!motivo.trim() || isActing}
            className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
            style={{ fontFamily: 'var(--font-dm-sans)', backgroundColor: 'var(--terracotta)', color: '#fff' }}
          >
            {isActing ? 'Rechazando…' : 'Confirmar rechazo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stats, setStats]       = useState<AdminStats | null>(null)
  const [pending, setPending]   = useState<AdminProfessional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [actingId, setActingId] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getPendingProfessionals()])
      .then(([s, p]) => { setStats(s); setPending(p) })
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar datos'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleAction = async (id: number, status: 'aprobado' | 'rechazado', motivo?: string) => {
    setActingId(id)
    try {
      await adminApi.verifyProfessional(id, status, motivo)
      setPending(prev => prev.filter(p => p.id !== id))
      if (stats) {
        const updated = stats.profesionales.map(x => {
          if (x.estado === 'pendiente') return { ...x, total: Math.max(0, x.total - 1) }
          if (x.estado === status)      return { ...x, total: x.total + 1 }
          return x
        })
        setStats({ ...stats, profesionales: updated })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setActingId(null)
      setRejectTarget(null)
    }
  }

  if (isLoading) return <Spinner />

  const sumArr = (arr: Array<{ total: number }>) => arr.reduce((s, x) => s + x.total, 0)

  const totalUsuarios      = stats ? sumArr(stats.usuarios) : 0
  const totalProfesionales = stats ? sumArr(stats.profesionales) : 0
  const totalReviews       = stats ? sumArr(stats.reviews) : 0

  const profByEstado = (e: VerificationStatus) => stats?.profesionales.find(x => x.estado === e)?.total ?? 0
  const reviewByEstado = (e: string) => stats?.reviews.find(x => x.estado === e)?.total ?? 0
  const userByRole = (r: string) => stats?.usuarios.find(x => x.role === r)?.total ?? 0

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-5xl mx-auto">

      {/* Cabecera */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
          Panel de administración
        </p>
        <h1 className="mt-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2 }}>
          Resumen del sistema
        </h1>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}>{error}</p>
        </div>
      )}

      {/* Tarjetas de totales */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Usuarios totales"    value={totalUsuarios} />
            <StatCard label="Profesionales"        value={totalProfesionales} />
            <StatCard label="Reseñas totales"      value={totalReviews} />
            <StatCard label="Profesionales / mes"  value={stats.profesionales_nuevos_mes} accent="var(--sage)" sub="este mes" />
          </div>

          {/* Desglose */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <BreakdownCard title="Usuarios por rol" rows={[
              { label: 'Administradores', value: userByRole('admin'),     color: 'var(--terracotta)' },
              { label: 'Psicólogos',      value: userByRole('psicologo'), color: '#B08B5A' },
              { label: 'Usuarios',        value: userByRole('usuario'),   color: 'var(--sage)' },
            ]} />
            <BreakdownCard title="Profesionales por estado" rows={[
              { label: 'Pendientes', value: profByEstado('pendiente'), color: '#B08B5A' },
              { label: 'Aprobados',  value: profByEstado('aprobado'),  color: 'var(--sage)' },
              { label: 'Rechazados', value: profByEstado('rechazado'), color: 'var(--terracotta)' },
            ]} />
            <BreakdownCard title="Reseñas por estado" rows={[
              { label: 'Pendientes', value: reviewByEstado('pendiente'), color: '#B08B5A' },
              { label: 'Aprobadas',  value: reviewByEstado('aprobado'),  color: 'var(--sage)' },
              { label: 'Rechazadas', value: reviewByEstado('rechazado'), color: 'var(--terracotta)' },
            ]} />
          </div>
        </>
      )}

      {/* Tabla de pendientes */}
      <div>
        <p className="mb-4" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
          Profesionales pendientes de verificación
        </p>

        {pending.length === 0 ? (
          <div className="rounded-2xl px-6 py-12 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--warm-mid)' }}>
              No hay solicitudes pendientes.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-alt)', borderBottom: '1px solid var(--border)' }}>
                  {['Profesional', 'Email', 'Cédula', 'Modalidad', 'Solicitud', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-mid)', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ backgroundColor: i % 2 === 0 ? 'var(--card-bg)' : 'var(--background)', borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 500 }}>{p.nombre} {p.apellido}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>{p.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>{p.cedula_profesional}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>{MODALITY_LABEL[p.modalidad] ?? p.modalidad}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>{formatDate(p.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAction(p.id, 'aprobado')}
                          disabled={actingId === p.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                          style={{ backgroundColor: 'rgba(94,139,97,0.1)', color: 'var(--sage)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(94,139,97,0.25)' }}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => setRejectTarget(p.id)}
                          disabled={actingId === p.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                          style={{ backgroundColor: 'rgba(190,96,68,0.08)', color: 'var(--terracotta)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(190,96,68,0.2)' }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {rejectTarget !== null && (
        <RejectModal
          isActing={actingId === rejectTarget}
          onConfirm={motivo => handleAction(rejectTarget, 'rechazado', motivo)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

    </div>
  )
}
