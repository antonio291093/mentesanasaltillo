import dynamic from 'next/dynamic'

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface MapaUbicacionProps {
  lat?: number | null
  lng?: number | null
  onChange: (lat: number, lng: number) => void
  readOnly?: boolean
}

// ─── Skeleton de carga (visible hasta que Leaflet hidrata) ────────────────────

function MapSkeleton() {
  return (
    <div style={{
      height: '360px',
      borderRadius: '14px',
      border: '1.5px solid var(--border)',
      background: 'var(--card-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    }}>
      {/* Pin animado */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 28 40"
        width="28"
        height="40"
        style={{ opacity: 0.25, animation: 'pulse 1.6s ease-in-out infinite' }}
        aria-hidden="true"
      >
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z"
          fill="var(--terracotta)"
        />
        <circle cx="14" cy="13" r="5.5" fill="white" opacity="0.94" />
        <circle cx="14" cy="13" r="2.8" fill="var(--terracotta)" />
      </svg>
      <span style={{
        fontSize: '13px',
        color: 'var(--warm-mid)',
        letterSpacing: '0.02em',
        opacity: 0.7,
      }}>
        Cargando mapa…
      </span>

      {/* Keyframes inyectados inline (solo para el skeleton) */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}

// ─── Importación dinámica (evita "window is not defined" en SSR) ──────────────

const MapaUbicacionDynamic = dynamic(
  () => import('./MapaUbicacionInner').then((m) => ({ default: m.MapaUbicacionInner })),
  { ssr: false, loading: () => <MapSkeleton /> },
)

// ─── Wrapper público ──────────────────────────────────────────────────────────

export default function MapaUbicacion(props: MapaUbicacionProps) {
  return <MapaUbicacionDynamic {...props} />
}
