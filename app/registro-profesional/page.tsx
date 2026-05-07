'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import * as profApi from '@/lib/api/professionals.api'
import * as specApi from '@/lib/api/specialties.api'
import type { Specialty, Modality } from '@/lib/types/api.types'

// ─── Style helpers ─────────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)',
  backgroundColor: 'var(--background)',
  border: '1.5px solid var(--border)',
  color: 'var(--foreground)',
  fontSize: '0.875rem',
}

function inputFocusOn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'var(--sage)'
  e.target.style.boxShadow   = '0 0 0 3px rgba(94,139,97,0.1)'
}
function inputFocusOff(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'var(--border)'
  e.target.style.boxShadow   = 'none'
}

// ─── Atoms ─────────────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span style={{
      display: 'block',
      fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--warm-mid)', fontWeight: 500,
    }}>
      {children}
      {required && <span style={{ color: 'var(--terracotta)', marginLeft: 2 }}>*</span>}
    </span>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5" style={{
      fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600,
      paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </h2>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12C1.87 9.78 3.28 7.86 5.06 6.38M9.9 4.24A9.12 9.12 0 0112 4C17 4 21.27 7.61 23 12C22.27 13.94 21.04 15.63 19.5 16.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M1 12C2.73 7.61 7 4 12 4C17 4 21.27 7.61 23 12C21.27 16.39 17 20 12 20C7 20 2.73 16.39 1 12Z" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  const done1 = current === 2
  return (
    <div className="flex items-start mb-10">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
          backgroundColor: 'var(--sage)',
          border: '2px solid var(--sage)',
          color: '#fff',
        }}>
          {done1
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2.5 8L6.5 12L13.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            : <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', fontWeight: 600 }}>1</span>
          }
        </div>
        <span style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem', letterSpacing: '0.08em',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          color: 'var(--sage)', fontWeight: current === 1 ? 600 : 400,
        }}>
          Tu cuenta
        </span>
      </div>

      <div className="flex-1 h-px mx-4 mt-[1.1rem] transition-colors duration-500"
        style={{ backgroundColor: done1 ? 'var(--sage)' : 'var(--border)' }}
      />

      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
          backgroundColor: current === 2 ? 'var(--sage)' : 'transparent',
          border: `2px solid ${current === 2 ? 'var(--sage)' : 'var(--border)'}`,
          color: current === 2 ? '#fff' : 'var(--warm-mid)',
        }}>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', fontWeight: 600 }}>2</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem', letterSpacing: '0.08em',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          color: current === 2 ? 'var(--sage)' : 'var(--warm-mid)',
          fontWeight: current === 2 ? 600 : 400,
        }}>
          Tu perfil
        </span>
      </div>
    </div>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface S1 {
  nombre: string; apellido: string; email: string
  password: string; confirmPassword: string; titulo: string
}
interface S2 {
  descripcion: string; cedula_profesional: string; cedula_especialidad: string
  precio_sesion_min: string; precio_sesion_max: string; modalidad: Modality
  direccion: string; colonia: string; ciudad: string
  selectedIds: number[]; addingId: number | ''
}

const TITULO_OPTIONS = ['Psicólogo/a', 'Psiquiatra', 'Terapeuta', 'Psicoterapeuta', 'Orientador/a', 'Otro']

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RegistroProfesionalPage() {
  const { register } = useAuth()

  const [step, setStep]                 = useState<1 | 2 | 3>(1)
  const [catalog, setCatalog]           = useState<Specialty[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [showPwd, setShowPwd]           = useState(false)
  const [showConf, setShowConf]         = useState(false)

  const [s1, setS1] = useState<S1>({
    nombre: '', apellido: '', email: '',
    password: '', confirmPassword: '', titulo: 'Psicólogo/a',
  })
  const [s2, setS2] = useState<S2>({
    descripcion: '', cedula_profesional: '', cedula_especialidad: '',
    precio_sesion_min: '', precio_sesion_max: '', modalidad: 'presencial',
    direccion: '', colonia: '', ciudad: 'Saltillo',
    selectedIds: [], addingId: '',
  })

  useEffect(() => { specApi.getAll().then(setCatalog).catch(() => {}) }, [])

  const upd1 = (f: keyof S1) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setS1(p => ({ ...p, [f]: e.target.value }))

  const upd2 = (f: keyof Omit<S2, 'selectedIds' | 'addingId'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setS2(p => ({ ...p, [f]: e.target.value }))

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!s1.nombre.trim() || !s1.apellido.trim() || !s1.email.trim() || !s1.password) {
      setError('Completa todos los campos requeridos')
      return
    }
    if (s1.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (s1.password !== s1.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError(null)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!s2.cedula_profesional.trim()) {
      setError('La cédula profesional es obligatoria')
      return
    }
    setIsSubmitting(true)
    setError(null)
    let accountCreated = false
    try {
      await register(s1.email, s1.password, s1.nombre, s1.apellido, 'psicologo')
      accountCreated = true
      await profApi.createProfile({
        descripcion:         s2.descripcion || null,
        cedula_profesional:  s2.cedula_profesional,
        cedula_especialidad: s2.cedula_especialidad || null,
        precio_sesion_min:   s2.precio_sesion_min ? Number(s2.precio_sesion_min) : null,
        precio_sesion_max:   s2.precio_sesion_max ? Number(s2.precio_sesion_max) : null,
        modalidad:           s2.modalidad,
        direccion:           s2.direccion || null,
        colonia:             s2.colonia || null,
        ciudad:              s2.ciudad,
      })
      if (s2.selectedIds.length > 0) {
        await profApi.updateSpecialties(s2.selectedIds)
      }
      setStep(3)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la solicitud'
      setError(accountCreated
        ? 'Tu cuenta fue creada, pero hubo un error al guardar el perfil. Inicia sesión y ve a Mi Perfil para completarlo.'
        : msg
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSpec = () => {
    if (!s2.addingId || s2.selectedIds.includes(Number(s2.addingId))) return
    setS2(p => ({ ...p, selectedIds: [...p.selectedIds, Number(p.addingId)], addingId: '' }))
  }
  const removeSpec = (id: number) =>
    setS2(p => ({ ...p, selectedIds: p.selectedIds.filter(x => x !== id) }))

  const available = catalog.filter(s => !s2.selectedIds.includes(s.id))
  const pwdMatch  = s1.confirmPassword.length > 0 && s1.password === s1.confirmPassword

  // ─── Pantalla de éxito ──────────────────────────────────────────────────────

  if (step === 3) {
    return (
      <div
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="max-w-md w-full text-center anim-fade-up">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: 'rgba(94,139,97,0.12)', border: '2px solid rgba(94,139,97,0.3)' }}
          >
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--sage)' }} aria-hidden>
              <path d="M8 20L16 28L32 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '0.5rem' }}>
            Solicitud recibida
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            ¡Solicitud enviada!
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--warm-mid)', marginBottom: '2.5rem' }}>
            Tu perfil está en revisión. El equipo de Mente Sana Saltillo verificará tu cédula profesional y te notificará cuando tu perfil esté activo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)', boxShadow: '0 4px 14px rgba(190,96,68,0.28)' }}
            >
              Ir al inicio
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', fontFamily: 'var(--font-dm-sans)', border: '1px solid var(--border)' }}
            >
              Ir al dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Formulario principal ───────────────────────────────────────────────────

  return (
    <div
      className="px-6 py-10 lg:py-14"
      style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 4rem)' }}
    >
      <div className="max-w-2xl mx-auto">

        {/* Cabecera */}
        <div className="mb-10 anim-fade-up">
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm-mid)', marginBottom: '0.4rem' }}>
            Registro profesional — Paso {step} de 2
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.15, marginBottom: '0.75rem' }}>
            {step === 1
              ? 'Únete al directorio'
              : `Hola, ${s1.titulo} ${s1.apellido || s1.nombre}`
            }
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--warm-mid)', lineHeight: 1.6 }}>
            {step === 1
              ? 'Crea tu cuenta para aparecer en el directorio de Mente Sana Saltillo.'
              : 'Completa tu información profesional para enviarnos tu solicitud.'
            }
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Banner de error */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-2xl"
            style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.2)' }}
          >
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}>
              {error}
            </p>
          </div>
        )}

        {/* ── PASO 1 ─────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleStep1} noValidate className="anim-fade-up d1">
            <div
              className="rounded-3xl p-7 space-y-5"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              <SectionTitle>Información de la cuenta</SectionTitle>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Nombre</FieldLabel>
                  <input
                    type="text" value={s1.nombre} onChange={upd1('nombre')}
                    required placeholder="Ana"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
                <div>
                  <FieldLabel required>Apellido</FieldLabel>
                  <input
                    type="text" value={s1.apellido} onChange={upd1('apellido')}
                    required placeholder="García"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
              </div>

              <div>
                <FieldLabel required>Título profesional</FieldLabel>
                <select
                  value={s1.titulo} onChange={upd1('titulo')}
                  className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all cursor-pointer"
                  style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                >
                  {TITULO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <FieldLabel required>Correo electrónico</FieldLabel>
                <input
                  type="email" value={s1.email} onChange={upd1('email')}
                  required placeholder="ana.garcia@ejemplo.com" autoComplete="email"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                  style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                />
              </div>

              <div>
                <FieldLabel required>Contraseña</FieldLabel>
                <div className="relative mt-1.5">
                  <input
                    type={showPwd ? 'text' : 'password'} value={s1.password}
                    onChange={upd1('password')} required
                    placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                    className="w-full rounded-xl px-4 py-3 pr-11 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                  <button
                    type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--warm-mid)' }}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
                {s1.password.length > 0 && s1.password.length < 8 && (
                  <p className="mt-1.5" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--terracotta)' }}>
                    Mínimo 8 caracteres
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Confirmar contraseña</FieldLabel>
                <div className="relative mt-1.5">
                  <input
                    type={showConf ? 'text' : 'password'} value={s1.confirmPassword}
                    onChange={upd1('confirmPassword')} required
                    placeholder="Repite tu contraseña" autoComplete="new-password"
                    className="w-full rounded-xl px-4 py-3 pr-11 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                  <button
                    type="button" onClick={() => setShowConf(v => !v)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--warm-mid)' }}
                    aria-label={showConf ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <EyeIcon open={showConf} />
                  </button>
                </div>
                {s1.confirmPassword.length > 0 && (
                  <p
                    className="mt-1.5 flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: pwdMatch ? 'var(--sage)' : 'var(--terracotta)' }}
                  >
                    {pwdMatch
                      ? <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Las contraseñas coinciden</>
                      : 'Las contraseñas no coinciden'
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--warm-mid)' }}>
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" style={{ color: 'var(--terracotta)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Inicia sesión
                </Link>
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'var(--terracotta)', color: '#fff', fontFamily: 'var(--font-dm-sans)', boxShadow: '0 4px 14px rgba(190,96,68,0.28)' }}
              >
                Continuar
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* ── PASO 2 ─────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleStep2} noValidate className="space-y-6 anim-fade-up d1">

            {/* Sobre ti */}
            <div className="rounded-3xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <SectionTitle>Sobre ti</SectionTitle>
              <FieldLabel>Descripción / Biografía</FieldLabel>
              <textarea
                value={s2.descripcion} onChange={upd2('descripcion')} rows={5}
                placeholder="Cuéntanos sobre tu enfoque terapéutico, experiencia y lo que te motiva…"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all resize-none"
                style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
              />
            </div>

            {/* Credenciales */}
            <div className="rounded-3xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <SectionTitle>Credenciales</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Cédula profesional</FieldLabel>
                  <input
                    type="text" value={s2.cedula_profesional} onChange={upd2('cedula_profesional')}
                    required placeholder="Ej. 7654321"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
                <div>
                  <FieldLabel>Cédula de especialidad</FieldLabel>
                  <input
                    type="text" value={s2.cedula_especialidad} onChange={upd2('cedula_especialidad')}
                    placeholder="Opcional"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
              </div>
            </div>

            {/* Modalidad y precio */}
            <div className="rounded-3xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <SectionTitle>Modalidad y precio</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel required>Modalidad</FieldLabel>
                  <select
                    value={s2.modalidad} onChange={upd2('modalidad')}
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all cursor-pointer"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  >
                    <option value="presencial">Presencial</option>
                    <option value="online">En línea</option>
                    <option value="ambas">Presencial y en línea</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Precio mínimo (MXN)</FieldLabel>
                  <input
                    type="number" min={0} value={s2.precio_sesion_min}
                    onChange={upd2('precio_sesion_min')} placeholder="Ej. 600"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
                <div>
                  <FieldLabel>Precio máximo (MXN)</FieldLabel>
                  <input
                    type="number" min={0} value={s2.precio_sesion_max}
                    onChange={upd2('precio_sesion_max')} placeholder="Ej. 900"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="rounded-3xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <SectionTitle>Ubicación del consultorio</SectionTitle>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Dirección</FieldLabel>
                  <input
                    type="text" value={s2.direccion} onChange={upd2('direccion')}
                    placeholder="Calle y número"
                    className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Colonia</FieldLabel>
                    <input
                      type="text" value={s2.colonia} onChange={upd2('colonia')}
                      placeholder="Ej. Centro"
                      className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                      style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                    />
                  </div>
                  <div>
                    <FieldLabel>Ciudad</FieldLabel>
                    <input
                      type="text" value={s2.ciudad} onChange={upd2('ciudad')}
                      className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                      style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Especialidades */}
            <div className="rounded-3xl p-7" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <SectionTitle>Especialidades</SectionTitle>

              <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                {s2.selectedIds.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)', fontStyle: 'italic' }}>
                    Sin especialidades seleccionadas aún.
                  </p>
                ) : (
                  s2.selectedIds.map(id => {
                    const spec = catalog.find(s => s.id === id)
                    if (!spec) return null
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                        style={{ backgroundColor: 'rgba(94,139,97,0.1)', border: '1px solid rgba(94,139,97,0.25)', fontFamily: 'var(--font-dm-sans)', color: 'var(--foreground)' }}
                      >
                        {spec.nombre}
                        <button
                          type="button" onClick={() => removeSpec(id)}
                          style={{ color: 'var(--warm-mid)', lineHeight: 1 }}
                          aria-label={`Eliminar ${spec.nombre}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </span>
                    )
                  })
                )}
              </div>

              {available.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={s2.addingId}
                    onChange={e => setS2(p => ({ ...p, addingId: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className="flex-1 rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer"
                    style={INPUT_STYLE} onFocus={inputFocusOn} onBlur={inputFocusOff}
                  >
                    <option value="">Seleccionar especialidad…</option>
                    {available.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                  <button
                    type="button" onClick={addSpec} disabled={!s2.addingId}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                    style={{ backgroundColor: 'var(--sage)', color: '#fff', fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Agregar
                  </button>
                </div>
              )}
            </div>

            {/* Footer del formulario */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <button
                type="button"
                onClick={() => { setError(null); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="inline-flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--warm-mid)', fontFamily: 'var(--font-dm-sans)' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Volver al paso anterior
              </button>
              <button
                type="submit" disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--terracotta)',
                  color: '#fff',
                  fontFamily: 'var(--font-dm-sans)',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(190,96,68,0.28)',
                }}
              >
                {isSubmitting && (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                )}
                {isSubmitting ? 'Enviando solicitud…' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
