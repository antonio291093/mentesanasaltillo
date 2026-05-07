'use client'

import { useEffect, useState } from 'react'
import * as profApi from '@/lib/api/professionals.api'
import type { DayOfWeek, Schedule } from '@/lib/types/api.types'

// ─── Config de días ───────────────────────────────────────────────────────────

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'lunes',     label: 'Lunes',     short: 'L' },
  { key: 'martes',    label: 'Martes',    short: 'M' },
  { key: 'miercoles', label: 'Miércoles', short: 'X' },
  { key: 'jueves',    label: 'Jueves',    short: 'J' },
  { key: 'viernes',   label: 'Viernes',   short: 'V' },
  { key: 'sabado',    label: 'Sábado',    short: 'S' },
  { key: 'domingo',   label: 'Domingo',   short: 'D' },
]

interface DayConfig {
  enabled:     boolean
  hora_inicio: string
  hora_fin:    string
}

type WeekConfig = Record<DayOfWeek, DayConfig>

function defaultConfig(): WeekConfig {
  const obj = {} as WeekConfig
  DAYS.forEach(({ key }) => {
    obj[key] = { enabled: false, hora_inicio: '09:00', hora_fin: '18:00' }
  })
  return obj
}

function schedulesToConfig(schedules: Schedule[]): WeekConfig {
  const cfg = defaultConfig()
  schedules.forEach(s => {
    cfg[s.dia_semana] = {
      enabled:     true,
      hora_inicio: s.hora_inicio.slice(0, 5),
      hora_fin:    s.hora_fin.slice(0, 5),
    }
  })
  return cfg
}

function configToSchedules(cfg: WeekConfig): Schedule[] {
  return DAYS
    .filter(({ key }) => cfg[key].enabled)
    .map(({ key }) => ({
      dia_semana:  key,
      hora_inicio: cfg[key].hora_inicio,
      hora_fin:    cfg[key].hora_fin,
    }))
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function inputFocusOn(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'var(--sage)'
  e.target.style.boxShadow  = '0 0 0 3px rgba(94,139,97,0.1)'
}
function inputFocusOff(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'var(--border)'
  e.target.style.boxShadow  = 'none'
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

export default function HorariosPage() {
  const [days, setDays]       = useState<WeekConfig>(defaultConfig())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving]   = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    profApi.getMyProfile()
      .then(p => setDays(schedulesToConfig(p.schedules)))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const toggle = (key: DayOfWeek) =>
    setDays(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))

  const setTime = (key: DayOfWeek, field: 'hora_inicio' | 'hora_fin', value: string) =>
    setDays(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await profApi.updateSchedules(configToSchedules(days))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <Spinner />

  const activeCount = DAYS.filter(({ key }) => days[key].enabled).length

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
          Horarios de atención
        </h1>
        <p className="mt-2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)', lineHeight: 1.6 }}>
          Activa los días en que atiendes y define tu horario de inicio y fin.
          {activeCount > 0 && (
            <span style={{ color: 'var(--sage)', fontWeight: 500 }}> {activeCount} {activeCount === 1 ? 'día activo' : 'días activos'}.</span>
          )}
        </p>
      </div>

      {/* Feedback */}
      {success && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(94,139,97,0.1)', border: '1px solid rgba(94,139,97,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--sage)', flexShrink: 0 }}><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--sage)' }}>
            Horarios guardados correctamente.
          </p>
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}>{error}</p>
        </div>
      )}

      {/* Grid de días */}
      <div className="space-y-3 mb-8">
        {DAYS.map(({ key, label, short }) => {
          const cfg     = days[key]
          const enabled = cfg.enabled

          return (
            <div
              key={key}
              className="rounded-2xl transition-all"
              style={{
                backgroundColor: enabled ? 'var(--card-bg)' : 'transparent',
                border: `1.5px solid ${enabled ? 'var(--sage)' : 'var(--border)'}`,
                padding: '1rem 1.25rem',
              }}
            >
              <div className="flex items-center gap-4">

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  role="switch"
                  aria-checked={enabled}
                  className="relative shrink-0 transition-all"
                  style={{
                    width: '42px', height: '24px',
                    borderRadius: '12px',
                    backgroundColor: enabled ? 'var(--sage)' : 'var(--border)',
                  }}
                >
                  <span
                    className="absolute top-1 transition-all"
                    style={{
                      left: enabled ? '20px' : '4px',
                      width: '16px', height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>

                {/* Día */}
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.05rem',
                    fontWeight: enabled ? 600 : 400,
                    color: enabled ? 'var(--foreground)' : 'var(--warm-mid)',
                    minWidth: '90px',
                  }}
                >
                  {label}
                </span>

                {/* Horarios */}
                {enabled ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="time"
                      value={cfg.hora_inicio}
                      onChange={e => setTime(key, 'hora_inicio', e.target.value)}
                      className="rounded-xl px-3 py-1.5 outline-none transition-all text-sm"
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        backgroundColor: 'var(--background)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={inputFocusOn}
                      onBlur={inputFocusOff}
                    />
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--warm-mid)' }}>a</span>
                    <input
                      type="time"
                      value={cfg.hora_fin}
                      onChange={e => setTime(key, 'hora_fin', e.target.value)}
                      className="rounded-xl px-3 py-1.5 outline-none transition-all text-sm"
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        backgroundColor: 'var(--background)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={inputFocusOn}
                      onBlur={inputFocusOff}
                    />
                  </div>
                ) : (
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)', fontStyle: 'italic' }}>
                    No disponible
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Botón guardar */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all"
        style={{
          backgroundColor: 'var(--terracotta)',
          color: '#fff',
          fontFamily: 'var(--font-dm-sans)',
          opacity: isSaving ? 0.7 : 1,
          cursor: isSaving ? 'not-allowed' : 'pointer',
          boxShadow: isSaving ? 'none' : '0 4px 14px rgba(190,96,68,0.28)',
        }}
      >
        {isSaving && (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        )}
        {isSaving ? 'Guardando…' : 'Guardar horarios'}
      </button>

    </div>
  )
}
