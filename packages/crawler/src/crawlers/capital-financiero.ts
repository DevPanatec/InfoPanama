/**
 * Crawler para El Capital Financiero (https://elcapitalfinanciero.com/)
 * Extrae artículos de noticias económicas y financieras para verificación OSINT
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '../types'

const BASE_URL = 'https://elcapitalfinanciero.com'
const SECTIONS = [
  '/economia',
  '/finanzas',
  '/negocios',
  '/politica',
]

export async function crawlCapitalFinanciero(): Promise<ScrapedArticle[]> {
  console.log('🔍 Iniciando crawler de El Capital Financiero...')

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

        $('a[href]').each((_, elem) => {
          const href = $(elem).attr('href')
          if (href && !articleLinks.includes(href)) {
            if (
              (href.includes(section) ||
               href.includes('/articulo/') ||
               href.includes('/noticia/')) &&
              !href.includes('#') &&
              !href.includes('javascript:') &&
              !href.includes('mailto:') &&
              href.length > 20
            ) {
              const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
              if (fullUrl.includes('elcapitalfinanciero.com')) {
                articleLinks.push(fullUrl)
              }
            }
          }
        })

        console.log(`🔗 Encontrados ${articleLinks.length} artículos en ${section}`)

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

    await page.waitForSelector('h1, .entry-title, .article-title', { timeout: 5000 })

    const html = await page.content()
    const $ = cheerio.load(html)

    // Extraer título
    let title =
      $('h1.entry-title').first().text().trim() ||
      $('h1.article-title').first().text().trim() ||
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
      '.entry-content',
      '.article-content',
      '.post-content',
      'article .content',
      '.single-content',
    ]

    for (const selector of contentSelectors) {
      const elem = $(selector)
      if (elem.length > 0) {
        elem.find('script, style, iframe, .advertisement, .ads, .social-share').remove()
        content = elem.text().trim()
        if (content.length > 100) break
      }
    }

    if (!content || content.length < 100) {
      content = $('article p, .content p, .entry p')
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
      $('.author-name').text().trim() ||
      $('.by-author').text().trim() ||
      $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').text().trim() ||
      'El Capital Financiero'

    // Extraer fecha
    let publishedDate: Date
    const dateStr =
      $('meta[property="article:published_time"]').attr('content') ||
      $('time').attr('datetime') ||
      $('.entry-date').text().trim() ||
      $('.published-date').text().trim()

    if (dateStr) {
      publishedDate = new Date(dateStr)
      if (isNaN(publishedDate.getTime())) {
        publishedDate = new Date()
      }
    } else {
      publishedDate = new Date()
    }

    // Determinar categoría desde la URL
    let category = 'Economía' // Por defecto economía
    if (url.includes('/finanzas')) category = 'finanzas'
    else if (url.includes('/negocios')) category = 'negocios'
    else if (url.includes('/politica')) category = 'política'

    await page.close()

    // Extraer imagen
    const imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('article img').first().attr('src') ||
      $('.featured-image img').attr('src')

    const finalImageUrl = imageUrl?.startsWith('http')
      ? imageUrl
      : imageUrl
      ? `${BASE_URL}${imageUrl}`
      : undefined

    return {
      title,
      url,
      sourceUrl: url,
      sourceName: 'El Capital Financiero',
      sourceType: 'news_website' as const,
      content,
      author,
      publishedDate: publishedDate.toISOString(),
      category,
      scrapedAt: new Date().toISOString(),
      imageUrl: finalImageUrl,
    }
  } catch (error) {
    await page.close()
    throw error
  }
}
