# mentesana-mcp

MCP server para publicar en **mentesanasaltillo.com/blog** desde Claude.
Corre en tu computadora (transporte stdio) y habla con la API del sitio usando una API key.

## Herramientas

| Tool | Qué hace |
|------|----------|
| `upload_image` | Sube una imagen local (o desde una URL) al VPS y devuelve su URL pública en `/uploads/...` |
| `create_post` | Crea un artículo. Por defecto queda en borrador; con `estado: "publicado"` sale ya, y con `publicado_at` futuro queda programado |
| `update_post` | Edita, publica, reprograma o despublica un artículo por `id` |
| `list_posts` | Lista borradores, programados y publicados |
| `get_post` | Muestra un artículo completo con su Markdown |

La URL que devuelve `upload_image` es pública, así que sirve también para programar el mismo post en Instagram y Facebook desde Metricool o Buffer.

## 1. Preparar el servidor (una sola vez)

En el droplet, dentro de la carpeta del proyecto:

```bash
# 1. Generar la API key y agregarla al .env de producción
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#   CONTENT_API_KEY=<la key generada>
#   PUBLIC_UPLOADS_URL=https://mentesanasaltillo.com/uploads

# 2. Crear la tabla posts
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" < database/migrations/add_posts.sql

# 3. Reconstruir y levantar (crea el volumen uploads_data y recarga Nginx)
docker compose up -d --build
```

Comprueba que respondan:

```bash
curl https://mentesanasaltillo.com/api/v1/posts
curl -H "x-api-key: <tu key>" https://mentesanasaltillo.com/api/v1/posts/manage
```

## 2. Compilar el MCP en tu computadora

```bash
cd mcp
npm install
npm run build
```

## 3. Conectarlo a Claude Desktop (Windows)

Abre `%APPDATA%\Claude\claude_desktop_config.json` (o en Claude Desktop: Settings → Developer → Edit Config) y agrega:

```json
{
  "mcpServers": {
    "mentesana": {
      "command": "node",
      "args": ["C:\\ruta\\a\\mentesanasaltillo\\mcp\\dist\\index.js"],
      "env": {
        "MENTESANA_API_KEY": "<tu CONTENT_API_KEY>"
      }
    }
  }
}
```

Reinicia Claude Desktop. Para Claude Code:

```bash
claude mcp add mentesana --env MENTESANA_API_KEY=<tu key> -- node C:\ruta\a\mentesanasaltillo\mcp\dist\index.js
```

### Variables

| Variable | Requerida | Default |
|----------|-----------|---------|
| `MENTESANA_API_KEY` | Sí | — (igual a `CONTENT_API_KEY` del backend) |
| `MENTESANA_SITE_URL` | No | `https://mentesanasaltillo.com` |
| `MENTESANA_API_URL` | No | `<SITE_URL>/api/v1` (para probar en local: `http://localhost:4000/api/v1`) |

## Flujo de trabajo

> Sube `C:\Users\antonio\Downloads\post-ansiedad.png`, crea el artículo del blog con este copy (versión larga para la web, sin hashtags) y prográmalo para el jueves a las 7 pm. Luego programa el mismo post en Instagram y Facebook con Metricool usando esa imagen.

Claude llama a `upload_image` → `create_post` (con `publicado_at`) y después a las herramientas de Metricool.

## Seguridad

- La API key permite crear y editar publicaciones; guárdala solo en el `.env` del servidor y en tu config local de Claude.
- Para revocarla, cambia `CONTENT_API_KEY` en el servidor y reinicia el backend.
- Si `CONTENT_API_KEY` está vacía, la gestión solo funciona con un JWT de administrador.
- El MCP corre por stdio en tu máquina; no expone ningún puerto. Para usarlo desde claude.ai web o el celular haría falta una versión HTTP con OAuth.
