# Configuración del Crawler Automático

El crawler se ejecuta automáticamente **3 veces al día** usando GitHub Actions.

## Horarios de ejecución (hora de Panamá)

- **2:00 AM** - Crawl nocturno
- **10:00 AM** - Crawl matutino
- **6:00 PM** - Crawl vespertino

## Configuración de Secrets en GitHub

Para que el crawler funcione, necesitas configurar estos secrets en tu repositorio:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Crea los siguientes **Repository secrets**:

### Secrets requeridos:

| Secret | Descripción | Dónde obtenerlo |
|--------|-------------|-----------------|
| `OPENAI_API_KEY` | API key de OpenAI para extracción de claims | https://platform.openai.com/api-keys |
| `CONVEX_URL` | URL de tu deployment de Convex | Dashboard de Convex |
| `NEXT_PUBLIC_CONVEX_URL` | URL pública de Convex | Dashboard de Convex (mismo valor) |

### Cómo obtener CONVEX_URL:

1. Ve a https://dashboard.convex.dev
2. Selecciona tu proyecto "InfoPanama"
3. Ve a Settings → URL
4. Copia la deployment URL (ejemplo: `https://your-project.convex.cloud`)

### Cómo obtener OPENAI_API_KEY:

1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala (solo se muestra una vez)

## Verificar que está funcionando

1. Ve a Actions en tu repositorio de GitHub
2. Deberías ver el workflow "Crawler Automático"
3. Espera al siguiente horario programado O ejecuta manualmente:
   - Click en "Crawler Automático"
   - Click en "Run workflow"
   - Selecciona la branch `main`
   - Click "Run workflow"

## Logs y monitoreo

- **Logs de GitHub Actions**: Ve a Actions → Crawler Automático → Click en cualquier ejecución
- **Logs de Convex**: Dashboard de Convex → Logs
- **Logs del crawler**: Se muestran en la ejecución de GitHub Actions

## Solución de problemas

### Error: "Missing required secret"
- Verifica que agregaste todos los secrets en GitHub Settings

### Error: "Playwright browser not found"
- Ya está configurado en el workflow, no deberías ver este error

### Claims no aparecen en la base de datos
- Verifica que CONVEX_URL esté correcto
- Revisa los logs en GitHub Actions para ver si hubo errores

## Ejecución manual local

Si quieres ejecutar el crawler manualmente desde tu computadora:

```bash
cd packages/crawler
npm run crawl:all
```

Asegúrate de tener las variables de entorno configuradas en tu `.env`:
- `OPENAI_API_KEY`
- `CONVEX_URL` o `NEXT_PUBLIC_CONVEX_URL`
