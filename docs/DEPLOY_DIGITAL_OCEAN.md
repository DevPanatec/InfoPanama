# 🚀 Guía de Despliegue en Digital Ocean

Esta guía te ayudará a desplegar **InfoPanama** (VerificaPty) en Digital Ocean.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura de Despliegue](#arquitectura-de-despliegue)
3. [Configuración de Servicios](#configuración-de-servicios)
4. [Costos Estimados](#costos-estimados)
5. [Pasos de Instalación](#pasos-de-instalación)
6. [Variables de Entorno](#variables-de-entorno)
7. [Automatización con GitHub Actions](#automatización-con-github-actions)
8. [Monitoreo y Logs](#monitoreo-y-logs)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Requisitos Previos

- [ ] Cuenta en Digital Ocean ([Sign up aquí](https://www.digitalocean.com))
- [ ] Cuenta en Vercel (para el frontend Next.js)
- [ ] Cuenta en Convex (para base de datos - ya configurado)
- [ ] Cuenta en Browserbase (para crawlers - ya configurado)
- [ ] Dominio personalizado (opcional pero recomendado)
- [ ] Git repository con el código

---

## 🏗️ Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────┐
│                  USUARIOS                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  VERCEL (Frontend - Next.js App)                │
│  - SSR & Static Generation                      │
│  - Edge Functions                                │
│  - CDN Global                                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  CONVEX (Backend - Database & API)              │
│  - Real-time Database                           │
│  - Queries & Mutations                          │
│  - File Storage                                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  DIGITAL OCEAN (Crawlers & Background Jobs)     │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  App Platform (Web Service)            │    │
│  │  - Node.js 20                          │    │
│  │  - Auto-scaling                        │    │
│  │  - Health checks                       │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Cron Jobs / Workers                   │    │
│  │  - Crawlers automáticos (3x/día)      │    │
│  │  - Procesamiento de claims            │    │
│  │  - Limpieza de datos                  │    │
│  └────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  BROWSERBASE (Headless Browsers)                │
│  - Instagram scraping                           │
│  - Anti-detection                               │
│  - IP rotation                                  │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Configuración de Servicios

### 1️⃣ Vercel (Frontend)

**Ya está configurado**, pero asegúrate de:

```bash
# Variables de entorno en Vercel Dashboard
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 2️⃣ Digital Ocean App Platform (Crawlers)

Vamos a desplegar los crawlers como un servicio en DO App Platform.

**Características**:
- Auto-scaling basado en carga
- Health checks automáticos
- Logs centralizados
- Rollback con un click

---

## 💰 Costos Estimados

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| **Vercel** | Pro | $20/mes (o Free para comenzar) |
| **Convex** | Professional | $25/mes (1M function calls) |
| **Digital Ocean App Platform** | Basic (512MB RAM) | $5/mes |
| **Browserbase** | Hobby | $20/mes |
| **Dominio** | .com | $12/año (~$1/mes) |
| **TOTAL** | | **$70-71/mes** |

### Alternativa Económica (para comenzar):
- Vercel: Free tier
- Convex: Free tier (hasta 1M llamadas)
- Digital Ocean: $5/mes
- Browserbase: $20/mes
- **TOTAL INICIAL: ~$25/mes**

---

## 📦 Pasos de Instalación

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todo esté en Git:
```bash
git add .
git commit -m "feat: preparar para despliegue en Digital Ocean"
git push origin main
```

2. Crea un archivo `Dockerfile` en la raíz del monorepo:

```dockerfile
# Ver archivo Dockerfile incluido abajo
```

3. Crea un archivo `.dockerignore`:

```
node_modules
.next
.turbo
*.log
.env.local
.DS_Store
```

### Paso 2: Crear App en Digital Ocean

1. Ve a [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)

2. Click en **"Create App"**

3. **Source**:
   - Selecciona tu repositorio de GitHub
   - Autoriza a Digital Ocean a acceder a tu repo

4. **Resources**:
   - Type: **Worker** (para cron jobs)
   - Name: `infopanama-crawler`
   - Build Command: `npm install && npm run build --workspace=@infopanama/crawler`
   - Run Command: `npm run crawl:all --workspace=@infopanama/crawler`

5. **Environment Variables**:
   - Agrega todas las variables (ver sección abajo)

6. **Pricing**:
   - Selecciona **Basic - $5/mes** (512MB RAM, suficiente para crawlers)

7. **Deploy**!

### Paso 3: Configurar Cron Job

Para ejecutar crawlers automáticamente 3 veces al día:

1. En Digital Ocean Dashboard → Apps → tu app
2. Ve a **Settings** → **App-Level Cron Jobs**
3. Agrega:

```
# Ejecutar crawlers 3 veces al día (8am, 2pm, 8pm UTC-5)
0 13,19,1 * * * npm run crawl:all --workspace=@infopanama/crawler
```

---

## 🔐 Variables de Entorno

Configura estas variables en Digital Ocean App Platform:

```bash
# OpenAI (para extracción de claims)
OPENAI_API_KEY=sk-proj-...

# Convex (base de datos)
CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Browserbase (scraping avanzado)
BROWSERBASE_API_KEY=bb_live_...
BROWSERBASE_PROJECT_ID=...

# Node environment
NODE_ENV=production
```

---

## 🤖 Automatización con GitHub Actions

Crea `.github/workflows/deploy.yml` para auto-deploy:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

      - name: Trigger deployment
        run: doctl apps create-deployment ${{ secrets.APP_ID }}
```

**Configuración en GitHub**:
1. Ve a Settings → Secrets → Actions
2. Agrega:
   - `DIGITALOCEAN_ACCESS_TOKEN`: Token de API de DO
   - `APP_ID`: ID de tu app (lo ves en la URL de DO)

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Instala doctl CLI
brew install doctl  # macOS
# o
sudo snap install doctl  # Linux

# Autentícate
doctl auth init

# Ver logs
doctl apps logs <APP_ID> --type=run --follow
```

### Monitoreo en Dashboard

1. Ve a Digital Ocean → Apps → tu app
2. Pestaña **"Runtime Logs"**
3. Filtra por:
   - Tipo: `run` (para logs de ejecución)
   - Período: últimas 24h

### Métricas Importantes

- **CPU Usage**: Debería estar <50% en promedio
- **Memory**: Debería estar <400MB (de 512MB disponibles)
- **Restart Count**: Debería ser 0 (si aumenta, hay problemas)

---

## 🔧 Troubleshooting

### ❌ Error: "Build failed"

**Causa**: Dependencias faltantes o errores de compilación

**Solución**:
```bash
# Verifica que todo compile localmente
npm install
npm run build --workspace=@infopanama/crawler

# Si funciona local, revisa los logs de DO
doctl apps logs <APP_ID> --type=build
```

### ❌ Error: "Health check failed"

**Causa**: App no responde en el puerto correcto

**Solución**:
- Cambia el tipo de recurso de "Web Service" a "Worker"
- Los crawlers no necesitan exponer un puerto HTTP

### ❌ Crawlers no se ejecutan

**Causa**: Cron job mal configurado

**Solución**:
1. Verifica el cron syntax en [crontab.guru](https://crontab.guru)
2. Asegúrate de usar UTC timezone
3. Para Panamá (UTC-5), suma 5 horas

Ejemplo: Para ejecutar a las 8am Panamá = 13:00 UTC
```
0 13 * * *  # 8am Panamá = 1pm UTC
```

### ❌ Out of Memory (OOM)

**Causa**: Crawlers usan mucha memoria

**Solución**:
1. Upgrade a plan de $12/mes (1GB RAM)
2. O optimiza los crawlers:
```typescript
// Limita crawlers simultáneos
const results = []
for (const crawler of crawlers) {
  const result = await crawler()  // Secuencial en vez de paralelo
  results.push(result)
}
```

---

## 🎯 Checklist Final

Antes de dar por terminado el despliegue:

- [ ] Frontend desplegado en Vercel
- [ ] Crawlers desplegados en Digital Ocean
- [ ] Cron jobs configurados (3x/día)
- [ ] Variables de entorno configuradas
- [ ] Browserbase configurado y funcionando
- [ ] Logs verificados (sin errores)
- [ ] GitHub Actions configurado (opcional)
- [ ] Dominio personalizado configurado (opcional)
- [ ] Monitoreo activo
- [ ] Primer scrape exitoso confirmado

---

## 📚 Recursos Útiles

- [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/)
- [Cron Expression Generator](https://crontab.guru)
- [Digital Ocean Community](https://www.digitalocean.com/community)

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs primero**: `doctl apps logs <APP_ID> --follow`
2. **Consulta esta guía**: Troubleshooting section
3. **Contacta al equipo**: Crea un issue en GitHub

---

**¡Listo!** 🎉 Tu plataforma de fact-checking estará corriendo 24/7 en Digital Ocean.
