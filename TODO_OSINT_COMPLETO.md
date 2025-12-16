# 🎯 TODO: Sistema OSINT Completo - InfoPanama

**Fecha:** 12 de Diciembre, 2025
**Objetivo:** Montar sistema OSINT completamente funcional con los 10 crawlers operativos

---

## 🔴 PRIORIDAD CRÍTICA (Hacer AHORA)

### 1. ✅ Verificar que los 10 Crawlers Funcionan
**Estado:** En proceso de verificación
**Crawlers:**
- [ ] La Prensa
- [ ] TVN
- [ ] Telemetro
- [ ] Panama América
- [ ] Crítica
- [ ] La Estrella
- [ ] Capital Financiero
- [ ] Metro Libre (nuevo)
- [ ] RPC Radio (nuevo)
- [ ] Gaceta Oficial

**Acción:**
```bash
cd packages/crawler
npm run crawl:all
# Verificar que cada crawler extrae artículos
```

**Resultado esperado:**
- Mínimo 5-10 artículos por crawler
- Sin errores fatales
- Claims extraídos con IA

---

### 2. ❌ Probar Sistema de Verificación con IA
**Estado:** NUNCA PROBADO
**Problema:** No sabemos si funciona end-to-end

**Acción:**
1. Ir a `http://localhost:3000/admin/dashboard/claims`
2. Seleccionar cualquier claim
3. Click en "Verificar con IA"
4. Verificar que:
   - Se genera veredicto
   - Se guarda en BD
   - Aparece en la página del claim

**Archivos involucrados:**
- `packages/convex/convex/verification.ts` - Action verifyClaim
- `apps/web/src/app/admin/dashboard/claims/[id]/review/page.tsx` - UI

**Si falla:** Revisar logs de Convex y consola del navegador

---

### 3. ❌ Publicar Claims al Homepage
**Estado:** 0 claims públicos
**Problema:** Landing page vacía, usuarios no ven contenido

**Acción:**
1. Verificar 5-10 claims con IA
2. Revisar manualmente que veredictos sean correctos
3. En dashboard, cambiar:
   - `status` → `"published"`
   - `isPublic` → `true`
4. Verificar que aparecen en `http://localhost:3000`

**SQL de ejemplo (via dashboard):**
```typescript
// En la UI del claim, botón "Publicar"
await ctx.db.patch(claimId, {
  status: "published",
  isPublic: true,
  publishedAt: Date.now()
})
```

---

### 4. ❌ Verificar Grafos de Relaciones
**Estado:** Desconocido si funcionan

**Acción:**
1. Ir a `http://localhost:3000/verificaciones/[cualquier-id]`
2. Verificar que se muestra:
   - Grafo de entidades relacionadas
   - Conexiones entre actores
   - Fuentes citadas
3. Si no funciona, revisar:
   - `apps/web/src/components/graph/MediaGraph.tsx`
   - Queries de entidades en Convex

---

### 5. ⚠️ Limpiar Entidades Huérfanas
**Estado:** 38 de 182 entidades sin conexión (20.9%)

**Acción:**
```bash
cd packages/crawler
# Opción A: Conectarlas automáticamente
npm run crawl:orphans

# Opción B: Eliminarlas
# Crear script para borrar entidades sin claims asociados
```

---

## 🟡 PRIORIDAD ALTA (Esta Semana)

### 6. ❌ Automatizar Crawlers con GitHub Actions
**Estado:** Crawlers solo se ejecutan manualmente

**Acción:**
1. Crear `.github/workflows/crawler-schedule.yml`
2. Configurar cron: cada 6 horas
3. Guardar secrets:
   - `CONVEX_URL`
   - `OPENAI_API_KEY`
   - `BROWSERBASE_API_KEY` (opcional)

**Archivo:**
```yaml
name: Crawler Automático
on:
  schedule:
    - cron: '0 */6 * * *'  # Cada 6 horas
  workflow_dispatch:

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run crawl:all
        env:
          CONVEX_URL: ${{ secrets.CONVEX_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

### 7. ❌ Implementar Sistema de Snapshots
**Estado:** No se guardan copias de páginas originales
**Riesgo:** Si el medio borra el artículo, se pierde evidencia

**Opciones:**

#### Opción A: Digital Ocean Spaces + Playwright Screenshots
**Costo:** ~$5/mes (250 GB)

**Acción:**
1. Crear bucket en Digital Ocean Spaces
2. Modificar crawlers para tomar screenshot:
```typescript
const screenshot = await page.screenshot({ fullPage: true })
await uploadToSpaces(screenshot, `${articleId}.png`)
```
3. Guardar URL en BD:
```typescript
await createArticle({
  ...
  snapshotUrl: `https://spaces.digitalocean.com/infopanama/${articleId}.png`
})
```

#### Opción B: Archive.org (gratis)
```typescript
const archiveUrl = `https://web.archive.org/save/${articleUrl}`
await fetch(archiveUrl)
```

---

### 8. ❌ Botones Rápidos de Moderación
**Estado:** Todo requiere edición manual

**Acción:**
Agregar botones en `apps/web/src/app/admin/dashboard/claims/page.tsx`:

```tsx
<div className="flex gap-2">
  <Button onClick={() => publishClaim(claim._id)}>
    ✅ Publicar
  </Button>
  <Button onClick={() => rejectClaim(claim._id)}>
    ❌ Rechazar
  </Button>
  <Button onClick={() => verifyClaim(claim._id)}>
    🤖 Verificar con IA
  </Button>
</div>
```

**Mutations necesarias:**
```typescript
// packages/convex/convex/claims.ts
export const publish = mutation({
  args: { claimId: v.id("claims") },
  handler: async (ctx, { claimId }) => {
    await ctx.db.patch(claimId, {
      status: "published",
      isPublic: true,
      publishedAt: Date.now()
    })
  }
})

export const reject = mutation({
  args: { claimId: v.id("claims") },
  handler: async (ctx, { claimId }) => {
    await ctx.db.patch(claimId, {
      status: "rejected"
    })
  }
})
```

---

### 9. ❌ Dashboard de Estadísticas
**Estado:** No hay vista general del sistema

**Acción:**
Mejorar `apps/web/src/app/admin/dashboard/page.tsx`:

```tsx
<div className="grid grid-cols-4 gap-4">
  <StatCard
    title="Claims Totales"
    value={stats.totalClaims}
    icon="📊"
  />
  <StatCard
    title="Verificados Hoy"
    value={stats.verifiedToday}
    icon="✅"
  />
  <StatCard
    title="Pendientes"
    value={stats.pending}
    icon="⏳"
  />
  <StatCard
    title="Publicados"
    value={stats.published}
    icon="🌐"
  />
</div>

<RecentActivity claims={recentClaims} />
<CrawlerStatus crawlers={crawlerStats} />
```

---

## 🟢 PRIORIDAD MEDIA (Próximas 2 Semanas)

### 10. ⚠️ Sistema de Actores/KYA (Know Your Actor)
**Estado:** Tabla `actors` vacía

**Objetivo:** Perfilar actores recurrentes (políticos, empresarios, trolls)

**Acción:**
1. Crear interfaz en `/admin/dashboard/actores`
2. Permitir:
   - Crear perfil de actor manualmente
   - Ver historial de claims del actor
   - Asignar score de credibilidad
   - Marcar como "troll", "bot", "político", etc.

**Schema:**
```typescript
actors: defineTable({
  name: v.string(),
  slug: v.string(),
  type: v.union(
    v.literal("politician"),
    v.literal("journalist"),
    v.literal("businessperson"),
    v.literal("troll"),
    v.literal("bot")
  ),
  credibilityScore: v.number(), // 0-100
  bio: v.optional(v.string()),
  photoUrl: v.optional(v.string()),
  socialMedia: v.optional(v.object({
    twitter: v.optional(v.string()),
    instagram: v.optional(v.string()),
    facebook: v.optional(v.string())
  }))
})
```

---

### 11. ⚠️ Detección Automática de Responsables
**Estado:** Tabla `probableResponsibles` vacía

**Objetivo:** IA que identifica quién difunde desinformación

**Acción:**
Usar GPT para analizar patrones:
```typescript
const analysis = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "Analiza estos 10 claims verificados como FALSO. ¿Hay un patrón de actores responsables?"
  }, {
    role: "user",
    content: JSON.stringify(falseClaims)
  }]
})
```

---

### 12. ⚠️ Búsqueda Semántica con Embeddings
**Estado:** Campo `hasEmbedding` siempre false

**Objetivo:** Buscar claims similares por significado, no solo palabras

**Acción:**
1. Generar embeddings con OpenAI:
```typescript
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: claim.claimText
})
```
2. Guardar en Qdrant o Pinecone
3. Implementar búsqueda:
```typescript
const similar = await qdrant.search({
  collection: "claims",
  vector: queryEmbedding,
  limit: 10
})
```

---

### 13. ❌ Sistema de Suscripciones
**Estado:** Tabla `subscriptions` vacía

**Objetivo:** Usuarios siguen temas o actores

**Acción:**
1. UI para suscribirse:
```tsx
<Button onClick={() => subscribe("topic", "política")}>
  🔔 Seguir tema "Política"
</Button>
```
2. Email notifications con Resend:
```typescript
await resend.emails.send({
  to: user.email,
  subject: "Nueva verificación: Política",
  html: `<p>Se publicó: ${claim.title}</p>`
})
```

---

### 14. ❌ Comentarios de Usuarios
**Estado:** Tabla `comments` vacía

**Objetivo:** Engagement público y crowdsourcing

**Acción:**
Agregar sección de comentarios en `/verificaciones/[id]`:
```tsx
<CommentsSection claimId={claim._id} />
```

**Moderación:**
- Auto-aprobar usuarios verificados
- Requiere aprobación para nuevos usuarios
- Detección de spam con Akismet

---

## 🔵 PRIORIDAD BAJA (Mes 2-3)

### 15. ⚠️ Análisis de Sentimiento
**Estado:** Campo `sentiment` nunca poblado

**Acción:**
```typescript
import { pipeline } from '@xenova/transformers'
const classifier = await pipeline('sentiment-analysis')
const result = await classifier(claim.claimText)
// result: { label: 'POSITIVE', score: 0.95 }
```

---

### 16. ⚠️ Grafo de Relaciones Visualizado
**Estado:** Datos existen pero visualización limitada

**Acción:**
Mejorar con D3.js force-directed graph:
```tsx
import ForceGraph2D from 'react-force-graph-2d'

<ForceGraph2D
  graphData={{
    nodes: entities,
    links: relations
  }}
  nodeLabel="name"
  linkLabel="type"
/>
```

---

### 17. ❌ Audit Logs Inmutables
**Estado:** Tabla `auditLogs` vacía

**Objetivo:** Trazabilidad para compliance

**Acción:**
Log cada acción administrativa:
```typescript
await ctx.db.insert("auditLogs", {
  userId: user._id,
  action: "publish_claim",
  resourceType: "claim",
  resourceId: claimId,
  timestamp: Date.now(),
  metadata: { oldStatus: "new", newStatus: "published" }
})
```

---

### 18. ❌ API Pública
**Estado:** No existe

**Objetivo:** Desarrolladores externos pueden consultar verificaciones

**Acción:**
```typescript
// /api/v1/claims
GET /api/v1/claims?status=published&limit=20
GET /api/v1/claims/:id
GET /api/v1/actors/:slug
GET /api/v1/stats

// Autenticación con API Key
Authorization: Bearer sk_live_xxx
```

---

## 📊 MÉTRICAS DE ÉXITO

### Semana 1 (Ahora)
- [ ] 10 crawlers funcionando
- [ ] 50+ claims verificados con IA
- [ ] 20+ claims publicados en homepage
- [ ] Sistema de verificación probado end-to-end
- [ ] Grafos funcionando

### Semana 2
- [ ] 200+ claims totales
- [ ] 100+ claims publicados
- [ ] Crawler automático con GitHub Actions
- [ ] Snapshots funcionando
- [ ] Dashboard con estadísticas

### Mes 1
- [ ] 500+ claims totales
- [ ] 50+ actores perfilados
- [ ] Búsqueda semántica funcionando
- [ ] Sistema de suscripciones
- [ ] 1000+ usuarios únicos

---

## 🚀 QUICK WINS (Impacto Alto, Esfuerzo Bajo)

### Ahora Mismo (30 min cada uno)
1. ✅ Ejecutar `npm run crawl:all` y verificar
2. ✅ Publicar 20 claims manualmente al homepage
3. ✅ Agregar botones de moderación rápida
4. ✅ Crear dashboard de estadísticas básico

### Hoy (2-3 horas cada uno)
5. ✅ Configurar GitHub Actions para crawlers
6. ✅ Implementar snapshots con Archive.org (gratis)
7. ✅ Probar sistema de verificación end-to-end
8. ✅ Limpiar entidades huérfanas

### Esta Semana
9. ✅ Sistema de actores básico
10. ✅ Embeddings + búsqueda semántica
11. ✅ Comentarios de usuarios
12. ✅ Suscripciones por email

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

```bash
# 1. Verificar crawlers (15 min)
cd packages/crawler
npm run crawl:all

# 2. Iniciar web app (1 min)
cd apps/web
npm run dev

# 3. Probar verificación con IA (10 min)
# → Abrir http://localhost:3000/admin/dashboard/claims
# → Seleccionar claim
# → Click "Verificar con IA"
# → Confirmar que funciona

# 4. Publicar primeros claims (20 min)
# → Revisar veredictos
# → Cambiar status a "published"
# → Verificar en homepage

# 5. Commit y push (5 min)
git add .
git commit -m "feat: sistema OSINT completo con 10 crawlers funcionando"
git push
```

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Crawlers probados localmente
- [ ] Verificación con IA funcionando
- [ ] Claims publicados en homepage
- [ ] Grafos de entidades funcionando
- [ ] GitHub Actions configurado
- [ ] Secrets configurados en GitHub
- [ ] Convex en producción
- [ ] DNS configurado
- [ ] SSL/HTTPS funcionando
- [ ] Analytics agregado (Plausible/Umami)
- [ ] Monitoring con Sentry
- [ ] Backups automáticos de BD

---

## 🆘 SOPORTE

**Si algo falla:**
1. Revisar logs de Convex: https://dashboard.convex.dev
2. Revisar consola del navegador (F12)
3. Revisar logs de crawler en terminal
4. Contactar a Claude Code con el error exacto

**Documentación:**
- Convex: https://docs.convex.dev
- Next.js: https://nextjs.org/docs
- Playwright: https://playwright.dev

---

**Última actualización:** 12 de Diciembre, 2025
**Progreso:** 30% completado (base técnica lista, falta contenido y automatización)
