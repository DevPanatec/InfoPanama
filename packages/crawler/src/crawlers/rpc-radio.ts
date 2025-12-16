/**
 * Crawler para RPC Radio (rpc.com.pa)
 * Medio de comunicación panameño de radio y noticias
 */

import { chromium } from 'playwright'
import type { ScrapedArticle } from '../types'

const BASE_URL = 'https://www.rpc.com.pa'

export async function crawlRPCRadio(): Promise<ScrapedArticle[]> {
  console.log('📻 Iniciando crawler de RPC Radio...')

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
    // Navegar a la sección de noticias
    console.log('📍 Navegando a RPC Radio...')
    await page.goto(`${BASE_URL}/noticias`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Esperar a que carguen las noticias
    await page.waitForSelector('article, .noticia, .card, .item-noticia', {
      timeout: 10000,
    })

    // Extraer artículos
    const articleElements = await page.locator('article, .noticia, .card, .item-noticia').all()

    console.log(`📊 Encontrados ${articleElements.length} artículos potenciales`)

    for (const article of articleElements.slice(0, 20)) {
      try {
        // Intentar extraer el enlace
        const linkElement = article.locator('a[href]').first()
        const href = await linkElement.getAttribute('href').catch(() => null)

        if (!href) continue

        const url = href.startsWith('http') ? href : `${BASE_URL}${href}`

        // Filtrar enlaces que no son artículos
        if (!url.includes('rpc.com.pa') || url.includes('#') || url.includes('javascript:')) {
          continue
        }

        // Extraer título
        const titleElement = article.locator('h1, h2, h3, h4, .titulo, .title').first()
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

        // Extraer descripción/extracto
        const descElement = article.locator('p, .descripcion, .excerpt, .resumen').first()
        const description = await descElement.textContent().catch(() => null)

        // Extraer fecha
        const dateElement = article.locator('time, .fecha, .date').first()
        const publishedDate = await dateElement.getAttribute('datetime').catch(() => {
          return dateElement.textContent().catch(() => null)
        })

        console.log(`✅ Noticia encontrada: ${title.substring(0, 60)}...`)

        articles.push({
          title: title.trim(),
          url,
          sourceUrl: url,
          sourceName: 'RPC Radio',
          sourceType: 'news_website' as const,
          content: description?.trim() || '',
          scrapedAt: new Date().toISOString(),
          publishedDate: publishedDate || new Date().toISOString(),
          imageUrl: finalImageUrl,
          author: undefined,
          category: undefined,
        })
      } catch (error) {
        console.log('⚠️  Error extrayendo noticia individual:', error)
        continue
      }
    }

    // Visitar cada artículo para extraer contenido completo
    console.log(`🔍 Extrayendo contenido de ${articles.length} noticias...`)

    for (let i = 0; i < articles.length; i++) {
      try {
        console.log(`�� Procesando noticia ${i + 1}/${articles.length}...`)

        await page.goto(articles[i].url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        })

        // Esperar el contenido
        await page
          .waitForSelector('.contenido, .content, article, .noticia-contenido', {
            timeout: 5000,
          })
          .catch(() => null)

        // Extraer contenido del artículo
        const contentElement = page.locator('.contenido, .content, .noticia-contenido, article p').first()
        const content = await contentElement.textContent().catch(() => {
          return page.locator('article p, .content p').allTextContents().then(texts => texts.join('\n'))
        })

        if (content && content.trim().length > articles[i].content.length) {
          articles[i].content = content.trim()
        }

        // Extraer autor
        const authorElement = page.locator('.autor, .author, .by-line, [rel="author"]').first()
        const author = await authorElement.textContent().catch(() => null)
        if (author) {
          articles[i].author = author.trim()
        }

        // Extraer categoría
        const categoryElement = page.locator('.categoria, .category, .seccion').first()
        const category = await categoryElement.textContent().catch(() => null)
        if (category) {
          articles[i].category = category.trim()
        }

        // Pequeña pausa
        await page.waitForTimeout(1000)
      } catch (error) {
        console.log(`⚠️  Error extrayendo contenido de noticia ${i + 1}:`, error)
        continue
      }
    }

    console.log(`✅ RPC Radio: ${articles.length} noticias extraídas exitosamente`)
  } catch (error) {
    console.error('❌ Error en crawler de RPC Radio:', error)
  } finally {
    await browser.close()
  }

  return articles.filter(article => article.content && article.content.length > 100)
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlRPCRadio()
    .then((articles) => {
      console.log('\n📊 Resumen:')
      console.log(`Total de noticias: ${articles.length}`)
      articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`)
        console.log(`   URL: ${article.url}`)
        console.log(`   Contenido: ${article.content.substring(0, 100)}...`)
      })
    })
    .catch(console.error)
}
