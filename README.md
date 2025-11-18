# InfoPanama - Plataforma de Verificación de Información

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![License](https://img.shields.io/badge/license-Propietario-red)

## 🎯 Visión del Proyecto

Plataforma híbrida estilo Snopes + Ground News para Panamá, 100% automatizada con IA, que verifica afirmaciones y mapea la cobertura mediática nacional, incluyendo análisis de debida diligencia de actores informativos.

## 🏗️ Arquitectura del Monorepo

```
infopanama/
├── apps/
│   ├── web/              # Frontend público Next.js 15
│   └── admin/            # Panel administrativo Next.js 15
├── packages/
│   ├── api/              # FastAPI Backend
│   ├── convex/           # Convex schema & functions
│   ├── scrapers/         # Playwright scrapers
│   ├── ai/               # NLP, RAG, verificación
│   ├── shared/           # Tipos y utilidades compartidas
│   └── ui/               # Componentes UI compartidos (shadcn)
├── docs/                 # Documentación técnica
└── infrastructure/       # Docker, CI/CD, scripts
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS + shadcn/ui**
- **ECharts / D3.js** (visualizaciones)
- **vis.js** (grafos)

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
- **ProxyScrape** (rotación de proxies)
- **Prefect** (orquestación de workflows)

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
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Levantar servicios con Docker
docker-compose up -d

# Iniciar desarrollo
npm run dev
```

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

```bash
# Build producción
npm run build

# Deploy staging
npm run deploy:staging

# Deploy producción
npm run deploy:prod
```

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
