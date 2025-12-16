/**
 * Crawler para Foco (https://foco.com.pa/)
 * Extrae artículos de noticias para verificación OSINT
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '../types/index.js'

const BASE_URL = 'https://foco.com.pa'
const SECTIONS = [
  '/politica',
  '/economia',
  '/sociedad',
  '/nacional',
  '/noticias',
]

export async function crawlFoco(): Promise<ScrapedArticle[]> {
  console.log('🔍 Iniciando crawler de Foco...')

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

      try {
        await page.goto(`${BASE_URL}${section}`, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        })

        // Esperar a que cargue la página
        await page.waitForTimeout(3000)

        // Obtener el HTML
        const html = await page.content()
        const $ = cheerio.load(html)

        // Buscar enlaces de artículos
        const articleLinks: string[] = []

        // Foco usa diferentes patrones para artículos
        $('a[href]').each((_, elem) => {
          const href = $(elem).attr('href')
          if (href && !articleLinks.includes(href)) {
            // Solo incluir URLs que parezcan artículos
            if (
              (href.includes(section) || href.includes('/noticias/') || href.includes('/articulo/')) &&
              !href.includes('#') &&
              !href.includes('javascript:') &&
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

    // Esperar a que cargue el contenido
    await page.waitForSelector('h1, .entry-title, .article-title, .post-title', { timeout: 5000 })

    const html = await page.content()
    const $ = cheerio.load(html)

    // Extraer título (probar diferentes selectores)
    let title =
      $('h1.entry-title').first().text().trim() ||
      $('h1.article-title').first().text().trim() ||
      $('h1.post-title').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim()

    // Limpiar título
    title = title.replace(/\s+/g, ' ').trim()

    if (!title || title.length < 10) {
      console.log(`⚠️  Título inválido para ${url}`)
      return null
    }

    // Extraer contenido del artículo
    let content = ''

    // Probar diferentes selectores comunes de Foco/WordPress
    const contentSelectors = [
      '.entry-content',
      '.article-content',
      '.post-content',
      'article .content',
      '.single-content',
      'article',
    ]

    for (const selector of contentSelectors) {
      const elem = $(selector)
      if (elem.length > 0) {
        // Remover elementos no deseados
        elem.find('script, style, iframe, .advertisement, .ads, .social-share').remove()
        content = elem.text().trim()
        if (content.length > 100) break
      }
    }

    // Fallback: obtener todos los párrafos
    if (!content || content.length < 100) {
      content = $('article p, .content p, .entry p')
        .map((_, el) => $(el).text().trim())
        .get()
        .join('\n\n')
    }

    // Limpiar contenido
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
      $('.author').text().trim() ||
      $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').text().trim() ||
      'Foco'

    // Extraer fecha de publicación
    let publishedDate: Date
    const dateStr =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="publish-date"]').attr('content') ||
      $('.published-date').attr('datetime') ||
      $('.post-date').attr('datetime') ||
      $('.entry-date').text().trim()

    if (dateStr) {
      publishedDate = new Date(dateStr)
      if (isNaN(publishedDate.getTime())) {
        publishedDate = new Date()
      }
    } else {
      publishedDate = new Date()
    }

    // Determinar categoría desde la URL o metadatos
    let category = 'General'
    if (url.includes('/politica')) category = 'política'
    else if (url.includes('/economia')) category = 'economía'
    else if (url.includes('/sociedad')) category = 'sociedad'
    else if (url.includes('/nacional')) category = 'nacional'
    else {
      // Intentar desde meta tags
      const metaCategory = $('meta[property="article:section"]').attr('content')
      if (metaCategory) category = metaCategory.toLowerCase()
    }

    await page.close()

    return {
      title,
      url,
      content,
      source: 'Foco',
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
