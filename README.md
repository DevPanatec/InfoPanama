# InfoPanama - Plataforma de Verificación de Información

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![License](https://img.shields.io/badge/license-Propietario-red)

## 🎯 Visión del Proyecto

Plataforma híbrida estilo Snopes + Ground News para Panamá, 100% automatizada con IA, que verifica afirmaciones y mapea la cobertura mediática nacional, incluyendo análisis de debida diligencia de actores informativos.

## 🏗️ Arquitectura del Monorepo

```
infopanama/
├── apps/
│   └── web/              # Aplicación Next.js 15 (público + admin)
│       ├── src/app/      # Rutas públicas
│       └── src/app/admin/ # Panel administrativo
├── packages/
│   ├── api/              # FastAPI Backend
│   ├── convex/           # Convex schema & functions
│   ├── scrapers/         # Playwright scrapers
│   ├── ai/               # NLP, RAG, verificación
│   └── shared/           # Tipos y utilidades compartidas
├── docs/                 # Documentación técnica
└── infrastructure/       # Docker, CI/CD, scripts
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.0.3** (App Router)
- **React 18.3.1** (NO React 19 por compatibilidad)
- **TypeScript 5.3.3**
- **Tailwind CSS + shadcn/ui patterns**
- **Lucide React** (iconos)
- **date-fns** (manejo de fechas)
- **ECharts / D3.js** (visualizaciones - por implementar)
- **vis.js** (grafos - por implementar)

### Backend
- **FastAPI** (Python)
- **Convex** (Database + Realtime)
- **Qdrant** (Vector Database)

### IA y Procesamiento
- **OpenAI GPT-4.1 / GPT-4.5**
- **LLaMA 3.1** (procesamiento local)
- **spaCy** (NLP en español)
- **sentence-transformers** (embeddings)

### Scraping y Orquestación
- **Playwright** (scraping dinámico)
- **Browserbase** (navegadores cloud con anti-detección e IPs rotativas)
- **Prefect** (orquestación de workflows - opcional)

### Infraestructura
- **DigitalOcean Droplet** (Ubuntu 24.04)
- **DigitalOcean Spaces** (almacenamiento S3)
- **Docker + Docker Compose**
- **GitHub Actions** (CI/CD)
- **Cloudflare** (WAF + CDN)

### Monitoring
- **Sentry** (error tracking)
- **Prometheus + Grafana** (métricas)

## 🚀 Quick Start

### Requisitos Previos

- Node.js 20+ y npm/pnpm
- Python 3.11+
- Docker y Docker Compose
- Git

### Instalación Local

```bash
# Clonar el repositorio
git clone <repo-url>
cd infopanama

# Instalar dependencias del workspace
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales:
#   - OPENAI_API_KEY: Tu API key de OpenAI
#   - NEXT_PUBLIC_CONVEX_URL: Tu URL de Convex

# Levantar servicios con Docker (opcional - backend)
docker-compose up -d

# Iniciar desarrollo (frontend público + admin)
npm run dev
# Accede a:
# - http://localhost:3000 (sitio público)
# - http://localhost:3000/admin/dashboard (panel admin)
```

### 🕷️ Ejecutar el Crawler

El crawler extrae noticias de medios panameños y crea claims automáticamente con IA:

```bash
# Windows
run-crawler.bat

# Linux/Mac
chmod +x run-crawler.sh
./run-crawler.sh
```

Ver [CRAWLER_SETUP.md](CRAWLER_SETUP.md) para documentación completa del crawler.

## 📋 Variables de Entorno

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# OpenAI
OPENAI_API_KEY=

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# DigitalOcean Spaces
DO_SPACES_KEY=
DO_SPACES_SECRET=
DO_SPACES_ENDPOINT=
DO_SPACES_BUCKET=

# ProxyScrape
PROXYSCRAPE_API_KEY=

# Sentry
SENTRY_DSN=
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Deployment

### Arquitectura de Producción

- **Frontend**: Vercel (Next.js App Router con SSR/SSG)
- **Backend/Database**: Convex (Real-time + File Storage)
- **Crawlers**: Digital Ocean App Platform (Workers + Cron Jobs)
- **Scraping Avanzado**: Browserbase (Headless browsers con anti-detección)

### Guías de Despliegue Completas

📚 **Documentación detallada:**

- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Lista completa de verificación
- **[DEPLOY_DIGITAL_OCEAN.md](DEPLOY_DIGITAL_OCEAN.md)** - Guía paso a paso para Digital Ocean
- **[BROWSERBASE_SETUP.md](packages/crawler/BROWSERBASE_SETUP.md)** - Configuración de scraping avanzado
- **[ANTICAPTCHA_SETUP.md](packages/crawler/ANTICAPTCHA_SETUP.md)** - Configuración de captcha solving (opcional)
- **[scripts/README.md](scripts/README.md)** - Scripts de setup automático
- **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** - Referencia rápida de comandos

### Quick Deploy

```bash
# 1. Setup automático de Digital Ocean
# Windows
.\scripts\setup-digital-ocean.ps1

# macOS/Linux
./scripts/setup-digital-ocean.sh

# 2. Frontend (Vercel)
# - Conecta tu repo en vercel.com
# - Configura variables de entorno
# - Deploy automático en push a main

# 3. Crawlers (Digital Ocean)
# - Crea app en cloud.digitalocean.com/apps
# - Configura cron jobs (3x/día)
# - Ver guía completa en DEPLOY_DIGITAL_OCEAN.md
```

### Costos Estimados

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Vercel | Pro | $20 (o Free) |
| Convex | Professional | $25 (o Free) |
| Digital Ocean | Basic | $5 |
| Browserbase | Hobby | $20 |
| OpenAI | Pay-as-you-go | ~$5-10 |
| AntiCaptcha | Pay-as-you-go (opcional) | ~$0-5 |
| **TOTAL** | | **$30-85/mes** |

## 🎯 Roadmap MVP (8 Semanas)

- **Semana 0**: Setup e infraestructura
- **Semana 1**: Scrapers básicos
- **Semana 2**: NLP y embeddings
- **Semana 3**: RAG y verificación
- **Semana 4**: Admin UI
- **Semana 5**: Agent mode y frontend
- **Semana 6**: Gov watcher y DD
- **Semana 7**: Media graph
- **Semana 8**: QA y deploy

## 📚 Documentación

Ver la carpeta [`/docs`](/docs) para documentación detallada:

- [Arquitectura del Sistema](/docs/architecture.md)
- [Guía de Desarrollo](/docs/development.md)
- [API Reference](/docs/api.md)
- [Metodología de Verificación](/docs/methodology.md)
- [Debida Diligencia](/docs/due-diligence.md)

## 🔐 Seguridad

- Todas las acciones administrativas son auditadas
- Logs inmutables en Convex
- 2FA obligatorio para approvers
- WAF con Cloudflare
- Rate limiting en todos los endpoints públicos

## 🤝 Convenciones de Código

### Commits
Usamos conventional commits:

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

### Branches
- `main`: producción
- `dev`: desarrollo
- `staging`: pre-producción
- `feature/*`: nuevas funcionalidades
- `fix/*`: correcciones
- `hotfix/*`: correcciones urgentes en producción

## 📄 Licencia

Propietario. Todos los derechos reservados.

## 🙋 Soporte

Para dudas o problemas, contactar al equipo de desarrollo.

---

**Desarrollado con** ❤️ **para Panamá**
