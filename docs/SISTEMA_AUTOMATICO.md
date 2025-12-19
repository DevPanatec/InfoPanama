# 🤖 Sistema Automático de Análisis OSINT

## Resumen

Se ha configurado un sistema automático que analiza artículos de noticias cada 12 horas usando IA para generar grafos OSINT de relaciones entre entidades (personas, organizaciones, medios).

---

## 🔄 Cómo Funciona

### 1. **Cron Job Programado** (cada 12 horas)
Archivo: `packages/convex/convex/crons.ts`

```typescript
crons.interval(
  'analyze-graph-relations',
  { hours: 12 },
  internal.crawlers.autoAnalyzeGraphRelations
)
```

### 2. **Análisis Automático**
Archivo: `packages/convex/convex/crawlers.ts:61-116`

**Proceso:**
1. Obtiene artículos nuevos (máximo 20 por ejecución)
2. Analiza cada artículo con OpenAI GPT-4o-mini
3. Extrae entidades (personas, organizaciones, medios)
4. Identifica relaciones entre entidades
5. Genera co-menciones automáticas
6. Guarda todo en Convex

### 3. **Query de Artículos No Analizados**
Archivo: `packages/convex/convex/articles.ts:401-431`

Identifica artículos que no tienen entidades asociadas (= no han sido analizados).

---

## ⚙️ Configuración Actual

| Setting | Valor | Descripción |
|---------|-------|-------------|
| **Frecuencia** | Cada 12 horas | Análisis automático |
| **Artículos por ejecución** | 20 | Límite para no gastar mucho en API |
| **Modelo IA** | gpt-4o-mini | Configurado en `.env.local` |
| **Temperature** | 0.3 | Para respuestas consistentes |
| **Max Tokens** | 2000 | Por artículo |

---

## 📊 Lo Que Hace Automáticamente

### ✅ Análisis con IA
- Identifica personas mencionadas
- Identifica organizaciones
- Identifica medios de comunicación
- Extrae relaciones entre entidades
- Calcula strength (fuerza de la relación 0-100)
- Calcula confidence (confianza 0-100)
- Determina sentiment (-100 a +100)

### ✅ Co-Menciones
- Conecta entidades que aparecen en el mismo artículo
- Incrementa strength con múltiples menciones
- Crea evidencia con links a artículos

---

## 🚧 Lo Que FALTA (Estado Actual)

### ❌ Crawlers de Medios Panameños
**Estado:** Cron job configurado pero crawler externo no implementado

**Archivo:** `packages/convex/convex/crawlers.ts:17-39`

**Lo que hace ahora:**
```typescript
// Solo registra el evento, no crawlea nada
console.log('📅 Crawl ejecutado:', timestamp)
```

**Lo que DEBERÍA hacer:**
1. Llamar a servicio externo (Railway, Render, etc.)
2. Crawler ejecuta con Playwright
3. Extrae noticias de medios panameños
4. Envía resultados de vuelta a Convex
5. Convex guarda artículos y dispara análisis

**Medios Sugeridos para Crawlear:**
- La Prensa (prensa.com)
- Panamá América (panamaamerica.com.pa)
- Telemetro (telemetro.com)
- TVN Noticias (tvn-2.com)
- Capital Financiero (capital.com.pa)
- La Estrella de Panamá (laestrella.com.pa)

### ❌ Auto-Verificación de Claims
**Estado:** Deshabilitado por dependencias circulares

**Archivo:** `packages/convex/convex/crons.ts:20-25`

```typescript
// TODO: Re-enable after fixing circular dependency
// crons.interval(
//   'auto-verify-claims',
//   { hours: 1 },
//   internal.crawlers.autoVerifyPendingClaims
// )
```

---

## 🎯 Próximos Pasos

### 1. Implementar Crawler Externo
**Opciones:**
- **Railway/Render:** Deploy del crawler como servicio separado
- **GitHub Actions:** Ejecutar crawler programado
- **Vercel Cron:** Usar cron jobs de Vercel
- **AWS Lambda:** Ejecutar serverless

**Archivo a deployar:** `packages/crawler/`

### 2. Configurar Webhook
El crawler debe enviar resultados a:
```
POST https://accomplished-rhinoceros-93.convex.site/receive-articles
```

### 3. Activar Sistema
Una vez el crawler esté corriendo:
1. Los artículos llegarán automáticamente a Convex
2. Cada 12 horas se analizarán con IA
3. Los grafos OSINT se generarán automáticamente
4. Las entidades y relaciones estarán en el dashboard

---

## 🧪 Testing Manual

### Probar Análisis IA (Manual)
1. Ve a `/admin/dashboard/media-graph`
2. Click en "Analizar con IA" (si hay artículos)
3. Click en "Generar Co-menciones"
4. Revisa el grafo actualizado

### Ver Logs del Cron
Desde Convex Dashboard:
1. Ve a Logs
2. Filtra por `[CRON]`
3. Verás:
   - `🤖 [CRON] Iniciando análisis automático...`
   - `📊 Analizando X artículos...`
   - `✅ Análisis completado`

---

## 📝 Archivos Modificados

1. **crons.ts** - Agregado cron job de análisis cada 12h
2. **crawlers.ts** - Agregada función `autoAnalyzeGraphRelations`
3. **articles.ts** - Agregada query `getUnanalyzed`
4. **graphAnalysis.ts** - Ya existía, solo se arreglaron tipos

---

## 💰 Costos Estimados

Con **20 artículos cada 12 horas**:
- **Ejecuciones por día:** 2
- **Artículos por día:** 40
- **Tokens promedio por artículo:** ~1500 tokens
- **Costo por 1M tokens (GPT-4o-mini):** $0.15
- **Costo diario estimado:** ~$0.009 USD
- **Costo mensual:** ~$0.27 USD

**Muy económico** ✅

---

## 🔐 Seguridad

- ✅ API key protegida en `.env.local`
- ✅ Funciones internas (solo cron puede llamarlas)
- ✅ Rate limiting implícito (20 artículos/ejecución)
- ⚠️ Falta: Alertas si el costo excede límite

---

## 📈 Monitoreo

### Métricas a Vigilar:
- Artículos analizados por día
- Entidades creadas
- Relaciones generadas
- Errores de OpenAI
- Costo de API

### Convex Dashboard:
- Logs tab → Filtrar por `[CRON]`
- Functions tab → Ver ejecuciones de `autoAnalyzeGraphRelations`

---

## ✅ Estado Final

| Feature | Estado |
|---------|--------|
| Cron job configurado | ✅ Listo |
| Análisis IA | ✅ Funcional |
| Co-menciones | ✅ Funcional |
| Query artículos no analizados | ✅ Lista |
| Crawler medios panameños | ❌ Pendiente |
| Auto-verificación claims | ❌ Deshabilitado |

---

**Fecha:** 2 Diciembre 2024
**Sistema:** Funcional pero requiere crawler externo para automatización completa
