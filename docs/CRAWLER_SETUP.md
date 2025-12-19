# 🕷️ Crawler de InfoPanama - Guía de Uso

El crawler de InfoPanama es un sistema automatizado que extrae noticias de medios panameños, identifica claims verificables usando IA (OpenAI GPT-5 mini), y los guarda automáticamente en Convex para su verificación.

## 📋 Características

- ✅ **Scraping automatizado** de múltiples fuentes de noticias panameñas
- ✅ **Extracción de claims con IA** usando OpenAI GPT-5 mini
- ✅ **Guardado automático** en Convex
- ✅ **Categorización inteligente** de claims por riesgo y tipo
- ✅ **Rate limiting** para no saturar servidores
- ✅ **Manejo de errores** robusto

## 🎯 Fuentes Configuradas

1. **La Prensa** - https://www.prensa.com
   - Secciones: Política, Economía, Sociedad, Nacionales

2. **Gaceta Oficial** - Documentos gubernamentales oficiales

## 🚀 Instalación

El crawler ya está instalado en el proyecto. Solo necesitas configurar tu API key de OpenAI:

```bash
# 1. Copia el archivo de ejemplo
cp .env.example .env.local

# 2. Edita .env.local y agrega tu OPENAI_API_KEY
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
OPENAI_MODEL=gpt-5-mini
```

## 🎮 Uso

### Opción 1: Script Ejecutable (Recomendado)

**En Windows:**
```bash
# Crawler completo (todas las fuentes)
run-crawler.bat

# Solo La Prensa
run-crawler.bat prensa

# Solo Gaceta Oficial
run-crawler.bat gaceta
```

**En Linux/Mac:**
```bash
# Dar permisos de ejecución (primera vez)
chmod +x run-crawler.sh

# Crawler completo
./run-crawler.sh

# Solo La Prensa
./run-crawler.sh prensa

# Solo Gaceta Oficial
./run-crawler.sh gaceta
```

### Opción 2: Comandos npm directos

```bash
cd packages/crawler

# Crawler completo
npm run crawl:all

# Solo La Prensa
npm run crawl:prensa

# Solo Gaceta Oficial
npm run crawl:gaceta

# Modo desarrollo (con hot reload)
npm run dev
```

## 🔄 Pipeline del Crawler

El crawler ejecuta 3 fases automáticamente:

### Fase 1: Crawling de Noticias
```
🔍 Visita los sitios web de noticias
📄 Extrae artículos recientes (máximo 5 por sección)
💾 Parsea título, contenido, autor, fecha, imagen
```

**Límites de scraping:**
- 5 artículos por sección
- 2 segundos de espera entre requests
- Timeout de 30 segundos por página

### Fase 2: Extracción de Claims con IA
```
🤖 Analiza cada artículo con OpenAI GPT-5 mini
🎯 Identifica afirmaciones verificables
📊 Categoriza por tipo y nivel de riesgo
✅ Filtra claims con confianza > 60%
```

**Categorías de claims:**
- `política` - Declaraciones políticas
- `economía` - PIB, presupuestos, inflación
- `salud` - CSS, hospitales, medicamentos
- `seguridad` - Criminalidad, policía
- `infraestructura` - Obras públicas
- `otros` - Educación, medio ambiente, cultura

**Niveles de riesgo:**
- `LOW` - Información técnica, bajo impacto
- `MEDIUM` - Datos sin verificar
- `HIGH` - Declaraciones controversiales
- `CRITICAL` - Información que podría causar pánico

### Fase 3: Guardado en Convex
```
💾 Guarda artículos en la tabla articles
📝 Crea claims verificables en la tabla claims
🏷️ Asigna categorías y tags automáticamente
🔥 Marca como featured si es de alto riesgo
```

## 📊 Monitoreo

Después de ejecutar el crawler, verás un resumen como este:

```
🎉 PIPELINE COMPLETADO
============================================================
📰 Artículos scrapeados: 20
🔍 Claims extraídos: 15
⏱️  Tiempo total: 45.23s
============================================================

💡 Próximos pasos:
1. Revisar los claims en http://localhost:3000/admin/dashboard
2. Aprobar claims para verificación automática
3. Publicar verificaciones en el homepage
```

## 🤖 Automatización

### Con Cron Jobs de Convex

Ya está configurado para ejecutarse cada 6 horas automáticamente:

```typescript
// packages/convex/convex/crons.ts
crons.interval(
  'crawl-news',
  { hours: 6 },
  internal.crawlers.crawlAndExtract
)
```

El cron job registra el evento pero NO ejecuta Playwright (que no puede correr en Convex). Para automatización completa, usa GitHub Actions:

### Con GitHub Actions (Recomendado)

Crea `.github/workflows/crawler.yml`:

```yaml
name: Run News Crawler

on:
  schedule:
    # Ejecutar cada 6 horas
    - cron: '0 */6 * * *'
  workflow_dispatch: # Permite ejecutar manualmente

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd packages/crawler
          npm install

      - name: Install Playwright browsers
        run: |
          cd packages/crawler
          npx playwright install --with-deps chromium

      - name: Run crawler
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          CONVEX_URL: ${{ secrets.CONVEX_URL }}
        run: |
          cd packages/crawler
          npm run crawl:all
```

**Configurar secretos en GitHub:**
1. Ve a Settings > Secrets and variables > Actions
2. Agrega:
   - `OPENAI_API_KEY`: Tu API key de OpenAI
   - `CONVEX_URL`: Tu URL de Convex (de .env.local)

## 💰 Costos Estimados

### OpenAI GPT-5 mini
- **Precio:** ~$0.00015 por 1K tokens de entrada
- **Artículo promedio:** ~2K tokens
- **Claim extraction:** ~$0.0003 por artículo

**Ejemplo:**
- 20 artículos scraped cada 6 horas
- 4 ejecuciones al día = 80 artículos/día
- Costo: 80 × $0.0003 = **$0.024/día** = **~$0.70/mes**

### Playwright (Gratis)
- GitHub Actions: 2,000 minutos/mes gratis
- Cada crawl: ~2-3 minutos
- 4 crawls/día × 30 días = 120 crawls = ~360 minutos/mes
- ✅ **100% dentro del tier gratuito**

## 🔧 Configuración Avanzada

### Agregar Nuevas Fuentes

Edita o crea un nuevo crawler en `packages/crawler/src/crawlers/`:

```typescript
// packages/crawler/src/crawlers/tu-medio.ts
import { chromium } from 'playwright'
import type { ScrapedArticle } from '../types/index.js'

export async function crawlTuMedio(): Promise<ScrapedArticle[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto('https://tumedio.com')

  // Extrae artículos...
  const articles = []

  await browser.close()
  return articles
}
```

Luego agrégalo a `src/index.ts`:

```typescript
import { crawlTuMedio } from './crawlers/tu-medio.js'

// En la función main()
const tuMedioArticles = await crawlTuMedio()
articles = [...articles, ...tuMedioArticles]
```

### Personalizar Extracción de Claims

Edita el prompt en `packages/crawler/src/processors/claim-extractor.ts`:

```typescript
const EXTRACTION_PROMPT = `Eres un experto analista...`
```

## 🐛 Troubleshooting

### Error: "CONVEX_URL no está configurado"
```bash
# Verifica que .env.local existe
cat .env.local

# Debe contener:
NEXT_PUBLIC_CONVEX_URL=https://tu-deployment.convex.cloud
```

### Error: "OpenAI API key inválido"
```bash
# Verifica tu API key en:
# https://platform.openai.com/api-keys

# Actualiza .env.local
OPENAI_API_KEY=sk-proj-tu-nueva-key
```

### Playwright no encuentra el browser
```bash
# Instala browsers de Playwright
cd packages/crawler
npx playwright install chromium
```

### Claims no aparecen en el admin
1. Verifica que Convex esté corriendo: `npm run dev`
2. Revisa logs del crawler: busca mensajes de "✅ Claim creado"
3. Verifica en Convex dashboard: https://dashboard.convex.dev

## 📚 Referencias

- [Documentación de Playwright](https://playwright.dev)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [GitHub Actions](https://docs.github.com/actions)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs completos del crawler
2. Verifica que todas las dependencias están instaladas
3. Confirma que las API keys son válidas
4. Revisa los issues en el repositorio

---

**Última actualización:** Diciembre 2025
