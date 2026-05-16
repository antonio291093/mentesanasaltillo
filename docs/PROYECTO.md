# Mente Sana Saltillo — Documentación Técnica del Proyecto

> Última actualización: mayo 2026

---

## Tabla de contenidos

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura general](#3-arquitectura-general)
4. [Páginas del frontend](#4-páginas-del-frontend)
5. [Endpoints del backend](#5-endpoints-del-backend)
6. [Esquema de base de datos](#6-esquema-de-base-de-datos)
7. [Sistema de autenticación y roles](#7-sistema-de-autenticación-y-roles)
8. [Notificaciones por email](#8-notificaciones-por-email)
9. [Tests E2E](#9-tests-e2e)
10. [Configuración de Docker](#10-configuración-de-docker)
11. [Proceso de deploy paso a paso](#11-proceso-de-deploy-paso-a-paso)
12. [Flujo de trabajo para cambios en producción](#12-flujo-de-trabajo-para-cambios-en-producción)
13. [Variables de entorno requeridas](#13-variables-de-entorno-requeridas)
14. [Credenciales de desarrollo](#14-credenciales-de-desarrollo)
15. [Próximos pasos pendientes](#15-próximos-pasos-pendientes)

---

## 1. Descripción del proyecto

**Mente Sana Saltillo** (`mentesanasaltillo.com`) es una plataforma web que conecta a personas de Saltillo, Coahuila con especialistas locales en salud mental (psicólogos y psiquiatras).

### Objetivo

Reducir la barrera de acceso a servicios de salud mental en Saltillo mostrando un directorio de profesionales locales verificados que ofrecen atención presencial, en línea o ambas modalidades.

### Audiencia

- **Usuarios:** personas de Saltillo que buscan atención psicológica o psiquiátrica.
- **Psicólogos:** profesionales que quieren aparecer en el directorio y gestionar su presencia.
- **Administradores:** personal interno que verifica profesionales y modera reseñas.

### Tono de la plataforma

Cálido, empático y accesible — nunca clínico ni frío. Toda la interfaz está en español.

---

## 2. Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.4 | Framework principal — App Router; tiene breaking changes respecto a versiones anteriores |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Tipado estricto; alias `@/*` apunta a la raíz del proyecto |
| Tailwind CSS | v4 | Estilos con configuración CSS-first en `app/globals.css` (sin `tailwind.config.ts`) |
| ESLint | 9 | Linting con presets `core-web-vitals` + TypeScript |
| Geist Sans / Mono | — | Fuentes cargadas con `next/font/google`, expuestas como variables CSS |

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 4.19.2 | Framework HTTP |
| TypeScript | 5.x | Tipado estricto |
| PostgreSQL | 16 | Base de datos relacional |
| pg (node-postgres) | 8.12.0 | Driver y pool de conexiones (max 10) |
| jsonwebtoken | 9.0.2 | Tokens JWT (access + refresh) |
| bcryptjs | 2.4.3 | Hash de contraseñas |
| express-validator | 7.3.2 | Validación de entrada en rutas |
| helmet | 7.1.0 | Cabeceras de seguridad HTTP |
| resend | 6.12.3 | Envío de emails transaccionales |

### DevOps

| Tecnología | Uso |
|---|---|
| Docker | Contenedores para cada servicio |
| Docker Compose | Orquestación de servicios |
| Nginx | Reverse proxy + terminación SSL |
| Certbot | Certificados SSL automáticos (Let's Encrypt) |
| DigitalOcean | Hosting (destino de deploy) |
| Namecheap | Registro de dominio |

### Testing

| Tecnología | Versión | Uso |
|---|---|---|
| Playwright | 1.59.1 | Tests E2E — 23 tests |

---

## 3. Arquitectura general

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET / BROWSER                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ :80 / :443
                ┌──────────────▼──────────────┐
                │           NGINX              │
                │       Reverse Proxy          │
                │  SSL Termination (443 → 80)  │
                └──────┬────────────┬──────────┘
                       │            │
         /api/v1/*     │            │  /*
                       │            │
        ┌──────────────▼──┐   ┌─────▼──────────────┐
        │    BACKEND       │   │     FRONTEND        │
        │  Node.js/Express │   │   Next.js 16        │
        │    puerto 4000   │   │   puerto 3000       │
        │                  │   │   (standalone)      │
        └──────────┬───────┘   └─────────────────────┘
                   │
          ┌────────▼────────┐
          │   POSTGRESQL    │
          │   puerto 5432   │
          │  (volumen       │
          │   persistente)  │
          └─────────────────┘
```

### Estructura interna del backend (MVC)

```
HTTP Request
    │
    ▼
routes/         ← Definición de endpoints + validadores (express-validator)
    │
    ▼
middlewares/    ← authenticate, requireRole, errorHandler
    │
    ▼
controllers/    ← Parseo de request, llamada a service, formato de response
    │
    ▼
services/       ← Lógica de negocio, queries SQL, integración con email
    │
    ▼
PostgreSQL      ← Pool de conexiones (max 10)
```

### Estructura interna del frontend

```
app/            ← Páginas (App Router, server + client components)
    ├── layout.tsx       ← Navbar + Footer globales
    └── [páginas]/       ← Rutas del sitio

components/     ← Navbar.tsx, Footer.tsx

lib/
    ├── api/             ← Cliente HTTP base + módulos por recurso
    │   ├── client.ts    ← fetch wrapper con reintentos en 401
    │   ├── auth.api.ts
    │   ├── professionals.api.ts
    │   ├── reviews.api.ts
    │   ├── admin.api.ts
    │   └── specialties.api.ts
    ├── hooks/           ← useAuth, useProfessionals, useReviews
    └── types/           ← api.types.ts (espejo de los tipos del backend)
```

### Paleta de colores (design tokens en `app/globals.css`)

| Variable CSS | Valor hex | Uso |
|---|---|---|
| `--background` | `#F9F4ED` | Fondo principal (crema) |
| `--foreground` | `#231A14` | Texto (marrón oscuro) |
| `--sage` | `#5E8B61` | Color primario (verde salvia) |
| `--sage-light` | `#B8D4BA` | Verde salvia claro |
| `--terracotta` | `#BE6044` | Acento (terracota) |
| `--warm-mid` | `#756259` | Marrón cálido |
| `--cream-alt` | `#EDE5D4` | Crema alternativa |
| `--card-bg` | `#FDFAF5` | Fondo de tarjetas |
| `--border` | `#E2D9CC` | Bordes |

**Fuentes:** Cormorant Garamond (serif, títulos) + DM Sans (sans-serif, cuerpo).

---

## 4. Páginas del frontend

### Públicas (sin autenticación)

| Ruta | Archivo | Propósito |
|---|---|---|
| `/` | `app/page.tsx` | Landing: importancia de la salud mental + CTA; muestra conteo real de especialistas desde la API |
| `/especialistas` | `app/especialistas/page.tsx` | Directorio con filtros (especialidad, modalidad, precio, ciudad). Datos paginados de la API |
| `/especialistas/[id]` | `app/especialistas/[id]/page.tsx` | Perfil detallado: foto, bio, especialidades, horarios, precio, reseñas aprobadas, CTA de contacto |
| `/sobre-nosotros` | `app/sobre-nosotros/page.tsx` | Misión, historia, cómo funciona la plataforma y valores del equipo |

### Autenticación

| Ruta | Archivo | Propósito |
|---|---|---|
| `/auth/login` | `app/auth/login/page.tsx` | Formulario de inicio de sesión. Redirige por rol: `admin → /admin`, `psicologo → /dashboard`, `usuario → /` |
| `/auth/registro` | `app/auth/registro/page.tsx` | Registro para usuarios (role: `usuario`) |
| `/registro-profesional` | `app/registro-profesional/page.tsx` | Registro en 2 pasos para psicólogos: paso 1 cuenta, paso 2 perfil profesional |

### Dashboard del psicólogo (requiere rol `psicologo`)

| Ruta | Archivo | Propósito |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Resumen: estado de verificación, estadísticas, accesos rápidos |
| `/dashboard/perfil` | `app/dashboard/perfil/page.tsx` | Editar bio, cédulas, precios, ubicación, modalidad, especialidades |
| `/dashboard/horarios` | `app/dashboard/horarios/page.tsx` | Gestionar horarios de atención por día de la semana |
| `/dashboard/resenas` | `app/dashboard/resenas/page.tsx` | Aprobar o rechazar reseñas de pacientes (pestañas: pendientes / aprobadas / rechazadas) |

### Panel administrativo (requiere rol `admin`)

| Ruta | Archivo | Propósito |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Stats generales + tabla de profesionales pendientes con acciones inline (aprobar/rechazar) |
| `/admin/profesionales` | `app/admin/profesionales/page.tsx` | Gestión completa de profesionales filtrada por estado |
| `/admin/resenas` | `app/admin/resenas/page.tsx` | Listado de reseñas filtrado por estado vía query param `?estado=` |

### Componentes globales

| Componente | Propósito |
|---|---|
| `components/Navbar.tsx` | Navbar sticky con menú hamburguesa en móvil y estado de sesión en tiempo real (evento `auth-change`) |
| `components/Footer.tsx` | Links del sitio + aviso de crisis (línea SAPTEL 55 5259-8121) |
| `app/admin/layout.tsx` | Layout del panel admin: sidebar desktop + barra inferior móvil + guard de rol admin |

---

## 5. Endpoints del backend

Base URL: `/api/v1`

### Autenticación (`/auth`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Registra usuario o psicólogo. Body: `{ email, password, nombre, apellido, role }` |
| `POST` | `/auth/login` | Público | Inicia sesión. Retorna `{ tokens: { accessToken, refreshToken }, user }` |
| `POST` | `/auth/refresh` | Público | Renueva access token. Body: `{ refreshToken }` |

### Usuarios (`/users`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/users/me` | Autenticado | Datos del usuario en sesión |
| `PATCH` | `/users/me` | Autenticado | Actualiza nombre, apellido, teléfono, ciudad, foto |

### Especialidades (`/specialties`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/specialties` | Público | Catálogo completo de especialidades |
| `POST` | `/specialties` | Admin | Crea nueva especialidad |
| `DELETE` | `/specialties/:id` | Admin | Elimina especialidad |

### Profesionales (`/professionals`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/professionals` | Público | Directorio de aprobados. Params: `especialidad`, `modalidad`, `precio_max`, `ciudad`, `page`, `limit` |
| `GET` | `/professionals/:id` | Público | Perfil completo: especialidades, horarios, reseñas aprobadas, avg_rating |
| `GET` | `/professionals/me/profile` | Psicólogo | Perfil del psicólogo autenticado |
| `POST` | `/professionals/me/profile` | Psicólogo | Crea perfil profesional (primera vez) |
| `PUT` | `/professionals/me/profile` | Psicólogo | Actualiza datos del perfil |
| `PUT` | `/professionals/me/schedules` | Psicólogo | Reemplaza todos los horarios. Body: `{ schedules: [{dia_semana, hora_inicio, hora_fin}] }` |
| `PUT` | `/professionals/me/specialties` | Psicólogo | Reemplaza todas las especialidades. Body: `{ specialtyIds: [1, 3, 5] }` |
| `POST` | `/professionals/me/specialties/:id` | Psicólogo | Agrega una especialidad |
| `DELETE` | `/professionals/me/specialties/:id` | Psicólogo | Elimina una especialidad |

### Reseñas (`/reviews`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/reviews` | Usuario | Crea reseña. Body: `{ professional_id, calificacion, comentario? }`. Estado inicial: `pendiente` |
| `PUT` | `/reviews/:id` | Usuario | Edita reseña propia. Vuelve automáticamente a `pendiente` |
| `PUT` | `/reviews/:id/status` | Psicólogo | Aprueba o rechaza reseña de su perfil. Body: `{ estado }` |

### Administración (`/admin`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/admin/professionals` | Admin | Lista profesionales. Query: `?estado=pendiente\|aprobado\|rechazado` |
| `GET` | `/admin/professionals/pending` | Admin | Alias para estado=pendiente |
| `PUT` | `/admin/professionals/:id/verify` | Admin | Aprueba o rechaza profesional. Body: `{ estado, motivo? }` |
| `GET` | `/admin/reviews` | Admin | Lista reseñas. Query: `?estado=pendiente\|aprobado\|rechazado` |
| `GET` | `/admin/stats` | Admin | Estadísticas: usuarios por rol, profesionales por estado, reseñas por estado, nuevos del mes |
| `GET` | `/admin/users` | Admin | Lista todos los usuarios |
| `PATCH` | `/admin/users/:id/toggle-active` | Admin | Activa o desactiva un usuario |

### Health check

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Retorna `{ status: "ok" }` — usado por Docker healthcheck |

> **Importante:** `professional_id` en reviews se refiere a `professional_profiles.id`, **no** a `users.id`. Siempre usar el `id` devuelto por `GET /api/v1/professionals`.

---

## 6. Esquema de base de datos

### Enums definidos

```sql
user_role:           admin | psicologo | usuario
modalidad_tipo:      presencial | online | ambas
verificacion_estado: pendiente | aprobado | rechazado
dia_semana_tipo:     lunes | martes | miercoles | jueves | viernes | sabado | domingo
review_estado:       pendiente | aprobado | rechazado
```

### Tablas

#### `users` — Autenticación central

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| role | user_role | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `user_profiles` — Datos personales

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users(id), UNIQUE, CASCADE DELETE |
| nombre | VARCHAR(100) | NOT NULL |
| apellido | VARCHAR(100) | NOT NULL |
| foto_url | TEXT | |
| telefono | VARCHAR(20) | |
| ciudad | VARCHAR(100) | DEFAULT 'Saltillo' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `professional_profiles` — Perfil de especialista

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users(id), UNIQUE, CASCADE DELETE |
| descripcion | TEXT | |
| cedula_profesional | VARCHAR(50) | |
| cedula_especialidad | VARCHAR(50) | |
| titulo_url | TEXT | |
| precio_sesion_min | DECIMAL(8,2) | CHECK(> 0) |
| precio_sesion_max | DECIMAL(8,2) | CHECK(>= precio_sesion_min) |
| modalidad | modalidad_tipo | DEFAULT 'presencial' |
| direccion | TEXT | |
| colonia | VARCHAR(100) | |
| ciudad | VARCHAR(100) | DEFAULT 'Saltillo' |
| estado_verificacion | verificacion_estado | DEFAULT 'pendiente' |
| motivo_rechazo | TEXT | |
| aprobado_por | INTEGER | FK → users(id), SET NULL on delete |
| aprobado_at | TIMESTAMPTZ | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Actualizado automáticamente por trigger |

#### `specialties` — Catálogo cerrado

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| nombre | VARCHAR(150) | UNIQUE, NOT NULL |
| descripcion | TEXT | |

**12 especialidades precargadas:** Psicología Clínica, Psicología Infantil y Adolescente, Terapia de Pareja, Terapia Familiar Sistémica, Terapia Cognitivo-Conductual (TCC), Manejo de Ansiedad y Estrés, Trastornos del Estado de Ánimo, Neuropsicología, Psicoanálisis, Adicciones, Duelo y Pérdida, Psicología del Deporte.

#### `professional_specialties` — Relación muchos a muchos

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| professional_id | INTEGER | FK → professional_profiles(id), CASCADE DELETE |
| specialty_id | INTEGER | FK → specialties(id), CASCADE DELETE |
| | | UNIQUE(professional_id, specialty_id) |

#### `schedules` — Disponibilidad semanal recurrente

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| professional_id | INTEGER | FK → professional_profiles(id), CASCADE DELETE |
| dia_semana | dia_semana_tipo | NOT NULL |
| hora_inicio | TIME | NOT NULL |
| hora_fin | TIME | NOT NULL |
| | | CHECK(hora_fin > hora_inicio) |

#### `reviews` — Reseñas con moderación

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| professional_id | INTEGER | FK → professional_profiles(id), CASCADE DELETE |
| user_id | INTEGER | FK → users(id), CASCADE DELETE |
| calificacion | INTEGER | CHECK(1–5) |
| comentario | TEXT | |
| estado | review_estado | DEFAULT 'pendiente' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | Actualizado automáticamente por trigger |
| | | UNIQUE(professional_id, user_id) — una review por usuario por profesional |

#### `review_edits` — Bitácora de ediciones

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| review_id | INTEGER | FK → reviews(id), CASCADE DELETE |
| comentario_anterior | TEXT | |
| calificacion_anterior | INTEGER | |
| editado_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `contact_views` — Analítica de consultas de perfil

| Columna | Tipo | Restricciones |
|---|---|---|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users(id), CASCADE DELETE |
| professional_id | INTEGER | FK → professional_profiles(id), CASCADE DELETE |
| viewed_at | TIMESTAMPTZ | DEFAULT NOW() |

> Sin UNIQUE — registra cada acceso individual para análisis temporal.

### Diagrama de relaciones

```
users (1) ─────────────────────── (1) user_profiles
  │
  ├── (1) ─────────────────────── (1) professional_profiles
  │                                          │
  │                          ┌──────────────┤
  │                          │              │
  │              (N) professional_specialties (N)─── specialties
  │                          │
  │                     (N) schedules
  │
  ├── (1) ─── (N) reviews ─── (1) ─── (N) review_edits
  │               │
  └───────────────┘ (user también es FK de reviews)
  │
  └── (1) ─── (N) contact_views ─── (N) ─── (1) professional_profiles
```

### Roles de PostgreSQL

| Rol BD | Permisos |
|---|---|
| `app_admin` | CRUD completo en todas las tablas y secuencias |
| `app_psicologo` | Gestión de propio perfil, horarios; lectura y moderación de reviews de su perfil |
| `app_usuario` | Lectura del directorio; gestión de sus propias reviews |
| `sms_user` | Usuario de conexión de la app (en `.env`); DEFAULT PRIVILEGES completo |

> Si se recrea la BD, ejecutar `database/fix_permissions.sql` para restaurar permisos.

### Triggers

- `set_updated_at()`: actualiza `updated_at` automáticamente en `professional_profiles` y `reviews` en cada UPDATE.

---

## 7. Sistema de autenticación y roles

### Flujo de autenticación

```
1. POST /auth/register → crea user + user_profile en transacción → retorna tokens
2. POST /auth/login → verifica credenciales → retorna { accessToken, refreshToken }
3. Cliente guarda tokens en localStorage
4. Cada request lleva: Authorization: Bearer <accessToken>
5. Si 401 → cliente llama POST /auth/refresh automáticamente (singleton, sin race conditions)
6. Si refresh falla → logout automático
```

### Tokens JWT

| Token | Duración | Payload |
|---|---|---|
| `accessToken` | `JWT_EXPIRES_IN` (default `7d`) | `{ id, email, role }` |
| `refreshToken` | Mismo secreto, sin expiración configurada | `{ id, email, role }` |

### Middlewares de autenticación

| Middleware | Comportamiento |
|---|---|
| `authenticate()` | Obligatorio. Falla con 401 si no hay token válido o está expirado |
| `optionalAuthenticate()` | Intenta parsear JWT; no bloquea si no hay token |
| `requireRole(...roles)` | Verifica rol del usuario autenticado. 403 si no autorizado |

### Roles de aplicación

| Rol | Registro | Acceso |
|---|---|---|
| `usuario` | `/auth/registro` | Directorio público, crear y editar propias reseñas |
| `psicologo` | `/registro-profesional` | Dashboard, perfil, horarios, moderar reseñas de su perfil |
| `admin` | Solo por BD / seed | Panel admin completo, verificar profesionales, gestionar usuarios |

### Redirección por rol tras login

```
admin     → /admin
psicologo → /dashboard
usuario   → /
```

### Sincronización de sesión en frontend

El hook `useAuth()` usa un evento custom `auth-change` para sincronizar todas las instancias del hook (incluido el Navbar) sin llamadas extra a la API:

```typescript
// Al hacer login o logout:
window.dispatchEvent(new CustomEvent('auth-change', { detail: { user } }))

// Cada instancia de useAuth escucha:
window.addEventListener('auth-change', handler)
```

### Flujo de verificación de psicólogos

```
1. Psicólogo se registra en /registro-profesional
2. estado_verificacion = 'pendiente' — NO aparece en el directorio público
3. Admin revisa en /admin/profesionales
4. Admin aprueba → estado = 'aprobado' → aparece en GET /professionals
          → se envía email de aprobación al psicólogo
5. Admin rechaza → estado = 'rechazado' + motivo_rechazo
          → se envía email con el motivo al psicólogo
```

### Flujo de reseñas

```
1. Usuario crea review → estado = 'pendiente' (no visible públicamente)
2. Psicólogo aprueba → estado = 'aprobado' (visible en perfil público)
3. Si usuario edita → versión anterior se guarda en review_edits
                    → estado vuelve automáticamente a 'pendiente'
4. Psicólogo debe aprobar de nuevo
```

---

## 8. Notificaciones por email

**SDK:** `resend` (npm package)  
**Implementación:** `backend/src/services/email.service.ts`  
**Todos los envíos son fire-and-forget** — no interrumpen el flujo principal si fallan.

| Evento | Destinatario | Función del servicio |
|---|---|---|
| Usuario se registra (`role='usuario'`) | Nuevo usuario | `sendWelcomeUser(email, nombre)` |
| Psicólogo se registra (`role='psicologo'`) | Nuevo psicólogo | `sendWelcomeProfessional(email, nombre)` |
| Admin aprueba perfil | Psicólogo | `sendProfessionalApproved(email, nombre)` |
| Admin rechaza perfil | Psicólogo | `sendProfessionalRejected(email, nombre, motivo)` |

### Configuración

| Variable | Desarrollo | Producción |
|---|---|---|
| `RESEND_API_KEY` | API key real de Resend | API key real de Resend |
| `EMAIL_FROM` | `onboarding@resend.dev` | `noreply@mentesanasaltillo.com` |

> En producción, `mentesanasaltillo.com` debe estar verificado como dominio en el panel de Resend antes de usarlo como remitente.

---

## 9. Tests E2E

**Framework:** Playwright 1.59.1  
**Ubicación:** `e2e/`  
**Total:** 23 tests

### Cómo correr los tests

```powershell
# Todos los tests (requiere frontend y backend corriendo en localhost)
$env:TEST_ENV="local"; npx playwright test --config=e2e/playwright.config.ts

# Solo smoke tests públicos
$env:TEST_ENV="local"; npx playwright test --config=e2e/playwright.config.ts --project="chromium-smoke-public"

# Ver reporte HTML
npx playwright show-report
```

### Estructura de archivos

```
e2e/
├── playwright.config.ts        # Proyectos, browsers, opciones de retry y trace
├── auth/
│   ├── psicologo.setup.ts      # Login psicólogo → guarda .auth/psicologo.json
│   └── admin.setup.ts          # Login admin → guarda .auth/admin.json
├── helpers/
│   └── env-config.ts           # getBaseUrl(), getAuthFilePath(), getAdminAuthFilePath()
├── fixtures/                   # Custom Playwright fixtures
├── poms/                       # Page Object Models
└── tests/
    ├── smoke/
    │   ├── public/              # Sin autenticación
    │   ├── psicologo/           # Con rol psicólogo
    │   └── admin/               # Con rol admin
    ├── regression/              # Flujos críticos del sistema
    └── handover/                # Tests de nuevas features
```

### Proyectos de Playwright

| Project | Navegadores | Auth | Descripción |
|---|---|---|---|
| `*-smoke-public` | Chromium | Ninguna | Landing, directorio público |
| `*-smoke-psicologo` | Chromium | `.auth/psicologo.json` | Dashboard, perfil |
| `*-smoke-admin` | Chromium | `.auth/admin.json` | Panel admin |
| `*-regression` | Chromium, Firefox, WebKit, Mobile | `.auth/psicologo.json` | Flujos principales |
| `*-handover` | Chromium, Firefox, WebKit, Mobile | `.auth/psicologo.json` | Nuevas features |

### Opciones de la configuración

- **Retries:** 2 en CI, 0 en local
- **Workers:** 1 en CI (evita race conditions), `auto` en local
- **Trace:** `on-first-retry` — guarda video y screenshots en fallos
- **Reporter:** HTML

> No hay unit tests ni integration tests configurados.

---

## 10. Configuración de Docker

### Servicios (`docker-compose.yml`)

```yaml
postgres:
  image: postgres:16-alpine
  environment: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
  volumes: postgres_data (persistente)
  healthcheck: pg_isready cada 10s, 5 reintentos
  restart: unless-stopped

backend:
  build: ./backend    # Dockerfile multistage
  puerto: 4000 (solo interno)
  depends_on: postgres (condition: service_healthy)
  environment: todas las variables del backend
  restart: unless-stopped

frontend:
  build: ./            # Dockerfile raíz, multistage
  puerto: 3000 (solo interno)
  environment: NEXT_PUBLIC_API_URL
  restart: unless-stopped

nginx:
  image: nginx:alpine
  puertos: 80, 443 (públicos)
  volumes: ./nginx/nginx.conf (solo lectura), ./nginx/certs (solo lectura)
  depends_on: frontend, backend
  restart: unless-stopped

volumes:
  postgres_data:    # Datos de PostgreSQL persisten entre reinicios
```

### Dockerfile del frontend (`./Dockerfile`)

```dockerfile
# Stage 1: deps    — instala dependencias (npm ci)
# Stage 2: builder — genera build (npm run build)
# Stage 3: runner  — Next.js standalone, usuario no-root
EXPOSE 3000
CMD ["node", "server.js"]
```

### Dockerfile del backend (`./backend/Dockerfile`)

```dockerfile
# Stage 1: deps    — instala dependencias (npm ci)
# Stage 2: builder — compila TypeScript (npm run build / tsc)
# Stage 3: runner  — solo deps de producción (npm ci --omit=dev)
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Configuración de Nginx (`nginx/nginx.conf`)

Tres bloques `server`:

| Bloque | Puerto | `server_name` | Función |
|---|---|---|---|
| Desarrollo | 80 | `localhost` | Proxy directo (sin SSL) — para pruebas locales con Docker |
| Producción HTTP | 80 | dominio real | Redirige 301 → HTTPS |
| Producción HTTPS | 443 ssl | dominio real | Termina TLS, hace proxy a frontend (:3000) y backend (:4000) |

**Reglas de proxy:**
- `/api/` → `http://backend:4000`
- `/*` → `http://frontend:3000`

**Certificados esperados en:** `/etc/nginx/certs/fullchain.pem` y `privkey.pem`

### `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  output: "standalone",  // Necesario para el Dockerfile multistage
};
```

---

## 11. Proceso de deploy paso a paso

### Prerrequisitos

- VPS en DigitalOcean (mínimo Droplet $12/mes, 2 GB RAM, 1 vCPU)
- Dominio registrado (`mentesanasaltillo.com`)
- Docker y Docker Compose Plugin instalados en el VPS
- Acceso SSH al VPS

### Paso 1 — Apuntar dominio al VPS

En Namecheap (o el registrador del dominio), crear registros A:

```
@   → [IP pública del VPS]
www → [IP pública del VPS]
```

Esperar propagación (1–48 horas).

### Paso 2 — Preparar el VPS

```bash
# Conectar al VPS
ssh root@[IP_VPS]

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose Plugin
apt install -y docker-compose-plugin

# Clonar el repositorio
git clone https://github.com/[usuario]/salud-mental-saltillo.git
cd salud-mental-saltillo
```

### Paso 3 — Configurar variables de entorno

```bash
# Backend
cp .env.production.example backend/.env
nano backend/.env
```

Valores a completar en `backend/.env`:

```env
DB_PASSWORD=<contraseña segura para sms_user>
JWT_SECRET=<generado con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
FRONTEND_URL=https://mentesanasaltillo.com
RESEND_API_KEY=re_<tu api key de resend>
EMAIL_FROM=noreply@mentesanasaltillo.com
NODE_ENV=production
```

```bash
# Frontend
echo "NEXT_PUBLIC_API_URL=https://mentesanasaltillo.com/api/v1" > .env.local
```

### Paso 4 — Configurar Nginx para el dominio

```bash
nano nginx/nginx.conf
# Reemplazar el server_name del bloque de producción:
# server_name mentesanasaltillo.com www.mentesanasaltillo.com;
```

### Paso 5 — Levantar los servicios

```bash
# Construir imágenes y levantar contenedores
docker compose up -d --build

# Verificar que todos estén corriendo
docker compose ps

# Ver logs de un servicio específico
docker compose logs --tail=50 backend
docker compose logs --tail=50 nginx
```

### Paso 6 — Inicializar la base de datos

```bash
# Ejecutar el schema (solo la primera vez, sin datos seed para producción)
docker compose exec -T postgres psql -U sms_user -d saludmentalsaltillo < database/schema.sql

# Crear usuario admin de producción directamente en la BD
docker compose exec postgres psql -U sms_user -d saludmentalsaltillo -c "
  INSERT INTO users (email, password_hash, role)
  VALUES ('admin@mentesanasaltillo.com', '<hash_bcrypt_de_password>', 'admin');
  INSERT INTO user_profiles (user_id, nombre, apellido)
  VALUES (lastval(), 'Admin', 'Mente Sana');
"
```

### Paso 7 — Obtener certificado SSL con Certbot

```bash
# Instalar Certbot en el VPS (fuera de Docker)
apt install -y certbot

# IMPORTANTE: detener Nginx antes de correr Certbot standalone
docker compose stop nginx

# Obtener certificado
certbot certonly --standalone \
  -d mentesanasaltillo.com \
  -d www.mentesanasaltillo.com \
  --email admin@mentesanasaltillo.com \
  --agree-tos --non-interactive

# Copiar certificados donde los espera Nginx
mkdir -p nginx/certs
cp /etc/letsencrypt/live/mentesanasaltillo.com/fullchain.pem nginx/certs/
cp /etc/letsencrypt/live/mentesanasaltillo.com/privkey.pem nginx/certs/

# Reiniciar Nginx
docker compose start nginx
```

### Paso 8 — Configurar renovación automática de SSL

```bash
# Agregar al crontab del VPS
crontab -e

# Añadir esta línea:
0 12 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/mentesanasaltillo.com/*.pem /ruta/al/proyecto/nginx/certs/ && docker compose -f /ruta/al/proyecto/docker-compose.yml restart nginx"
```

### Paso 9 — Verificar el deploy

```bash
curl https://mentesanasaltillo.com/api/v1/health
# Esperado: {"status":"ok"}

curl https://mentesanasaltillo.com/api/v1/professionals
# Esperado: {"success":true,"data":[],"pagination":{...}}
```

---

## 12. Flujo de trabajo para cambios en producción

### Cambio de código (frontend o backend)

```bash
# 1. En local: hacer el cambio y probar
git add [archivos específicos]
git commit -m "tipo: descripción del cambio"
git push origin main

# 2. En el VPS:
ssh root@[IP_VPS]
cd salud-mental-saltillo
git pull origin main

# 3a. Solo cambia el frontend:
docker compose build frontend && docker compose up -d frontend

# 3b. Solo cambia el backend:
docker compose build backend && docker compose up -d backend

# 3c. Cambian ambos:
docker compose build frontend backend && docker compose up -d frontend backend

# 4. Verificar sin downtime
docker compose ps
docker compose logs --tail=20 backend
```

### Cambio de schema de base de datos

```bash
# NUNCA re-ejecutar schema.sql completo en producción (borra todos los datos)
# Solo ejecutar las instrucciones nuevas (ALTER TABLE, CREATE INDEX, etc.)

docker compose exec postgres psql -U sms_user -d saludmentalsaltillo -c "
  ALTER TABLE professional_profiles ADD COLUMN nueva_columna TEXT;
"
```

### Cambio de variables de entorno

```bash
# Editar el archivo de entorno
nano backend/.env

# Reiniciar solo el servicio afectado (no reconstruir imagen)
docker compose restart backend
```

### Rollback a una versión anterior

```bash
# Ver historial de commits
git log --oneline -15

# Volver a un commit específico
git checkout [hash_commit]
docker compose build backend frontend && docker compose up -d backend frontend
```

### Verificar logs en producción

```bash
# Logs en tiempo real de todos los servicios
docker compose logs -f

# Logs de un servicio específico (últimas 100 líneas)
docker compose logs --tail=100 backend
docker compose logs --tail=100 nginx

# Ver uso de recursos
docker stats
```

---

## 13. Variables de entorno requeridas

### Backend (`backend/.env`)

| Variable | Descripción | Valor desarrollo | Valor producción |
|---|---|---|---|
| `DB_NAME` | Nombre de la base de datos | `saludmentalsaltillo` | `saludmentalsaltillo` |
| `DB_USER` | Usuario PostgreSQL de la app | `sms_user` | `sms_user` |
| `DB_PASSWORD` | Contraseña del usuario PostgreSQL | `saludmentalsaltillo` | Contraseña segura generada |
| `DB_HOST` | Host de PostgreSQL | `postgres` (nombre del servicio Docker) | `postgres` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` | `5432` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `saludmentalsaltillo2026!*` | Generar con `crypto.randomBytes(64).toString('hex')` |
| `JWT_EXPIRES_IN` | Duración del access token | `7d` | `7d` |
| `PORT` | Puerto del servidor Express | `4000` | `4000` |
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |
| `FRONTEND_URL` | URL del frontend (usada en CORS) | `http://localhost:3000` | `https://mentesanasaltillo.com` |
| `RESEND_API_KEY` | API key de Resend para emails | `re_xxxx` | `re_xxxx` (cuenta real) |
| `EMAIL_FROM` | Remitente en emails enviados | `onboarding@resend.dev` | `noreply@mentesanasaltillo.com` |

### Frontend (`.env.local`)

| Variable | Descripción | Valor desarrollo | Valor producción |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend | `http://localhost:4000/api/v1` | `https://mentesanasaltillo.com/api/v1` |

> Las variables `NEXT_PUBLIC_*` se incrustan en el bundle del cliente al hacer `npm run build`. No incluir secretos con este prefijo.

### Template de producción

El archivo `.env.production.example` en la raíz del proyecto contiene la plantilla completa con instrucciones. Copiar como `backend/.env` y completar los valores antes del primer deploy.

---

## 14. Credenciales de desarrollo

> Estas credenciales son **exclusivas para desarrollo local**. Jamás usarlas en producción.

### Base de datos local

```
Host:     localhost (o postgres dentro de Docker Compose)
Puerto:   5432
Database: saludmentalsaltillo
Usuario:  sms_user
Password: saludmentalsaltillo
```

### Usuarios de prueba (creados por el seed en `database/schema.sql`)

| Email | Contraseña | Rol | Estado |
|---|---|---|---|
| `admin@salud-mental-saltillo.mx` | `Password123!` | admin | activo |
| `dra.garcia@example.com` | `Password123!` | psicologo | aprobada |
| `dr.martinez@example.com` | `Password123!` | psicologo | pendiente |
| `dra.lopez@example.com` | `Password123!` | psicologo | rechazada |
| `paciente1@example.com` | `Password123!` | usuario | activo |
| `paciente2@example.com` | `Password123!` | usuario | activo |

### URLs de desarrollo

| Servicio | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:4000/api/v1` |
| Health check | `http://localhost:4000/api/v1/health` |

### Comandos de desarrollo

```bash
# Frontend (desde la raíz del proyecto)
npm run dev       # Inicia servidor en http://localhost:3000
npm run build     # Build de producción
npm run start     # Inicia servidor de producción (requiere npm run build primero)
npm run lint      # Ejecuta ESLint

# Backend (desde backend/)
npm run dev       # Inicia con nodemon (hot reload) en puerto 4000
npm run build     # Compila TypeScript a dist/
npm run start     # Inicia servidor compilado
npm run lint      # Ejecuta ESLint en src/

# Docker Compose (desde la raíz)
docker compose up -d            # Levanta todos los servicios
docker compose up -d --build    # Reconstruye imágenes y levanta
docker compose down             # Detiene y elimina contenedores
docker compose ps               # Estado de los servicios
docker compose logs -f backend  # Logs en tiempo real del backend

# Tests E2E (requiere frontend y backend corriendo)
$env:TEST_ENV="local"; npx playwright test --config=e2e/playwright.config.ts
npx playwright show-report      # Abrir reporte HTML
```

---

## 15. Próximos pasos pendientes

### Deploy a producción (alta prioridad)

- [ ] Contratar Droplet en DigitalOcean (mínimo $12/mes — 2 GB RAM, 1 vCPU, 50 GB SSD)
- [ ] Apuntar registros DNS del dominio `mentesanasaltillo.com` a la IP del VPS
- [ ] Instalar Docker y Docker Compose en el VPS
- [ ] Generar `JWT_SECRET` seguro para producción con `crypto.randomBytes(64)`
- [ ] Crear y completar `backend/.env` de producción con todos los valores reales
- [ ] Verificar dominio `mentesanasaltillo.com` en el panel de Resend
- [ ] Cambiar `EMAIL_FROM` a `noreply@mentesanasaltillo.com`
- [ ] Ejecutar `database/schema.sql` en la BD de producción (sin datos seed)
- [ ] Crear usuario admin de producción directamente en la BD
- [ ] Configurar Certbot y SSL (renovación automática vía cron)
- [ ] Configurar Nginx con el dominio real

### Funcionalidades pendientes

- [ ] Subida directa de fotos de perfil (actualmente solo acepta URL externa)
- [ ] Subida de archivos de título/cédula (actualmente solo acepta URL)
- [ ] Búsqueda de texto libre en el directorio de especialistas
- [ ] Sistema de citas y agendamiento en línea
- [ ] Notificaciones por email a usuarios cuando su reseña es moderada
- [ ] Panel de analítica para psicólogos (vistas de perfil, tendencias)
- [ ] Recuperación de contraseña por email
- [ ] Chat o mensajería entre pacientes y psicólogos

### Infraestructura y calidad

- [ ] Configurar backups automáticos de PostgreSQL (pg_dump diario con retención 30 días)
- [ ] Configurar monitoreo y alertas de uptime (UptimeRobot o similar)
- [ ] Agregar unit tests e integration tests al backend
- [ ] Configurar CI/CD con GitHub Actions (lint + tests en PR, deploy automático en push a main)

---

*Documentación generada con Claude Code — mayo 2026*
