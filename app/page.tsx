import Link from "next/link";
import * as profApi from "@/lib/api/professionals.api";

async function getSpecialistCount(): Promise<number | null> {
  try {
    const res = await profApi.getAll({ limit: 1 });
    return res.pagination.total;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const specialistCount = await getSpecialistCount();
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >      
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-16 pb-28 lg:px-16 lg:pt-24 lg:pb-36">
        {/* Atmospheric blob decorations */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full anim-float"
          style={{
            background: "radial-gradient(circle, var(--sage-light) 0%, transparent 70%)",
            opacity: 0.45,
            filter: "blur(48px)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 -left-16 w-[360px] h-[360px] rounded-full"
          style={{
            background: "radial-gradient(circle, #F0C5A3 0%, transparent 70%)",
            opacity: 0.3,
            filter: "blur(56px)",
          }}
        />

        {/* Location badge */}
        <div
          className="anim-fade-up inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full"
          style={{ backgroundColor: "var(--sage-light)", color: "var(--foreground)" }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--sage)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Saltillo, Coahuila
          </span>
        </div>

        {/* Headline */}
        <div className="relative max-w-5xl">
          <h1
            className="anim-fade-up d1"
            style={{
              fontFamily: "var(--font-cormorant)",
              lineHeight: 1.03,
              letterSpacing: "-0.025em",
            }}
          >
            <span
              className="block"
              style={{
                fontSize: "clamp(3.8rem, 9vw, 7.5rem)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--sage)",
              }}
            >
              Tu mente
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(3.8rem, 9vw, 7.5rem)",
                fontWeight: 600,
              }}
            >
              merece atención
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(3.8rem, 9vw, 7.5rem)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--warm-mid)",
              }}
            >
              y cuidado.
            </span>
          </h1>

          <p
            className="anim-fade-up d2 mt-8 max-w-xl"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: "var(--warm-mid)",
            }}
          >
            Sabemos que dar el primer paso puede ser difícil. En Saltillo tienes
            acceso a especialistas comprometidos con tu bienestar emocional.
            No estás solo.
          </p>

          <div className="anim-fade-up d3 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/especialistas"
              className="inline-flex items-center gap-3 rounded-full transition-all hover:opacity-90 hover:shadow-lg"
              style={{
                backgroundColor: "var(--terracotta)",
                color: "#fff",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "1rem",
                fontWeight: 500,
                padding: "1rem 2rem",
              }}
            >
              Encuentra tu especialista
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.875rem",
                color: "var(--warm-mid)",
              }}
            >
              Primera consulta orientativa gratuita
            </span>
          </div>
          {specialistCount !== null && specialistCount > 0 && (
            <p
              className="anim-fade-up d3 mt-5"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.8rem",
                color: "var(--warm-mid)",
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ color: "var(--sage)", fontWeight: 600 }}>
                {specialistCount}
              </span>{" "}
              especialistas certificados disponibles en Saltillo
            </p>
          )}
        </div>
      </section>

      {/* ── Awareness section ───────────────────────────────────────── */}
      <section
        className="px-6 py-20 lg:px-16"
        style={{ backgroundColor: "var(--cream-alt)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="mb-12"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--warm-mid)",
            }}
          >
            Por qué importa
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 — Stat */}
            <div
              className="rounded-3xl p-8 flex flex-col justify-between"
              style={{ backgroundColor: "var(--sage)", color: "#fff", minHeight: "280px" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "5.5rem",
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                1 de 4
              </p>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "1rem",
                    lineHeight: 1.65,
                    opacity: 0.92,
                  }}
                >
                  personas en México enfrenta un problema de salud mental a lo
                  largo de su vida.
                </p>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.8rem",
                    opacity: 0.65,
                  }}
                >
                  — OMS, 2023
                </p>
              </div>
            </div>

            {/* Card 2 — Quote */}
            <div
              className="rounded-3xl p-8 flex flex-col justify-between"
              style={{ backgroundColor: "var(--card-bg)", minHeight: "280px" }}
            >
              <svg
                width="36"
                height="28"
                viewBox="0 0 36 28"
                fill="none"
                aria-hidden
                className="mb-4"
              >
                <path
                  d="M0 28V16.8C0 7.46667 4.26667 1.86667 12.8 0L14.4 2.8C10.4 3.86667 8 6.93333 8 11.2H14.4V28H0ZM21.6 28V16.8C21.6 7.46667 25.8667 1.86667 34.4 0L36 2.8C32 3.86667 29.6 6.93333 29.6 11.2H36V28H21.6Z"
                  fill="var(--sage-light)"
                />
              </svg>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "1.5rem",
                    fontStyle: "italic",
                    fontWeight: 500,
                    lineHeight: 1.45,
                    color: "var(--foreground)",
                  }}
                >
                  Pedir ayuda no es señal de debilidad. Es el primer acto de
                  valentía hacia ti mismo.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    style={{
                      width: "32px",
                      height: "2px",
                      backgroundColor: "var(--sage)",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.8rem",
                      color: "var(--warm-mid)",
                    }}
                  >
                    Equipo de especialistas
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 — Awareness */}
            <div
              className="rounded-3xl p-8 flex flex-col justify-between"
              style={{ backgroundColor: "var(--foreground)", color: "#F9F4ED", minHeight: "280px" }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="17"
                  cy="17"
                  r="15"
                  stroke="var(--sage-light)"
                  strokeWidth="1.5"
                />
                <path
                  d="M17 11V19M17 22V23"
                  stroke="var(--sage-light)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    color: "#EDE5D4",
                  }}
                >
                  La depresión y la ansiedad son las condiciones más frecuentes,
                  y en la mayoría de los casos{" "}
                  <strong style={{ color: "var(--sage-light)" }}>
                    tienen tratamiento efectivo
                  </strong>
                  .
                </p>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.85rem",
                    color: "var(--warm-mid)",
                  }}
                >
                  No tienes que vivir con eso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA section ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-28 lg:px-16 text-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Subtle center blob */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div
            style={{
              width: "600px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, var(--sage-light) 0%, transparent 65%)",
              opacity: 0.2,
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <p
            className="mb-5"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--warm-mid)",
            }}
          >
            Damos el primer paso juntos
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2.6rem, 5.5vw, 4.5rem)",
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            En Saltillo hay especialistas
            <br />
            listos para escucharte.
          </h2>
          <p
            className="mt-6 max-w-xl mx-auto"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              color: "var(--warm-mid)",
            }}
          >
            Encuentra al profesional que mejor se adapte a tus necesidades,
            desde la comodidad de tu hogar o en consulta presencial en Saltillo.
          </p>
          <Link
            href="/especialistas"
            className="inline-flex items-center gap-3 mt-10 rounded-full transition-all hover:opacity-90 hover:shadow-xl"
            style={{
              backgroundColor: "var(--terracotta)",
              color: "#fff",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "1.05rem",
              fontWeight: 500,
              padding: "1.1rem 2.4rem",
            }}
          >
            Encuentra tu especialista
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.8rem",
              color: "var(--warm-mid)",
            }}
          >
            Sin costo de registro · Primera orientación gratuita
          </p>
        </div>
      </section>

    </div>
  );
}
