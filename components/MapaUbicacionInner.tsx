'use client'

import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'

import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState, useEffect, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  lat?: number | null
  lng?: number | null
  onChange: (lat: number, lng: number) => void
  readOnly?: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const SALTILLO: [number, number] = [25.4232, -101.0053]

// ─── Ícono personalizado (pin terracotta) ─────────────────────────────────────

const PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40"
       style="filter:drop-shadow(0 4px 9px rgba(35,26,20,0.30))">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z"
          fill="#BE6044"/>
    <circle cx="14" cy="13" r="5.5" fill="white" opacity="0.94"/>
    <circle cx="14" cy="13" r="2.8" fill="#BE6044"/>
  </svg>
`

const markerIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:40px">${PIN_SVG}</div>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -44],
})

// ─── Sub-componente: captura clics en el mapa ─────────────────────────────────

function ClickLayer({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPlace(e.latlng.lat, e.latlng.lng) })
  return null
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function MapaUbicacionInner({ lat, lng, onChange, readOnly = false }: Props) {
  const safeLat = lat != null ? Number(lat) : null
  const safeLng = lng != null ? Number(lng) : null
  const hasCoords = safeLat != null && safeLng != null
  const [pos, setPos] = useState<[number, number] | null>(
    hasCoords ? [safeLat, safeLng] : null,
  )

  // Sincroniza si el padre cambia las coordenadas (ej: carga inicial desde API)
  useEffect(() => {
    const la = lat != null ? Number(lat) : null
    const lo = lng != null ? Number(lng) : null
    setPos(la != null && lo != null ? [la, lo] : null)
  }, [lat, lng])

  const place = useCallback((newLat: number, newLng: number) => {
    const rounded: [number, number] = [+newLat.toFixed(6), +newLng.toFixed(6)]
    setPos(rounded)
    onChange(rounded[0], rounded[1])
  }, [onChange])

  const center: [number, number] = pos ?? SALTILLO
  const zoom = readOnly ? 15 : 13

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>

      {/* ── Contenedor del mapa ──────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1.5px solid var(--border)',
        boxShadow: '0 2px 18px rgba(35,26,20,0.07), 0 1px 4px rgba(35,26,20,0.05)',
      }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '360px', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
          {!readOnly && <ClickLayer onPlace={place} />}
          {pos && (
            <Marker
              position={pos}
              icon={markerIcon}
              draggable={!readOnly}
              eventHandlers={
                readOnly ? {} : {
                  dragend(e) {
                    const { lat: la, lng: lo } = (e.target as L.Marker).getLatLng()
                    place(la, lo)
                  },
                }
              }
            />
          )}
        </MapContainer>

        {/* Hint flotante cuando no hay ubicación aún (solo modo edición) */}
        {!readOnly && !pos && (
          <div style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(253,250,245,0.96)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '7px 18px',
            fontSize: '13px',
            lineHeight: 1,
            color: 'var(--warm-mid)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 12px rgba(35,26,20,0.10)',
            letterSpacing: '0.01em',
          }}>
            Haz clic en el mapa para fijar la ubicación del consultorio
          </div>
        )}
      </div>

      {/* ── Pie: estado + coordenadas (solo modo edición) ────────────────────── */}
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '10px',
          minHeight: '22px',
          padding: '0 2px',
        }}>
          {pos ? (
            <>
              {/* Badge "Ubicación fijada" */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--sage)',
                background: 'rgba(94,139,97,0.11)',
                padding: '3px 10px 3px 7px',
                borderRadius: '20px',
                flexShrink: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="#5E8B61" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ubicación fijada
              </span>

              {/* Coordenadas numéricas */}
              <span style={{
                fontSize: '11px',
                color: 'var(--warm-mid)',
                fontFamily: 'ui-monospace, "Cascadia Code", monospace',
                letterSpacing: '0.03em',
                opacity: 0.85,
              }}>
                {Number(pos[0]).toFixed(6)},&nbsp;{Number(pos[1]).toFixed(6)}
              </span>
            </>
          ) : (
            <span style={{
              fontSize: '12px',
              color: 'var(--warm-mid)',
              opacity: 0.75,
              fontStyle: 'italic',
            }}>
              Sin ubicación — haz clic en el mapa o arrastra el marcador para ajustar
            </span>
          )}
        </div>
      )}
    </div>
  )
}
