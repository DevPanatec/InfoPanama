/**
 * Crawler para Metro Libre (metrolibre.com)
 * Medio de noticias panameño enfocado en noticias locales y nacionales
 */

import { chromium } from 'playwright'
import type { ScrapedArticle } from '../types'

const BASE_URL = 'https://www.metrolibre.com'

export async function crawlMetroLibre(): Promise<ScrapedArticle[]> {
  console.log('📰 Iniciando crawler de Metro Libre...')

  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await context.newPage()
  const articles: ScrapedArticle[] = []

  try {
    // Navegar a la portada
    console.log('📍 Navegando a Metro Libre...')
    await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Esperar a que carguen los artículos
    await page.waitForSelector('article, .post, .entry', {
      timeout: 10000,
    })

    // Extraer artículos de la portada
    const articleElements = await page.locator('article, .post, .entry').all()

    console.log(`📊 Encontrados ${articleElements.length} artículos potenciales`)

    for (const article of articleElements.slice(0, 20)) {
      try {
        // Intentar extraer el enlace del artículo
        const linkElement = article.locator('a[href*="metrolibre.com"]').first()
        const href = await linkElement.getAttribute('href').catch(() => null)

        if (!href) continue

        const url = href.startsWith('http') ? href : `${BASE_URL}${href}`

        // Extraer título
        const titleElement = article.locator('h1, h2, h3, .entry-title, .post-title').first()
        const title = await titleElement.textContent().catch(() => null)

        if (!title || title.trim().length < 10) continue

        // Extraer imagen
        const imgElement = article.locator('img').first()
        const imageUrl = await imgElement.getAttribute('src').catch(() => null)
        const finalImageUrl = imageUrl?.startsWith('http')
          ? imageUrl
          : imageUrl
          ? `${BASE_URL}${imageUrl}`
          : undefined

        // Extraer fecha
        const dateElement = article.locator('time, .date, .published').first()
        const publishedDate = await dateElement.getAttribute('datetime').catch(() => {
          return dateElement.textContent().catch(() => null)
        })

        console.log(`✅ Artículo encontrado: ${title.substring(0, 60)}...`)

        articles.push({
          title: title.trim(),
          url,
          sourceUrl: url,
          sourceName: 'Metro Libre',
          sourceType: 'news_website' as const,
          content: '', // Se llenará al visitar el artículo
          scrapedAt: new Date().toISOString(),
          publishedDate: publishedDate || new Date().toISOString(),
          imageUrl: finalImageUrl,
          author: undefined,
        })
      } catch (error) {
        console.log('⚠️  Error extrayendo artículo individual:', error)
        continue
      }
    }

    // Visitar cada artículo para extraer el contenido completo
    console.log(`🔍 Extrayendo contenido de ${articles.length} artículos...`)

    for (let i = 0; i < articles.length; i++) {
      try {
        console.log(`📄 Procesando artículo ${i + 1}/${articles.length}...`)

        await page.goto(articles[i].url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        })

        // Esperar el contenido
        await page
          .waitForSelector('.entry-content, .article-content, .post-content, article', {
            timeout: 5000,
          })
          .catch(() => null)

        // Extraer contenido del artículo
        const contentElement = page.locator('.entry-content, .article-content, .post-content').first()
        const content = await contentElement.textContent().catch(() => {
          return page.locator('article p').allTextContents().then(texts => texts.join('\n'))
        })

        if (content) {
          articles[i].content = content.trim()
        }

        // Extraer autor si está disponible
        const authorElement = page.locator('.author, .by-author, [rel="author"]').first()
        const author = await authorElement.textContent().catch(() => null)
        if (author) {
          articles[i].author = author.trim()
        }

        // Pequeña pausa para no sobrecargar el servidor
        await page.waitForTimeout(1000)
      } catch (error) {
        console.log(`⚠️  Error extrayendo contenido del artículo ${i + 1}:`, error)
        continue
      }
    }

    console.log(`✅ Metro Libre: ${articles.length} artículos extraídos exitosamente`)
  } catch (error) {
    console.error('❌ Error en crawler de Metro Libre:', error)
  } finally {
    await browser.close()
  }

  return articles.filter(article => article.content && article.content.length > 100)
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlMetroLibre()
    .then((articles) => {
      console.log('\n📊 Resumen:')
      console.log(`Total de artículos: ${articles.length}`)
      articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`)
        console.log(`   URL: ${article.url}`)
        console.log(`   Contenido: ${article.content.substring(0, 100)}...`)
      })
    })
    .catch(console.error)
}
