-- Migración: blog / publicaciones
-- Tabla de posts para el contenido que también se publica en Instagram y Facebook.
-- Un post con estado 'publicado' y publicado_at en el futuro queda programado:
-- la API pública solo lo muestra cuando publicado_at <= NOW().
--
-- Ejecutar una vez en producción:
--   docker compose exec -T postgres psql -U $DB_USER -d $DB_NAME < database/migrations/add_posts.sql

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_estado') THEN
        CREATE TYPE post_estado AS ENUM ('borrador', 'publicado');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL       PRIMARY KEY,
    slug         VARCHAR(120) NOT NULL,
    titulo       VARCHAR(200) NOT NULL,
    resumen      VARCHAR(500),
    contenido    TEXT         NOT NULL,
    imagen_url   TEXT,
    imagen_alt   VARCHAR(300),
    tags         TEXT[]       NOT NULL DEFAULT '{}',
    estado       post_estado  NOT NULL DEFAULT 'borrador',
    publicado_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_posts_slug UNIQUE (slug),
    CONSTRAINT chk_posts_publicado_fecha
        CHECK (estado = 'borrador' OR publicado_at IS NOT NULL)
);

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_posts_publicacion ON posts(estado, publicado_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags        ON posts USING GIN (tags);

-- Permisos para el usuario de conexión (si la tabla se creó con otro usuario)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'sms_user') THEN
        GRANT ALL PRIVILEGES ON TABLE posts TO sms_user;
        GRANT ALL PRIVILEGES ON SEQUENCE posts_id_seq TO sms_user;
    END IF;
END
$$;
