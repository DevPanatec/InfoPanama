# 🏠 AUDITORÍA LANDING PAGE - InfoPanama
**Fecha:** 10 de diciembre, 2025

---

## ✅ COMPONENTES FUNCIONALES

### 1. Hero Section (`Hero.tsx`)
- ✅ **Funciona:** Sección principal con título y subtítulo
- ✅ **Diseño:** Gradiente azul profesional
- ✅ **Búsqueda:** Tiene input de búsqueda (revisar si funciona)

### 2. RecentClaims (`RecentClaims.tsx`)
- ✅ **Query funcional:** `api.claims.getPublished`
- ✅ **UI completa:** Cards con imagen, categoría, fecha, veredicto
- ✅ **Estados:** Loading, empty state, y lista
- ✅ **Animaciones:** Fade-in con delay progresivo
- ⚠️ **PROBLEMA:** **0 claims publicados** - Landing está VACÍO

### 3. Categories Sidebar
- ✅ **Query funcional:** `api.claims.getCategories`
- ✅ **Muestra categorías:** Con conteo de claims por categoría
- ✅ **Links funcionales:** Navega a `/verificaciones?category=X`
- ✅ **Colores:** 8 colores diferentes para categorías

### 4. Newsletter (`Newsletter.tsx`)
- ❓ **Estado:** No revisado aún
- ⚠️ **Probablemente:** Solo UI, sin backend

### 5. Footer (`Footer.tsx`)
- ✅ **Siempre presente:** Layout consistente
- ❓ **Links:** No verificados si funcionan

---

## ❌ COMPONENTES NO FUNCIONALES / DESHABILITADOS

### 1. Trending Topics
- ❌ **Comentado en código** (líneas 71-86 de `page.tsx`)
- ❌ Muestra: `undefined` (query no implementado)
- 🎯 **Para implementar:** Necesita query `api.topics.getTrending`

### 2. Recent Activity
- ❌ **Comentado en código** (líneas 121-138 de `page.tsx`)
- ❌ Muestra: `undefined` (query no implementado)
- 🎯 **Para implementar:** Necesita query `api.auditLogs.getRecent` o similar

### 3. StatsCards
- ❓ **Archivo existe** pero no se usa en landing
- ❓ Probablemente descontinuado

---

## 🔴 PROBLEMA CRÍTICO: LANDING VACÍO

### Estado Actual:
```
Claims publicados: 0
Claims totales: 152
Status de todos: "new"
```

### Por qué está vacío:
1. **Ningún claim ha sido verificado y aprobado**
2. Para que aparezca en landing necesita:
   - `status: "published"`
   - `isPublic: true`

### Workflow de Publicación:
```
Claim "new"
  → Verificar con IA
    → Status "review"
      → Editor aprueba
        → Status "published" + isPublic: true
          → ✅ Aparece en Landing
```

---

## 📊 ANÁLISIS DE QUERIES

### Queries Usadas en Landing:

#### 1. `api.claims.getPublished`
```typescript
// apps/web/src/components/home/RecentClaims.tsx:22
const claims = useQuery(api.claims.getPublished, { limit: 6 })
```
- ✅ **Funciona:** Query existe en `convex/claims.ts:57`
- ✅ **Filtro correcto:**
  - `status === 'published'`
  - `isPublic === true`
- ✅ **Orden:** Por `publishedAt` descendente
- ⚠️ **Resultado:** Array vacío (0 claims cumplen criterios)

#### 2. `api.claims.getCategories`
```typescript
// apps/web/src/app/page.tsx:28
const categories = useQuery(api.claims.getCategories, {})
```
- ✅ **Funciona:** Query existe en `convex/claims.ts:211`
- ✅ **Retorna:** Array de `{ name, count }`
- ✅ **Resultado:** Categorías correctas (infraestructura, política, etc.)

#### 3. Queries NO IMPLEMENTADAS:
- ❌ `api.topics.getTrending` - Para trending topics
- ❌ `api.auditLogs.getRecent` - Para actividad reciente

---

## 🎯 PÁGINAS RELACIONADAS

### `/verificaciones` (Lista completa)
- ❓ **Estado:** No revisado
- 📍 **Archivo:** `apps/web/src/app/verificaciones/page.tsx`
- 🎯 **Debe mostrar:** TODAS las verificaciones publicadas

### `/verificaciones/[id]` (Detalle)
- ❓ **Estado:** No revisado
- 📍 **Archivo:** `apps/web/src/app/verificaciones/[id]/page.tsx`
- 🎯 **Debe mostrar:** Veredicto completo, evidencia, análisis

### `/medios` (Medios de comunicación)
- ❓ **Estado:** No revisado
- 📍 **Archivo:** `apps/web/src/app/medios/page.tsx`

### `/actores` (Actores y KYA)
- ❓ **Estado:** No revisado
- 📍 **Archivo:** `apps/web/src/app/actores/page.tsx`

---

## 🔧 ACCIONES INMEDIATAS PARA ACTIVAR LANDING

### Opción 1: Publicar Claims Manualmente (RÁPIDO)
```sql
-- En Convex dashboard o con mutation
1. Seleccionar 5-10 claims de "new"
2. Cambiar status a "published"
3. Setear isPublic = true
4. Setear publishedAt = Date.now()
```

### Opción 2: Workflow Completo (CORRECTO)
```
1. ✅ Ir a /admin/dashboard/claims
2. ✅ Seleccionar un claim
3. ✅ "Verificar con IA"
4. ✅ Revisar veredicto
5. ✅ "Aprobar y Publicar"
6. ✅ Repetir para 5-10 claims
```

### Opción 3: Auto-publicar Claims de Prueba (DESARROLLO)
```typescript
// Crear mutation temporal para publicar batch
export const autoPublishTopClaims = mutation({
  handler: async (ctx) => {
    const claims = await ctx.db.query('claims')
      .filter(q => q.eq(q.field('status'), 'new'))
      .take(10)

    for (const claim of claims) {
      await ctx.db.patch(claim._id, {
        status: 'published',
        isPublic: true,
        publishedAt: Date.now()
      })
    }
  }
})
```

---

## 📝 CHECKLIST DE FUNCIONALIDAD

### Landing Page (/):
- [x] Hero section se muestra
- [x] RecentClaims query funciona
- [ ] RecentClaims muestra datos (VACÍO - 0 publicados)
- [x] Categories sidebar funciona
- [x] Newsletter form se muestra
- [ ] Newsletter form funciona (backend?)
- [x] Footer se muestra
- [x] Responsive design
- [ ] Trending topics (DESHABILITADO)
- [ ] Recent activity (DESHABILITADO)

### Verificaciones Page (/verificaciones):
- [ ] Lista todas las publicadas
- [ ] Filtro por categoría funciona
- [ ] Búsqueda funciona
- [ ] Paginación funciona

### Detalle de Verificación (/verificaciones/[id]):
- [ ] Muestra veredicto completo
- [ ] Muestra evidencia
- [ ] Muestra fuentes
- [ ] Muestra análisis de IA
- [ ] Permite comentarios (si está implementado)

### Otras Páginas Públicas:
- [ ] /medios - Funcional
- [ ] /medios/[slug] - Funcional
- [ ] /actores - Funcional
- [ ] /actores/[id] - Funcional
- [ ] /metodologia - Funcional
- [ ] /sobre-nosotros - Funcional

---

## 🚀 PRIORIDADES

### PRIORIDAD 1 (CRÍTICO): Poblar Landing
- [ ] Publicar 10 claims de prueba
- [ ] Verificar que aparecen en landing
- [ ] Verificar que links funcionan

### PRIORIDAD 2 (IMPORTANTE): Verificar Páginas
- [ ] Revisar `/verificaciones` completa
- [ ] Revisar `/verificaciones/[id]` detalle
- [ ] Asegurar que todo navega correctamente

### PRIORIDAD 3 (DESEABLE): Features Avanzadas
- [ ] Implementar Trending Topics
- [ ] Implementar Recent Activity
- [ ] Newsletter backend funcional

### PRIORIDAD 4 (FUTURO): Optimizaciones
- [ ] SEO metadata
- [ ] Open Graph tags
- [ ] Performance optimization
- [ ] Analytics

---

## 🐛 BUGS CONOCIDOS

### 1. Landing Vacío
- **Impacto:** CRÍTICO
- **Causa:** 0 claims con status "published"
- **Fix:** Publicar claims manualmente o con workflow

### 2. Trending Topics Deshabilitado
- **Impacto:** BAJO
- **Causa:** Query no implementado
- **Fix:** Implementar `api.topics.getTrending`

### 3. Recent Activity Deshabilitado
- **Impacto:** BAJO
- **Causa:** Query no implementado
- **Fix:** Implementar `api.auditLogs.getRecent`

---

## 💡 RECOMENDACIONES

### Inmediato (Hoy):
1. **Publicar 10 claims** para poblar el landing
2. **Verificar navegación** end-to-end
3. **Captura de pantalla** del landing funcionando

### Esta Semana:
1. **Workflow de moderación** simplificado
2. **Auto-verificación** de claims de medios confiables
3. **Trending topics** implementado

### Este Mes:
1. **Newsletter** backend con Resend
2. **Comentarios** de usuarios
3. **Sistema de reportes** para usuarios

---

## 📊 MÉTRICAS ACTUALES

```
Landing Page:
├─ Claims mostrados: 0 / 6 posibles
├─ Categorías activas: 7
├─ Trending topics: 0 (deshabilitado)
└─ Recent activity: 0 (deshabilitado)

Base de Datos:
├─ Claims totales: 152
├─ Claims publicados: 0
├─ Claims verificados: ~1 (testing)
└─ Claims sin procesar: 152

Páginas Públicas:
├─ Landing (/) - ✅ UI completa, ⚠️ sin datos
├─ /verificaciones - ❓ No revisado
├─ /verificaciones/[id] - ❓ No revisado
├─ /medios - ❓ No revisado
├─ /actores - ❓ No revisado
├─ /metodologia - ❓ No revisado
└─ /sobre-nosotros - ❓ No revisado
```

---

**SIGUIENTE PASO:** Publicar 5-10 claims de prueba para activar el landing page.
