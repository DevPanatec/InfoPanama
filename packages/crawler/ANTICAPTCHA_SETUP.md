# 🔓 Configuración de AntiCaptcha

## ¿Qué es AntiCaptcha?

AntiCaptcha es un servicio de resolución de captchas que puede usarse como **backup** si Browserbase falla resolviendo captchas automáticamente.

## ⚠️ ¿Cuándo usar AntiCaptcha?

**EN LA MAYORÍA DE CASOS NO LO NECESITAS** porque:
- ✅ Browserbase resuelve captchas automáticamente
- ✅ Browserbase incluye anti-detección
- ✅ Browserbase ya tiene IPs rotativas

**Solo configura AntiCaptcha si:**
- ❌ Browserbase sigue fallando con captchas específicos
- ❌ Necesitas resolver captchas fuera de Browserbase
- ❌ Tienes muchos captchas de tipo específico (reCAPTCHA v3, hCaptcha, etc.)

---

## 📋 Pasos para Configurar

### 1. Crear Cuenta

1. Ve a [https://anti-captcha.com](https://anti-captcha.com)
2. Click en "Sign Up"
3. Registra tu cuenta con email

### 2. Agregar Fondos

AntiCaptcha funciona con **pay-as-you-go** (pagas por lo que usas):

1. Dashboard → "Top Up Balance"
2. Agrega fondos (mínimo $5)
3. Métodos de pago:
   - Tarjeta de crédito
   - PayPal
   - Criptomonedas

### 3. Obtener API Key

1. Dashboard → Settings → API Setup
2. Copia tu **API Key** (empieza con números)
3. Guárdala de forma segura

### 4. Configurar Variables de Entorno

Agrega a tu archivo `.env`:

```bash
# AntiCaptcha
ANTICAPTCHA_API_KEY=your-api-key-here
```

---

## 💰 Costos por Tipo de Captcha

| Tipo de Captcha | Costo por 1000 | Tiempo Promedio |
|-----------------|----------------|-----------------|
| **reCAPTCHA v2** | $1.00 | 10-20 segundos |
| **reCAPTCHA v3** | $1.50 | 10-20 segundos |
| **hCaptcha** | $1.00 | 10-20 segundos |
| **FunCaptcha** | $1.50 | 15-30 segundos |
| **Image Captcha** | $0.50 | 5-10 segundos |
| **Text Captcha** | $0.50 | 5-10 segundos |

**Comparación con 2Captcha:**
- AntiCaptcha: $0.50-$3.00 por 1000 ✅ (más barato)
- 2Captcha: $2.99 por 1000
- Browserbase: Incluido en plan ($20/mes) ✅ (mejor opción)

---

## 🔧 Implementación en el Código

### Instalar Cliente de AntiCaptcha

```bash
cd packages/crawler
npm install @antiadmin/anticaptchaofficial
```

### Ejemplo de Uso

```typescript
import ac from '@antiadmin/anticaptchaofficial'

// Configurar API key
ac.setAPIKey(process.env.ANTICAPTCHA_API_KEY || '')

// Resolver reCAPTCHA v2
async function solveRecaptchaV2(websiteUrl: string, websiteKey: string) {
  const result = await ac.solveRecaptchaV2Proxyless(
    websiteUrl,
    websiteKey
  )
  return result // Token de solución
}

// Resolver hCaptcha
async function solveHCaptcha(websiteUrl: string, websiteKey: string) {
  const result = await ac.solveHCaptchaProxyless(
    websiteUrl,
    websiteKey
  )
  return result
}

// Verificar balance
async function checkBalance() {
  const balance = await ac.getBalance()
  console.log(`💰 Balance restante: $${balance}`)
  return balance
}
```

### Integración con Playwright

```typescript
import { chromium } from 'playwright'
import ac from '@antiadmin/anticaptchaofficial'

async function crawlWithCaptchaSolving(url: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(url)

    // Detectar si hay captcha
    const hasCaptcha = await page.locator('.g-recaptcha').count() > 0

    if (hasCaptcha) {
      console.log('🔓 Captcha detectado, resolviendo...')

      // Obtener site key
      const siteKey = await page.locator('.g-recaptcha').getAttribute('data-sitekey')

      // Resolver con AntiCaptcha
      ac.setAPIKey(process.env.ANTICAPTCHA_API_KEY || '')
      const token = await ac.solveRecaptchaV2Proxyless(url, siteKey!)

      // Inyectar solución
      await page.evaluate((captchaToken) => {
        // @ts-ignore
        document.getElementById('g-recaptcha-response').innerHTML = captchaToken
      }, token)

      console.log('✅ Captcha resuelto')
    }

    // Continuar con scraping...
    const data = await page.textContent('body')

    return data
  } finally {
    await browser.close()
  }
}
```

---

## 🚀 Uso con Browserbase (Recomendado)

**Mejor práctica:** Usa Browserbase primero, AntiCaptcha como fallback.

```typescript
async function crawlWithFallback(url: string) {
  // 1. Intentar con Browserbase (incluye captcha solving)
  if (process.env.BROWSERBASE_API_KEY) {
    try {
      console.log('🔒 Intentando con Browserbase...')
      const result = await crawlWithBrowserbase(url)
      return result
    } catch (error) {
      console.log('⚠️  Browserbase falló, usando AntiCaptcha...')
    }
  }

  // 2. Fallback: Playwright local + AntiCaptcha
  return await crawlWithCaptchaSolving(url)
}
```

---

## 📊 Monitoreo de Uso

### Ver Balance

```typescript
import ac from '@antiadmin/anticaptchaofficial'

async function checkStats() {
  ac.setAPIKey(process.env.ANTICAPTCHA_API_KEY || '')

  const balance = await ac.getBalance()
  console.log(`💰 Balance: $${balance}`)

  if (balance < 1) {
    console.warn('⚠️  Balance bajo! Recarga pronto.')
  }
}
```

### Estadísticas en Dashboard

Ve a https://anti-captcha.com/clients/finance/history para ver:
- Total de captchas resueltos
- Costos por día/semana/mes
- Tasa de éxito
- Balance restante

---

## 🎯 Mejores Prácticas

### 1. Verificar Balance Antes de Scraping

```typescript
const MIN_BALANCE = 1 // $1 mínimo

async function ensureBalance() {
  const balance = await ac.getBalance()

  if (balance < MIN_BALANCE) {
    throw new Error(`⚠️  Balance insuficiente: $${balance}. Recarga en https://anti-captcha.com`)
  }

  return true
}
```

### 2. Caché de Tokens (si es posible)

```typescript
const tokenCache = new Map<string, { token: string, expiresAt: number }>()

async function getCachedToken(siteKey: string) {
  const cached = tokenCache.get(siteKey)

  if (cached && Date.now() < cached.expiresAt) {
    return cached.token
  }

  // Resolver nuevo token
  const token = await ac.solveRecaptchaV2Proxyless(url, siteKey)

  // Cachear por 2 minutos (reCAPTCHA v2 tokens duran ~2-3 min)
  tokenCache.set(siteKey, {
    token,
    expiresAt: Date.now() + 120000
  })

  return token
}
```

### 3. Manejo de Errores

```typescript
async function solveCaptchaWithRetry(url: string, siteKey: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const token = await ac.solveRecaptchaV2Proxyless(url, siteKey)
      return token
    } catch (error) {
      console.error(`❌ Intento ${i + 1} falló:`, error)

      if (i === maxRetries - 1) {
        throw new Error('No se pudo resolver captcha después de 3 intentos')
      }

      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}
```

---

## ⚠️ Troubleshooting

### Error: "ERROR_ZERO_BALANCE"

**Causa:** No tienes fondos en tu cuenta.

**Solución:**
1. Ve a https://anti-captcha.com/clients/finance/refill
2. Agrega fondos ($5 mínimo)

### Error: "ERROR_KEY_DOES_NOT_EXIST"

**Causa:** API key inválida.

**Solución:**
1. Verifica que `ANTICAPTCHA_API_KEY` esté correctamente configurada
2. Genera nueva API key en el dashboard

### Error: "ERROR_NO_SLOT_AVAILABLE"

**Causa:** Servicio sobrecargado (raro).

**Solución:**
- Espera 30 segundos y reintenta
- Usa otro servicio como 2Captcha

### Captcha resuelto pero no funciona

**Causa:** Token expiró o sitio lo rechazó.

**Solución:**
- Tokens de reCAPTCHA v2 duran ~2-3 minutos
- Úsalos inmediatamente después de obtenerlos
- No cachees tokens por mucho tiempo

---

## 🔐 Seguridad

### Nunca expongas tu API Key

```typescript
// ❌ MAL - hardcodeado
const apiKey = '1234567890abcdef'

// ✅ BIEN - variable de entorno
const apiKey = process.env.ANTICAPTCHA_API_KEY
```

### Agrega a .gitignore

```bash
# En .env (ya debería estar en .gitignore)
ANTICAPTCHA_API_KEY=your-api-key
```

### Limita el uso

```typescript
// Evita loops infinitos que gasten tu balance
const MAX_CAPTCHA_SOLVES_PER_DAY = 100

let captchaSolvesToday = 0

async function rateLimitedSolve(url: string, siteKey: string) {
  if (captchaSolvesToday >= MAX_CAPTCHA_SOLVES_PER_DAY) {
    throw new Error('⚠️  Límite diario de captchas alcanzado')
  }

  const token = await ac.solveRecaptchaV2Proxyless(url, siteKey)
  captchaSolvesToday++

  return token
}
```

---

## 📚 Recursos

- [Documentación Oficial](https://anti-captcha.com/apidoc)
- [Cliente NPM](https://www.npmjs.com/package/@antiadmin/anticaptchaofficial)
- [Dashboard](https://anti-captcha.com/clients/settings/apisetup)
- [Pricing](https://anti-captcha.com/clients/finance/deposits)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa la documentación oficial
2. Verifica tu balance
3. Contacta soporte: https://anti-captcha.com/clients/support/tickets

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en anti-captcha.com
- [ ] Fondos agregados ($5+ recomendado)
- [ ] API Key obtenida
- [ ] `ANTICAPTCHA_API_KEY` en `.env`
- [ ] Cliente npm instalado: `@antiadmin/anticaptchaofficial`
- [ ] Código de fallback implementado
- [ ] Balance monitoreado
- [ ] Límites de uso configurados

---

**Recuerda:** AntiCaptcha es **OPCIONAL**. Browserbase resuelve la mayoría de captchas automáticamente. Solo úsalo si realmente lo necesitas.

**Costo típico:** $1-5/mes (si lo usas esporádicamente)
