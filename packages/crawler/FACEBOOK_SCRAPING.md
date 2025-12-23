# 📘 Guía de Scraping de Facebook con Browserbase

## 🎯 ¿Qué puedes hacer ahora?

Con Browserbase configurado, puedes hacer scraping de:
- ✅ Posts públicos de Facebook
- ✅ Páginas de Facebook (La Prensa, TVN-2, Telemetro)
- ✅ Instagram posts (próximamente)
- ✅ Twitter/X (próximamente)

## 🔧 Configuración

### 1. Obtener credenciales de Browserbase

1. Ve a [browserbase.com](https://browserbase.com)
2. Crea una cuenta (tienen plan gratuito)
3. Ve a Settings → API Keys
4. Copia tu **API Key** y **Project ID**

### 2. Agregar a `.env`

Agrega estas líneas a tu archivo `.env`:

```bash
# Browserbase (para scraping de redes sociales)
BROWSERBASE_API_KEY=tu_api_key_aqui
BROWSERBASE_PROJECT_ID=tu_project_id_aqui
```

### 3. Verificar configuración

```bash
cd packages/crawler
npx tsx test-facebook-browserbase.ts
```

Si ves ✅ significa que está configurado correctamente.

---

## 🚀 Uso Rápido

### Opción 1: Script de prueba

```bash
cd packages/crawler
npx tsx test-facebook-browserbase.ts
```

### Opción 2: Desde código

```typescript
import { crawlFacebookPost } from './src/crawlers/facebook-single-post.js'

const article = await crawlFacebookPost(
  'https://www.facebook.com/prensacom/posts/123456789'
)

if (article) {
  console.log('Título:', article.title)
  console.log('Contenido:', article.content)
  console.log('Autor:', article.author)
}
```

### Opción 3: Agregar al crawler principal

Ya está integrado! Solo guarda posts de Facebook en Convex:

```typescript
import { crawlFacebookPost } from './crawlers/facebook-single-post.js'
import { saveArticleToConvex } from './utils/convex.js'

// Scrapear post
const article = await crawlFacebookPost(facebookUrl)

// Guardar en Convex
if (article) {
  await saveArticleToConvex(article)
}
```

---

## 📋 Ejemplos de URLs válidas

### La Prensa
```
https://www.facebook.com/prensacom/posts/pfbid...
https://www.facebook.com/prensacom/photos/...
```

### TVN-2
```
https://www.facebook.com/tvn2/posts/...
```

### Telemetro
```
https://www.facebook.com/telemetro/posts/...
```

---

## 🎬 Cómo funciona Browserbase

Browserbase te da **navegadores reales en la nube** con:

1. **Anti-detección**: Facebook no detecta que es un bot
2. **IPs rotativas**: Cada request usa una IP diferente
3. **Fingerprinting realista**: Headers, canvas, WebGL como usuario real
4. **Captcha bypass**: Resuelve captchas automáticamente

### Arquitectura

```
Tu código
   ↓
Playwright conecta via CDP
   ↓
Browserbase Cloud (navegador real)
   ↓
Facebook (piensa que es usuario normal)
   ↓
Contenido extraído
```

---

## 💰 Costos de Browserbase

### Plan Free
- ✅ 100 sesiones/mes gratis
- ✅ 60 segundos/sesión
- ✅ Anti-detección básico
- ✅ Perfecto para testing

### Plan Hobby ($20/mes)
- ✅ 1000 sesiones/mes
- ✅ 300 segundos/sesión
- ✅ Anti-detección avanzado
- ✅ IPs rotativas premium
- ✅ Captcha solving incluido

**Recomendación:** Empieza con Free, upgradea cuando necesites más.

---

## 🛡️ Mejores Prácticas

### 1. Respetar Rate Limits
```typescript
// ✅ BUENO - Delay entre requests
await crawlFacebookPost(url1)
await new Promise(r => setTimeout(r, 5000)) // 5 segundos
await crawlFacebookPost(url2)

// ❌ MALO - Requests sin delay
for (const url of urls) {
  await crawlFacebookPost(url) // Facebook te bloqueará
}
```

### 2. Usar horarios aleatorios
```typescript
// Simula comportamiento humano
const randomDelay = Math.floor(Math.random() * 3000) + 2000 // 2-5 seg
await new Promise(r => setTimeout(r, randomDelay))
```

### 3. Limitar posts por día
```typescript
// Máximo 50-100 posts/día para no levantar sospechas
const MAX_POSTS_PER_DAY = 50
```

### 4. Rotar URLs de páginas
```typescript
// No siempre scrapear la misma página
const pages = ['prensacom', 'tvn2', 'telemetro']
const randomPage = pages[Math.floor(Math.random() * pages.length)]
```

---

## 🔍 Debugging

### Ver qué está pasando

Browserbase tiene dashboard donde puedes ver:
- 📹 **Video** de la sesión
- 🖥️ **Screenshots** en cada paso
- 📝 **Logs** detallados
- ⏱️ **Tiempo** de ejecución

Ve a: [app.browserbase.com/sessions](https://app.browserbase.com/sessions)

### Errores comunes

#### Error: "ERR_TUNNEL_CONNECTION_FAILED"
**Causa:** API Key o Project ID incorrectos
**Solución:** Verifica las credenciales en `.env`

#### Error: "Session timeout"
**Causa:** La sesión excedió el límite de tiempo
**Solución:** Optimiza el código para ser más rápido

#### Error: "No se pudo extraer contenido"
**Causa:** Facebook cambió el HTML o bloqueó el acceso
**Solución:** Actualiza los selectores en `facebook-single-post.ts`

---

## 📊 Monitoreo

### Verificar uso de Browserbase

```bash
# Ver sesiones activas
curl -X GET https://api.browserbase.com/v1/sessions \
  -H "X-BB-API-Key: $BROWSERBASE_API_KEY"

# Ver uso del mes
curl -X GET https://api.browserbase.com/v1/usage \
  -H "X-BB-API-Key: $BROWSERBASE_API_KEY"
```

---

## 🎯 Próximos Pasos

1. ✅ Probar con un post de Facebook
2. ⬜ Agregar scraping de páginas completas
3. ⬜ Implementar scraping de Instagram
4. ⬜ Implementar scraping de Twitter/X
5. ⬜ Automatizar con cron jobs

---

## 📚 Recursos

- [Browserbase Docs](https://docs.browserbase.com)
- [Playwright Docs](https://playwright.dev)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api) (alternativa oficial)

---

## ⚖️ Consideraciones Legales

- ✅ Solo scrapea contenido **público**
- ✅ Respeta `robots.txt` cuando aplique
- ✅ No sobrecargues los servidores
- ✅ Úsalo para fact-checking y periodismo investigativo
- ❌ No uses para spam o propósitos maliciosos

**Disclaimer:** El web scraping de redes sociales está en zona gris legal. Úsalo responsablemente.

---

**¿Dudas?** Revisa los logs o contacta al equipo de desarrollo.
