# 📸 Reporte: Instagram Scraping con Browserbase

**Fecha:** 12 de Diciembre, 2025
**Estado:** 🔴 BLOQUEADO POR INSTAGRAM

---

## 🎯 Objetivo

Scrapear posts de Instagram (@focopanama) usando Browserbase para evitar detección de bots.

## ✅ Lo que Funciona

### Browserbase Configuración
- ✅ Plan Hobby activado ($20/mes)
- ✅ API Key configurada correctamente
- ✅ Project ID configurado
- ✅ Conexión WebSocket funcional
- ✅ Navegación a sitios normales (Google, Example.com) funciona perfectamente

### Evidencia de Funcionamiento
```bash
# Test exitoso con example.com
npx tsx diagnose-browserbase.ts
# ✅ Conexión establecida
# ✅ Navegación a https://example.com exitosa
# ✅ Título obtenido: "Example Domain"
```

## 🔴 El Problema

### Error Consistente con Instagram
```
❌ page.goto: net::ERR_TUNNEL_CONNECTION_FAILED at https://www.instagram.com/focopanama/
```

### Patrón del Error
1. ✅ Conexión a Browserbase: **EXITOSA**
2. ✅ Sesión creada: **EXITOSA**
3. ✅ Página abierta: **EXITOSA**
4. ❌ `page.goto('https://www.instagram.com/...')`: **FALLA**

### Diagnóstico
El error `ERR_TUNNEL_CONNECTION_FAILED` ocurre **específicamente** cuando intentamos navegar a Instagram, pero NO con otros sitios.

## 🔍 Causa Raíz

**Instagram está bloqueando las IPs de Browserbase.**

### ¿Por qué?

1. **IPs conocidas:** Browserbase usa infraestructura de AWS que Instagram probablemente ya identificó
2. **Detección agresiva:** Instagram tiene uno de los anti-bot más sofisticados del mundo
3. **Plan Hobby limitado:** El plan básico puede tener IPs compartidas y quemadas
4. **Volumen de tráfico:** Browserbase es un servicio popular, Instagram detecta patrones

## 📊 Limitaciones del Plan Hobby

- ✅ 100 horas/mes de uso
- ❌ **1 sesión concurrente solamente**
- ❌ IPs compartidas (no residenciales)
- ❌ Rotación de IPs limitada
- ❌ Sin garantías para sitios anti-scraping

## 🛠️ Soluciones Intentadas

### 1. Cambio de `waitUntil`
- Cambio de `networkidle` → `domcontentloaded`
- **Resultado:** Mismo error

### 2. Delay antes de navegación
- Agregado `setTimeout(2000)` antes de `page.goto()`
- **Resultado:** Mismo error

### 3. Warming session (visitar Google primero)
- Navegación a Google antes de Instagram
- **Resultado:** Pendiente (en prueba)

### 4. Uso de API REST
- Crear sesión via POST `/v1/sessions`
- Conectar via CDP a `session.connectUrl`
- **Resultado:** Mismo error

## 💡 Alternativas

### Opción 1: **Upgrade de Plan Browserbase** 🔄 Moderado

**Plan Professional ($250/mes)**
- 10 sesiones concurrentes
- IPs residenciales rotativas
- Mayor probabilidad de éxito con Instagram
- Soporte prioritario

**Pros:**
- ✅ Más control sobre IPs
- ✅ Mejor anti-detección
- ✅ Puede funcionar con Instagram

**Contras:**
- ❌ Costo 12.5x más alto
- ⚠️ Sin garantía de éxito (Instagram muy agresivo)

---

### Opción 2: **Apify Instagram Scraper** ⭐ RECOMENDADO

**Servicio:** https://apify.com/apify/instagram-scraper

**Ventajas:**
- ✅ Especializado en Instagram
- ✅ Mantenimiento automático cuando Instagram cambia
- ✅ APIs estables
- ✅ $49/mes plan básico (más barato que Professional)
- ✅ Incluye manejo de login, captchas, rate limiting

**Desventajas:**
- ❌ Dependencia de tercero
- ❌ Límites de requests según plan

**Implementación:**
```typescript
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
})

const run = await client.actor('apify/instagram-scraper').call({
  directUrls: ['https://www.instagram.com/focopanama/'],
  resultsType: 'posts',
  resultsLimit: 20
})

const { items } = await client.dataset(run.defaultDatasetId).listItems()
```

---

### Opción 3: **Bright Data (ex-Luminati)** 💰 Premium

**Servicio:** https://brightdata.com/products/web-scraper

**Ventajas:**
- ✅ IPs residenciales de verdad
- ✅ Altísima tasa de éxito
- ✅ Instagram scraper pre-configurado
- ✅ Manejo automático de CAPTCHAs

**Desventajas:**
- ❌ Muy caro ($500+/mes)
- ❌ Requiere verificación empresarial

---

### Opción 4: **Instagram API Oficial** 📊 Limitado

**API:** Instagram Basic Display API / Instagram Graph API

**Ventajas:**
- ✅ Oficial y legal
- ✅ Sin problemas de bloqueo
- ✅ Gratis hasta cierto límite

**Desventajas:**
- ❌ Requiere autenticación OAuth del usuario
- ❌ Solo acceso a cuentas que autoricen la app
- ❌ Datos limitados comparado con scraping
- ❌ No sirve para monitoreo de cuentas públicas sin permiso

---

### Opción 5: **Scraping Manual Ocasional** 🖐️ Free

**Método:**
- Usar Browserbase SOLO para 1-2 posts por día
- Complementar con scraping manual
- Instagram de Foco no es una fuente primaria

**Ventajas:**
- ✅ Sin costo adicional
- ✅ Menos riesgo de bloqueo (volumen bajo)

**Desventajas:**
- ❌ No escalable
- ❌ Requiere intervención manual
- ❌ Datos inconsistentes

---

### Opción 6: **Cambiar a Twitter/X de Foco** 🐦 Alternativa

**Método:**
- Si Foco también tiene cuenta en Twitter/X
- Twitter es MÁS fácil de scrapear que Instagram
- Usar mismo Browserbase

**Ventajas:**
- ✅ Twitter menos restrictivo que Instagram
- ✅ Sin costo adicional
- ✅ Mismo tipo de contenido

**Desventajas:**
- ❌ Depende de que Foco tenga Twitter
- ❌ Contenido puede ser diferente

---

## 📈 Comparación de Costos

| Solución | Costo Mensual | Probabilidad Éxito | Mantenimiento |
|----------|---------------|-------------------|---------------|
| **Browserbase Hobby** | $20 | ❌ 0% (bloqueado) | Bajo |
| **Browserbase Pro** | $250 | ⚠️ 40-60% | Medio |
| **Apify** | $49-99 | ✅ 90%+ | Muy Bajo |
| **Bright Data** | $500+ | ✅ 95%+ | Muy Bajo |
| **API Oficial** | Gratis | ✅ 100% | Bajo |
| **Manual** | $0 | ✅ 100% | Alto |
| **Twitter** | $20 | ✅ 80% | Bajo |

---

## 🎯 Recomendación Final

### Para InfoPanama:

**Corto plazo (inmediato):**
1. ✅ **Usar los otros 10 crawlers** que SÍ funcionan
2. ✅ Generar contenido con medios tradicionales
3. ⏸️ Pausar Instagram hasta definir estrategia

**Mediano plazo (1-2 semanas):**
- **Opción A:** Probar **Apify** ($49/mes) - MEJOR ROI
- **Opción B:** Verificar si Foco tiene **Twitter** y scrapear eso
- **Opción C:** Scraping **manual ocasional** de Instagram (1-2 posts/semana)

**Largo plazo (1-3 meses):**
- Si Instagram de Foco es **crítico**: invertir en Apify o Bright Data
- Si NO es crítico: mantener enfoque en medios tradicionales

---

## 📝 Notas Técnicas

### Sesiones de Browserbase
- Plan Hobby: **1 sesión concurrente**
- Timeout de inactividad: **5 minutos**
- Límite mensual: **100 horas**

### Rate Limits Observados
- Creación de sesiones: ~10-20/hora antes de rate limit temporal
- Conexiones simultáneas: 1 (plan Hobby)

### Archivos de Prueba Creados
- `diagnose-browserbase.ts` - Diagnóstico general ✅
- `test-instagram.ts` - Test básico de Instagram ❌
- `test-instagram-direct.ts` - Test directo ❌
- `test-browserbase-api.ts` - Via REST API ❌
- `test-warm-session.ts` - Warming session (pendiente)
- `check-browserbase-sessions.ts` - Listar sesiones ✅

---

## 🔗 Referencias

- Browserbase Docs: https://docs.browserbase.com
- Apify Instagram Scraper: https://apify.com/apify/instagram-scraper
- Instagram Basic Display API: https://developers.facebook.com/docs/instagram-basic-display-api
- Bright Data: https://brightdata.com

---

**Conclusión:** Instagram es extremadamente difícil de scrapear sin herramientas especializadas. Para InfoPanama, la mejor opción es usar Apify ($49/mes) o cambiar el foco a fuentes más accesibles.
