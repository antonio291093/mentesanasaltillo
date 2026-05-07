import Link from 'next/link'

// ─── Datos estáticos ──────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Explora perfiles verificados',
    desc: 'Navega entre especialistas con cédula profesional comprobada. Cada perfil incluye especialidades, modalidad, rango de precios y horarios reales.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M18 18L24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Encuentra al especialista para ti',
    desc: 'Filtra por especialidad, modalidad (presencial u online) y precio. Compara perfiles y lee reseñas de otros pacientes antes de decidir.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 24C5 20.13 9.03 17 14 17C18.97 17 23 20.13 23 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 8L22 10L26 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Contáctalo directamente',
    desc: 'Sin intermediarios. Una vez que creas tu cuenta, accedes al teléfono y dirección del especialista para agendar tu consulta como prefieras.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M5 6H23V19C23 19.55 22.55 20 22 20H6C5.45 20 5 19.55 5 19V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M5 6L14 14L23 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const VALUES = [
  {
    title: 'Accesibilidad',
    desc: 'Información clara, gratuita y sin formularios complicados. Cualquier persona de Saltillo puede buscar ayuda sin barreras.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M13 8V13L17 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: 'var(--sage)',
    bg: 'var(--sage-light)',
  },
  {
    title: 'Confianza',
    desc: 'Todos los profesionales son verificados manualmente. Revisamos cédula, título y datos antes de aprobar cualquier perfil.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <path d="M13 3L4 7V13C4 18.25 7.97 23.17 13 24C18.03 23.17 22 18.25 22 13V7L13 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 13L12 16L18 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: 'var(--terracotta)',
    bg: '#F5D5CA',
  },
  {
    title: 'Privacidad',
    desc: 'Tu búsqueda es completamente privada. No compartimos tus datos con los especialistas hasta que tú decidas contactarlos.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <rect x="5" y="11" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 11V8C9 5.79 10.79 4 13 4C15.21 4 17 5.79 17 8V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="13" cy="17" r="1.5" fill="currentColor" />
      </svg>
    ),
    color: 'var(--warm-mid)',
    bg: 'var(--cream-alt)',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SobreNosotrosPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 lg:px-16 lg:pt-28 lg:pb-36">

        {/* Blobs decorativos */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
          aria-hidden
          style={{
            background: 'radial-gradient(circle, var(--sage-light) 0%, transparent 70%)',
            opacity: 0.4,
            filter: 'blur(56px)',
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 -left-10 w-72 h-72 rounded-full"
          aria-hidden
          style={{
            background: 'radial-gradient(circle, #F0C5A3 0%, transparent 70%)',
            opacity: 0.28,
            filter: 'blur(50px)',
          }}
        />

        <div className="relative max-w-4xl">
          <p
            className="anim-fade-up inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'var(--sage-light)', color: 'var(--foreground)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
          >
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sage)' }} />
            Sobre nosotros
          </p>

          <h1 className="anim-fade-up d1" style={{ fontFamily: 'var(--font-cormorant)', lineHeight: 1.05, letterSpacing: '-0.025em' }}>
            <span
              className="block"
              style={{ fontSize: 'clamp(3.2rem, 7vw, 6rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--sage)' }}
            >
              Cada persona
            </span>
            <span
              className="block"
              style={{ fontSize: 'clamp(3.2rem, 7vw, 6rem)', fontWeight: 600 }}
            >
              merece encontrar
            </span>
            <span
              className="block"
              style={{ fontSize: 'clamp(3.2rem, 7vw, 6rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--warm-mid)' }}
            >
              al especialista correcto.
            </span>
          </h1>

          <p
            className="anim-fade-up d2 mt-8 max-w-xl"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--warm-mid)' }}
          >
            Somos un directorio verificado de profesionales de salud mental, creado para las personas de Saltillo, Coahuila.
          </p>
        </div>
      </section>

      {/* ── Por qué existimos ────────────────────────────────────────────── */}
      <section className="px-6 py-20 lg:px-16 lg:py-28" style={{ backgroundColor: 'var(--cream-alt)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Texto */}
          <div>
            <p
              className="mb-5"
              style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}
            >
              Por qué existimos
            </p>
            <h2
              className="mb-8"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.15 }}
            >
              El problema que queremos resolver
            </h2>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1rem', lineHeight: 1.85, color: 'var(--warm-mid)' }} className="space-y-5">
              <p>
                En Saltillo, muchas personas que necesitan apoyo psicológico o psiquiátrico no saben por dónde empezar. Las opciones existen, pero están dispersas, son difíciles de comparar y no siempre es claro si un profesional está certificado.
              </p>
              <p>
                Esa incertidumbre tiene un costo real: personas que postergan buscar ayuda, que eligen mal por falta de información, o que simplemente se rinden antes de dar el primer paso.
              </p>
              <p>
                Mente Sana Saltillo nació para resolver exactamente eso: un directorio claro, confiable y local donde cualquier persona pueda encontrar al especialista que necesita, sin complicaciones.
              </p>
            </div>
          </div>

          {/* Pull quote */}
          <div className="relative">
            <div
              className="rounded-3xl p-10"
              style={{ backgroundColor: 'var(--foreground)', color: '#F9F4ED' }}
            >
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none" aria-hidden className="mb-6">
                <path d="M0 32V19.2C0 8.53 4.87 2.13 14.6 0L16.5 3.2C11.9 4.43 9.14 7.92 9.14 12.8H16.5V32H0ZM23.5 32V19.2C23.5 8.53 28.37 2.13 38.1 0L40 3.2C35.4 4.43 32.64 7.92 32.64 12.8H40V32H23.5Z" fill="var(--sage-light)" fillOpacity="0.35" />
              </svg>
              <p
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, color: '#EDE5D4' }}
              >
                Pedir ayuda no es señal de debilidad. Es el primer acto de valentía hacia ti mismo.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div style={{ width: '36px', height: '2px', backgroundColor: 'var(--sage-light)' }} />
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--sage-light)', letterSpacing: '0.04em' }}>
                  Equipo Mente Sana Saltillo
                </p>
              </div>
            </div>
            {/* Decoración esquina */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl -z-10"
              aria-hidden
              style={{ backgroundColor: 'var(--sage-light)', opacity: 0.4 }}
            />
          </div>

        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────────────── */}
      <section className="px-6 py-20 lg:px-16 lg:py-28" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <p
              className="mb-4"
              style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}
            >
              Simple y directo
            </p>
            <h2
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.15 }}
            >
              Cómo funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="relative rounded-3xl p-8 flex flex-col"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                {/* Número grande */}
                <span
                  className="absolute top-6 right-8 select-none"
                  aria-hidden
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '5rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--sage-light)',
                    opacity: 0.6,
                  }}
                >
                  {step.n}
                </span>

                {/* Ícono */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'var(--sage-light)', color: 'var(--sage)' }}
                >
                  {step.icon}
                </div>

                {/* Conector entre pasos */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 z-10"
                    aria-hidden
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                  />
                )}

                <h3
                  className="mb-3"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.2 }}
                >
                  {step.title}
                </h3>
                <p
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--warm-mid)' }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Nuestros valores ─────────────────────────────────────────────── */}
      <section className="px-6 py-20 lg:px-16 lg:py-28" style={{ backgroundColor: 'var(--cream-alt)' }}>
        <div className="max-w-6xl mx-auto">

          <div className="mb-14">
            <p
              className="mb-4"
              style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warm-mid)' }}
            >
              Lo que nos guía
            </p>
            <h2
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.15 }}
            >
              Nuestros valores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((val) => (
              <div
                key={val.title}
                className="rounded-3xl p-8"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: val.bg, color: val.color }}
                >
                  {val.icon}
                </div>
                <h3
                  className="mb-3"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.6rem', fontWeight: 600 }}
                >
                  {val.title}
                </h3>
                <p
                  style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.92rem', lineHeight: 1.78, color: 'var(--warm-mid)' }}
                >
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA para profesionales ───────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-24 lg:px-16 lg:py-32"
        style={{ backgroundColor: 'var(--foreground)', color: '#F9F4ED' }}
      >
        {/* Blob decorativo fondo oscuro */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div
            style={{
              width: '640px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, var(--sage) 0%, transparent 65%)',
              opacity: 0.08,
              filter: 'blur(70px)',
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <p
            className="mb-5"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sage-light)', opacity: 0.8 }}
          >
            Para profesionales
          </p>
          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              lineHeight: 1.15,
              color: '#EDE5D4',
            }}
          >
            ¿Eres especialista en salud mental en Saltillo?
          </h2>
          <p
            className="mb-10 max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '1.05rem', lineHeight: 1.8, color: '#A89888' }}
          >
            Lleva tu práctica a más personas. Registra tu perfil, comparte tus especialidades y horarios, y conecta con pacientes que te buscan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-full transition-all hover:opacity-90 hover:shadow-xl"
              style={{
                backgroundColor: 'var(--terracotta)',
                color: '#fff',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.05rem',
                fontWeight: 500,
                padding: '1rem 2.2rem',
                cursor: 'pointer',
              }}
            >
              Registra tu perfil
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3.5 9H14.5M14.5 9L10 4.5M14.5 9L10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link
              href="/especialistas"
              style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: '#7A6A5E' }}
              className="hover:text-[#A89888] transition-colors"
            >
              Ver cómo se ven los perfiles →
            </Link>
          </div>

          <p
            className="mt-6"
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: '#5A4A3E' }}
          >
            Sin costo · Verificación en 48 h · Control total de tu perfil
          </p>
        </div>
      </section>

    </div>
  )
}
