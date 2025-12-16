# 🕷️ Lista de Crawlers - InfoPanama

Todos los crawlers disponibles para extraer noticias de medios panameños.

---

## 📰 Medios Activos (11 crawlers)

### 1. **La Prensa** 📰
- **URL**: https://www.prensa.com
- **Tipo**: Periódico tradicional
- **Script**: `npm run crawl:prensa`
- **Estado**: ✅ Activo

### 2. **TVN** 📺
- **URL**: https://www.tvn-2.com
- **Tipo**: Canal de TV / Noticias
- **Script**: Incluido en `crawl:all`
- **Estado**: ✅ Activo

### 3. **Telemetro** 📺
- **URL**: https://www.telemetro.com
- **Tipo**: Canal de TV / Noticias
- **Script**: Incluido en `crawl:all`
- **Estado**: ✅ Activo

### 4. **Panama América** 📰
- **URL**: https://www.panamaamerica.com.pa
- **Tipo**: Periódico
- **Script**: Incluido en `crawl:all`
- **Estado**: ✅ Activo

### 5. **Crítica** 📰
- **URL**: https://www.critica.com.pa
- **Tipo**: Periódico
- **Script**: Incluido en `crawl:all`
- **Estado**: ✅ Activo

### 6. **La Estrella de Panamá** 📰
- **URL**: https://www.laestrella.com.pa
- **Tipo**: Periódico
- **Script**: Incluido en `crawl:all`
- **Estado**: ✅ Activo

### 7. **El Capital Financiero** 💰
- **URL**: https://elcapitalfinanciero.com
- **Tipo**: Medio económico/financiero
- **Script**: `npm run crawl:capital`
- **Estado**: ✅ Activo
- **Secciones**: Economía, Finanzas, Negocios, Política

### 8. **Metro Libre** 📰 ⭐ NUEVO
- **URL**: https://www.metrolibre.com
- **Tipo**: Periódico digital
- **Script**: `npm run crawl:metro`
- **Estado**: ✅ Activo
- **Agregado**: Diciembre 2025

### 9. **RPC Radio** 📻 ⭐ NUEVO
- **URL**: https://www.rpc.com.pa
- **Tipo**: Radio / Noticias
- **Script**: `npm run crawl:rpc`
- **Estado**: ✅ Activo
- **Agregado**: Diciembre 2025

### 10. **Foco (Instagram)** 📸
- **URL**: https://instagram.com/focopanama
- **Tipo**: Medio digital / Redes sociales
- **Script**: Incluido en `crawl:all`
- **Estado**: ✅ Activo
- **Requiere**: Browserbase configurado

### 11. **Gaceta Oficial** 🏛️
- **URL**: https://www.gacetaoficial.gob.pa
- **Tipo**: Publicación oficial del gobierno
- **Script**: `npm run crawl:gaceta`
- **Estado**: ✅ Activo
- **Nota**: NO se extraen claims (documentos legales, no verificables)

---

## 🚫 Crawlers Desactivados

### Foco (Sitio Web)
- **URL**: https://foco.com.pa
- **Estado**: ❌ Desactivado
- **Razón**: Dominio no disponible o cambió
- **Alternativa**: Usar crawler de Instagram (@focopanama)

---

## 📊 Estadísticas

| Categoría | Cantidad |
|-----------|----------|
| **Crawlers Activos** | 11 |
| **Medios Tradicionales** | 6 |
| **Canales TV** | 2 |
| **Radio** | 1 |
| **Económicos** | 1 |
| **Redes Sociales** | 1 |
| **Oficiales** | 1 |

---

## 🚀 Cómo Usar

### Ejecutar todos los crawlers
```bash
cd packages/crawler
npm run crawl:all
```

### Ejecutar crawler individual
```bash
# La Prensa
npm run crawl:prensa

# Metro Libre
npm run crawl:metro

# RPC Radio
npm run crawl:rpc

# Capital Financiero
npm run crawl:capital

# Gaceta Oficial
npm run crawl:gaceta
```

---

## 🔧 Agregar Nuevo Crawler

### 1. Crear archivo del crawler
```typescript
// packages/crawler/src/crawlers/nuevo-medio.ts
import { chromium } from 'playwright'
import type { ScrapedArticle } from '../types'

export async function crawlNuevoMedio(): Promise<ScrapedArticle[]> {
  // ... implementación
}
```

### 2. Agregar al index.ts
```typescript
// Importar
import { crawlNuevoMedio } from './crawlers/nuevo-medio.js'

// Agregar configuración de fuente
'Nuevo Medio': {
  slug: 'nuevo-medio',
  name: 'Nuevo Medio',
  url: 'https://nuevomedio.com',
  type: 'media',
},

// Agregar llamada en main()
console.log('\n📰 Crawling Nuevo Medio...')
const nuevoMedioArticles = await crawlNuevoMedio()
articles = [...articles, ...nuevoMedioArticles]
```

### 3. Agregar script en package.json
```json
{
  "scripts": {
    "crawl:nuevo": "tsx src/crawlers/nuevo-medio.ts"
  }
}
```

### 4. Probar
```bash
npm run crawl:nuevo
```

---

## 📝 Plantilla de Crawler

```typescript
/**
 * Crawler para [NOMBRE DEL MEDIO]
 * [Descripción breve]
 */

import { chromium } from 'playwright'
import type { ScrapedArticle } from '../types'

const BASE_URL = 'https://ejemplo.com'

export async function crawlEjemplo(): Promise<ScrapedArticle[]> {
  console.log('📰 Iniciando crawler de Ejemplo...')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  })

  const page = await context.newPage()
  const articles: ScrapedArticle[] = []

  try {
    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Extraer artículos...

    console.log(`✅ Ejemplo: ${articles.length} artículos extraídos`)
  } catch (error) {
    console.error('❌ Error en crawler de Ejemplo:', error)
  } finally {
    await browser.close()
  }

  return articles.filter(a => a.content && a.content.length > 100)
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlEjemplo()
    .then((articles) => {
      console.log(`\n📊 Total: ${articles.length} artículos`)
      articles.forEach((a, i) => {
        console.log(`${i + 1}. ${a.title}`)
      })
    })
    .catch(console.error)
}
```

---

## 🎯 Próximos Crawlers Sugeridos

- [ ] **Nex Noticias** (nexnoticias.com)
- [ ] **TVMax** (tvmax-9.com)
- [ ] **Mi Diario** (midiario.com)
- [ ] **Radio La Exitosa** (laexitosa.com.pa)
- [ ] **Día a Día** (dia-a-dia.com.pa)
- [ ] **El Siglo** (elsiglo.com.pa)

---

## 📚 Documentación Técnica

### Tipo ScrapedArticle
```typescript
interface ScrapedArticle {
  title: string
  url: string
  sourceUrl: string
  sourceName: string
  sourceType: 'news_website' | 'social_media' | 'official_document'
  content: string
  scrapedAt: string
  publishedDate: string
  imageUrl?: string
  author?: string
  category?: string
}
```

### Mejores Prácticas

1. **Respetar rate limits**: Usar `page.waitForTimeout()` entre requests
2. **Manejo de errores**: Usar try/catch y continuar con siguiente artículo
3. **User agent**: Siempre configurar user agent realista
4. **Filtrar contenido**: Solo artículos con >100 caracteres
5. **Logs claros**: Usar emojis y mensajes descriptivos
6. **Timeout razonable**: 15-30 segundos por página

---

**Última actualización**: Diciembre 2025
