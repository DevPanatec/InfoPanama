# 🔍 ROADMAP: Implementación OSINT Completa

## Estado Actual: ⚠️ OSINT Pasivo (Solo Prompts)

Actualmente la IA **NO** tiene acceso a información en tiempo real. Solo usa:
- ✅ Conocimiento entrenado (hasta enero 2025)
- ✅ Prompts que le indican CÓMO verificar
- ✅ Metodología profesional de fact-checking

**Limitación crítica**: La IA no puede verificar claims sobre eventos recientes o datos actualizados.

---

## 🎯 Fase 1: Web Search Integration (CRÍTICO)

### Opción A: Perplexity API (Recomendado)
```typescript
// packages/convex/convex/lib/perplexity.ts
import { Perplexity } from '@perplexity-ai/sdk'

export async function searchWithPerplexity(query: string) {
  const perplexity = new Perplexity(process.env.PERPLEXITY_API_KEY)

  const response = await perplexity.chat.completions.create({
    model: 'sonar', // Modelo con búsqueda web real-time
    messages: [{
      role: 'user',
      content: `Busca información verificable sobre: ${query}.
                Prioriza fuentes oficiales panameñas (.gob.pa, contraloría, INEC).`
    }],
    return_citations: true,
    search_domain_filter: ['gob.pa'], // Filtrar dominios oficiales
  })

  return {
    answer: response.choices[0].message.content,
    citations: response.citations,
  }
}
```

**Ventajas**:
- ✅ Búsqueda + LLM en una llamada
- ✅ Retorna citas con URLs verificables
- ✅ Modelo optimizado para fact-checking
- ✅ ~$5/1M tokens (económico)

**Integración**:
```typescript
// En verification.ts
const searchResults = await searchWithPerplexity(
  `Verificar: "${claim.claimText}" en fuentes oficiales de Panamá`
)

// Agregar resultados al prompt de GPT-5 mini
const enhancedPrompt = `
${userPrompt}

## RESULTADOS DE BÚSQUEDA OSINT:
${searchResults.answer}

Fuentes consultadas:
${searchResults.citations.map(c => `- ${c.url}`).join('\n')}
`
```

### Opción B: Tavily AI (Alternativa)
- API especializada en búsqueda para agentes de IA
- Filtra contenido, extrae información relevante
- ~$0.002 por búsqueda

### Opción C: Exa.ai (Mejor para búsqueda semántica)
- Búsqueda neural, no solo keywords
- Ideal para encontrar artículos similares
- ~$1.50/1000 búsquedas

---

## 🎯 Fase 2: Crawlers de Fuentes Oficiales

### A. Crawler de Gaceta Oficial
```typescript
// packages/crawler/src/crawlers/gaceta-oficial.ts
import { chromium } from 'playwright'

export async function crawlGacetaOficial() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('https://www.gacetaoficial.gob.pa/')

  // Extraer últimas publicaciones
  const publications = await page.$$eval('.publication-item', items =>
    items.map(item => ({
      title: item.querySelector('h3')?.textContent,
      date: item.querySelector('.date')?.textContent,
      url: item.querySelector('a')?.href,
      pdf: item.querySelector('.pdf-link')?.href,
    }))
  )

  // Guardar en Convex
  for (const pub of publications) {
    await ctx.runMutation(api.articles.create, {
      title: pub.title,
      url: pub.url,
      sourceId: gacetaOficialSourceId,
      sourceType: 'official_source',
      publishedDate: parseDate(pub.date),
    })
  }

  await browser.close()
}
```

### B. Crawler de Contraloría General
```typescript
// Scraping de reportes financieros, auditorías, estadísticas
// URL: https://www.contraloria.gob.pa/
```

### C. Crawler de INEC
```typescript
// Datos estadísticos oficiales
// URL: https://www.inec.gob.pa/
```

### D. Crawler de Asamblea Nacional
```typescript
// Leyes, proyectos, votaciones
// URL: https://www.asamblea.gob.pa/
```

### E. Medios de Comunicación
```typescript
// La Prensa: https://www.prensa.com/
// TVN: https://www.tvn-2.com/
// Telemetro: https://www.telemetro.com/
```

**Arquitectura**:
```
packages/crawler/
├── src/
│   ├── crawlers/
│   │   ├── gaceta-oficial.ts
│   │   ├── contraloria.ts
│   │   ├── inec.ts
│   │   ├── asamblea.ts
│   │   └── media/
│   │       ├── la-prensa.ts
│   │       ├── tvn.ts
│   │       └── telemetro.ts
│   ├── schedulers/
│   │   └── cron.ts           # Programación de crawls
│   ├── processors/
│   │   ├── text-extractor.ts
│   │   ├── pdf-parser.ts
│   │   └── claim-extractor.ts
│   └── storage/
│       └── snapshot.ts       # Guardar snapshots en DO Spaces
```

---

## 🎯 Fase 3: Vector Database + RAG

### A. Setup Qdrant (Vector DB)
```typescript
// packages/convex/convex/lib/qdrant.ts
import { QdrantClient } from '@qdrant/js-client-rest'
import OpenAI from 'openai'

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
})

export async function indexArticle(article: Article) {
  const openai = new OpenAI()

  // Generar embedding
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: article.content,
  })

  // Guardar en Qdrant
  await qdrant.upsert('articles', {
    points: [{
      id: article._id,
      vector: embedding.data[0].embedding,
      payload: {
        title: article.title,
        url: article.url,
        sourceId: article.sourceId,
        publishedDate: article.publishedDate,
      }
    }]
  })
}

export async function searchSimilarArticles(claimText: string, limit = 5) {
  const openai = new OpenAI()

  // Embedding del claim
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: claimText,
  })

  // Búsqueda semántica
  const results = await qdrant.search('articles', {
    vector: embedding.data[0].embedding,
    limit,
    with_payload: true,
  })

  return results
}
```

### B. RAG en Verificación
```typescript
// En verification.ts
export const verifyClaim = action({
  handler: async (ctx, args) => {
    // 1. Búsqueda semántica de artículos relacionados
    const similarArticles = await searchSimilarArticles(claim.claimText)

    // 2. Búsqueda web con Perplexity
    const webResults = await searchWithPerplexity(claim.claimText)

    // 3. Construir contexto enriquecido
    const contextPrompt = `
## CONTEXTO DE NUESTRA BASE DE DATOS:
${similarArticles.map(a => `
Fuente: ${a.payload.title}
URL: ${a.payload.url}
Fecha: ${a.payload.publishedDate}
Relevancia: ${(a.score * 100).toFixed(0)}%
`).join('\n')}

## RESULTADOS DE BÚSQUEDA WEB:
${webResults.answer}
Fuentes: ${webResults.citations.map(c => c.url).join(', ')}
`

    // 4. Enviar a GPT-5 mini con OSINT completo
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt + contextPrompt }
      ],
      response_format: { type: 'json_object' },
    })

    // ...
  }
})
```

---

## 🎯 Fase 4: Snapshot System (Evidencia Inmutable)

### A. Capturar Snapshots con Playwright
```typescript
// packages/crawler/src/storage/snapshot.ts
import { chromium } from 'playwright'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function createSnapshot(url: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'networkidle' })

  // Capturar múltiples formatos
  const [html, pdf, screenshot] = await Promise.all([
    page.content(),
    page.pdf({ format: 'A4' }),
    page.screenshot({ fullPage: true }),
  ])

  // Subir a Digital Ocean Spaces
  const s3 = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
    }
  })

  const timestamp = Date.now()
  const baseKey = `snapshots/${timestamp}`

  await Promise.all([
    s3.send(new PutObjectCommand({
      Bucket: 'infopanama-snapshots',
      Key: `${baseKey}.html`,
      Body: html,
      ContentType: 'text/html',
    })),
    s3.send(new PutObjectCommand({
      Bucket: 'infopanama-snapshots',
      Key: `${baseKey}.pdf`,
      Body: pdf,
      ContentType: 'application/pdf',
    })),
    s3.send(new PutObjectCommand({
      Bucket: 'infopanama-snapshots',
      Key: `${baseKey}.png`,
      Body: screenshot,
      ContentType: 'image/png',
    })),
  ])

  await browser.close()

  return {
    htmlPath: `${baseKey}.html`,
    pdfPath: `${baseKey}.pdf`,
    screenshotPath: `${baseKey}.png`,
    contentHash: hashContent(html),
  }
}
```

---

## 🎯 Fase 5: Automated Claim Extraction (NLP)

### Extraer Claims Automáticamente de Artículos
```typescript
// packages/convex/convex/nlp/claim-extraction.ts
export const extractClaims = action({
  handler: async (ctx, args) => {
    const article = await ctx.runQuery(api.articles.getById, { id: args.articleId })

    const openai = getOpenAIClient()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Modelo más potente para extracción
      messages: [{
        role: 'system',
        content: `Eres un experto en extraer afirmaciones verificables de artículos de noticias.

        Extrae SOLO afirmaciones que sean:
        1. Verificables objetivamente (con datos, fuentes)
        2. Relevantes para el contexto panameño
        3. Potencialmente impactantes (no trivialidades)
        4. De políticos, funcionarios o figuras públicas

        Formato JSON:
        {
          "claims": [
            {
              "text": "La afirmación exacta",
              "speaker": "Quién lo dijo",
              "context": "Contexto relevante",
              "category": "política|economía|salud|seguridad|infraestructura",
              "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
              "isVerifiable": boolean
            }
          ]
        }`
      }, {
        role: 'user',
        content: `Artículo:\nTítulo: ${article.title}\n\n${article.content}`
      }],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content)

    // Crear claims automáticamente
    for (const claim of result.claims) {
      if (claim.isVerifiable) {
        await ctx.runMutation(api.claims.create, {
          title: `${claim.speaker}: "${claim.text.substring(0, 50)}..."`,
          description: claim.context,
          claimText: claim.text,
          category: claim.category,
          sourceType: 'auto_extracted',
          sourceUrl: article.url,
          sourceId: article._id,
          riskLevel: claim.riskLevel,
        })
      }
    }
  }
})
```

---

## 📊 Arquitectura Final: OSINT Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - Dashboard de verificaciones                               │
│  - Vista de claims con evidencia                             │
│  - Explorador de fuentes                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Convex)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Verification System                                  │  │
│  │  - GPT-5 mini con prompts avanzados                  │  │
│  │  - Perplexity para web search                        │  │
│  │  - Qdrant para RAG                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CRAWLER SYSTEM                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Gaceta      │  │  Contraloría │  │  Medios      │     │
│  │  Oficial     │  │  General     │  │  Panameños   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Schedule: Cron jobs cada 1-6 horas                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Convex DB   │  │  Qdrant      │  │  DO Spaces   │     │
│  │  (Metadata)  │  │  (Vectors)   │  │  (Snapshots) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Costos Estimados (Mensual)

### Servicios Necesarios:
1. **Perplexity API**: ~$50-100/mes (según uso)
2. **Qdrant Cloud**: ~$25-50/mes (1M vectors)
3. **Digital Ocean Spaces**: ~$5-10/mes (250GB)
4. **OpenAI GPT-5 mini**: ~$100-200/mes (verificaciones)
5. **Playwright Cloud** (opcional): ~$50/mes

**Total estimado**: $230-410/mes para OSINT completo

---

## 🚀 Plan de Implementación Recomendado

### Semana 1-2: Web Search (CRÍTICO)
```bash
npm install @perplexity-ai/sdk
```
- Integrar Perplexity API
- Modificar verification.ts para incluir búsqueda web
- Probar con claims reales

### Semana 3-4: Crawlers Básicos
- Implementar crawler de Gaceta Oficial
- Implementar crawler de La Prensa
- Setup cron jobs con Convex scheduled functions

### Semana 5-6: Vector Database
- Setup Qdrant Cloud
- Implementar indexación de artículos
- RAG en sistema de verificación

### Semana 7-8: Snapshots + Refinamiento
- Implementar sistema de snapshots
- Setup Digital Ocean Spaces
- Testing completo y ajustes

---

## ¿Empezamos con la Fase 1 (Web Search)?

Es lo más impactante y rápido de implementar. Con Perplexity la IA podrá:
- ✅ Buscar en internet en tiempo real
- ✅ Acceder a fuentes oficiales actualizadas
- ✅ Verificar claims con información reciente
- ✅ Citar fuentes específicas

**¿Quieres que implemente Perplexity ahora?**
