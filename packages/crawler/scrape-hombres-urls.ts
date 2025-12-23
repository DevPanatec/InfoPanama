/**
 * Scrapear URLs específicas sobre Hombres de Blanco
 */

import 'dotenv/config'
import { chromium } from 'playwright'
import { ConvexHttpClient } from 'convex/browser'
import OpenAI from 'openai'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// URLs encontradas sobre Hombres de Blanco
const URLS = [
  'https://www.prensa.com/unidad-investigativa/hombres-de-blanco-cerca-de-obtener-65-millones-del-municipio-de-panama/',
  'https://www.prensa.com/sociedad/minsa-defiende-contratacion-directa-de-hombres-de-blanco-para-limpieza-de-hospitales/',
  'https://www.telemetro.com/nacionales/minsa-reitera-limpieza-hospitales-pese-contrato-refrendo-contraloria-n6047318',
  'https://www.panamaamerica.com.pa/politica/irregularidades-marcan-licitacion-en-tocumen-sa-1123943',
  'https://www.panamaamerica.com.pa/sociedad/se-destapa-escandalo-en-licitacion-de-limpieza-de-tocumen-sa-1123906'
]

interface Article {
  title: string
  url: string
  sourceName: string
  sourceUrl: string
  sourceType: 'news_website'
  content: string
  scrapedAt: string
  publishedDate: string
  imageUrl?: string
  author?: string
}

// Helper functions
async function createClaim(data: any) {
  return await convex.mutation('claims:create' as any, data)
}

async function createArticle(data: any) {
  return await convex.mutation('articles:create' as any, data)
}

async function createSource(data: any) {
  return await convex.mutation('sources:create' as any, data)
}

async function getSourceBySlug(slug: string) {
  return await convex.query('sources:getBySlug' as any, { slug })
}

function generateContentHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

const SOURCE_CONFIG: Record<string, any> = {
  'La Prensa': {
    slug: 'la-prensa',
    name: 'La Prensa',
    url: 'https://www.prensa.com',
    type: 'media',
  },
  'TVN': {
    slug: 'tvn',
    name: 'TVN',
    url: 'https://www.tvn-2.com',
    type: 'media',
  },
  'Telemetro': {
    slug: 'telemetro',
    name: 'Telemetro',
    url: 'https://www.telemetro.com',
    type: 'media',
  },
  'Panamá América': {
    slug: 'panama-america',
    name: 'Panamá América',
    url: 'https://www.panamaamerica.com.pa',
    type: 'media',
  }
}

async function getOrCreateSource(sourceName: string) {
  const config = SOURCE_CONFIG[sourceName]
  if (!config) {
    throw new Error(`Source configuration not found for: ${sourceName}`)
  }

  let source = await getSourceBySlug(config.slug)

  if (!source) {
    console.log(`   📝 Creando nueva fuente: ${config.name}`)
    const sourceId = await createSource({
      slug: config.slug,
      name: config.name,
      url: config.url,
      type: config.type,
      verifiedSource: true,
    })
    source = { _id: sourceId, name: config.name }
  }

  return source
}

async function extractClaimsWithAI(articleText: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en fact-checking. Extrae declaraciones verificables del artículo.

Devuelve un JSON con este formato:
{
  "claims": [
    {
      "text": "declaración exacta",
      "speaker": "nombre del declarante",
      "context": "contexto de la declaración",
      "category": "categoría",
      "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
      "isVerifiable": true/false,
      "confidence": 0-1
    }
  ]
}

ENFÓCATE EN: Contratos, licitaciones, irregularidades, declaraciones de funcionarios sobre Hombres de Blanco Corp.`
        },
        {
          role: 'user',
          content: articleText
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const result = JSON.parse(response.choices[0].message.content || '{"claims":[]}')
    return result.claims || []
  } catch (error: any) {
    console.error(`   ❌ Error extrayendo claims: ${error.message}`)
    return []
  }
}

async function scrapeArticle(url: string): Promise<Article | null> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log(`\n📄 Scrapeando: ${url}`)

    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2000)

    const articleData = await page.evaluate(() => {
      const title = document.querySelector('h1')?.textContent?.trim() || ''

      // Buscar contenido en diferentes selectores
      const contentSelectors = [
        '.article-body',
        '.entry-content',
        'article .content',
        '.story-body',
        '.body-content',
        '[itemprop="articleBody"]'
      ]

      let content = ''
      for (const selector of contentSelectors) {
        const el = document.querySelector(selector)
        if (el) {
          content = el.textContent?.trim() || ''
          if (content.length > 100) break
        }
      }

      // Si no se encontró, intentar con <article> o main
      if (!content) {
        const article = document.querySelector('article') || document.querySelector('main')
        content = article?.textContent?.trim() || ''
      }

      // Fecha
      const dateEl = document.querySelector('time') ||
                    document.querySelector('.date') ||
                    document.querySelector('[datetime]') ||
                    document.querySelector('.publish-date')
      const dateText = dateEl?.getAttribute('datetime') ||
                      dateEl?.textContent?.trim() || ''

      // Imagen
      const img = (document.querySelector('article img') ||
                  document.querySelector('.featured-image img') ||
                  document.querySelector('meta[property="og:image"]')) as HTMLImageElement | HTMLMetaElement

      const imageUrl = img instanceof HTMLImageElement
        ? img.src
        : img?.getAttribute('content') || ''

      // Autor
      const author = (document.querySelector('.author') ||
                     document.querySelector('[rel="author"]') ||
                     document.querySelector('[itemprop="author"]'))?.textContent?.trim() || ''

      return { title, content, dateText, imageUrl, author }
    })

    if (!articleData.title || articleData.content.length < 100) {
      console.log(`   ⚠️  No se pudo extraer contenido completo`)
      await browser.close()
      return null
    }

    // Determinar fuente
    let sourceName = 'Desconocido'
    if (url.includes('prensa.com')) sourceName = 'La Prensa'
    else if (url.includes('tvn-2.com')) sourceName = 'TVN'
    else if (url.includes('telemetro.com')) sourceName = 'Telemetro'
    else if (url.includes('panamaamerica.com')) sourceName = 'Panamá América'

    const publishedDate = articleData.dateText
      ? new Date(articleData.dateText)
      : new Date()

    if (isNaN(publishedDate.getTime())) {
      publishedDate.setTime(Date.now())
    }

    await browser.close()

    console.log(`   ✅ Título: ${articleData.title.substring(0, 70)}...`)
    console.log(`   📝 Contenido: ${articleData.content.length} caracteres`)

    return {
      title: articleData.title,
      url: url,
      sourceName: sourceName,
      sourceUrl: url,
      sourceType: 'news_website',
      content: articleData.content,
      scrapedAt: new Date().toISOString(),
      publishedDate: publishedDate.toISOString(),
      imageUrl: articleData.imageUrl || undefined,
      author: articleData.author || undefined
    }

  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`)
    await browser.close()
    return null
  }
}

async function main() {
  console.log('🔍 SCRAPEANDO NOTICIAS SOBRE HOMBRES DE BLANCO')
  console.log('='.repeat(60))
  console.log(`📰 Total URLs: ${URLS.length}\n`)

  const articles: Article[] = []

  for (const url of URLS) {
    const article = await scrapeArticle(url)
    if (article) {
      articles.push(article)
    }
    await new Promise(resolve => setTimeout(resolve, 1000)) // Delay entre requests
  }

  console.log(`\n📊 Artículos scrapeados exitosamente: ${articles.length}/${URLS.length}`)

  if (articles.length === 0) {
    console.log('❌ No se pudo scrapear ningún artículo')
    return
  }

  // Guardar en Convex
  console.log('\n💾 GUARDANDO EN CONVEX')
  console.log('='.repeat(60))

  let totalClaims = 0

  for (const article of articles) {
    try {
      const source = await getOrCreateSource(article.sourceName)
      const contentHash = generateContentHash(article.content)

      console.log(`\n📄 ${article.title.substring(0, 60)}...`)

      const articleId = await createArticle({
        title: article.title,
        url: article.url,
        content: article.content,
        htmlContent: article.content,
        contentHash: contentHash,
        sourceId: source._id,
        publishedDate: new Date(article.publishedDate).getTime(),
        author: article.author || undefined,
        topics: ['Hombres de Blanco', 'Salud', 'Licitaciones']
      })

      console.log(`   ✅ Artículo guardado`)

      // Extraer claims
      const claims = await extractClaimsWithAI(
        `${article.title}\n\n${article.content}`
      )

      console.log(`   🔍 Encontrados ${claims.length} claims`)

      for (const claim of claims) {
        await createClaim({
          title: `${claim.speaker ? claim.speaker + ': ' : ''}"${claim.text.substring(0, 80)}..."`,
          description: claim.context,
          claimText: claim.text,
          category: claim.category || 'Salud',
          tags: ['Hombres de Blanco', 'Salud', 'Licitaciones', article.sourceName],
          riskLevel: claim.riskLevel || 'MEDIUM',
          sourceType: 'auto_extracted',
          sourceUrl: article.url,
          imageUrl: article.imageUrl,
          isPublic: true,
          isFeatured: claim.riskLevel === 'HIGH' || claim.riskLevel === 'CRITICAL',
          autoPublished: true,
          status: 'published',
        })

        totalClaims++
        console.log(`   ✅ "${claim.text.substring(0, 60)}..."`)
      }

    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ COMPLETADO`)
  console.log(`   📰 Artículos procesados: ${articles.length}`)
  console.log(`   📢 Claims guardados: ${totalClaims}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
