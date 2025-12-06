/**
 * Crawler para Telemetro (https://www.telemetro.com/)
 * Extrae artículos de noticias para verificación OSINT
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '../types/index.js'

const BASE_URL = 'https://www.telemetro.com'
const SECTIONS = [
  '/nacionales',
  '/economia',
  '/deportes',
  '/internacionales',
]

export async function crawlTelemetro(): Promise<ScrapedArticle[]> {
  console.log('🔍 Iniciando crawler de Telemetro...')

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
      console.log(`📺 Scrapeando sección: ${section}`)

      const page = await context.newPage()
      await page.goto(`${BASE_URL}${section}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      })

      await page.waitForTimeout(3000)

      const html = await page.content()
      const $ = cheerio.load(html)

      const articleLinks: string[] = []
      $('a[href*="/nacionales/"], a[href*="/economia/"], a[href*="/deportes/"], a[href*="/internacionales/"]').each((_, elem) => {
        const href = $(elem).attr('href')
        if (href && !articleLinks.includes(href) && href.length > 20) {
          const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
          articleLinks.push(fullUrl)
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
          console.error(`❌ Error scraping ${link}:`, error)
        }

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

    await page.waitForSelector('h1, .title, .headline', { timeout: 5000 })

    const html = await page.content()
    const $ = cheerio.load(html)

    const title =
      $('h1').first().text().trim() ||
      $('.title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      ''

    if (!title) {
      return null
    }

    let content = ''
    const contentSelectors = [
      'article .content',
      '.article-body',
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

    if (!content) {
      $('p').each((_, elem) => {
        const text = $(elem).text().trim()
        if (text.length > 50) {
          content += text + '\n\n'
        }
      })
    }

    const author =
      $('.author').first().text().trim() ||
      $('.byline').first().text().trim() ||
      $('meta[name="author"]').attr('content') ||
      undefined

    const dateText =
      $('time').first().attr('datetime') ||
      $('.date').first().text().trim() ||
      $('meta[property="article:published_time"]').attr('content') ||
      new Date().toISOString()

    const publishedDate = new Date(dateText)

    const imageUrl =
      $('.article-image img').first().attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      undefined

    let category = 'Nacionales'
    if (url.includes('/economia')) category = 'Economía'
    else if (url.includes('/internacionales')) category = 'Internacionales'
    else if (url.includes('/deportes')) category = 'Deportes'

    return {
      title,
      url,
      content: content.trim(),
      author,
      publishedDate,
      imageUrl,
      source: 'Telemetro',
      category,
    }
  } catch (error) {
    console.error(`Error scraping article ${url}:`, error)
    return null
  } finally {
    await page.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlTelemetro()
    .then((articles) => {
      console.log('\n📊 Resumen:')
      console.log(`Total de artículos: ${articles.length}`)
    })
    .catch(console.error)
}
