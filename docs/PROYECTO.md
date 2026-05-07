# Resumen Ejecutivo — Salud Mental Saltillo

> Actualizado: mayo 2026

---

## 1. Descripción del Proyecto

**Salud Mental Saltillo** (`mentesanasaltillo.com`) es una plataforma web que conecta a personas de Saltillo, Coahuila, con especialistas locales en salud mental. El objetivo es reducir la barrera de acceso a servicios psicológicos y psiquiátricos mostrando un directorio de profesionales verificados que ofrecen atención presencial, en línea o ambas modalidades.

**Audiencia principal:** personas de Saltillo que buscan atención psicológica o psiquiátrica.

**Tono:** cálido, empático y accesible — nunca clínico ni frío.

---

## 2. Stack Tecnológico

### Frontend

| Tecnología | Versión | Notas |
|---|---|---|
| Next.js | 16.2.4 | App Router; tiene breaking changes respecto a versiones anteriores |
| React | 19 | — |
| TypeScript | 5 | Modo estricto; alias `@/*` apunta a la raíz del proyecto |
| Tailwind CSS | v4 | Configuración CSS-first en `app/globals.css` (sin `tailwind.config.ts`) |
| ESLint | 9 | Presets `core-web-vitals` + TypeScript |
| Geist Sans/Mono | — | Cargadas con `next/font/google`, expuestas como variables CSS |

### Backend

| Tecnología | Notas |
|---|---|
| Node.js + Express | Servidor HTTP en puerto 4000 |
| PostgreSQL 16 | Base de datos relacional |
| JWT | Autenticación con access token + refresh token |
| bcryptjs | Hash de contraseñas (cost 12) |
| Resend SDK | Envío transaccional de emails |

### Infraestructura

| Componente | Tecnología |
|---|---|
| Contenedores | Docker + Docker Compose |
| Reverse proxy | Nginx (alpine) |
| SSL | Certbot / Let's Encrypt |
| Hosting | DigitalOcean (destino de despliegue) |
| Dominio | Namecheap → DigitalOcean |

### Testing

| Herramienta | Cobertura |
|---|---|
| Playwright | 23 tests E2E (navegación, auth, especialistas, dashboards) |
| Unit / integration | No configurados aún |

---

## 3. Arquitectura General

```
Internet
   │
   ▼
Nginx (80/443)
   ├── /api/*  ──► Backend (Express :4000) ──► PostgreSQL (:5432)
   └── /*      ──► Frontend (Next.js :3000)
```

- **Frontend:** Next.js con App Router. No existe directorio `pages/`. La capa de servicios vive en `lib/api/`, los hooks en `lib/hooks/` y los tipos en `lib/types/`.
- **Backend:** Node.js + Express. Expone todos los endpoints bajo `/api/v1/`. Valida tokens JWT en cada request protegido.
- **Base de datos:** PostgreSQL 16. Un único schema `public` con 9 tablas, triggers y roles de BD separados por tipo de usuario.
- **Nginx:** actúa como punto de entrada único. Termina SSL en producción y hace proxy al frontend o al backend según la ruta.

### Flujo de autenticación (frontend)

```
Login → accessToken en localStorage
  │
  ├── useAuth() lee el token y expone estado de sesión
  ├── Evento 'auth-change' sincroniza todas las instancias (incluido Navbar)
  ├── lib/api/client.ts agrega el token en cada request
  └── En 401 → intenta refresh automático antes de cerrar sesión
```

### Redirección por rol tras login

| Rol | Destino |
|---|---|
| `admin` | `/admin` |
| `psicologo` | `/dashboard` |
| `usuario` | `/` |

---

## 4. Páginas del Frontend

### Públicas

| Ruta | Archivo | Propósito |
|---|---|---|
| `/` | `app/page.tsx` | Landing: importancia de la salud mental + CTA; muestra conteo real de especialistas |
| `/especialistas` | `app/especialistas/page.tsx` | Directorio de especialistas con datos reales de la API |
| `/especialistas/[id]` | `app/especialistas/[id]/page.tsx` | Perfil detallado: foto, especialidades, horarios, precio, reviews |
| `/sobre-nosotros` | `app/sobre-nosotros/page.tsx` | Misión, historia, cómo funciona y valores |

### Autenticación

| Ruta | Archivo | Propósito |
|---|---|---|
| `/auth/login` | `app/auth/login/page.tsx` | Formulario de inicio de sesión con redirección por rol |
| `/auth/registro` | `app/auth/registro/page.tsx` | Registro de usuarios con `role: usuario` |
| `/registro-profesional` | `app/registro-profesional/page.tsx` | Registro en 2 pasos para psicólogos: cuenta + perfil profesional |

### Dashboard del psicólogo

| Ruta | Archivo | Propósito |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Resumen: estado de verificación, stats, accesos rápidos |
| `/dashboard/perfil` | `app/dashboard/perfil/page.tsx` | Editar bio, cédulas, precios, ubicación y especialidades |
| `/dashboard/horarios` | `app/dashboard/horarios/page.tsx` | Gestionar horarios de atención por día de la semana |
| `/dashboard/resenas` | `app/dashboard/resenas/page.tsx` | Aprobar/rechazar reseñas de pacientes por pestañas |

### Panel de administración

| Ruta | Archivo | Propósito |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Stats generales + tabla de profesionales pendientes con aprobar/rechazar inline |
| `/admin/profesionales` | `app/admin/profesionales/page.tsx` | Gestión de profesionales por estado (pendiente/aprobado/rechazado) con acciones |
| `/admin/resenas` | `app/admin/resenas/page.tsx` | Listado de reseñas filtrado por estado vía `?estado=` |

### Componentes globales

| Componente | Propósito |
|---|---|
| `components/Navbar.tsx` | Navbar global sticky con menú hamburguesa y estado de sesión en tiempo real |
| `components/Footer.tsx` | Footer con links y aviso de crisis (SAPTEL) |
| `app/admin/layout.tsx` | Layout del panel admin: sidebar desktop + barra inferior móvil, guard de rol |

---

## 5. Endpoints del Backend

Base: `/api/v1`

### Auth

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Registro de nuevos usuarios |
| `POST` | `/auth/login` | Público | Inicio de sesión; devuelve access + refresh token |
| `POST` | `/auth/refresh` | Público | Renueva access token con refresh token |

### Usuarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/users/me` | Autenticado | Devuelve perfil del usuario en sesión |
| `PATCH` | `/users/me` | Autenticado | Actualiza datos del usuario en sesión |

### Especialidades

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/specialties` | Público | Catálogo completo de especialidades |
| `POST` | `/specialties` | Admin | Crea nueva especialidad |
| `DELETE` | `/specialties/:id` | Admin | Elimina una especialidad |

### Profesionales

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/professionals` | Público | Directorio de profesionales aprobados |
| `GET` | `/professionals/:id` | Público | Perfil público de un profesional |
| `GET` | `/professionals/me/profile` | Psicólogo | Perfil propio del psicólogo autenticado |
| `POST` | `/professionals/me/profile` | Psicólogo | Crea perfil profesional |
| `PUT` | `/professionals/me/profile` | Psicólogo | Actualiza perfil profesional |
| `PUT` | `/professionals/me/schedules` | Psicólogo | Reemplaza horarios de atención |
| `PUT` | `/professionals/me/specialties` | Psicólogo | Reemplaza conjunto de especialidades |
| `POST` | `/professionals/me/specialties/:id` | Psicólogo | Agrega una especialidad |
| `DELETE` | `/professionals/me/specialties/:id` | Psicólogo | Elimina una especialidad |

### Reviews

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/reviews` | Usuario | Crea reseña (queda en `pendiente`) |
| `PUT` | `/reviews/:id` | Usuario | Edita reseña propia (vuelve a `pendiente`) |
| `PUT` | `/reviews/:id/status` | Psicólogo | Aprueba o rechaza una reseña |

### Admin

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/admin/professionals/pending` | Admin | Lista profesionales pendientes de verificación |
| `PUT` | `/admin/professionals/:id/verify` | Admin | Aprueba o rechaza un profesional |
| `GET` | `/admin/reviews` | Admin | Lista todas las reseñas |
| `GET` | `/admin/stats` | Admin | Estadísticas generales de la plataforma |
| `GET` | `/admin/users` | Admin | Lista todos los usuarios |
| `PATCH` | `/admin/users/:id/toggle-active` | Admin | Activa/desactiva un usuario |

> **Nota importante:** `professional_id` en reviews y otros endpoints se refiere a `professional_profiles.id`, **no** a `users.id`. Siempre usar el `id` devuelto por `GET /api/v1/professionals`.

---

## 6. Esquema de Base de Datos

### Tipos enumerados (ENUMs)

| ENUM | Valores |
|---|---|
| `user_role` | `admin`, `psicologo`, `usuario` |
| `modalidad_tipo` | `presencial`, `online`, `ambas` |
| `verificacion_estado` | `pendiente`, `aprobado`, `rechazado` |
| `dia_semana_tipo` | `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo` |
| `review_estado` | `pendiente`, `aprobado`, `rechazado` |

### Tablas

#### `users`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `email` | VARCHAR(255) | UNIQUE |
| `password_hash` | VARCHAR(255) | bcrypt cost 12 |
| `role` | `user_role` | DEFAULT `usuario` |
| `created_at` | TIMESTAMPTZ | — |
| `is_active` | BOOLEAN | DEFAULT true |

#### `user_profiles`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `user_id` | INTEGER FK → `users.id` | CASCADE DELETE, UNIQUE |
| `nombre` | VARCHAR(100) | — |
| `apellido` | VARCHAR(100) | — |
| `foto_url` | TEXT | — |
| `telefono` | VARCHAR(20) | — |
| `ciudad` | VARCHAR(100) | DEFAULT `Saltillo` |
| `created_at` | TIMESTAMPTZ | — |

#### `professional_profiles`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `user_id` | INTEGER FK → `users.id` | CASCADE DELETE, UNIQUE |
| `descripcion` | TEXT | — |
| `foto_url` | TEXT | — |
| `cedula_profesional` | VARCHAR(50) | Requerida |
| `cedula_especialidad` | VARCHAR(50) | Opcional |
| `titulo_url` | TEXT | — |
| `precio_sesion_min/max` | NUMERIC(10,2) | Restricción: max ≥ min |
| `modalidad` | `modalidad_tipo` | DEFAULT `presencial` |
| `direccion`, `colonia`, `ciudad` | TEXT/VARCHAR | Ubicación física |
| `estado_verificacion` | `verificacion_estado` | DEFAULT `pendiente` |
| `motivo_rechazo` | TEXT | Obligatorio al rechazar |
| `aprobado_por` | INTEGER FK → `users.id` | SET NULL on delete |
| `aprobado_at` | TIMESTAMPTZ | — |
| `is_active` | BOOLEAN | DEFAULT true |
| `created_at`, `updated_at` | TIMESTAMPTZ | `updated_at` auto con trigger |

#### `specialties`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `nombre` | VARCHAR(150) | UNIQUE |
| `descripcion` | TEXT | — |

**Catálogo inicial (12 especialidades):** Psicología Clínica, Psicología Infantil y Adolescente, Terapia de Pareja, Terapia Familiar Sistémica, TCC, Manejo de Ansiedad y Estrés, Trastornos del Estado de Ánimo, Neuropsicología, Psicoanálisis, Adicciones, Duelo y Pérdida, Psicología del Deporte.

#### `professional_specialties` (many-to-many)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `professional_id` | INTEGER FK → `professional_profiles.id` | CASCADE DELETE |
| `specialty_id` | INTEGER FK → `specialties.id` | CASCADE DELETE |
| — | — | UNIQUE (professional_id, specialty_id) |

#### `schedules`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `professional_id` | INTEGER FK → `professional_profiles.id` | CASCADE DELETE |
| `dia_semana` | `dia_semana_tipo` | — |
| `hora_inicio` | TIME | — |
| `hora_fin` | TIME | Restricción: hora_fin > hora_inicio |

#### `reviews`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `professional_id` | INTEGER FK → `professional_profiles.id` | CASCADE DELETE |
| `user_id` | INTEGER FK → `users.id` | CASCADE DELETE |
| `calificacion` | INTEGER | CHECK entre 1 y 5 |
| `comentario` | TEXT | — |
| `estado` | `review_estado` | DEFAULT `pendiente` |
| `created_at`, `updated_at` | TIMESTAMPTZ | `updated_at` auto con trigger |
| — | — | UNIQUE (professional_id, user_id): una review por usuario por profesional |

#### `review_edits`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `review_id` | INTEGER FK → `reviews.id` | CASCADE DELETE |
| `comentario_anterior` | TEXT | Estado antes de la edición |
| `calificacion_anterior` | INTEGER | CHECK entre 1 y 5 |
| `editado_at` | TIMESTAMPTZ | — |

#### `contact_views`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | — |
| `user_id` | INTEGER FK → `users.id` | CASCADE DELETE |
| `professional_id` | INTEGER FK → `professional_profiles.id` | CASCADE DELETE |
| `viewed_at` | TIMESTAMPTZ | — |

### Diagrama de relaciones

```
users ─────────────────┬── user_profiles (1:1)
  │                    │
  ├── professional_profiles (1:1) ─── professional_specialties ─── specialties
  │       │                       └── schedules
  │       │
  ├── reviews ── review_edits
  └── contact_views
```

### Triggers

- `set_updated_at()`: actualiza `updated_at` automáticamente en `professional_profiles` y `reviews` al hacer UPDATE.

---

## 7. Sistema de Autenticación y Roles

### Roles de aplicación (JWT)

| Rol | Acceso |
|---|---|
| `admin` | Panel de administración completo, gestión de usuarios y verificación de profesionales |
| `psicologo` | Dashboard propio: perfil, horarios, reseñas |
| `usuario` | Directorio público y gestión de sus propias reseñas |

### Flujo de verificación de profesionales

```
Registro (role: psicologo)
  └── Completa perfil → estado_verificacion: pendiente
        └── Admin aprueba → estado_verificacion: aprobado → visible en directorio
        └── Admin rechaza → estado_verificacion: rechazado + motivo_rechazo
```

### Flujo de reviews

```
Usuario crea review → estado: pendiente (no público)
  └── Psicólogo aprueba → estado: aprobado (visible)
  └── Usuario edita → vuelve a pendiente automáticamente
        └── Psicólogo debe aprobar de nuevo
```

### Roles de PostgreSQL

| Rol BD | Permisos |
|---|---|
| `app_admin` | GRANT ALL en todas las tablas y secuencias |
| `app_psicologo` | SELECT/INSERT/UPDATE en su perfil, horarios; SELECT en reviews y specialties |
| `app_usuario` | SELECT en directorio público; SELECT/INSERT/UPDATE en sus reviews |
| `sms_user` | Usuario de conexión de la app (definido en `.env`); GRANT ALL con DEFAULT PRIVILEGES |

---

## 8. Notificaciones por Email

**SDK:** `resend` (npm)  
**Variables de entorno:** `RESEND_API_KEY`, `EMAIL_FROM`

| Evento | Disparador | Destinatario |
|---|---|---|
| Bienvenida usuario | Registro con `role='usuario'` | Nuevo usuario |
| Bienvenida psicólogo | Registro con `role='psicologo'` | Nuevo psicólogo |
| Perfil aprobado | Admin aprueba profesional | Psicólogo |
| Perfil rechazado | Admin rechaza con motivo | Psicólogo |

> Todos los envíos son **fire-and-forget**: no interrumpen el flujo si fallan.

| Entorno | `EMAIL_FROM` |
|---|---|
| Desarrollo | `onboarding@resend.dev` |
| Producción | `noreply@mentesanasaltillo.com` |

---

## 9. Tests E2E

**Framework:** Playwright  
**Ubicación:** `e2e/`  
**Total:** 23 tests

**Cobertura:**
- Navegación general
- Autenticación (login, registro)
- Directorio de especialistas y perfiles individuales
- Dashboards (psicólogo y admin)

**Cómo ejecutar:**
```powershell
$env:TEST_ENV="local"; npx playwright test --config=e2e/playwright.config.ts
```

> No hay unit tests ni integration tests configurados aún.

---

## 10. Docker y Configuración de Despliegue

### Servicios (`docker-compose.yml`)

| Servicio | Imagen / Build | Puerto interno | Descripción |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | BD con volumen persistente y healthcheck |
| `backend` | `./backend` (Dockerfile) | 4000 | API Express; espera a que postgres esté healthy |
| `frontend` | `.` (Dockerfile raíz) | 3000 | Next.js; recibe `NEXT_PUBLIC_API_URL` como build arg |
| `nginx` | `nginx:alpine` | 80, 443 | Reverse proxy; monta `nginx.conf` y certs en modo `:ro` |

### Variables de entorno necesarias (`.env` en la raíz)

```env
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=
NEXT_PUBLIC_API_URL=
RESEND_API_KEY=
EMAIL_FROM=
```

### Nginx (`nginx/nginx.conf`)

Tres bloques `server`:

| Bloque | Puerto | `server_name` | Función |
|---|---|---|---|
| Desarrollo | 80 | `localhost` | Proxy directo sin SSL (sin certificados) |
| Producción HTTP | 80 | dominio real | Redirige → HTTPS |
| Producción HTTPS | 443 ssl | dominio real | Termina TLS y hace proxy al frontend/backend |

**Certificados:** `/etc/nginx/certs/fullchain.pem` y `privkey.pem` (generados con Certbot).

### Comandos de desarrollo (frontend)

```bash
npm run dev      # http://localhost:3000
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

---

## 11. Estado Actual del Proyecto

| Área | Estado |
|---|---|
| Frontend — páginas públicas | ✅ Completado |
| Frontend — autenticación | ✅ Completado |
| Frontend — dashboard psicólogo | ✅ Completado |
| Frontend — panel admin | ✅ Completado |
| Frontend — conexión con API real | ✅ Completado |
| Base de datos (schema + seed) | ✅ Completado y validado en pgAdmin 4 |
| Backend — autenticación JWT | ✅ Completado |
| Backend — endpoints profesionales | ✅ Completado |
| Backend — endpoints especialidades | ✅ Completado |
| Backend — endpoints reviews | ✅ Completado |
| Backend — endpoints admin | ✅ Completado |
| Notificaciones email (Resend) | ✅ Completado |
| Tests E2E (Playwright) | ✅ 23 tests |
| Docker Compose | ✅ Configurado |
| Nginx (reverse proxy) | ✅ Configurado |
| SSL / Certbot | ⏳ Pendiente (producción) |
| Despliegue en DigitalOcean | ⏳ Pendiente |

---

## 12. Próximos Pasos Pendientes

| Tarea | Notas |
|---|---|
| Generar `JWT_SECRET` seguro | Usar valor aleatorio de alta entropía antes del primer deploy |
| Configurar Certbot en el servidor | `certbot certonly --standalone -d mentesanasaltillo.com` |
| Apuntar dominio en Namecheap → DigitalOcean | Actualizar nameservers o registros A |
| Cambiar `EMAIL_FROM` a producción | `noreply@mentesanasaltillo.com` |
| Configurar unit/integration tests | No hay cobertura de este tipo aún |
| Ejecutar `database/fix_permissions.sql` si se recrea la BD | Requerido si `sms_user` pierde permisos tras recrear el schema |
