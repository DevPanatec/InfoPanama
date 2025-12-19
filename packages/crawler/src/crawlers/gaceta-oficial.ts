/**
 * Crawler para Gaceta Oficial de Panamá
 * https://www.gacetaoficial.gob.pa/
 *
 * Extrae publicaciones oficiales del gobierno para verificación
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedArticle } from '../types/index.js'

const BASE_URL = 'https://www.gacetaoficial.gob.pa'

export async function crawlGacetaOficial(): Promise<ScrapedArticle[]> {
  console.log('🏛️  Iniciando crawler de Gaceta Oficial...')

  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const articles: ScrapedArticle[] = []

  try {
    const page = await context.newPage()

    // Ir a la página principal
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('📄 Página cargada, extrayendo publicaciones...')

    // Esperar a que cargue el contenido
    await page.waitForTimeout(2000)

    const html = await page.content()
    const $ = cheerio.load(html)

    // Buscar enlaces de publicaciones (esto dependerá de la estructura de la página)
    const publicationLinks: string[] = []

    // Intentar múltiples selectores comunes
    $(
      'a[href*="gaceta"], a[href*="publicacion"], a[href*=".pdf"], .publication-link, .gaceta-link'
    ).each((_, elem) => {
      const href = $(elem).attr('href')
      if (href && !publicationLinks.includes(href)) {
        const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
        publicationLinks.push(fullUrl)
      }
    })

    console.log(`🔗 Encontradas ${publicationLinks.length} publicaciones`)

    // Scrapear las primeras 10 publicaciones
    const linksToScrape = publicationLinks.slice(0, 10)

    for (const link of linksToScrape) {
      try {
        // Si es un PDF, solo guardamos la metadata
        if (link.endsWith('.pdf')) {
          articles.push({
            title: `Gaceta Oficial - ${link.split('/').pop()}`,
            url: link,
            sourceUrl: link,
            sourceName: 'Gaceta Oficial de Panamá',
            sourceType: 'official_document' as const,
            content: 'Documento PDF de la Gaceta Oficial de Panamá',
            scrapedAt: new Date().toISOString(),
            publishedDate: new Date().toISOString(),
            category: 'Oficial',
          })
          console.log(`📋 PDF registrado: ${link}`)
        } else {
          // Si es una página HTML, la scrapeamos
          const article = await scrapePublication(context, link)
          if (article) {
            articles.push(article)
            console.log(`✅ Scraped: ${article.title.substring(0, 60)}...`)
          }
        }
      } catch (error) {
        console.error(`❌ Error scraping ${link}:`, error)
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    await page.close()
  } finally {
    await browser.close()
  }

  console.log(`\n🎉 Crawler completado: ${articles.length} publicaciones extraídas`)
  return articles
}

async function scrapePublication(context: any, url: string): Promise<ScrapedArticle | null> {
  const page = await context.newPage()

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    })

    await page.waitForTimeout(1000)

    const html = await page.content()
    const $ = cheerio.load(html)

    // Extraer título
    const title =
      $('h1').first().text().trim() ||
      $('.title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      `Publicación - ${url.split('/').pop()}`

    // Extraer contenido
    let content = ''
    $('p, .content, article').each((_, elem) => {
      const text = $(elem).text().trim()
      if (text.length > 20) {
        content += text + '\n\n'
      }
    })

    // Extraer fecha
    const dateText =
      $('.date').first().text().trim() ||
      $('time').first().attr('datetime') ||
      $('meta[property="article:published_time"]').attr('content')

    const publishedDate = dateText ? new Date(dateText) : new Date()

    return {
      title,
      url,
      sourceUrl: url,
      sourceName: 'Gaceta Oficial de Panamá',
      sourceType: 'official_document' as const,
      content: content.trim() || 'Contenido de publicación oficial',
      scrapedAt: new Date().toISOString(),
      publishedDate: publishedDate.toISOString(),
      category: 'Oficial',
    }
  } catch (error) {
    console.error(`Error scraping publication ${url}:`, error)
    return null
  } finally {
    await page.close()
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlGacetaOficial()
    .then((articles) => {
      console.log('\n📊 Resumen:')
      console.log(`Total de publicaciones: ${articles.length}`)
      console.log('\nPrimeras 3 publicaciones:')
      articles.slice(0, 3).forEach((article, i) => {
        console.log(`\n${i + 1}. ${article.title}`)
        console.log(`   URL: ${article.url}`)
        console.log(`   Fuente: ${article.sourceName}`)
      })
    })
    .catch(console.error)
}
