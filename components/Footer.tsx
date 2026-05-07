import Link from 'next/link'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/especialistas', label: 'Especialistas' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-[#D4C8BC]">

      {/* Cuerpo principal */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

          {/* Columna: marca y tagline */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <FooterLeafIcon className="w-6 h-6 text-sage-light" />
              <span className="font-serif text-lg text-[#F0E8DC]">
                Mente <span className="italic text-sage-light">Sana</span>
              </span>
            </div>
            <p className="text-sm text-[#A89888] leading-relaxed">
              Conectando personas de Saltillo con profesionales de salud mental.
            </p>
          </div>

          {/* Columna: enlaces rápidos */}
          <div>
            <h2 className="text-[0.65rem] font-medium tracking-[0.18em] uppercase text-[#7A6A5E] mb-4">
              Navegación
            </h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[#B8A898] hover:text-[#F0E8DC] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna: aviso de emergencias */}
          <div>
            <div className="rounded-xl border border-[#BE6044]/30 bg-[#BE6044]/10 p-4">
              <div className="flex items-start gap-2.5">
                <IconWarning className="w-4 h-4 mt-0.5 shrink-0 text-terracotta" />
                <div>
                  <p className="text-xs font-semibold text-terracotta mb-1.5 leading-snug">
                    Este sitio es un directorio informativo, no un servicio de emergencias.
                  </p>
                  <p className="text-xs text-[#B8A898] leading-relaxed">
                    Si estás en crisis, llama al{' '}
                    <a
                      href="tel:8002900024"
                      className="font-bold text-terracotta hover:underline"
                    >
                      800-290-0024
                    </a>{' '}
                    (SAPTEL — atención las 24 horas)
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[#5A4A3E]">
            © {year} Mente Sana Saltillo. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#5A4A3E]">
            Saltillo, Coahuila, México
          </p>
        </div>
      </div>

    </footer>
  )
}

function FooterLeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 4C16 4 7 9.5 7 18C7 22.97 11.03 27 16 27V4Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path
        d="M16 4C16 4 25 9.5 25 18C25 22.97 20.97 27 16 27V4Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <line
        x1="16" y1="27" x2="16" y2="31"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  )
}

function IconWarning({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 9V13M12 17H12.01M3.44 17.12L10.44 4.12C11.05 3.03 12.95 3.03 13.56 4.12L20.56 17.12C21.17 18.21 20.22 19.5 19 19.5H5C3.78 19.5 2.83 18.21 3.44 17.12Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}
