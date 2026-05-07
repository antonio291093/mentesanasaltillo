# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Proyecto

Plataforma web para conectar a personas de Saltillo, Coahuila con especialistas locales en salud mental.

### Objetivo

Reducir la barrera de acceso a servicios de salud mental en Saltillo, mostrando profesionales locales que ofrecen sus servicios.

### Audiencia

Personas de Saltillo que buscan atención psicológica o psiquiátrica.

### Páginas existentes

- `app/page.tsx` — Landing page: importancia de la salud mental + CTA hacia especialistas; muestra conteo real de especialistas
- `app/especialistas/page.tsx` — Listado de especialistas con datos reales de la API
- `app/especialistas/[id]/page.tsx` — Perfil detallado de especialista: foto, especialidades, horarios, precio, reviews
- `app/sobre-nosotros/page.tsx` — Sobre nosotros: misión, historia, cómo funciona y valores
- `app/auth/login/page.tsx` — Formulario de inicio de sesión con redirección por rol
- `app/auth/registro/page.tsx` — Formulario de registro para usuarios (role: usuario)
- `app/registro-profesional/page.tsx` — Registro en 2 pasos para psicólogos: cuenta + perfil profesional
- `app/dashboard/page.tsx` — Resumen del psicólogo: estado de verificación, stats, accesos rápidos
- `app/dashboard/perfil/page.tsx` — Editar perfil profesional: bio, cédulas, precios, ubicación, especialidades
- `app/dashboard/horarios/page.tsx` — Gestionar horarios de atención por día de la semana
- `app/dashboard/resenas/page.tsx` — Aprobar/rechazar reseñas de pacientes por pestañas
- `app/admin/layout.tsx` — Layout del panel admin: sidebar desktop + barra inferior móvil, guard de rol admin
- `app/admin/page.tsx` — Resumen admin: stats generales + tabla de profesionales pendientes con aprobar/rechazar inline
- `app/admin/profesionales/page.tsx` — Gestión de profesionales por estado (pendiente/aprobado/rechazado) con acciones
- `app/admin/resenas/page.tsx` — Listado de reseñas filtrado por estado vía query param `?estado=`
- `components/Navbar.tsx` — Navbar global sticky con menú hamburguesa y estado de sesión en tiempo real
- `components/Footer.tsx` — Footer global con links y aviso de crisis (SAPTEL)

### Convenciones de UI

- Toda la interfaz en español
- Tono cálido, empático y accesible — nunca clínico ni frío
- Skill activa: `frontend-design` (evitar diseño genérico de IA)

### Roadmap

#### Frontend (completado)
- Navbar + Footer globales en `layout.tsx`
- Página de perfil individual `/especialistas/[id]`
- Página `/sobre-nosotros`

#### Base de datos (completado)
- Schema PostgreSQL en `database/schema.sql` — ejecutado y validado en pgAdmin 4
- Documentación del modelo en `database/README.md`
- Tablas: users, user_profiles, professional_profiles, specialties,
  professional_specialties, schedules, reviews, review_edits, contact_views
- Roles PostgreSQL: app_admin, app_psicologo, app_usuario

#### Backend (completado)
- ✅ Estructura de carpetas Node.js + Express
- ✅ Configuración de conexión a PostgreSQL con pool
- ✅ Autenticación JWT con roles (register, login, refresh)
- ✅ Endpoints de profesionales (listado, perfil, crear, actualizar)
- ✅ Endpoints de especialidades (catálogo público)
- ✅ Endpoints de reviews (crear, editar, aprobar/rechazar)
- ✅ Middlewares: auth, roles, errores

#### Endpoints implementados (completo)
Auth
- `POST   /api/v1/auth/register`
- `POST   /api/v1/auth/login`
- `POST   /api/v1/auth/refresh`

Usuarios
- `GET    /api/v1/users/me`
- `PATCH  /api/v1/users/me`

Especialidades
- `GET    /api/v1/specialties`
- `POST   /api/v1/specialties` *(admin)*
- `DELETE /api/v1/specialties/:id` *(admin)*

Profesionales
- `GET    /api/v1/professionals`
- `GET    /api/v1/professionals/:id`
- `GET    /api/v1/professionals/me/profile`
- `POST   /api/v1/professionals/me/profile`
- `PUT    /api/v1/professionals/me/profile`
- `PUT    /api/v1/professionals/me/schedules`
- `PUT    /api/v1/professionals/me/specialties`
- `POST   /api/v1/professionals/me/specialties/:id`
- `DELETE /api/v1/professionals/me/specialties/:id`

Reviews
- `POST   /api/v1/reviews`
- `PUT    /api/v1/reviews/:id`
- `PUT    /api/v1/reviews/:id/status`

Admin
- `GET    /api/v1/admin/professionals/pending`
- `PUT    /api/v1/admin/professionals/:id/verify`
- `GET    /api/v1/admin/reviews`
- `GET    /api/v1/admin/stats`
- `GET    /api/v1/admin/users`
- `PATCH  /api/v1/admin/users/:id/toggle-active`

#### Frontend conectado con API (completado)
- ✅ Páginas de auth: `/auth/login` y `/auth/registro`
- ✅ Capa de servicios API en frontend (`lib/api/`, `lib/hooks/`, `lib/types/`)
- ✅ Conectar frontend con backend (placeholders reemplazados con datos reales)
- ✅ Navbar con estado de sesión en tiempo real (evento `auth-change`)

#### Frontend completado (dashboard, registro y admin)
- ✅ Dashboard de psicólogo: `/dashboard` (resumen, perfil, horarios, reseñas)
- ✅ Página de registro profesional: `/registro-profesional`
- ✅ Dashboard de administrador: `/admin` (resumen con stats, gestión de profesionales, gestión de reseñas)

#### Pendiente — Deploy a producción
- Dockerizar frontend, backend y PostgreSQL
- Configurar Nginx como reverse proxy
- Configurar Certbot para SSL/HTTPS
- Configurar dominio en Namecheap → DigitalOcean
- Cambiar `EMAIL_FROM` a `noreply@mentesanasaltillo.com` en producción
- Generar `JWT_SECRET` seguro para producción

## Comandos

```bash
npm run dev      # Servidor de desarrollo (http://localhost:3000)
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar ESLint
```

**E2E**: Playwright configurado en `e2e/` con 23 tests que cubren
navegación, autenticación, especialistas y dashboards.
Correr con: `$env:TEST_ENV="local"; npx playwright test --config=e2e/playwright.config.ts`

No hay unit tests ni integration tests configurados todavía.

## Stack

- **Next.js 16.2.4** con App Router — versión con breaking changes (ver AGENTS.md)
- **React 19**
- **TypeScript 5** en modo estricto; alias de ruta `@/*` apunta a la raíz del proyecto
- **Tailwind CSS v4** — configuración CSS-first (sin `tailwind.config.ts`)
- **ESLint 9** con presets `core-web-vitals` + TypeScript
- **PostgreSQL** — base de datos relacional (schema en `database/schema.sql`)

## Arquitectura

El proyecto usa el **App Router** de Next.js (`app/`). No existe directorio `pages/`.

### Tailwind CSS v4

La configuración se hace directamente en `app/globals.css` mediante la directiva `@theme inline`, **no** en un archivo `tailwind.config.ts`. Los tokens de diseño (colores, fuentes) se definen ahí como variables CSS:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --font-sans: var(--font-geist-sans);
}
```

### Fuentes

Las fuentes (Geist Sans y Geist Mono) se cargan en `app/layout.tsx` con `next/font/google` y se exponen como variables CSS (`--font-geist-sans`, `--font-geist-mono`) para usarlas desde el tema de Tailwind.

### Tema y colores

Los colores base se definen como propiedades CSS en `:root` dentro de `globals.css` y cambian automáticamente en modo oscuro con `@media (prefers-color-scheme: dark)`.

## Notas técnicas importantes

### IDs en la API
- `professional_id` en reviews y otros endpoints se refiere a `professional_profiles.id`, **NO** a `users.id`
- Siempre usar el `id` retornado por `GET /api/v1/professionals`

### Flujo de verificación de profesionales
1. Psicólogo se registra → `role: psicologo`
2. Completa perfil → `estado_verificacion: pendiente`
3. Admin aprueba → `estado_verificacion: aprobado`
4. Aparece público en `GET /api/v1/professionals`

### Flujo de reviews
1. Usuario crea review → `estado: pendiente` (no visible públicamente)
2. Psicólogo aprueba → `estado: aprobado` (visible públicamente)
3. Usuario edita → vuelve a `pendiente` automáticamente
4. Psicólogo debe aprobar de nuevo

### Permisos PostgreSQL
- Usuario de conexión: `sms_user` (definido en `.env` como `DB_USER`)
- Permisos otorgados con `GRANT ALL` en `schema.sql`
- Si se recrea la BD ejecutar `database/fix_permissions.sql`

### Autenticación en el frontend
- Token almacenado en localStorage con clave `accessToken`
- Hook `useAuth()` en `lib/hooks/useAuth.ts` maneja toda la sesión
- Evento personalizado `'auth-change'` sincroniza todas las instancias del hook (incluido Navbar) tras login/logout — sin llamadas extra a la API
- Redirección por rol tras login: `admin → /admin`, `psicologo → /dashboard`, `usuario → /`
- El cliente API (`lib/api/client.ts`) agrega el token automáticamente en cada request y reintenta con refresh en caso de 401

### Notificaciones por email (Resend)
- SDK: paquete npm `resend`
- Configuración: `RESEND_API_KEY` y `EMAIL_FROM` en `backend/.env`
- Durante desarrollo usar `EMAIL_FROM=onboarding@resend.dev`
- En producción usar `EMAIL_FROM=noreply@mentesanasaltillo.com`

Emails implementados:
- Bienvenida usuario → se envía al registrarse con `role='usuario'`
- Bienvenida psicólogo → se envía al registrarse con `role='psicologo'`
- Perfil aprobado → se envía cuando admin aprueba un profesional
- Perfil rechazado → se envía cuando admin rechaza con motivo

Todos los envíos son fire-and-forget (no interrumpen el flujo si fallan)
