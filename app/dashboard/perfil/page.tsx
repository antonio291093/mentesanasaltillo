'use client'

import { useEffect, useState } from 'react'
import * as profApi from '@/lib/api/professionals.api'
import * as specApi from '@/lib/api/specialties.api'
import type { ProfessionalProfile, Specialty, Modality } from '@/lib/types/api.types'

// ─── Tipos del formulario ─────────────────────────────────────────────────────

interface ProfileForm {
  descripcion:         string
  foto_url:            string
  precio_sesion_min:   string
  precio_sesion_max:   string
  modalidad:           Modality
  direccion:           string
  colonia:             string
  ciudad:              string
  cedula_profesional:  string
  cedula_especialidad: string
}

const EMPTY_FORM: ProfileForm = {
  descripcion: '', foto_url: '', precio_sesion_min: '', precio_sesion_max: '',
  modalidad: 'presencial', direccion: '', colonia: '', ciudad: 'Saltillo',
  cedula_profesional: '', cedula_especialidad: '',
}

function profileToForm(p: ProfessionalProfile): ProfileForm {
  return {
    descripcion:         p.descripcion ?? '',
    foto_url:            p.perfil_foto ?? '',
    precio_sesion_min:   p.precio_sesion_min?.toString() ?? '',
    precio_sesion_max:   p.precio_sesion_max?.toString() ?? '',
    modalidad:           p.modalidad,
    direccion:           p.direccion ?? '',
    colonia:             p.colonia ?? '',
    ciudad:              p.ciudad,
    cedula_profesional:  p.cedula_profesional,
    cedula_especialidad: p.cedula_especialidad ?? '',
  }
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function inputFocusOn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'var(--sage)'
  e.target.style.boxShadow  = '0 0 0 3px rgba(94,139,97,0.1)'
}
function inputFocusOff(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'var(--border)'
  e.target.style.boxShadow  = 'none'
}

const INPUT_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)',
  backgroundColor: 'var(--background)',
  border: '1.5px solid var(--border)',
  color: 'var(--foreground)',
  fontSize: '0.875rem',
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--warm-mid)', fontWeight: 500 }}>
      {children}
    </label>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-5"
      style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 600, paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}
    >
      {children}
    </h2>
  )
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

export default function PerfilPage() {
  const [profile, setProfile]         = useState<ProfessionalProfile | null>(null)
  const [noProfile, setNoProfile]     = useState(false)
  const [catalog, setCatalog]         = useState<Specialty[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [addingId, setAddingId]       = useState<number | ''>('')
  const [form, setForm]               = useState<ProfileForm>(EMPTY_FORM)
  const [isLoading, setIsLoading]     = useState(true)
  const [isSaving, setIsSaving]       = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      profApi.getMyProfile().catch(err => {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('404') || msg.includes('no encontr') || msg.includes('perfil')) {
          setNoProfile(true)
          return null
        }
        throw err
      }),
      specApi.getAll(),
    ]).then(([prof, specs]) => {
      if (prof) {
        setProfile(prof)
        setForm(profileToForm(prof))
        setSelectedIds((prof.specialties ?? []).map(s => s.id))
      }
      setCatalog(specs)
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil')
    }).finally(() => setIsLoading(false))
  }, [])

  const set = (field: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleRemoveSpecialty = (id: number) =>
    setSelectedIds(prev => prev.filter(x => x !== id))

  const handleAddSpecialty = () => {
    if (!addingId || selectedIds.includes(Number(addingId))) return
    setSelectedIds(prev => [...prev, Number(addingId)])
    setAddingId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const payload = {
      descripcion:        form.descripcion || null,
      perfil_foto:        form.foto_url || null,
      precio_sesion_min:  form.precio_sesion_min ? Number(form.precio_sesion_min) : null,
      precio_sesion_max:  form.precio_sesion_max ? Number(form.precio_sesion_max) : null,
      modalidad:          form.modalidad,
      direccion:          form.direccion || null,
      colonia:            form.colonia || null,
      ciudad:             form.ciudad,
      cedula_profesional: form.cedula_profesional,
      cedula_especialidad: form.cedula_especialidad || null,
    }

    try {
      const updated = noProfile
        ? await profApi.createProfile(payload)
        : await profApi.updateProfile(payload)

      await profApi.updateSpecialties(selectedIds)

      setProfile(updated)
      setNoProfile(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <Spinner />

  const availableToAdd = catalog.filter(s => !selectedIds.includes(s.id))

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
          {noProfile ? 'Crea tu perfil profesional' : 'Edita tu perfil profesional'}
        </h1>
      </div>

      {/* Feedback */}
      {success && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(94,139,97,0.1)', border: '1px solid rgba(94,139,97,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--sage)', flexShrink: 0 }}><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--sage)' }}>
            Perfil guardado correctamente.
          </p>
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(190,96,68,0.08)', border: '1px solid rgba(190,96,68,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--terracotta)' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-10">

        {/* ── Información básica ─────────────────────────────────────── */}
        <section>
          <SectionTitle>Información básica</SectionTitle>
          <div className="space-y-4">

            <div>
              <Label>Descripción / Biografía</Label>
              <textarea
                value={form.descripcion}
                onChange={set('descripcion')}
                rows={5}
                placeholder="Cuéntale a tus pacientes sobre ti, tu enfoque y tu experiencia…"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all resize-none"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>

            <div>
              <Label>URL de foto de perfil</Label>
              <input
                type="url"
                value={form.foto_url}
                onChange={set('foto_url')}
                placeholder="https://…"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>

          </div>
        </section>

        {/* ── Credenciales ───────────────────────────────────────────── */}
        <section>
          <SectionTitle>Credenciales</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Cédula profesional *</Label>
              <input
                type="text"
                value={form.cedula_profesional}
                onChange={set('cedula_profesional')}
                required
                placeholder="Ej. 7654321"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
            <div>
              <Label>Cédula de especialidad</Label>
              <input
                type="text"
                value={form.cedula_especialidad}
                onChange={set('cedula_especialidad')}
                placeholder="Opcional"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
          </div>
        </section>

        {/* ── Consulta ───────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Modalidad y precio</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Modalidad *</Label>
              <select
                value={form.modalidad}
                onChange={set('modalidad')}
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all cursor-pointer"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              >
                <option value="presencial">Presencial</option>
                <option value="online">En línea</option>
                <option value="ambas">Presencial y en línea</option>
              </select>
            </div>
            <div>
              <Label>Precio mínimo (MXN)</Label>
              <input
                type="number"
                value={form.precio_sesion_min}
                onChange={set('precio_sesion_min')}
                min={0}
                placeholder="Ej. 600"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
            <div>
              <Label>Precio máximo (MXN)</Label>
              <input
                type="number"
                value={form.precio_sesion_max}
                onChange={set('precio_sesion_max')}
                min={0}
                placeholder="Ej. 900"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
          </div>
        </section>

        {/* ── Ubicación ──────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Ubicación del consultorio</SectionTitle>
          <div className="space-y-4">
            <div>
              <Label>Dirección</Label>
              <input
                type="text"
                value={form.direccion}
                onChange={set('direccion')}
                placeholder="Calle y número"
                className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Colonia</Label>
                <input
                  type="text"
                  value={form.colonia}
                  onChange={set('colonia')}
                  placeholder="Ej. Centro"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                  style={INPUT_STYLE}
                  onFocus={inputFocusOn}
                  onBlur={inputFocusOff}
                />
              </div>
              <div>
                <Label>Ciudad</Label>
                <input
                  type="text"
                  value={form.ciudad}
                  onChange={set('ciudad')}
                  placeholder="Saltillo"
                  className="mt-1.5 w-full rounded-xl px-4 py-3 outline-none transition-all"
                  style={INPUT_STYLE}
                  onFocus={inputFocusOn}
                  onBlur={inputFocusOff}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Especialidades ─────────────────────────────────────────── */}
        <section>
          <SectionTitle>Especialidades</SectionTitle>

          {/* Tags actuales */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIds.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem', color: 'var(--warm-mid)', fontStyle: 'italic' }}>
                Sin especialidades aún.
              </p>
            ) : (
              selectedIds.map(id => {
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
                      type="button"
                      onClick={() => handleRemoveSpecialty(id)}
                      className="hover:text-terracotta transition-colors"
                      style={{ color: 'var(--warm-mid)', lineHeight: 1 }}
                      aria-label={`Eliminar ${spec.nombre}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </span>
                )
              })
            )}
          </div>

          {/* Agregar especialidad */}
          {availableToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={addingId}
                onChange={e => setAddingId(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer"
                style={INPUT_STYLE}
                onFocus={inputFocusOn}
                onBlur={inputFocusOff}
              >
                <option value="">Seleccionar especialidad…</option>
                {availableToAdd.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSpecialty}
                disabled={!addingId}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{ backgroundColor: 'var(--sage)', color: '#fff', fontFamily: 'var(--font-dm-sans)' }}
              >
                Agregar
              </button>
            </div>
          )}
        </section>

        {/* ── Botón guardar ─────────────────────────────────────────── */}
        <div className="pt-2">
          <button
            type="submit"
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
            {isSaving ? 'Guardando…' : noProfile ? 'Crear perfil' : 'Guardar cambios'}
          </button>
        </div>

      </form>
    </div>
  )
}
