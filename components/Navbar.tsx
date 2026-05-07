'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import type { AuthUser } from '@/lib/types/api.types'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/especialistas', label: 'Especialistas' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
]

function profileHref(user: AuthUser) {
  if (user.role === 'admin')     return '/admin'
  if (user.role === 'psicologo') return '/dashboard'
  return '/'
}

// ─── Dropdown menú de usuario ─────────────────────────────────────────────────

function UserMenu({ user, onLogout, onClose }: { user: AuthUser; onLogout: () => void; onClose?: () => void }) {
  const [open, setOpen]  = useState(false)
  const ref              = useRef<HTMLDivElement>(null)
  const router           = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    onLogout()
    setOpen(false)
    onClose?.()
    router.push('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:bg-sage-light/30"
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--foreground)',
          border: '1.5px solid var(--border)',
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar inicial */}
        <span
          className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--sage)', color: '#fff', fontFamily: 'var(--font-cormorant)', fontSize: '0.9rem' }}
        >
          {user.nombre.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate">{user.nombre}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-2xl py-1.5 z-50"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(35,26,20,0.12)',
          }}
        >
          <div
            className="px-4 py-2.5 mb-1"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--foreground)' }}>
              {user.nombre} {user.apellido}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--warm-mid)', marginTop: '2px' }}>
              {user.email}
            </p>
          </div>
          <Link
            href={profileHref(user)}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors hover:bg-sage-light/20"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--foreground)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 20C4 17.79 7.58 16 12 16C16.42 16 20 17.79 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Mi perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors hover:bg-sage-light/20"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 21H5C4.45 21 4 20.55 4 20V4C4 3.45 4.45 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Navbar principal ─────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen]          = useState(false)
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Marca */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 group"
            aria-label="Mente Sana Saltillo — inicio"
          >
            <LeafIcon className="w-7 h-7 text-sage transition-transform duration-300 group-hover:scale-105" />
            <div className="leading-none select-none">
              <span className="font-serif text-[1.2rem] font-medium text-foreground tracking-wide">
                Mente <span className="italic text-sage">Sana</span>
              </span>
              <span className="block text-[0.6rem] tracking-[0.18em] uppercase text-warm-mid font-sans">
                Saltillo
              </span>
            </div>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="
                  relative text-sm font-medium text-warm-mid
                  hover:text-foreground transition-colors duration-200
                  after:absolute after:-bottom-0.5 after:left-0
                  after:h-[1.5px] after:w-0 after:bg-sage
                  after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:block">
            {isLoading ? (
              /* Placeholder vacío durante hidratación para evitar flash */
              <div className="w-28 h-8" />
            ) : user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <Link
                href="/auth/login"
                className="
                  text-sm font-medium px-5 py-2 rounded-full
                  border-2 border-terracotta text-terracotta
                  hover:bg-terracotta hover:text-white
                  transition-all duration-200
                "
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Botón hamburguesa — solo móvil */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden p-2 -mr-2 text-warm-mid hover:text-foreground transition-colors"
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background px-5 pt-4 pb-6 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <nav className="flex flex-col gap-1 mb-5" aria-label="Menú móvil">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-base font-medium text-foreground hover:text-sage transition-colors border-b border-border/50 last:border-0"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth móvil */}
          {!isLoading && (
            user ? (
              <div className="space-y-2">
                <div
                  className="px-4 py-3 rounded-2xl mb-3"
                  style={{ backgroundColor: 'var(--sage-light)', opacity: 0.6 }}
                >
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--foreground)' }}>
                    {user.nombre} {user.apellido}
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--warm-mid)', marginTop: '2px' }}>
                    {user.email}
                  </p>
                </div>
                <Link
                  href={profileHref(user)}
                  onClick={() => setOpen(false)}
                  className="block w-full text-center text-sm font-medium px-5 py-2.5 rounded-full border-2 border-border hover:border-foreground transition-all duration-200"
                  style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--foreground)' }}
                >
                  Mi perfil
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="w-full text-sm font-medium px-5 py-2.5 rounded-full border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white transition-all duration-200"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="
                  block w-full text-center text-sm font-medium px-5 py-2.5 rounded-full
                  border-2 border-terracotta text-terracotta
                  hover:bg-terracotta hover:text-white
                  transition-all duration-200
                "
              >
                Iniciar sesión
              </Link>
            )
          )}
        </div>
      )}
    </header>
  )
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M16 4C16 4 7 9.5 7 18C7 22.97 11.03 27 16 27V4Z" fill="currentColor" fillOpacity="0.85" />
      <path d="M16 4C16 4 25 9.5 25 18C25 22.97 20.97 27 16 27V4Z" fill="currentColor" fillOpacity="0.3" />
      <line x1="16" y1="27" x2="16" y2="31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
      <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
