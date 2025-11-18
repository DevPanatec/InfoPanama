# 🚀 Guía de Inicio - InfoPanama

Esta guía te ayudará a configurar el proyecto InfoPanama en tu máquina local.

## 📋 Requisitos Previos

### Software Necesario

- **Node.js** 20+ y npm 10+
- **Python** 3.11+
- **Poetry** (gestor de dependencias Python)
- **Git**
- **Docker** y Docker Compose (para servicios locales)

### Cuentas y Servicios

- Cuenta en [Convex](https://convex.dev/)
- API Key de OpenAI
- Cuenta en DigitalOcean (para Spaces)
- ProxyScrape API Key (opcional para scraping)

## 🏗️ Setup Inicial

### 1. Clonar el Repositorio

```bash
git clone <repo-url>
cd InfoPanama
```

### 2. Instalar Dependencias del Monorepo

```bash
# Instalar dependencias de Node
npm install

# Instalar Poetry (si no lo tienes)
curl -sSL https://install.python-poetry.org | python3 -

# Instalar dependencias de Python
cd packages/api
poetry install
cd ../..
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar con tus credenciales
nano .env.local  # o tu editor favorito
```

Configuración mínima requerida:

```bash
# Convex (obtener después del paso 4)
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant (si usas Docker local)
QDRANT_URL=http://localhost:6333

# DigitalOcean Spaces
DO_SPACES_KEY=
DO_SPACES_SECRET=
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=infopanama-snapshots
```

### 4. Configurar Convex

```bash
# Ir al paquete de Convex
cd packages/convex

# Iniciar Convex (te pedirá autenticarte)
npx convex dev

# Seguir las instrucciones para crear un proyecto
# Copiar las variables generadas a .env.local
```

### 5. Levantar Servicios con Docker

```bash
# En la raíz del proyecto
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Verificar que los servicios estén corriendo
docker ps
```

Esto levantará:
- Qdrant (vector database) en puerto 6333
- PostgreSQL (opcional, para futuros usos)

## 🖥️ Ejecutar el Proyecto

### Desarrollo Completo (Todo el Monorepo)

```bash
# En la raíz del proyecto
npm run dev
```

Esto inicia:
- Frontend Web en http://localhost:3000
- Admin Panel en http://localhost:3001
- Convex en modo desarrollo

### Desarrollo Individual

#### Frontend Web

```bash
npm run dev:web
# Abre http://localhost:3000
```

#### Admin Panel

```bash
npm run dev:admin
# Abre http://localhost:3001
```

#### FastAPI Backend

```bash
cd packages/api
poetry run uvicorn app.main:app --reload
# API disponible en http://localhost:8000
# Docs en http://localhost:8000/api/docs
```

#### Convex

```bash
npm run convex:dev
```

## 🧪 Verificar Instalación

### 1. Verificar Frontend

Abre http://localhost:3000 - Deberías ver la página principal de InfoPanama.

### 2. Verificar API

```bash
curl http://localhost:8000/health
# Debe devolver: {"status":"healthy"}
```

### 3. Verificar Convex

En la terminal donde corriste `convex dev`, deberías ver:
```
✓ Convex functions ready!
```

### 4. Verificar Qdrant

```bash
curl http://localhost:6333/collections
# Debe devolver un JSON con las colecciones
```

## 📚 Próximos Pasos

Ahora que tienes el proyecto funcionando:

1. **Explorar el Código**
   - `/apps/web` - Frontend público
   - `/packages/convex` - Schema y funciones de base de datos
   - `/packages/api` - Backend FastAPI

2. **Crear Datos de Prueba**
   ```bash
   # Ejecutar scripts de seed (próximamente)
   npm run seed
   ```

3. **Leer la Documentación**
   - [Arquitectura del Sistema](./architecture.md)
   - [Guía de Desarrollo](./development.md)
   - [Metodología de Verificación](./methodology.md)

4. **Empezar a Desarrollar**
   - Revisa el [Backlog](../README.md#-roadmap-mvp-8-semanas)
   - Elige una tarea de la Épica actual
   - Crea una rama: `git checkout -b feature/TASK-ID`

## ❗ Troubleshooting

### Error: "Cannot connect to Convex"

- Verifica que `NEXT_PUBLIC_CONVEX_URL` esté configurado en `.env.local`
- Ejecuta `npx convex dev` en `packages/convex`

### Error: "OpenAI API key not found"

- Verifica que `OPENAI_API_KEY` esté configurado
- La key debe empezar con `sk-`

### Error: "Qdrant connection refused"

- Verifica que Docker esté corriendo: `docker ps`
- Levanta los servicios: `npm run docker:up`

### Error: "Module not found"

```bash
# Limpiar e instalar de nuevo
npm run clean
npm install
```

### Problemas con Poetry

```bash
# Reinstalar Poetry
curl -sSL https://install.python-poetry.org | python3 - --uninstall
curl -sSL https://install.python-poetry.org | python3 -

# Limpiar cache
poetry cache clear pypi --all
poetry install
```

## 💬 Ayuda

Si tienes problemas:

1. Revisa los logs: `npm run docker:logs`
2. Consulta la documentación completa en `/docs`
3. Contacta al equipo de desarrollo

## 🎉 ¡Listo!

Ya tienes InfoPanama corriendo localmente. ¡Hora de desarrollar!
