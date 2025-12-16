/**
 * Crawler para Crítica (https://www.critica.com.pa/)
 * Extrae artículos de noticias para verificación OSINT
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '../types/index.js'

const BASE_URL = 'https://www.critica.com.pa'
const SECTIONS = [
  '/politica',
  '/economia',
  '/nacional',
  '/provincias',
]

export async function crawlCritica(): Promise<ScrapedArticle[]> {
  console.log('🔍 Iniciando crawler de Crítica...')

  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const articles: ScrapedArticle[] = []

  try {
    for (const section of SECTIONS) {
      console.log(`📰 Scrapeando sección: ${section}`)

      const page = await context.newPage()

      try {
        await page.goto(`${BASE_URL}${section}`, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        })

        await page.waitForTimeout(3000)

        const html = await page.content()
        const $ = cheerio.load(html)

        const articleLinks: string[] = []

        // Crítica usa Drupal, buscar enlaces de artículos
        $('a[href*="/"]').each((_, elem) => {
          const href = $(elem).attr('href')
          if (href && !articleLinks.includes(href)) {
            // Filtrar solo URLs de artículos válidas
            if (
              (href.includes(section) ||
               href.includes('/content/') ||
               href.includes('/noticias/')) &&
              !href.includes('#') &&
              !href.includes('javascript:') &&
              !href.includes('mailto:') &&
              href.length > 20
            ) {
              const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
              if (fullUrl.startsWith(BASE_URL)) {
                articleLinks.push(fullUrl)
              }
            }
          }
        })

        console.log(`🔗 Encontrados ${articleLinks.length} artículos en ${section}`)

        // Scrapear máximo 5 artículos por sección
        const linksToScrape = articleLinks.slice(0, 5)

        for (const link of linksToScrape) {
          try {
            const article = await scrapeArticle(context, link)
            if (article) {
              articles.push(article)
              console.log(`✅ Scraped: ${article.title.substring(0, 60)}...`)
            }
          } catch (error) {
            console.error(`Error scraping article ${link}:`, error)
          }

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        await page.close()
      } catch (error) {
        console.error(`❌ Error en sección ${section}:`, error)
        await page.close()
      }
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

    await page.waitForSelector('h1, .field--name-title, .page-title', { timeout: 5000 })

    const html = await page.content()
    const $ = cheerio.load(html)

    // Extraer título (Drupal patterns)
    let title =
      $('h1.field--name-title').first().text().trim() ||
      $('h1.page-title').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim()

    title = title.replace(/\s+/g, ' ').trim()

    if (!title || title.length < 10) {
      console.log(`⚠️  Título inválido para ${url}`)
      return null
    }

    // Extraer contenido
    let content = ''

    const contentSelectors = [
      '.field--name-body',
      '.node__content',
      '.field--type-text-with-summary',
      'article .content',
      '.article-content',
    ]

    for (const selector of contentSelectors) {
      const elem = $(selector)
      if (elem.length > 0) {
        elem.find('script, style, iframe, .advertisement, .ads').remove()
        content = elem.text().trim()
        if (content.length > 100) break
      }
    }

    if (!content || content.length < 100) {
      content = $('article p, .content p')
        .map((_, el) => $(el).text().trim())
        .get()
        .join('\n\n')
    }

    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()

    if (!content || content.length < 100) {
      console.log(`⚠️  Contenido muy corto para ${url}`)
      return null
    }

    // Extraer autor
    const author =
      $('.field--name-uid').text().trim() ||
      $('.author').text().trim() ||
      $('meta[name="author"]').attr('content') ||
      'Crítica'

    // Extraer fecha
    let publishedDate: Date
    const dateStr =
      $('meta[property="article:published_time"]').attr('content') ||
      $('.field--name-post-date').text().trim() ||
      $('time').attr('datetime') ||
      $('.date').text().trim()

    if (dateStr) {
      publishedDate = new Date(dateStr)
      if (isNaN(publishedDate.getTime())) {
        publishedDate = new Date()
      }
    } else {
      publishedDate = new Date()
    }

    // Determinar categoría desde la URL
    let category = 'General'
    if (url.includes('/politica')) category = 'política'
    else if (url.includes('/economia')) category = 'economía'
    else if (url.includes('/nacional')) category = 'nacional'
    else if (url.includes('/provincias')) category = 'provincias'

    await page.close()

    return {
      title,
      url,
      content,
      source: 'Crítica',
      author,
      publishedDate,
      category,
      scrapedAt: new Date(),
    }
  } catch (error) {
    await page.close()
    throw error
  }
}
