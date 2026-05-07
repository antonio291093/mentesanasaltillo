-- ============================================================
-- Plataforma de Salud Mental Saltillo — Schema PostgreSQL
-- Compatible con PostgreSQL 14+ / pgAdmin 4
-- Ejecutar completo en una base de datos vacía y dedicada
-- ============================================================
-- ADVERTENCIA: Los password_hash del seed son solo para
-- desarrollo local. Reemplazar antes de cualquier despliegue.
-- ============================================================


-- ============================================================
-- 0. TIPOS ENUMERADOS
-- ============================================================

CREATE TYPE user_role          AS ENUM ('admin', 'psicologo', 'usuario');
CREATE TYPE modalidad_tipo     AS ENUM ('presencial', 'online', 'ambas');
CREATE TYPE verificacion_estado AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE dia_semana_tipo    AS ENUM (
    'lunes', 'martes', 'miercoles', 'jueves',
    'viernes', 'sabado', 'domingo'
);
CREATE TYPE review_estado      AS ENUM ('pendiente', 'aprobado', 'rechazado');


-- ============================================================
-- 1. USUARIOS Y AUTENTICACIÓN
-- ============================================================

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL DEFAULT 'usuario',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE user_profiles (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER      NOT NULL,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    foto_url   TEXT,
    telefono   VARCHAR(20),
    ciudad     VARCHAR(100) NOT NULL DEFAULT 'Saltillo',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_profiles_user UNIQUE (user_id)
);


-- ============================================================
-- 2. PROFESIONALES
-- ============================================================

CREATE TABLE professional_profiles (
    id                   SERIAL           PRIMARY KEY,
    user_id              INTEGER          NOT NULL,
    descripcion          TEXT,
    foto_url             TEXT,
    cedula_profesional   VARCHAR(50)      NOT NULL,
    cedula_especialidad  VARCHAR(50),
    titulo_url           TEXT,
    precio_sesion_min    NUMERIC(10, 2),
    precio_sesion_max    NUMERIC(10, 2),
    modalidad            modalidad_tipo   NOT NULL DEFAULT 'presencial',
    direccion            TEXT,
    colonia              VARCHAR(150),
    ciudad               VARCHAR(100)     NOT NULL DEFAULT 'Saltillo',
    estado_verificacion  verificacion_estado NOT NULL DEFAULT 'pendiente',
    motivo_rechazo       TEXT,
    aprobado_por         INTEGER,
    aprobado_at          TIMESTAMPTZ,
    is_active            BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prof_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_prof_profiles_aprobado_por
        FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_professional_user UNIQUE (user_id),
    CONSTRAINT chk_precio_min_positivo
        CHECK (precio_sesion_min IS NULL OR precio_sesion_min >= 0),
    CONSTRAINT chk_precio_max_positivo
        CHECK (precio_sesion_max IS NULL OR precio_sesion_max >= 0),
    CONSTRAINT chk_precio_rango
        CHECK (
            precio_sesion_min IS NULL
            OR precio_sesion_max IS NULL
            OR precio_sesion_max >= precio_sesion_min
        )
);

-- Catálogo de especialidades en salud mental
CREATE TABLE specialties (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    descripcion TEXT,

    CONSTRAINT uq_specialties_nombre UNIQUE (nombre)
);

-- Relación many-to-many: profesional ↔ especialidad
CREATE TABLE professional_specialties (
    id              SERIAL  PRIMARY KEY,
    professional_id INTEGER NOT NULL,
    specialty_id    INTEGER NOT NULL,

    CONSTRAINT fk_prof_spec_professional
        FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_prof_spec_specialty
        FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE,
    CONSTRAINT uq_prof_specialty UNIQUE (professional_id, specialty_id)
);

CREATE TABLE schedules (
    id              SERIAL          PRIMARY KEY,
    professional_id INTEGER         NOT NULL,
    dia_semana      dia_semana_tipo NOT NULL,
    hora_inicio     TIME            NOT NULL,
    hora_fin        TIME            NOT NULL,

    CONSTRAINT fk_schedules_professional
        FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_horario_valido CHECK (hora_fin > hora_inicio)
);


-- ============================================================
-- 3. REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id              SERIAL        PRIMARY KEY,
    professional_id INTEGER       NOT NULL,
    user_id         INTEGER       NOT NULL,
    calificacion    INTEGER       NOT NULL,
    comentario      TEXT,
    estado          review_estado NOT NULL DEFAULT 'pendiente',
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reviews_professional
        FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Un usuario puede dejar exactamente una review por profesional
    CONSTRAINT uq_review_por_usuario UNIQUE (professional_id, user_id),
    CONSTRAINT chk_calificacion CHECK (calificacion BETWEEN 1 AND 5)
);

-- Bitácora de ediciones: guarda el estado anterior antes de cada cambio
CREATE TABLE review_edits (
    id                    SERIAL      PRIMARY KEY,
    review_id             INTEGER     NOT NULL,
    comentario_anterior   TEXT,
    calificacion_anterior INTEGER     NOT NULL,
    editado_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_review_edits_review
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT chk_calificacion_anterior CHECK (calificacion_anterior BETWEEN 1 AND 5)
);


-- ============================================================
-- 4. REGISTRO DE VISTAS DE CONTACTO
-- ============================================================

-- Registra cada vez que un usuario autenticado accede a los
-- datos de contacto de un profesional (teléfono, dirección).
CREATE TABLE contact_views (
    id              SERIAL      PRIMARY KEY,
    user_id         INTEGER     NOT NULL,
    professional_id INTEGER     NOT NULL,
    viewed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_contact_views_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_contact_views_professional
        FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);


-- ============================================================
-- 5. TRIGGER: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_professional_profiles_updated_at
    BEFORE UPDATE ON professional_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. ÍNDICES
-- ============================================================

-- users
CREATE INDEX idx_users_role      ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- professional_profiles — búsquedas frecuentes desde el directorio
CREATE INDEX idx_prof_profiles_estado     ON professional_profiles(estado_verificacion);
CREATE INDEX idx_prof_profiles_modalidad  ON professional_profiles(modalidad);
CREATE INDEX idx_prof_profiles_ciudad     ON professional_profiles(ciudad);
CREATE INDEX idx_prof_profiles_is_active  ON professional_profiles(is_active);
CREATE INDEX idx_prof_profiles_precio_min ON professional_profiles(precio_sesion_min);

-- professional_specialties — lookup bidireccional
CREATE INDEX idx_prof_spec_professional ON professional_specialties(professional_id);
CREATE INDEX idx_prof_spec_specialty    ON professional_specialties(specialty_id);

-- schedules
CREATE INDEX idx_schedules_professional ON schedules(professional_id);
CREATE INDEX idx_schedules_dia          ON schedules(dia_semana);

-- reviews
CREATE INDEX idx_reviews_professional ON reviews(professional_id);
CREATE INDEX idx_reviews_user         ON reviews(user_id);
CREATE INDEX idx_reviews_estado       ON reviews(estado);

-- review_edits
CREATE INDEX idx_review_edits_review    ON review_edits(review_id);
CREATE INDEX idx_review_edits_editado   ON review_edits(editado_at);

-- contact_views — analítica y deduplicación rápida
CREATE INDEX idx_contact_views_user         ON contact_views(user_id);
CREATE INDEX idx_contact_views_professional ON contact_views(professional_id);
CREATE INDEX idx_contact_views_viewed_at    ON contact_views(viewed_at);


-- ============================================================
-- 7. ROLES Y PERMISOS DE POSTGRESQL
-- ============================================================
-- Cambiar las contraseñas antes de usar en cualquier entorno.

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin LOGIN PASSWORD 'change_me_admin_2024!';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_psicologo') THEN
        CREATE ROLE app_psicologo LOGIN PASSWORD 'change_me_psicologo_2024!';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_usuario') THEN
        CREATE ROLE app_usuario LOGIN PASSWORD 'change_me_usuario_2024!';
    END IF;
END
$$;

-- app_admin: acceso total (panel de moderación)
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- app_psicologo: gestión de su propio perfil, horarios y lectura de reviews
GRANT SELECT, INSERT, UPDATE ON professional_profiles    TO app_psicologo;
GRANT SELECT, INSERT, UPDATE ON user_profiles            TO app_psicologo;
GRANT SELECT                  ON users                   TO app_psicologo;
GRANT SELECT                  ON specialties             TO app_psicologo;
GRANT SELECT, INSERT, DELETE  ON professional_specialties TO app_psicologo;
GRANT SELECT, INSERT, UPDATE, DELETE ON schedules        TO app_psicologo;
GRANT SELECT                  ON reviews                 TO app_psicologo;
GRANT SELECT                  ON contact_views           TO app_psicologo;
GRANT USAGE ON ALL SEQUENCES  IN SCHEMA public           TO app_psicologo;

-- app_usuario: lectura del directorio público + gestión de sus propias reviews
GRANT SELECT                  ON users                    TO app_usuario;
GRANT SELECT, INSERT, UPDATE  ON user_profiles            TO app_usuario;
GRANT SELECT                  ON professional_profiles    TO app_usuario;
GRANT SELECT                  ON specialties              TO app_usuario;
GRANT SELECT                  ON professional_specialties TO app_usuario;
GRANT SELECT                  ON schedules                TO app_usuario;
GRANT SELECT, INSERT, UPDATE  ON reviews                  TO app_usuario;
GRANT SELECT, INSERT          ON review_edits             TO app_usuario;
GRANT SELECT, INSERT          ON contact_views            TO app_usuario;
GRANT USAGE ON ALL SEQUENCES  IN SCHEMA public            TO app_usuario;


-- ============================================================
-- PERMISOS PARA EL USUARIO DE CONEXIÓN DE LA APLICACIÓN
-- Ejecutar con un superusuario de PostgreSQL
-- El usuario (sms_user) se define en la variable DB_USER del .env
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sms_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO sms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO sms_user;


-- ============================================================
-- 8. DATOS SEED
-- ============================================================
-- Contraseña para todos los usuarios seed: Password123!
-- Hash generado con bcryptjs, cost 12. SOLO para desarrollo local.
--
-- Si el hash no funciona al ejecutar el seed en una nueva instalación,
-- regenerarlo con:
--   node -e "const b = require('bcryptjs'); b.hash('Password123!', 12).then(h => console.log(h))"
-- y reemplazar los valores $2b$12$... en los INSERT de abajo.

-- 8.1 Usuarios
INSERT INTO users (email, password_hash, role) VALUES
    ('admin@salud-mental-saltillo.mx',
     '$2b$12$eImiTXuWVxfM37uY4JANjuOOQgt0D.KQkRkSmhM.eRXrqGCT4yJCy',
     'admin'),
    ('dra.garcia@example.com',
     '$2b$12$eImiTXuWVxfM37uY4JANjuOOQgt0D.KQkRkSmhM.eRXrqGCT4yJCy',
     'psicologo'),
    ('lic.martinez@example.com',
     '$2b$12$eImiTXuWVxfM37uY4JANjuOOQgt0D.KQkRkSmhM.eRXrqGCT4yJCy',
     'psicologo'),
    ('dr.reyes@example.com',
     '$2b$12$eImiTXuWVxfM37uY4JANjuOOQgt0D.KQkRkSmhM.eRXrqGCT4yJCy',
     'psicologo'),
    ('maria.lopez@example.com',
     '$2b$12$eImiTXuWVxfM37uY4JANjuOOQgt0D.KQkRkSmhM.eRXrqGCT4yJCy',
     'usuario'),
    ('carlos.hernandez@example.com',
     '$2b$12$eImiTXuWVxfM37uY4JANjuOOQgt0D.KQkRkSmhM.eRXrqGCT4yJCy',
     'usuario');

-- 8.2 Perfiles de usuario
INSERT INTO user_profiles (user_id, nombre, apellido, telefono, ciudad) VALUES
    (1, 'Admin',      'Sistema',          NULL,           'Saltillo'),
    (2, 'Laura',      'García Morales',   '8441234567',   'Saltillo'),
    (3, 'Roberto',    'Martínez Soto',    '8449876543',   'Saltillo'),
    (4, 'Alejandro',  'Reyes Valdez',     '8445551234',   'Saltillo'),
    (5, 'María',      'López Torres',     '8441112222',   'Saltillo'),
    (6, 'Carlos',     'Hernández Ruiz',   '8443334444',   'Saltillo');

-- 8.3 Catálogo de especialidades
INSERT INTO specialties (nombre, descripcion) VALUES
    ('Psicología Clínica',
     'Evaluación y tratamiento de trastornos mentales y emocionales en adultos'),
    ('Psicología Infantil y Adolescente',
     'Atención en desarrollo, comportamiento y salud mental de niños y adolescentes'),
    ('Terapia de Pareja',
     'Intervención en conflictos relacionales, comunicación y vínculos afectivos'),
    ('Terapia Familiar Sistémica',
     'Abordaje de dinámicas familiares, roles y patrones de comunicación'),
    ('Terapia Cognitivo-Conductual (TCC)',
     'Modificación de pensamientos y conductas disfuncionales basada en evidencia'),
    ('Manejo de Ansiedad y Estrés',
     'Técnicas para el control de ansiedad generalizada, fobias y estrés crónico'),
    ('Trastornos del Estado de Ánimo',
     'Diagnóstico y tratamiento de depresión, distimia y trastorno bipolar'),
    ('Neuropsicología',
     'Evaluación y rehabilitación de funciones cognitivas vinculadas al sistema nervioso'),
    ('Psicoanálisis',
     'Exploración del inconsciente, conflictos internos y patrones relacionales tempranos'),
    ('Adicciones y Conductas Compulsivas',
     'Intervención en abuso de sustancias, ludopatía y otras conductas adictivas'),
    ('Duelo y Pérdida',
     'Acompañamiento terapéutico en procesos de pérdida, separación y duelo complicado'),
    ('Psicología del Deporte',
     'Optimización del rendimiento y bienestar mental en deportistas');

-- 8.4 Perfiles profesionales
--     aprobado_por = 1 (admin) | user_id 2,3,4 son los psicólogos
INSERT INTO professional_profiles (
    user_id, descripcion,
    cedula_profesional, cedula_especialidad,
    precio_sesion_min, precio_sesion_max, modalidad,
    direccion, colonia, ciudad,
    estado_verificacion, aprobado_por, aprobado_at
) VALUES
(
    2,
    'Soy psicóloga clínica con 10 años de experiencia en Saltillo. Me especializo '
    'en terapia cognitivo-conductual para adultos con ansiedad y depresión. '
    'Ofrezco un espacio seguro, empático y sin juicios para trabajar juntos '
    'hacia tu bienestar.',
    '7654321', '8901234',
    600.00, 900.00, 'ambas',
    'Blvd. Luis Echeverría 1450, Int. 302', 'Los Pinos', 'Saltillo',
    'aprobado', 1, NOW() - INTERVAL '30 days'
),
(
    3,
    'Licenciado en Psicología con maestría en Terapia Familiar. Trabajo con '
    'familias, parejas y adultos en crisis vitales, conflictos relacionales o '
    'situaciones de cambio. Mi enfoque es sistémico y orientado a soluciones.',
    '3456789', NULL,
    500.00, 700.00, 'presencial',
    'Av. Constitución 876, Consultorio 5', 'Centro', 'Saltillo',
    'aprobado', 1, NOW() - INTERVAL '20 days'
),
(
    4,
    'Psiquiatra con 15 años de experiencia en el tratamiento de trastornos del '
    'estado de ánimo, trastorno bipolar y esquizofrenia. Realizo evaluaciones '
    'diagnósticas completas y tratamiento farmacológico combinado con '
    'psicoterapia de apoyo.',
    '1234567', '5678901',
    800.00, 1200.00, 'presencial',
    'Torre Médica Saltillo, Cons. 810', 'Colonia República', 'Saltillo',
    'aprobado', 1, NOW() - INTERVAL '15 days'
);

-- 8.5 Especialidades por profesional
--     IDs de professional_profiles: 1=Dra. García, 2=Lic. Martínez, 3=Dr. Reyes
--     IDs de specialties: 1=Clínica, 3=Pareja, 4=Familiar, 5=TCC, 6=Ansiedad,
--                         7=Estado de Ánimo, 8=Neuropsico, 11=Duelo
INSERT INTO professional_specialties (professional_id, specialty_id) VALUES
    (1, 5),  -- García: TCC
    (1, 6),  -- García: Ansiedad y Estrés
    (1, 7),  -- García: Trastornos del Estado de Ánimo
    (2, 3),  -- Martínez: Terapia de Pareja
    (2, 4),  -- Martínez: Terapia Familiar
    (2, 11), -- Martínez: Duelo y Pérdida
    (3, 1),  -- Reyes: Psicología Clínica
    (3, 7),  -- Reyes: Trastornos del Estado de Ánimo
    (3, 8);  -- Reyes: Neuropsicología

-- 8.6 Horarios
INSERT INTO schedules (professional_id, dia_semana, hora_inicio, hora_fin) VALUES
    -- Dra. García: lunes–viernes con corte al mediodía
    (1, 'lunes',     '09:00', '13:00'),
    (1, 'lunes',     '15:00', '19:00'),
    (1, 'martes',    '09:00', '13:00'),
    (1, 'miercoles', '09:00', '13:00'),
    (1, 'miercoles', '15:00', '19:00'),
    (1, 'jueves',    '09:00', '13:00'),
    (1, 'viernes',   '09:00', '14:00'),
    -- Lic. Martínez: tardes entre semana + sábados
    (2, 'lunes',     '16:00', '20:00'),
    (2, 'miercoles', '16:00', '20:00'),
    (2, 'viernes',   '16:00', '20:00'),
    (2, 'sabado',    '09:00', '14:00'),
    -- Dr. Reyes: martes, jueves y sábados
    (3, 'martes',    '10:00', '14:00'),
    (3, 'jueves',    '10:00', '14:00'),
    (3, 'jueves',    '16:00', '19:00'),
    (3, 'sabado',    '09:00', '13:00');

-- 8.7 Reviews
--     professional_id 1 = Dra. García | user_id 5 = María | 6 = Carlos
INSERT INTO reviews
    (professional_id, user_id, calificacion, comentario, estado)
VALUES
(
    1, 5, 5,
    'La Dra. García cambió mi vida. Llegué con una ansiedad que no me dejaba '
    'funcionar y en seis meses logré retomar el control. Su trato es muy humano '
    'y sus técnicas realmente funcionan. La recomiendo ampliamente.',
    'aprobado'
),
(
    2, 6, 1,
    'Este comentario fue rechazado porque incluía datos de contacto externos '
    'y publicidad no permitida, conforme a los lineamientos de la plataforma.',
    'rechazado'
);

-- 8.8 Bitácora: la primera review fue editada antes de su aprobación
INSERT INTO review_edits
    (review_id, comentario_anterior, calificacion_anterior)
VALUES
(
    1,
    'La Dra. García es muy buena. Me ayudó bastante con mi ansiedad.',
    4
);

-- 8.9 Vistas de contacto registradas
INSERT INTO contact_views (user_id, professional_id) VALUES
    (5, 1),  -- María consultó a Dra. García
    (5, 3),  -- María consultó a Dr. Reyes
    (6, 1);  -- Carlos consultó a Dra. García

-- ============================================================
-- Fin del schema — listo para ejecutar en pgAdmin 4
-- ============================================================
