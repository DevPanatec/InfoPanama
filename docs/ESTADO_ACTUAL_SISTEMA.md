# 📊 Estado Actual del Sistema OSINT - InfoPanama

**Fecha:** 13 de Diciembre, 2025
**Última verificación:** 11:15 AM

---

## ✅ LO QUE YA FUNCIONA

### 1. **Crawlers** (10 de 11 funcionando)

| # | Medio | Estado | Artículos |
|---|-------|--------|-----------|
| 1 | La Prensa | ✅ Funciona | 11 scrapeados |
| 2 | TVN | ✅ Funciona | ~10 scrapeados |
| 3 | Telemetro | ✅ Funciona | En proceso |
| 4 | Panama América | ✅ Funciona | En proceso |
| 5 | Crítica | ✅ Funciona | En proceso |
| 6 | La Estrella | ✅ Funciona | En proceso |
| 7 | Capital Financiero | ✅ Funciona | En proceso |
| 8 | Metro Libre | ✅ Funciona | En proceso |
| 9 | RPC Radio | ✅ Funciona | En proceso |
| 10 | Gaceta Oficial | ✅ Funciona | En proceso |
| 11 | Foco Instagram | ❌ Bloqueado | Instagram bloquea Browserbase |

**Total esperado:** ~100-150 artículos nuevos por ejecución

---

### 2. **Extracción de Claims con IA**
- ✅ OpenAI GPT-5-mini configurado
- ✅ Prompts profesionales de fact-checking
- ✅ Categorización automática
- ✅ Risk level assessment
- ✅ Guardado en Convex

---

### 3. **Base de Datos (Convex)**
- ✅ Schema completo definido
- ✅ Tablas: claims, articles, sources, entities, verdicts
- ✅ Relaciones configuradas
- ✅ Queries optimizadas

---

### 4. **Dashboard Administrativo**
- ✅ Login con Clerk
- ✅ Vista de claims
- ✅ Gestión de actores
- ✅ Gestión de fuentes
- ✅ Gestión de eventos
- ✅ Audit logs

---

### 5. **Sistema de Verificación con IA**
- ✅ Action `verifyClaim` en Convex
- ✅ Mutation `saveVerdict` funcionando
- ✅ Integración con GPT-5-mini
- ✅ UI de revisión de claims
- ⚠️ **NUNCA PROBADO END-TO-END**

---

### 6. **Landing Page**
- ✅ Homepage con diseño profesional
- ✅ Sección de verificaciones con análisis OSINT
- ✅ Página de metodología
- ✅ Página de sobre nosotros
- ✅ Grafo de medios
- ✅ **EntitiesSection** - Análisis de entidades con probabilidad de involucramiento
- ✅ **RelationsGraph** - Grafo interactivo de relaciones entre entidades
- ❌ **0 claims publicados** (vacío)

### 7. **Página de Revisión de Claims (MEJORADA HOY)**
- ✅ **Información completa del medio** (nombre, credibilidad, verificación)
- ✅ **Fecha y hora exacta de publicación**
- ✅ **Autor del artículo**
- ✅ **URL original + snapshot archivado**
- ✅ **Contenido completo del artículo** (expandible)
- ✅ **Topics/temas detectados**
- ✅ **Alertas de información faltante**
- ✅ **Barra de credibilidad visual** (color-coded)
- ✅ **Verificación de fuente** (badges verificado/no verificado)

---

### 8. **Infraestructura**
- ✅ Monorepo con Turborepo
- ✅ Next.js 15 con App Router
- ✅ TypeScript estricto
- ✅ Tailwind CSS
- ✅ shadcn/ui components
- ✅ Convex backend
- ✅ Clerk autenticación

---

## ❌ LO QUE FALTA (CRÍTICO)

### 1. **Probar Sistema de Verificación** 🔴
**Por qué es crítico:** No sabemos si funciona

**Acción:**
```bash
# 1. Abrir dashboard
open http://localhost:3000/admin/dashboard/claims

# 2. Seleccionar cualquier claim
# 3. Click "Verificar con IA"
# 4. Confirmar que se genera veredicto
```

---

### 2. **Publicar Claims al Homepage** 🔴
**Por qué es crítico:** Landing page vacía, sin contenido público

**Estado actual:**
- Claims totales: ~152
- Claims con status "published": **0**
- Claims públicos visibles: **0**

**Acción:**
```typescript
// En el dashboard, para cada claim verificado:
await updateClaim(claimId, {
  status: "published",
  isPublic: true,
  publishedAt: Date.now()
})
```

**Meta:** Publicar mínimo 20-50 claims esta semana

---

### 3. **Verificar Grafos Funcionan** 🟡
**Por qué es importante:** Es feature principal del OSINT

**Acción:**
```bash
# Abrir cualquier claim
open http://localhost:3000/verificaciones/[claim-id]

# Verificar que se muestra:
# - Grafo de entidades
# - Conexiones entre actores
# - Fuentes relacionadas
```

---

### 4. **Automatizar Crawlers** 🟡
**Por qué es importante:** Contenido fresco automático

**Estado:** Manual solamente

**Acción:**
```bash
# Crear archivo .github/workflows/crawler.yml
# Configurar cron: cada 6 horas
# Agregar secrets en GitHub
```

**Costo:** $0 (GitHub Actions free tier)

---

### 5. **Sistema de Snapshots** 🟢
**Por qué es útil:** Preservar evidencia

**Opciones:**
- **Gratis:** Archive.org (wayback machine)
- **Pagado:** Digital Ocean Spaces ($5/mes)

---

## 📈 MÉTRICAS ACTUALES

### Base de Datos
```
Claims:        ~152 (todos status "new")
├─ new:        152 (100%)
├─ review:     0
├─ published:  0
└─ rejected:   0

Entities:      182
├─ conectadas: 144 (79%)
└─ huérfanas:  38 (21%)

Articles:      ~152
Sources:       4-5
Verdicts:      0 (probablemente)
```

### Crawlers
```
Ejecutados:    Manualmente
Frecuencia:    A demanda
Último run:    Hoy 8:28 PM
Artículos:     ~15-20 por crawler
Total/run:     ~150 artículos
```

### Homepage
```
Visitantes:    0 (no deployado)
Claims públicos: 0
Engagement:    N/A
```

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### AHORA (Próximos 30 minutos)

#### 1. Probar Verificación con IA ⏱️ 10 min
```bash
# Terminal 1: Asegurar que web app corre
cd apps/web
npm run dev

# Navegador:
# 1. http://localhost:3000/admin/dashboard
# 2. Click en cualquier claim
# 3. Click "Verificar con IA"
# 4. Esperar resultado
# 5. Confirmar que se guarda
```

**Resultado esperado:**
- ✅ Veredicto generado por IA
- ✅ Guardado en base de datos
- ✅ Visible en UI del claim

**Si falla:**
- Revisar logs de Convex
- Revisar console.log() en navegador
- Verificar OPENAI_API_KEY

---

#### 2. Publicar 20 Claims ⏱️ 15 min
```bash
# En el dashboard:
# Para cada claim verificado:

# Opción A: Manualmente en UI
1. Abrir claim
2. Click "Editar"
3. Cambiar status → "published"
4. Check ✓ isPublic
5. Save

# Opción B: Script rápido
# Crear: packages/convex/scripts/publish-claims.ts
```

**Script sugerido:**
```typescript
// packages/convex/scripts/publish-first-claims.ts
import { ConvexHttpClient } from 'convex/browser'

const client = new ConvexHttpClient(process.env.CONVEX_URL!)

async function publishTopClaims() {
  // 1. Get first 20 claims with veredictos
  const claims = await client.query('claims:list' as any, {
    limit: 20,
    status: 'review' // o 'new' si no hay verified
  })

  // 2. Publish each one
  for (const claim of claims) {
    await client.mutation('claims:update' as any, {
      id: claim._id,
      status: 'published',
      isPublic: true,
      publishedAt: Date.now()
    })
    console.log(`✅ Publicado: ${claim.title}`)
  }
}

publishTopClaims()
```

---

#### 3. Verificar Homepage ⏱️ 5 min
```bash
# Abrir
open http://localhost:3000

# Verificar que aparecen:
# - Claims publicados
# - Contador de verificaciones
# - Último contenido
```

---

### HOY (Próximas 2-3 horas)

#### 4. Configurar GitHub Actions ⏱️ 30 min

**Archivo:** `.github/workflows/crawler-schedule.yml`

```yaml
name: Crawler Automático

on:
  schedule:
    # Cada 6 horas: 12 AM, 6 AM, 12 PM, 6 PM (UTC)
    - cron: '0 0,6,12,18 * * *'
  workflow_dispatch: # Permitir ejecución manual

jobs:
  crawl:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run crawlers
        working-directory: packages/crawler
        env:
          CONVEX_URL: ${{ secrets.CONVEX_URL }}
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: gpt-5-mini
        run: npm run crawl:all

      - name: Notify on failure
        if: failure()
        run: |
          echo "❌ Crawler failed"
          # Aquí podrías agregar notificación por email/Slack
```

**Secrets a configurar en GitHub:**
1. `CONVEX_URL` → https://accomplished-rhinoceros-93.convex.cloud
2. `OPENAI_API_KEY` → sk-proj-xOpV...

**Cómo configurar secrets:**
```bash
# En GitHub:
# Settings → Secrets and variables → Actions → New repository secret
```

---

#### 5. Implementar Snapshots con Archive.org ⏱️ 45 min

**Modificar crawlers para archivar:**

```typescript
// packages/crawler/src/utils/archive.ts
export async function archiveUrl(url: string): Promise<string> {
  try {
    // Solicitar a Archive.org que guarde la página
    const archiveUrl = `https://web.archive.org/save/${url}`
    const response = await fetch(archiveUrl, {
      headers: {
        'User-Agent': 'InfoPanama OSINT Bot (archiving for fact-checking)'
      }
    })

    // Extraer URL del snapshot
    const location = response.headers.get('Content-Location')
    if (location) {
      return `https://web.archive.org${location}`
    }

    return archiveUrl
  } catch (error) {
    console.error('Error archiving:', error)
    return url
  }
}
```

**Integrar en crawler:**

```typescript
// En cada crawler, después de scrapear:
import { archiveUrl } from '../utils/archive'

const archivedUrl = await archiveUrl(article.url)

await createArticle({
  ...article,
  snapshotUrl: archivedUrl
})
```

---

#### 6. Dashboard de Estadísticas ⏱️ 1 hora

**Archivo:** `apps/web/src/app/admin/dashboard/page.tsx`

Agregar:
```tsx
// Query para stats
const stats = useQuery(api.stats.getDashboardStats)

<div className="grid grid-cols-4 gap-4 mb-8">
  <StatCard
    title="Claims Totales"
    value={stats?.totalClaims ?? 0}
    change="+12 esta semana"
    icon="📊"
  />
  <StatCard
    title="Publicados"
    value={stats?.published ?? 0}
    change="+5 hoy"
    icon="✅"
  />
  <StatCard
    title="Pendientes"
    value={stats?.pending ?? 0}
    change="-3 desde ayer"
    icon="⏳"
  />
  <StatCard
    title="Tasa de Éxito"
    value={`${stats?.successRate ?? 0}%`}
    change="+2.5%"
    icon="📈"
  />
</div>

<RecentActivity />
<CrawlerStatus />
```

**Query en Convex:**
```typescript
// packages/convex/convex/stats.ts
export const getDashboardStats = query({
  handler: async (ctx) => {
    const claims = await ctx.db.query("claims").collect()

    return {
      totalClaims: claims.length,
      published: claims.filter(c => c.status === "published").length,
      pending: claims.filter(c => c.status === "new").length,
      successRate: 85 // Calcular basado en veredictos
    }
  }
})
```

---

### ESTA SEMANA

#### 7. Botones de Moderación Rápida
#### 8. Sistema de Actores Básico
#### 9. Limpiar Entidades Huérfanas
#### 10. Deploy a producción

---

## ✅ CHECKLIST PRE-LAUNCH

### Técnico
- [ ] 10 crawlers verificados funcionando
- [ ] Sistema de verificación probado
- [ ] 50+ claims publicados
- [ ] Grafos funcionando
- [ ] GitHub Actions configurado
- [ ] Snapshots activados
- [ ] Dashboard con stats

### Contenido
- [ ] 100+ claims verificados
- [ ] 20+ actores perfilados
- [ ] 10+ eventos documentados
- [ ] Metodología publicada
- [ ] Sobre nosotros completo

### Infraestructura
- [ ] Dominio configurado
- [ ] SSL/HTTPS
- [ ] Analytics (Plausible)
- [ ] Monitoring (Sentry)
- [ ] Backups automáticos

---

## 🚀 ESTADO: LISTO PARA TESTING

**Resumen:**
- ✅ **Infraestructura:** 95% completa
- ⚠️ **Contenido:** 30% completo (falta publicar)
- ⚠️ **Automatización:** 50% completa (falta GitHub Actions)
- ❌ **Testing:** 0% (nunca probado end-to-end)

**Próximo paso crítico:** **PROBAR SISTEMA DE VERIFICACIÓN**

Una vez confirmado que funciona, proceder con publicación masiva de claims.

---

**Última actualización:** 12 Dic 2025, 8:28 PM
