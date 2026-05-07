'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function IconGrid()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg> }
function IconUser()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20C4 17.79 7.58 16 12 16C16.42 16 20 17.79 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconClock()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconStar()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> }
function IconLogout()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 21H5C4.45 21 4 20.55 4 20V4C4 3.45 4.45 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconExternal()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 13V19C18 19.55 17.55 20 17 20H5C4.45 20 4 19.55 4 19V7C4 6.45 4.45 6 5 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 3H21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconMenu()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> }
function IconX()         { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> }

// ─── Config de navegación ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Resumen',   Icon: IconGrid  },
  { href: '/dashboard/perfil',   label: 'Mi Perfil', Icon: IconUser  },
  { href: '/dashboard/horarios', label: 'Horarios',  Icon: IconClock },
  { href: '/dashboard/resenas',  label: 'Reseñas',   Icon: IconStar  },
]

// ─── Sidebar (contenido compartido) ──────────────────────────────────────────

function SidebarContent({
  nombre, apellido, email, profileId,
  pathname, onLogout, onClose,
}: {
  nombre: string; apellido: string; email: string; profileId?: number
  pathname: string; onLogout: () => void; onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">

      {/* Avatar + info */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--sage)', color: '#fff' }}
          >
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', fontWeight: 600 }}>
              {nombre.charAt(0)}{apellido.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }} className="truncate">
              {nombre} {apellido}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--warm-mid)' }} className="truncate">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Navegación del dashboard">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--sage)' : 'var(--warm-mid)',
                backgroundColor: active ? 'rgba(94,139,97,0.1)' : 'transparent',
                borderLeft: active ? '2px solid var(--sage)' : '2px solid transparent',
              }}
            >
              <Icon />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="px-3 pb-5 space-y-1.5" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        {profileId && (
          <Link
            href={`/especialistas/${profileId}`}
            target="_blank"
            onClick={onClose}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl transition-all"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.82rem',
              color: 'var(--warm-mid)',
            }}
          >
            <IconExternal />
            Ver mi perfil público
          </Link>
        )}
        <button
          onClick={() => { onLogout(); onClose?.() }}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl transition-all"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.82rem',
            color: 'var(--terracotta)',
          }}
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router                      = useRouter()
  const pathname                    = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileId, setProfileId]   = useState<number | undefined>()

  // Guardia de ruta
  useEffect(() => {
    if (!isLoading) {
      if (!user)                     router.replace('/auth/login')
      else if (user.role !== 'psicologo') router.replace('/')
    }
  }, [user, isLoading, router])

  // Obtener el ID del perfil profesional para el link "Ver perfil público"
  useEffect(() => {
    if (!user || user.role !== 'psicologo') return
    import('@/lib/api/professionals.api').then(api =>
      api.getMyProfile()
        .then(p => setProfileId(p.id))
        .catch(() => {})
    )
  }, [user])

  const handleLogout = () => { logout(); router.push('/') }

  // Pantalla de carga / guard
  if (isLoading || !user || user.role !== 'psicologo') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--sage)' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
            <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)' }}>
            Verificando sesión…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]" style={{ backgroundColor: 'var(--background)' }}>

      {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
        style={{ backgroundColor: 'var(--cream-alt)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarContent
          nombre={user.nombre} apellido={user.apellido} email={user.email}
          profileId={profileId} pathname={pathname} onLogout={handleLogout}
        />
      </aside>

      {/* ── Barra superior móvil ─────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ backgroundColor: 'var(--cream-alt)', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  color: active ? 'var(--sage)' : 'var(--warm-mid)',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.62rem',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.04em',
                }}
              >
                <Icon />
                {label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--warm-mid)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem', letterSpacing: '0.04em' }}
          >
            <IconLogout />
            Salir
          </button>
        </div>
      </div>

      {/* ── Área de contenido ────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
