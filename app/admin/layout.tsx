'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

// ─── Iconos ────────────────────────────────────────────────────────────────────

function IconGrid()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg> }
function IconUsers()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 20C3 17.24 5.69 15 9 15C12.31 15 15 17.24 15 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 11C17.93 11 19.5 12.57 19.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M19.5 14.5C20.88 14.5 22 15.62 22 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconStar()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> }
function IconLogout() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 21H5C4.45 21 4 20.55 4 20V4C4 3.45 4.45 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }

// ─── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/admin',               label: 'Resumen',         Icon: IconGrid  },
  { href: '/admin/profesionales', label: 'Profesionales',   Icon: IconUsers },
  { href: '/admin/resenas',       label: 'Reseñas',         Icon: IconStar  },
]

// ─── Sidebar content ───────────────────────────────────────────────────────────

function SidebarContent({
  nombre, apellido, email, pathname, onLogout, onClose,
}: {
  nombre: string; apellido: string; email: string
  pathname: string; onLogout: () => void; onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--terracotta)', color: '#fff' }}
          >
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 600 }}>
              {nombre.charAt(0)}{apellido.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', fontWeight: 600 }} className="truncate">
              {nombre} {apellido}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'var(--terracotta)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Administrador
            </p>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--warm-mid)', marginTop: '0.4rem' }} className="truncate">
          {email}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Navegación del panel admin">
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
                color: active ? 'var(--terracotta)' : 'var(--warm-mid)',
                backgroundColor: active ? 'rgba(190,96,68,0.08)' : 'transparent',
                borderLeft: active ? '2px solid var(--terracotta)' : '2px solid transparent',
              }}
            >
              <Icon />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-5" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <button
          onClick={() => { onLogout(); onClose?.() }}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl transition-all"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--terracotta)' }}
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router                      = useRouter()
  const pathname                    = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!user)                    router.replace('/auth/login')
      else if (user.role !== 'admin') router.replace('/')
    }
  }, [user, isLoading, router])

  const handleLogout = () => { logout(); router.push('/') }

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--terracotta)' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
          <path d="M12 2A10 10 0 0122 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]" style={{ backgroundColor: 'var(--background)' }}>

      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
        style={{ backgroundColor: 'var(--cream-alt)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarContent
          nombre={user.nombre} apellido={user.apellido} email={user.email}
          pathname={pathname} onLogout={handleLogout}
        />
      </aside>

      {/* Barra inferior móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40" style={{ backgroundColor: 'var(--cream-alt)', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl"
                style={{
                  color: active ? 'var(--terracotta)' : 'var(--warm-mid)',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.62rem',
                  fontWeight: active ? 600 : 400,
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
            style={{ color: 'var(--warm-mid)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem' }}
          >
            <IconLogout />
            Salir
          </button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
