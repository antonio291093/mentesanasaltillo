'use client'

import { useEffect, useState } from 'react'
import * as adminApi from '@/lib/api/admin.api'
import type { AdminProfessional, VerificationStatus } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return '—'
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`
  return `$${(min ?? max)!.toLocaleString()}`
}

const MODALITY_LABEL: Record<string, string> = {
  presencial: 'Presencial', online: 'En línea', ambas: 'Ambas',
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

// ─── Reject modal ──────────────────────────────────────────────────────────────

function RejectModal({
  nombre, onConfirm, onCancel, isActing,
}: {
  nombre:    string
  onConfirm: (motivo: string) => void
  onCancel:  () => void
  isActing:  boolean
}) {
  const [motivo, setMotivo] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(35,26,20,0.45)' }}>
      <div className="w-full max-w-md rounded-3xl p-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <h3 className="mb-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 600 }}>
          Rechazar solicitud
        </h3>
        <p className="mb-4" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)' }}>
          Indica el motivo para rechazar el perfil de <strong>{nombre}</strong>. Esta información se enviará al profesional.
        </p>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          rows={3}
          placeholder="Ej. La cédula profesional no corresponde al nombre registrado."
          className="w-full rounded-xl px-4 py-3 outline-none resize-none mb-4"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', backgroundColor: 'var(--background)', border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
          autoFocus
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm"
            style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--warm-mid)', border: '1px solid var(--border)' }}
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

// ─── Professional card ─────────────────────────────────────────────────────────

function ProfCard({
  prof, tab, onApprove, onRejectOpen, onRevoke, isActing,
}: {
  prof:         AdminProfessional
  tab:          VerificationStatus
  onApprove:    () => void
  onRejectOpen: () => void
  onRevoke:     () => void
  isActing:     boolean
}) {
  return (
    <article className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.925rem', fontWeight: 600 }}>
            {prof.nombre} {prof.apellido}
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--warm-mid)' }}>
            {prof.email}
          </p>
        </div>
        <time style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--warm-mid)', whiteSpace: 'nowrap' }}>
          {formatDate(prof.created_at)}
        </time>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mb-3">
        <div>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
            Cédula prof.
          </span>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
            {prof.cedula_profesional}
          </p>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
            Modalidad
          </span>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
            {MODALITY_LABEL[prof.modalidad] ?? prof.modalidad}
          </p>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
            Precio / sesión
          </span>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
            {formatPrice(prof.precio_sesion_min, prof.precio_sesion_max)}
          </p>
        </div>
      </div>

      {prof.descripcion && (
        <p className="mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)', lineHeight: 1.6 }}>
          {prof.descripcion}
        </p>
      )}

      {prof.motivo_rechazo && tab === 'rechazado' && (
        <p className="mb-3 px-3 py-2 rounded-xl" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--terracotta)', backgroundColor: 'rgba(190,96,68,0.06)', border: '1px solid rgba(190,96,68,0.15)' }}>
          Motivo: {prof.motivo_rechazo}
        </p>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {tab === 'pendiente' && (
          <>
            <button
              onClick={onApprove} disabled={isActing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50"
              style={{ backgroundColor: 'rgba(94,139,97,0.1)', color: 'var(--sage)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(94,139,97,0.25)' }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Aprobar
            </button>
            <button
              onClick={onRejectOpen} disabled={isActing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50"
              style={{ backgroundColor: 'rgba(190,96,68,0.08)', color: 'var(--terracotta)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(190,96,68,0.2)' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Rechazar
            </button>
          </>
        )}
        {tab === 'aprobado' && (
          <button
            onClick={onRevoke} disabled={isActing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50"
            style={{ backgroundColor: 'rgba(176,139,90,0.1)', color: '#B08B5A', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(176,139,90,0.25)' }}
          >
            Revocar aprobación
          </button>
        )}
        {tab === 'rechazado' && (
          <button
            onClick={onApprove} disabled={isActing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50"
            style={{ backgroundColor: 'rgba(94,139,97,0.1)', color: 'var(--sage)', fontFamily: 'var(--font-dm-sans)', border: '1px solid rgba(94,139,97,0.25)' }}
          >
            Aprobar
          </button>
        )}
      </div>
    </article>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = VerificationStatus

const TABS: { key: Tab; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado',  label: 'Aprobados'  },
  { key: 'rechazado', label: 'Rechazados' },
]

export default function ProfesionalesPage() {
  const [tab, setTab]             = useState<Tab>('pendiente')
  const [profs, setProfs]         = useState<AdminProfessional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingId, setActingId]   = useState<number | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminProfessional | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    adminApi.getProfessionals(tab)
      .then(setProfs)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar'))
      .finally(() => setIsLoading(false))
  }, [tab])

  const handleVerify = async (id: number, status: VerificationStatus, motivo?: string) => {
    setActingId(id)
    try {
      await adminApi.verifyProfessional(id, status, motivo)
      setProfs(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setActingId(null)
      setRejectTarget(null)
    }
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-4xl mx-auto">

      {/* Cabecera */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}>
          Admin
        </p>
        <h1 className="mt-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2 }}>
          Gestión de profesionales
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
          const active = tab === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
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
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <Spinner />
      ) : profs.length === 0 ? (
        <div className="rounded-2xl px-6 py-14 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--warm-mid)' }}>
            No hay profesionales {tab === 'pendiente' ? 'pendientes' : tab === 'aprobado' ? 'aprobados' : 'rechazados'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {profs.map(prof => (
            <ProfCard
              key={prof.id}
              prof={prof}
              tab={tab}
              isActing={actingId === prof.id}
              onApprove={() => handleVerify(prof.id, 'aprobado')}
              onRejectOpen={() => setRejectTarget(prof)}
              onRevoke={() => handleVerify(prof.id, 'pendiente')}
            />
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {rejectTarget && (
        <RejectModal
          nombre={`${rejectTarget.nombre} ${rejectTarget.apellido}`}
          isActing={actingId === rejectTarget.id}
          onConfirm={motivo => handleVerify(rejectTarget.id, 'rechazado', motivo)}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}
