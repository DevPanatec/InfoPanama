/**
 * Crawler especializado para buscar noticias sobre "Hombres de Blanco"
 * Busca en múltiples fuentes panameñas
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

// Configuración de fuentes
const SEARCH_SOURCES = [
  {
    name: 'La Prensa',
    searchUrl: 'https://www.prensa.com/buscar/?q=hombres+de+blanco',
    slug: 'la-prensa'
  },
  {
    name: 'TVN',
    searchUrl: 'https://www.tvn-2.com/buscar?q=hombres+de+blanco',
    slug: 'tvn'
  },
  {
    name: 'Telemetro',
    searchUrl: 'https://www.telemetro.com/buscar?q=hombres+de+blanco',
    slug: 'telemetro'
  },
  {
    name: 'Panamá América',
    searchUrl: 'https://www.panamaamerica.com.pa/search/node/hombres%20de%20blanco',
    slug: 'panama-america'
  }
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

async function searchInLaPrensa(): Promise<Article[]> {
  console.log('\n🔍 Buscando en La Prensa...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const articles: Article[] = []

  try {
    await page.goto('https://www.prensa.com/buscar/?q=hombres+de+blanco', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    await page.waitForTimeout(2000)

    // Buscar enlaces de artículos
    const articleLinks = await page.evaluate(() => {
      const links: { url: string; title: string }[] = []

      // Buscar en diferentes selectores
      const selectors = [
        'article a[href*="/"]',
        '.article-card a',
        '.search-result a',
        'h2 a, h3 a'
      ]

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const anchor = el as HTMLAnchorElement
          const url = anchor.href
          const title = anchor.textContent?.trim() || ''

          if (url && title && url.includes('prensa.com') &&
              !url.includes('/buscar') && !links.find(l => l.url === url)) {
            links.push({ url, title })
          }
        })
      })

      return links.slice(0, 10) // Primeros 10 resultados
    })

    console.log(`   📰 Encontrados ${articleLinks.length} resultados`)

    // Scrapear cada artículo
    for (const link of articleLinks) {
      try {
        await page.goto(link.url, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForTimeout(1000)

        const articleData = await page.evaluate(() => {
          const title = document.querySelector('h1')?.textContent?.trim() || ''

          // Buscar contenido
          const contentSelectors = [
            '.article-body',
            '.entry-content',
            'article .content',
            '.story-body'
          ]

          let content = ''
          for (const selector of contentSelectors) {
            const el = document.querySelector(selector)
            if (el) {
              content = el.textContent?.trim() || ''
              break
            }
          }

          // Fecha
          const dateEl = document.querySelector('time') ||
                        document.querySelector('.date') ||
                        document.querySelector('[datetime]')
          const dateText = dateEl?.getAttribute('datetime') ||
                          dateEl?.textContent?.trim() || ''

          // Imagen
          const img = document.querySelector('article img') as HTMLImageElement
          const imageUrl = img?.src || ''

          // Autor
          const author = document.querySelector('.author')?.textContent?.trim() || ''

          return { title, content, dateText, imageUrl, author }
        })

        if (articleData.title && articleData.content) {
          const publishedDate = articleData.dateText
            ? new Date(articleData.dateText)
            : new Date()

          articles.push({
            title: articleData.title,
            url: link.url,
            sourceName: 'La Prensa',
            sourceUrl: link.url,
            sourceType: 'news_website',
            content: articleData.content,
            scrapedAt: new Date().toISOString(),
            publishedDate: publishedDate.toISOString(),
            imageUrl: articleData.imageUrl || undefined,
            author: articleData.author || undefined
          })

          console.log(`   ✅ ${articleData.title.substring(0, 60)}...`)
        }
      } catch (err) {
        console.log(`   ⚠️  Error scrapeando: ${link.url}`)
      }
    }

  } catch (error: any) {
    console.error(`   ❌ Error en búsqueda: ${error.message}`)
  } finally {
    await browser.close()
  }

  return articles
}

async function searchInTVN(): Promise<Article[]> {
  console.log('\n🔍 Buscando en TVN...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const articles: Article[] = []

  try {
    // Buscar directamente en Google site:tvn-2.com
    await page.goto('https://www.google.com/search?q=site:tvn-2.com+"hombres+de+blanco"', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    await page.waitForTimeout(2000)

    const links = await page.evaluate(() => {
      const results: { url: string; title: string }[] = []
      document.querySelectorAll('a[href*="tvn-2.com"]').forEach(el => {
        const anchor = el as HTMLAnchorElement
        let url = anchor.href

        // Limpiar URL de Google
        if (url.includes('google.com/url?q=')) {
          const urlParams = new URLSearchParams(url.split('?')[1])
          url = urlParams.get('q') || url
        }

        const title = el.textContent?.trim() || ''

        if (url.includes('tvn-2.com') && !url.includes('/search') &&
            !results.find(r => r.url === url)) {
          results.push({ url, title })
        }
      })
      return results.slice(0, 10)
    })

    console.log(`   📺 Encontrados ${links.length} resultados`)

    for (const link of links) {
      try {
        await page.goto(link.url, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForTimeout(1000)

        const articleData = await page.evaluate(() => {
          const title = document.querySelector('h1')?.textContent?.trim() || ''

          const contentEl = document.querySelector('.article-content') ||
                           document.querySelector('.entry-content') ||
                           document.querySelector('article')
          const content = contentEl?.textContent?.trim() || ''

          const dateEl = document.querySelector('time') ||
                        document.querySelector('.date')
          const dateText = dateEl?.getAttribute('datetime') ||
                          dateEl?.textContent?.trim() || ''

          const img = document.querySelector('article img') as HTMLImageElement
          const imageUrl = img?.src || ''

          return { title, content, dateText, imageUrl }
        })

        if (articleData.title && articleData.content) {
          articles.push({
            title: articleData.title,
            url: link.url,
            sourceName: 'TVN',
            sourceUrl: link.url,
            sourceType: 'news_website',
            content: articleData.content,
            scrapedAt: new Date().toISOString(),
            publishedDate: articleData.dateText
              ? new Date(articleData.dateText).toISOString()
              : new Date().toISOString(),
            imageUrl: articleData.imageUrl || undefined
          })

          console.log(`   ✅ ${articleData.title.substring(0, 60)}...`)
        }
      } catch (err) {
        console.log(`   ⚠️  Error scrapeando: ${link.url}`)
      }
    }

  } catch (error: any) {
    console.error(`   ❌ Error en búsqueda: ${error.message}`)
  } finally {
    await browser.close()
  }

  return articles
}

// Helper functions (igual que en index.ts)
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

IMPORTANTE: Solo extrae declaraciones sobre HOMBRES DE BLANCO (sector médico/salud en Panamá).`
        },
        {
          role: 'user',
          content: articleText
        }
      ],
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{"claims":[]}')
    return result.claims || []
  } catch (error: any) {
    console.error(`   ❌ Error extrayendo claims: ${error.message}`)
    return []
  }
}

async function main() {
  console.log('🔍 BÚSQUEDA ESPECIALIZADA: HOMBRES DE BLANCO')
  console.log('='.repeat(60))

  const allArticles: Article[] = []

  // Buscar en La Prensa
  const laPrensaArticles = await searchInLaPrensa()
  allArticles.push(...laPrensaArticles)

  // Buscar en TVN
  const tvnArticles = await searchInTVN()
  allArticles.push(...tvnArticles)

  console.log(`\n📊 Total artículos encontrados: ${allArticles.length}`)

  if (allArticles.length === 0) {
    console.log('❌ No se encontraron artículos sobre "Hombres de Blanco"')
    return
  }

  // Guardar artículos y extraer claims
  console.log('\n💾 GUARDANDO ARTÍCULOS Y EXTRAYENDO CLAIMS')
  console.log('='.repeat(60))

  let totalClaims = 0

  for (const article of allArticles) {
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
        topics: ['Hombres de Blanco', 'Salud']
      })

      console.log(`   ✅ Artículo guardado`)

      // Extraer claims
      const claims = await extractClaimsWithAI(
        `${article.title}\n\n${article.content.substring(0, 3000)}`
      )

      console.log(`   🔍 Encontrados ${claims.length} claims`)

      for (const claim of claims) {
        await createClaim({
          title: `${claim.speaker ? claim.speaker + ': ' : ''}"${claim.text.substring(0, 80)}..."`,
          description: claim.context,
          claimText: claim.text,
          category: claim.category,
          tags: ['Hombres de Blanco', 'Salud', article.sourceName],
          riskLevel: claim.riskLevel,
          sourceType: 'auto_extracted',
          sourceUrl: article.url,
          imageUrl: article.imageUrl,
          isPublic: true,
          isFeatured: claim.riskLevel === 'HIGH' || claim.riskLevel === 'CRITICAL',
          autoPublished: true,
          status: 'published',
        })

        totalClaims++
        console.log(`   ✅ Claim guardado: "${claim.text.substring(0, 50)}..."`)
      }

    } catch (error: any) {
      console.error(`   ❌ Error procesando artículo: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ COMPLETADO`)
  console.log(`   📰 Artículos procesados: ${allArticles.length}`)
  console.log(`   📢 Claims guardados: ${totalClaims}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
