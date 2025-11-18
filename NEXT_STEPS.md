# 🚀 Próximos Pasos - InfoPanama

## ✅ Estado Actual

Hemos completado exitosamente el **Setup Inicial (Épica 0)** con:

1. ✅ Estructura de monorepo con Turborepo
2. ✅ Convex configurado con schema completo
3. ✅ Next.js 15 con componentes iniciales
4. ✅ FastAPI con estructura base
5. ✅ Package shared con tipos y utilidades
6. ✅ Docker Compose para servicios locales
7. ✅ Documentación inicial

**Progreso Épica 0:** 60% completado
**Progreso Total:** ~15%

## 📦 Qué Instalar Ahora

### 1. Instalar Dependencias

```bash
# En la raíz del proyecto
npm install

# Esto instalará todas las dependencias de:
# - apps/web
# - packages/convex
# - packages/shared
```

### 2. Instalar Poetry (Python)

```bash
# En Windows (PowerShell)
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -

# Luego instalar dependencias del API
cd packages/api
poetry install
cd ../..
```

### 3. Instalar Convex CLI Globalmente (Opcional)

```bash
npm install -g convex
```

## ⚙️ Configurar Convex

### Paso 1: Crear Proyecto en Convex

```bash
cd packages/convex
npx convex dev
```

Esto:
1. Te pedirá autenticarte en Convex (navegador)
2. Te preguntará si quieres crear un nuevo proyecto
3. Generará las credenciales automáticamente

### Paso 2: Copiar Credenciales

Después de `npx convex dev`, verás algo como:

```
✓ Deployed functions to https://xxx.convex.cloud
✓ CONVEX_DEPLOYMENT=prod:xxx
✓ NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

Copia estas variables a tu `.env.local` en la raíz:

```bash
# En la raíz del proyecto
cp .env.example .env.local

# Editar .env.local con las credenciales de Convex
```

## 🐳 Levantar Servicios Docker

```bash
# En la raíz del proyecto
npm run docker:up

# Esto levantará:
# - Qdrant (puerto 6333)
# - PostgreSQL (puerto 5432)
# - Redis (puerto 6379)
# - Prefect (puerto 4200)

# Verificar que estén corriendo
docker ps
```

## 🚀 Iniciar Desarrollo

### Opción 1: Todo el Monorepo

```bash
npm run dev
```

Esto iniciará:
- Web app en http://localhost:3000
- Convex en modo watch

### Opción 2: Solo Frontend

```bash
npm run dev:web
```

### Opción 3: API + Frontend

```bash
# Terminal 1: Frontend
npm run dev:web

# Terminal 2: API
cd packages/api
poetry run uvicorn app.main:app --reload
```

## 🔑 Configurar API Keys

Para empezar a desarrollar, necesitarás:

### 1. OpenAI API Key (Obligatoria para verificación)

1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Agrégala a `.env.local`:

```bash
OPENAI_API_KEY=sk-...
```

### 2. DigitalOcean Spaces (Opcional por ahora)

Puedes dejarlo vacío por ahora. Lo necesitarás cuando empieces a hacer scraping.

## 🧪 Verificar que Todo Funciona

### 1. Verificar Convex

```bash
# En packages/convex
npx convex dev

# Deberías ver: ✓ Convex functions ready!
```

### 2. Verificar Frontend

```bash
npm run dev:web
```

Abre http://localhost:3000 - Deberías ver:
- Hero con buscador
- 4 tarjetas de estadísticas (probablemente en 0)
- Sección "Verificaciones Recientes" (vacía por ahora)

### 3. Verificar API

```bash
cd packages/api
poetry run uvicorn app.main:app --reload
```

Abre http://localhost:8000/api/docs - Deberías ver la documentación Swagger.

### 4. Verificar Docker

```bash
docker ps

# Deberías ver 4 contenedores corriendo:
# - infopanama-qdrant
# - infopanama-postgres
# - infopanama-redis
# - infopanama-prefect
```

## 📝 Crear Datos de Prueba

### Opción 1: Usar la API de Convex directamente

```bash
cd packages/convex
npx convex dev

# En otra terminal, crear un script de seed
```

### Opción 2: Usar el Frontend

Una vez que el frontend esté corriendo, puedes crear claims manualmente desde la UI (cuando implementemos el formulario).

## 🎯 Siguiente Épica: Scrapers (Semana 1)

Ahora que el setup está completo, el siguiente paso es:

### SCRAPE-001: Setup Playwright base

```bash
# Crear packages/scrapers
mkdir -p packages/scrapers
cd packages/scrapers

# Inicializar proyecto Python
poetry init
poetry add playwright beautifulsoup4 httpx
poetry run playwright install

# Crear estructura
mkdir -p scrapers/{base,medios,oficiales}
touch scrapers/base/__init__.py
touch scrapers/base/scraper.py
```

### SCRAPE-002: Integrar ProxyScrape

1. Obtener API key de https://proxyscrape.com/
2. Implementar `proxy_manager.py`
3. Testear rotación de proxies

### SCRAPE-003: Scrapers de medios (Fase 1)

Implementar scrapers para:
- Telemetro
- La Prensa
- TVN

## 📚 Recursos Útiles

### Documentación

- [Convex Docs](https://docs.convex.dev/)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Playwright Docs](https://playwright.dev/)

### Estructura del Proyecto

Lee estos archivos para entender la estructura:
- [README.md](./README.md) - Visión general
- [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - Resumen del setup
- [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) - Guía detallada
- [packages/convex/README.md](./packages/convex/README.md) - Schema de Convex

## ❓ FAQ

### ¿Por qué no veo datos en el frontend?

Porque la base de datos está vacía. Necesitas crear datos de prueba o esperar a implementar los scrapers.

### ¿Necesito todas las API keys ahora?

No. Para desarrollo inicial solo necesitas:
- Convex (se configura automáticamente)
- OpenAI (si quieres probar verificación)

Los demás servicios son opcionales hasta que los necesites.

### ¿Cómo agrego más dependencias?

```bash
# Para frontend
npm install <package> --workspace=web

# Para API Python
cd packages/api
poetry add <package>

# Para Convex
cd packages/convex
npm install <package>
```

### ¿Cómo hago deploy?

Por ahora no. Primero completaremos el MVP local. El deploy vendrá en la Épica 10.

## 🐛 Problemas Comunes

### Error: "Cannot find module"

```bash
npm run clean
npm install
```

### Error: "Convex deployment not found"

Asegúrate de haber ejecutado `npx convex dev` y copiado las variables a `.env.local`.

### Error: "Docker connection refused"

```bash
# Reiniciar Docker
npm run docker:down
npm run docker:up
```

## ✨ Comandos Rápidos

```bash
# Desarrollo completo
npm run dev

# Solo web
npm run dev:web

# API
cd packages/api && poetry run python -m app.main

# Convex
cd packages/convex && npx convex dev

# Docker
npm run docker:up
npm run docker:down
npm run docker:logs

# Linting
npm run lint
npm run format

# Typecheck
npm run typecheck
```

## 📞 Ayuda

Si tienes problemas:
1. Revisa [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)
2. Busca en [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)
3. Revisa los logs: `npm run docker:logs`

---

**¡Listo para empezar! 🚀**

Ejecuta `npm install` y luego sigue los pasos de "Configurar Convex" para comenzar.
