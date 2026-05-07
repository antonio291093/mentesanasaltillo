# Modelo de datos — Salud Mental Saltillo

Base de datos PostgreSQL para una plataforma de directorio de profesionales de
salud mental en Saltillo, Coahuila. Permite a personas buscar especialistas
verificados, dejar reseñas y acceder a información de contacto.

---

## Configuración inicial

### 1. Crear el usuario de PostgreSQL

Conectarse a PostgreSQL como superusuario (ej. `postgres`) y ejecutar:

```sql
CREATE USER sms_user WITH PASSWORD 'tu_password';
```

> El nombre de usuario y la contraseña deben coincidir con las variables `DB_USER` y `DB_PASSWORD` del archivo `backend/.env`.

### 2. Crear la base de datos

```sql
CREATE DATABASE saludmentalsaltillo OWNER sms_user;
```

### 3. Ejecutar el schema

Abrir `database/schema.sql` en **pgAdmin 4**, conectarse a la base de datos `saludmentalsaltillo` y ejecutar el archivo completo.

El script crea tablas, índices, roles de aplicación, permisos para `sms_user` e inserta datos seed de ejemplo.

### 4. Verificar la conexión desde el backend

```bash
cd backend
npm run dev
```

Si la conexión es exitosa verás en consola: `Conectado a PostgreSQL`.

---

## Tabla de contenido

1. [Descripción general](#1-descripción-general)
2. [Diagrama de relaciones](#2-diagrama-de-relaciones)
3. [Tablas](#3-tablas)
4. [Decisiones de diseño](#4-decisiones-de-diseño)
5. [Roles de PostgreSQL](#5-roles-de-postgresql)
6. [Ejecutar en pgAdmin 4](#6-ejecutar-en-pgadmin-4)

---

## 1. Descripción general

El modelo se organiza en cuatro dominios:

| Dominio | Tablas |
|---|---|
| **Autenticación** | `users`, `user_profiles` |
| **Profesionales** | `professional_profiles`, `specialties`, `professional_specialties`, `schedules` |
| **Reseñas** | `reviews`, `review_edits` |
| **Analítica** | `contact_views` |

Todos los timestamps usan `TIMESTAMPTZ` (con zona horaria). Los campos
`updated_at` de `professional_profiles` y `reviews` se actualizan automáticamente
mediante triggers de PostgreSQL, sin necesidad de lógica en el backend.

### Tipos ENUM definidos

| Tipo | Valores |
|---|---|
| `user_role` | `admin`, `psicologo`, `usuario` |
| `modalidad_tipo` | `presencial`, `online`, `ambas` |
| `verificacion_estado` | `pendiente`, `aprobado`, `rechazado` |
| `dia_semana_tipo` | `lunes` … `domingo` (sin tilde para evitar problemas de encoding en queries) |
| `review_estado` | `pendiente`, `aprobado`, `rechazado` |

---

## 2. Diagrama de relaciones

```mermaid
erDiagram
    users {
        int         id            PK
        varchar     email         UK
        varchar     password_hash
        user_role   role
        timestamptz created_at
        boolean     is_active
    }

    user_profiles {
        int         id         PK
        int         user_id    FK_UK
        varchar     nombre
        varchar     apellido
        text        foto_url
        varchar     telefono
        varchar     ciudad
        timestamptz created_at
    }

    professional_profiles {
        int                  id                  PK
        int                  user_id             FK_UK
        varchar              cedula_profesional
        varchar              cedula_especialidad
        numeric              precio_sesion_min
        numeric              precio_sesion_max
        modalidad_tipo       modalidad
        verificacion_estado  estado_verificacion
        text                 motivo_rechazo
        int                  aprobado_por        FK
        timestamptz          aprobado_at
        boolean              is_active
        timestamptz          updated_at
    }

    specialties {
        int     id      PK
        varchar nombre  UK
        text    descripcion
    }

    professional_specialties {
        int professional_id FK
        int specialty_id    FK
    }

    schedules {
        int             id              PK
        int             professional_id FK
        dia_semana_tipo dia_semana
        time            hora_inicio
        time            hora_fin
    }

    reviews {
        int           id              PK
        int           professional_id FK
        int           user_id         FK
        int           calificacion
        text          comentario
        review_estado estado
        timestamptz   updated_at
    }

    review_edits {
        int         id                    PK
        int         review_id             FK
        text        comentario_anterior
        int         calificacion_anterior
        timestamptz editado_at
    }

    contact_views {
        int         id              PK
        int         user_id         FK
        int         professional_id FK
        timestamptz viewed_at
    }

    users                    ||--o|  user_profiles            : "extiende"
    users                    ||--o|  professional_profiles     : "tiene"
    users                    ||--o{  reviews                   : "escribe"
    users                    ||--o{  contact_views             : "genera"
    users                    ||--o{  professional_profiles     : "aprueba"
    professional_profiles    ||--o{  professional_specialties  : "asigna"
    professional_profiles    ||--o{  schedules                 : "define"
    professional_profiles    ||--o{  reviews                   : "recibe"
    professional_profiles    ||--o{  contact_views             : "recibe"
    specialties              ||--o{  professional_specialties  : "incluida en"
    reviews                  ||--o{  review_edits              : "registra"
```

---

## 3. Tablas

### `users`

Tabla central de autenticación. Toda cuenta en el sistema —sin importar el
rol— vive aquí.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `SERIAL` | PK autoincremental |
| `email` | `VARCHAR(255)` | Único, usado como identificador de login |
| `password_hash` | `VARCHAR(255)` | Bcrypt hash — nunca texto plano |
| `role` | `user_role` | `admin` / `psicologo` / `usuario` |
| `is_active` | `BOOLEAN` | `false` = cuenta suspendida sin borrar |

---

### `user_profiles`

Datos personales separados de la autenticación. La separación permite que un
usuario exista (con sesión activa) sin haber completado su perfil todavía.

| Columna | Notas |
|---|---|
| `user_id` | FK + UNIQUE: relación estricta 1-a-1 con `users` |
| `ciudad` | Default `'Saltillo'` — la mayoría de usuarios son locales |

---

### `professional_profiles`

El perfil público de cada especialista. Solo aparece en el directorio cuando
`estado_verificacion = 'aprobado'` AND `is_active = true`.

| Columna | Notas de negocio |
|---|---|
| `cedula_profesional` | Obligatoria — base del proceso de verificación |
| `cedula_especialidad` | Nullable — no todos tienen posgrado registrado |
| `titulo_url` | URL al documento subido (PDF/imagen del título) |
| `precio_sesion_min/max` | Rango de precio; constraint garantiza `min ≤ max` |
| `modalidad` | `presencial`, `online` o `ambas` — filtro clave en el directorio |
| `estado_verificacion` | Flujo: `pendiente → aprobado` o `pendiente → rechazado` |
| `motivo_rechazo` | Solo se llena cuando `estado_verificacion = 'rechazado'` |
| `aprobado_por` | FK al usuario admin que tomó la decisión |
| `updated_at` | Actualizado automáticamente por trigger `trg_professional_profiles_updated_at` |

**Constraints de precio:**
```sql
CHECK (precio_sesion_min IS NULL OR precio_sesion_min >= 0)
CHECK (precio_sesion_max IS NULL OR precio_sesion_max >= 0)
CHECK (precio_sesion_max IS NULL OR precio_sesion_min IS NULL
       OR precio_sesion_max >= precio_sesion_min)
```

---

### `specialties`

Catálogo cerrado de especialidades en salud mental. Solo los admins agregan
entradas; los profesionales eligen de este catálogo.

Las 12 especialidades del seed incluyen: Psicología Clínica, TCC, Terapia de
Pareja, Terapia Familiar, Neuropsicología, Manejo de Ansiedad, Duelo y Pérdida,
entre otras.

---

### `professional_specialties`

Tabla pivote many-to-many entre `professional_profiles` y `specialties`.
Un profesional puede tener varias especialidades; una especialidad puede
pertenecer a varios profesionales.

Constraint `UNIQUE(professional_id, specialty_id)` impide duplicados.

---

### `schedules`

Bloques de disponibilidad semanal recurrente por profesional. Un mismo día
puede tener múltiples bloques (ej. mañana y tarde). Constraint
`CHECK(hora_fin > hora_inicio)` garantiza coherencia.

| Columna | Notas |
|---|---|
| `dia_semana` | ENUM `lunes`–`domingo` |
| `hora_inicio` / `hora_fin` | Tipo `TIME` (sin fecha) — es disponibilidad recurrente |

---

### `reviews`

Reseñas que los usuarios dejan sobre profesionales. Ingresan con estado
`pendiente` y solo son visibles en el directorio al pasar a `aprobado`.

| Columna | Notas |
|---|---|
| `calificacion` | `INTEGER` entre 1 y 5 — enforced por `CHECK` |
| `estado` | `pendiente` → `aprobado` o `rechazado` |
| `updated_at` | Trigger `trg_reviews_updated_at` lo mantiene actualizado |

Constraint `UNIQUE(professional_id, user_id)` garantiza que cada usuario
puede dejar exactamente **una** reseña por profesional.

---

### `review_edits`

Bitácora inmutable de modificaciones a reseñas. Cada vez que el usuario edita
su reseña, se guarda el estado anterior en esta tabla. Permite auditoría y
resolución de disputas.

| Columna | Notas |
|---|---|
| `comentario_anterior` | Texto antes del cambio |
| `calificacion_anterior` | Calificación antes del cambio |
| `editado_at` | Timestamp exacto del momento de la edición |

---

### `contact_views`

Registro de cada vez que un usuario autenticado accede a los datos de contacto
de un profesional (teléfono, dirección). No tiene UNIQUE — se registran todos
los accesos para analítica temporal.

| Consulta útil | Propósito |
|---|---|
| Contar filas por `professional_id` | Medir popularidad de un perfil |
| Filtrar por `user_id` | Ver historial de búsqueda de un usuario |
| Agrupar por `viewed_at::date` | Tendencia diaria de accesos |

---

## 4. Decisiones de diseño

### Por qué `reviews` tiene estado `pendiente/aprobado/rechazado`

Las reseñas en plataformas de salud son sensibles: pueden contener
información médica, datos de contacto externos o contenido difamatorio.
El flujo de moderación previo evita que contenido inapropiado aparezca
en el directorio público. Una review nueva entra con `pendiente` y solo
es visible al público tras ser `aprobada` por un admin.

```
Usuario envía reseña
        │
        ▼
   estado = 'pendiente'  ←── invisible en directorio
        │
   Admin revisa
        │
   ┌────┴────┐
   ▼         ▼
aprobado  rechazado
(pública) (oculta, motivo no expuesto al público)
```

### Por qué `review_edits` existe como tabla separada

Guardar el historial de ediciones directamente en `reviews` inflaría la tabla
principal y complicaría las consultas del directorio. Al separarlo en
`review_edits` se mantiene la tabla de reviews limpia y consultable de forma
eficiente, mientras el historial completo está disponible para auditoría sin
afectar el rendimiento de las lecturas cotidianas.

Además, si un profesional disputa una calificación, el admin puede ver
exactamente qué dijo el usuario en cada versión.

### Por qué `contact_views` registra cada acceso

El modelo de negocio futuro puede incluir cobro por visibilidad o métricas
de conversión (cuántos usuarios que vieron el contacto agendaron cita). Al
registrar cada acceso —no solo el primero— se habilita analítica temporal
completa: picos de demanda, estacionalidad, comparativa entre perfiles.

No se usa UNIQUE porque la misma persona puede consultar el teléfono de un
especialista en diferentes momentos, y cada acceso tiene valor analítico.

### Cómo funciona el flujo de verificación de profesionales

El objetivo es que solo aparezcan en el directorio especialistas cuya
identidad y credenciales han sido validadas.

```
Profesional se registra
        │
        ▼
   professional_profiles creado
   estado_verificacion = 'pendiente'
   is_active = true
        │
        │  (No aparece en directorio todavía)
        │
   Admin revisa cédula + título
        │
   ┌────┴────────────────┐
   ▼                     ▼
aprobado              rechazado
aprobado_por = admin  motivo_rechazo = "..."
aprobado_at = NOW()
        │
        ▼
  Visible en directorio público
  (estado = 'aprobado' AND is_active = true)
```

Si el admin que aprobó es eliminado del sistema, `aprobado_por` queda en
`NULL` (ON DELETE SET NULL) — la aprobación sigue siendo válida.

---

## 5. Roles de PostgreSQL

El schema crea tres roles de aplicación con permisos diferenciados:

### `app_admin`

Acceso total a todas las tablas y secuencias. Usado por el panel de
administración: moderación de reviews, verificación de profesionales,
gestión de usuarios.

### `app_psicologo`

| Tabla | Permisos |
|---|---|
| `professional_profiles` | SELECT, INSERT, UPDATE |
| `user_profiles` | SELECT, INSERT, UPDATE |
| `users` | SELECT |
| `specialties` | SELECT |
| `professional_specialties` | SELECT, INSERT, DELETE |
| `schedules` | SELECT, INSERT, UPDATE, DELETE |
| `reviews` | SELECT |
| `contact_views` | SELECT |

No puede modificar `reviews` (solo leerlas) ni acceder a `review_edits`.

### `app_usuario`

| Tabla | Permisos |
|---|---|
| `users` | SELECT |
| `user_profiles` | SELECT, INSERT, UPDATE |
| `professional_profiles` | SELECT |
| `specialties` | SELECT |
| `professional_specialties` | SELECT |
| `schedules` | SELECT |
| `reviews` | SELECT, INSERT, UPDATE |
| `review_edits` | SELECT, INSERT |
| `contact_views` | SELECT, INSERT |

No puede ver `professional_profiles` de forma filtrada por rol — eso lo
maneja la lógica de la aplicación (WHERE estado_verificacion = 'aprobado').

> **Importante:** las contraseñas de los roles en `schema.sql` son
> placeholders (`change_me_*`). Cambiarlas antes de cualquier despliegue.

---

## 6. Ejecutar en pgAdmin 4

### Requisitos

- PostgreSQL 14 o superior
- pgAdmin 4 instalado y conectado al servidor local

### Pasos

1. **Crear la base de datos**

   En el panel izquierdo de pgAdmin: clic derecho en *Databases* →
   *Create* → *Database*. Nombrarla `salud_mental_saltillo`.
   Encoding: `UTF8`.

2. **Abrir el Query Tool**

   Clic derecho en la base de datos recién creada →
   *Query Tool* (o `Alt+Shift+Q`).

3. **Cargar el archivo**

   En el Query Tool: *File* → *Open* → seleccionar
   `database/schema.sql`.

4. **Ejecutar**

   Presionar `F5` o el botón *Execute/Refresh*. El script completo
   corre de arriba hacia abajo sin errores en una base vacía.

5. **Verificar**

   Expandir *Schemas* → *public* → *Tables* en el panel izquierdo.
   Deben aparecer las 9 tablas. Para confirmar los datos seed:

   ```sql
   SELECT u.email, u.role, up.nombre, up.apellido
   FROM users u
   JOIN user_profiles up ON up.user_id = u.id
   ORDER BY u.id;
   ```

### Notas de seguridad

- Los `password_hash` del seed corresponden a `Password123!` con bcrypt
  cost 12. **Solo para desarrollo local.**
- Los roles `app_admin`, `app_psicologo` y `app_usuario` se crean con
  contraseñas placeholder. Cambiarlas antes de usar en staging o producción.
- En producción, usar variables de entorno para credenciales de conexión y
  nunca el usuario `postgres` superusuario desde la aplicación.
