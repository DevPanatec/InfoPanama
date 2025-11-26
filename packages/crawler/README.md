# 🔍 InfoPanama OSINT Crawler

Sistema de crawling automático GRATIS para extraer noticias y verificar claims.

## 🎯 ¿Qué hace?

1. **Scrapea medios panameños** (La Prensa, Gaceta Oficial, etc.)
2. **Extrae claims con IA** (GPT-5 mini identifica afirmaciones verificables)
3. **Guarda en Convex** (para verificación automática)

## 🚀 Instalación

```bash
cd packages/crawler
npm install
npx playwright install chromium
```

## ⚙️ Configuración

Copia `.env.example` a `.env` y configura:

```bash
# OpenAI API (para extracción de claims)
OPENAI_API_KEY=sk-proj-...

# Convex (para guardar datos)
CONVEX_URL=https://your-deployment.convex.cloud
```

## 🎮 Uso

### Opción 1: Ejecutar todo el pipeline
```bash
npm run crawl:all
```

Esto hará:
1. ✅ Crawl de La Prensa (20 artículos)
2. ✅ Crawl de Gaceta Oficial (10 publicaciones)
3. ✅ Extracción de claims con IA
4. ✅ Guardado en Convex

### Opción 2: Crawlers individuales
```bash
# Solo La Prensa
npm run crawl:prensa

# Solo Gaceta Oficial
npm run crawl:gaceta
```

### Opción 3: Test de extracción de claims
```bash
npm run extract:claims
```

## 📊 Output Esperado

```
🚀 Iniciando Pipeline OSINT de InfoPanama
============================================================

📰 FASE 1: CRAWLING DE NOTICIAS
============================================================
🔍 Crawling La Prensa...
📰 Scrapeando sección: /politica
🔗 Encontrados 15 artículos en /politica
✅ Scraped: Presidente anuncia reforma fiscal...
...
✅ Fase 1 completada: 25 artículos scrapeados

🤖 FASE 2: EXTRACCIÓN DE CLAIMS CON IA
============================================================
🔍 Extrayendo claims de: "Presidente anuncia reforma..."
✅ Extraídos 2 claims verificables
   1. [HIGH] "El presupuesto 2025 será de $30 mil millones"
   2. [MEDIUM] "La tasa de desempleo bajó al 8%"
...

💾 FASE 3: GUARDANDO EN BASE DE DATOS
============================================================
📝 Procesando "Presidente anuncia reforma fiscal..."
   ✅ Claim creado: j97kaz8...
   ✅ Claim creado: k28lbx9...
...

🎉 PIPELINE COMPLETADO
============================================================
📰 Artículos scrapeados: 25
🔍 Claims extraídos: 12
⏱️  Tiempo total: 142.35s
============================================================
```

## 🤖 Automatización con Cron Jobs

El sistema incluye cron jobs en Convex que ejecutan automáticamente:

### 1. Crawl cada 6 horas
- Extrae noticias recientes
- Identifica claims verificables
- Los guarda en estado "new"

### 2. Verificación automática cada hora
- Verifica claims con riskLevel HIGH o CRITICAL
- Usa GPT-5 mini con prompts avanzados
- Genera veredictos automáticos

### 3. Limpieza semanal
- Elimina claims rechazados de hace >90 días
- Optimiza la base de datos

**Configuración:** Ver `packages/convex/convex/crons.ts`

## 📁 Estructura

```
packages/crawler/
├── src/
│   ├── crawlers/
│   │   ├── la-prensa.ts       # Crawler de La Prensa
│   │   └── gaceta-oficial.ts  # Crawler de Gaceta Oficial
│   ├── processors/
│   │   └── claim-extractor.ts # Extracción IA de claims
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── index.ts                # Pipeline principal
├── .env
├── package.json
└── README.md
```

## 🔧 Cómo Agregar Más Fuentes

### Ejemplo: TVN Noticias

```typescript
// src/crawlers/tvn.ts
import { chromium } from 'playwright'
import * as cheerio from 'cheerio'

export async function crawlTVN() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto('https://www.tvn-2.com/noticias')

  // Tu lógica de scraping aquí
  // ...

  await browser.close()
  return articles
}
```

Luego agrégalo a `src/index.ts`:

```typescript
import { crawlTVN } from './crawlers/tvn.js'

// En main():
const tvnArticles = await crawlTVN()
articles = [...articles, ...tvnArticles]
```

## 🎯 Fuentes Soportadas Actualmente

- ✅ La Prensa (www.prensa.com)
- ✅ Gaceta Oficial (gacetaoficial.gob.pa)
- ⏳ TVN Noticias (próximamente)
- ⏳ Telemetro (próximamente)
- ⏳ La Estrella (próximamente)

## 💡 Tips

1. **Rate Limiting**: El crawler espera 2 segundos entre requests para no saturar los sitios
2. **User Agent**: Usamos un user agent real para evitar bloqueos
3. **Headless**: Chromium corre en modo headless (sin UI)
4. **Selectores CSS**: Los selectores pueden cambiar si los medios actualizan su diseño
5. **Costos**: GPT-5 mini cuesta ~$0.25-$2 por 1M tokens (muy barato)

## 🐛 Troubleshooting

### Error: "OPENAI_API_KEY no configurado"
- Verifica que `.env` existe y tiene tu API key
- La API key debe empezar con `sk-proj-...`

### Error: "CONVEX_URL no configurado"
- Copia la URL de tu deployment desde Convex dashboard
- Debe ser `https://xxx.convex.cloud`

### Error: "Chromium no instalado"
```bash
npx playwright install chromium
```

### Selectores CSS no funcionan
- Los medios cambian su diseño ocasionalmente
- Actualiza los selectores en el crawler respectivo
- Usa las herramientas de desarrollador del navegador para encontrar los nuevos selectores

## 📈 Métricas

Crawl típico (todas las fuentes):
- ⏱️ **Duración**: ~2-3 minutos
- 📰 **Artículos**: ~25-30
- 🔍 **Claims extraídos**: ~10-15
- 💰 **Costo OpenAI**: ~$0.01-0.05

## 🔐 Seguridad

- ✅ No almacenamos contenido protegido por copyright completo
- ✅ Solo guardamos metadata y citas breves
- ✅ Respetamos robots.txt
- ✅ Rate limiting para no saturar servidores
- ✅ API keys nunca se commitean (están en .env)

## 🚀 Próximos Pasos

1. **Más fuentes**: TVN, Telemetro, La Estrella, medios internacionales
2. **Webhooks**: Notificaciones cuando se detectan claims HIGH/CRITICAL
3. **Docker**: Containerizar para deployment fácil
4. **Railway/Render**: Hospedar crawler para ejecución automática
5. **Monitoring**: Dashboard para ver status de crawls

---

**🎉 ¡Sistema OSINT 100% GRATIS implementado!**

Solo pagas OpenAI (~$5-10/mes para uso moderado).
