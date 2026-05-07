'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

// ─── Iconos ───────────────────────────────────────────────────────────────────

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 4C16 4 7 9.5 7 18C7 22.97 11.03 27 16 27V4Z" fill="var(--sage)" fillOpacity="0.85" />
      <path d="M16 4C16 4 25 9.5 25 18C25 22.97 20.97 27 16 27V4Z" fill="var(--sage)" fillOpacity="0.3" />
      <line x1="16" y1="27" x2="16" y2="31" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3L21 21M10.5 10.68A3 3 0 0013.32 13.5M6.36 6.5C4.27 8.03 2 12 2 12C2 12 5 19 12 19C13.83 19 15.45 18.47 16.82 17.65M9.9 5.24C10.58 5.08 11.28 5 12 5C19 5 22 12 22 12C22 12 21.08 13.92 19.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Input helper ─────────────────────────────────────────────────────────────

function inputFocusOn(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'var(--sage)'
  e.target.style.boxShadow  = '0 0 0 3px rgba(94,139,97,0.12)'
}
function inputFocusOff(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'var(--border)'
  e.target.style.boxShadow  = 'none'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error }   = useAuth()
  const router                        = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await login(email, password)
      if (user.role === 'admin') router.replace('/admin')
      else if (user.role === 'psicologo') router.replace('/dashboard')
      else router.replace('/')
    } catch {
      // el error ya está en `error` del hook
    }
  }

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Atmospheric blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, var(--sage-light) 0%, transparent 65%)', opacity: 0.13, filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, #F0C5A3 0%, transparent 70%)', opacity: 0.18, filter: 'blur(60px)' }} />
      </div>

      <div className="relative w-full max-w-md anim-fade-up">

        {/* Tarjeta principal */}
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 12px 48px rgba(35,26,20,0.08)',
          }}
        >
          {/* Cabecera de marca */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group" aria-label="Mente Sana Saltillo">
              <LeafIcon />
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 500, letterSpacing: '0.04em' }}>
                Mente{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--sage)' }}>Sana</span>
              </span>
            </Link>
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '2.1rem',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Bienvenido de vuelta
            </h1>
            <p
              className="mt-2"
              style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--warm-mid)', lineHeight: 1.6 }}
            >
              Inicia sesión para continuar
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div
              className="mb-5 rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#FEF0EC', border: '1px solid #F5C5B5' }}
            >
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--terracotta)' }}>
                {error}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)', fontWeight: 500 }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className="mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
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

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-mid)', fontWeight: 500 }}
              >
                Contraseña
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    backgroundColor: 'var(--background)',
                    border: '1.5px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={inputFocusOn}
                  onBlur={inputFocusOff}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: 'var(--warm-mid)' }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full py-3.5 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--terracotta)',
                color: '#fff',
                fontFamily: 'var(--font-dm-sans)',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(190,96,68,0.3)',
              }}
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Links de pie */}
          <div className="mt-8 space-y-3 text-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.87rem', color: 'var(--warm-mid)' }}>
              ¿No tienes cuenta?{' '}
              <Link
                href="/auth/registro"
                className="font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
                style={{ color: 'var(--terracotta)' }}
              >
                Regístrate
              </Link>
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.87rem', color: 'var(--warm-mid)' }}>
              ¿Eres profesional?{' '}
              <Link
                href="/registro-profesional"
                className="font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
                style={{ color: 'var(--sage)' }}
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Nota de privacidad */}
        <p
          className="mt-5 text-center"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--warm-mid)', opacity: 0.75 }}
        >
          Tu información está protegida y nunca es compartida con terceros.
        </p>
      </div>
    </div>
  )
}
