/**
 * Crawler para La Prensa (https://www.prensa.com/)
 * Extrae artículos de noticias para verificación OSINT
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '../types/index.js'

const BASE_URL = 'https://www.prensa.com'
const SECTIONS = [
  '/politica',
  '/economia',
  '/sociedad',
  '/nacionales',
]

export async function crawlLaPrensa(): Promise<ScrapedArticle[]> {
  console.log('🔍 Iniciando crawler de La Prensa...')

  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const articles: ScrapedArticle[] = []

  try {
    // Crawlear cada sección
    for (const section of SECTIONS) {
      console.log(`📰 Scrapeando sección: ${section}`)

      const page = await context.newPage()
      await page.goto(`${BASE_URL}${section}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Esperar a que carguen los artículos
      await page.waitForSelector('article, .article, .story', { timeout: 10000 }).catch(() => {
        console.log(`⚠️ No se encontraron artículos en ${section}`)
      })

      // Obtener el HTML
      const html = await page.content()
      const $ = cheerio.load(html)

      // Buscar enlaces de artículos
      const articleLinks: string[] = []
      $('a[href*="/noticias/"], a[href*="/notas/"]').each((_, elem) => {
        const href = $(elem).attr('href')
        if (href && !articleLinks.includes(href)) {
          const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
          articleLinks.push(fullUrl)
        }
      })

      console.log(`🔗 Encontrados ${articleLinks.length} artículos en ${section}`)

      // Scrapear cada artículo (máximo 5 por sección para no saturar)
      const linksToScrape = articleLinks.slice(0, 5)

      for (const link of linksToScrape) {
        try {
          const article = await scrapeArticle(context, link)
          if (article) {
            articles.push(article)
            console.log(`✅ Scraped: ${article.title.substring(0, 60)}...`)
          }
        } catch (error) {
          console.error(`❌ Error scraping ${link}:`, error)
        }

        // Rate limiting: esperar 2 segundos entre requests
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      await page.close()
    }
  } finally {
    await browser.close()
  }

  console.log(`\n🎉 Crawler completado: ${articles.length} artículos scrapeados`)
  return articles
}

async function scrapeArticle(context: any, url: string): Promise<ScrapedArticle | null> {
  const page = await context.newPage()

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    })

    // Esperar a que cargue el contenido
    await page.waitForSelector('h1, .article-title, .headline', { timeout: 5000 })

    const html = await page.content()
    const $ = cheerio.load(html)

    // Extraer título
    const title =
      $('h1').first().text().trim() ||
      $('.article-title').first().text().trim() ||
      $('.headline').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      ''

    if (!title) {
      return null
    }

    // Extraer contenido
    let content = ''

    // Intentar múltiples selectores comunes
    const contentSelectors = [
      'article .article-body',
      '.article-content',
      '.story-content',
      'article p',
      '.entry-content p',
    ]

    for (const selector of contentSelectors) {
      const paragraphs = $(selector)
      if (paragraphs.length > 0) {
        paragraphs.each((_, elem) => {
          content += $(elem).text().trim() + '\n\n'
        })
        break
      }
    }

    // Si no encontramos contenido con selectores, extraer todos los <p> del article
    if (!content) {
      $('p').each((_, elem) => {
        const text = $(elem).text().trim()
        if (text.length > 50) {
          // Filtrar párrafos muy cortos
          content += text + '\n\n'
        }
      })
    }

    // Extraer autor
    const author =
      $('.author').first().text().trim() ||
      $('.byline').first().text().trim() ||
      $('meta[name="author"]').attr('content') ||
      undefined

    // Extraer fecha
    const dateText =
      $('.publish-date').first().text().trim() ||
      $('time').first().attr('datetime') ||
      $('meta[property="article:published_time"]').attr('content') ||
      new Date().toISOString()

    const publishedDate = new Date(dateText)

    // Extraer imagen
    const imageUrl =
      $('.article-image img').first().attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      undefined

    // Extraer categoría de la URL o metadata
    let category = 'Nacionales'
    if (url.includes('/politica')) category = 'Política'
    else if (url.includes('/economia')) category = 'Economía'
    else if (url.includes('/sociedad')) category = 'Sociedad'

    return {
      title,
      url,
      content: content.trim(),
      author,
      publishedDate,
      imageUrl,
      source: 'La Prensa',
      category,
    }
  } catch (error) {
    console.error(`Error scraping article ${url}:`, error)
    return null
  } finally {
    await page.close()
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlLaPrensa()
    .then((articles) => {
      console.log('\n📊 Resumen:')
      console.log(`Total de artículos: ${articles.length}`)
      console.log('\nPrimeros 3 artículos:')
      articles.slice(0, 3).forEach((article, i) => {
        console.log(`\n${i + 1}. ${article.title}`)
        console.log(`   URL: ${article.url}`)
        console.log(`   Categoría: ${article.category}`)
        console.log(`   Contenido: ${article.content.substring(0, 150)}...`)
      })
    })
    .catch(console.error)
}
