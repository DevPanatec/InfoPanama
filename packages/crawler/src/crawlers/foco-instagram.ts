/**
 * Crawler para Instagram de Foco (@focopanama)
 * Extrae publicaciones públicas de Instagram
 *
 * CONFIGURACIÓN:
 * - Usa Browserbase (navegadores en la nube con anti-detección)
 * - Bypass automático de captchas y detección de bots
 * - IPs rotativas incluidas
 */

import { chromium } from 'playwright-core'
import type { ScrapedArticle } from '../types'

const INSTAGRAM_USERNAME = 'focopanama'
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`

// Configuración de Browserbase
const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''
const BROWSERBASE_SESSION_ID = process.env.BROWSERBASE_SESSION_ID || '' // Sesión persistente con login de Instagram

// 2Captcha como fallback (opcional)
const CAPTCHA_API_KEY = process.env.CAPTCHA_2CAPTCHA_KEY || ''

export async function crawlFocoInstagram(): Promise<ScrapedArticle[]> {
  console.log('📸 Iniciando crawler de Instagram (@focopanama)...')

  // Verificar si Browserbase está configurado
  if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
    console.log('⚠️  Browserbase no configurado. Instagram scraping requiere Browserbase.')
    console.log('   Configura BROWSERBASE_API_KEY y BROWSERBASE_PROJECT_ID en .env')
    return []
  }

  console.log('🔒 Usando Browserbase (anti-detección + IPs rotativas)')

  // Construir URL de conexión con sesión persistente si está disponible
  let connectionUrl = `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&projectId=${BROWSERBASE_PROJECT_ID}`

  if (BROWSERBASE_SESSION_ID) {
    connectionUrl += `&sessionId=${BROWSERBASE_SESSION_ID}`
    console.log('🔐 Usando sesión persistente autenticada')
  } else {
    console.log('⚠️  Sin sesión persistente - Instagram puede bloquear el acceso')
    console.log('   Agrega BROWSERBASE_SESSION_ID a .env para usar sesión autenticada')
  }

  // Conectar a Browserbase
  console.log('   → Conectando a Browserbase...')
  const browser = await chromium.connectOverCDP(connectionUrl)
  console.log('   ✅ Conexión establecida')

  const context = browser.contexts()[0]

  const articles: ScrapedArticle[] = []

  try {
    console.log('   → Creando nueva página...')
    const page = await context.newPage()
    console.log('   ✅ Página creada')

    // Pequeño delay para asegurar que la sesión está lista
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`🔍 Accediendo a ${INSTAGRAM_URL}...`)
    await page.goto(INSTAGRAM_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
    console.log('   ✅ Página cargada')

    // Esperar a que cargue el contenido
    await page.waitForTimeout(5000)

    // Cerrar modal de cookies/login si aparece
    try {
      const closeButton = page.locator('button:has-text("Not Now"), button:has-text("Ahora no")')
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.first().click()
      }
    } catch (e) {
      // Ignorar si no aparece el modal
    }

    // Instagram carga posts dinámicamente
    // Hacer scroll para cargar más posts
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(2000)
    }

    // Debug: guardar screenshot y HTML para ver qué está pasando
    console.log('📸 Tomando screenshot de diagnóstico...')
    await page.screenshot({ path: 'instagram-debug.png', fullPage: true })

    const htmlContent = await page.content()
    console.log(`📄 HTML length: ${htmlContent.length} characters`)

    // Buscar posts usando múltiples estrategias
    const postLinks = await page.evaluate(() => {
      const links: string[] = []

      // Estrategia 1: Buscar por href que contenga /p/
      document.querySelectorAll('a').forEach((anchor) => {
        const href = anchor.href
        if (href && href.includes('/p/') && href.includes('instagram.com')) {
          if (!links.includes(href)) {
            links.push(href)
          }
        }
      })

      // Estrategia 2: Buscar en el contenido de la página usando regex
      const matches = document.body.innerHTML.matchAll(/href="(\/p\/[^"]+)"/g)
      for (const match of matches) {
        const fullUrl = `https://www.instagram.com${match[1]}`
        if (!links.includes(fullUrl)) {
          links.push(fullUrl)
        }
      }

      return links
    })

    console.log(`📊 Encontrados ${postLinks.length} posts`)

    if (postLinks.length === 0) {
      console.log('\n⚠️  No se encontraron posts. Diagnóstico:')
      console.log('   - Screenshot guardado en: instagram-debug.png')
      console.log('   - Verifica el screenshot para ver si Instagram está bloqueando')
      console.log('   - Es posible que necesites sesión autenticada\n')
    }

    // Scrapear cada post (máximo 10 para no saturar)
    const linksToScrape = postLinks.slice(0, 10)

    for (const link of linksToScrape) {
      try {
        const article = await scrapeInstagramPost(context, link)
        if (article) {
          articles.push(article)
          console.log(`✅ Scraped IG post: ${article.title.substring(0, 60)}...`)
        }
      } catch (error) {
        console.error(`❌ Error scraping ${link}:`, error)
      }

      // Rate limiting: esperar 3 segundos entre requests
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    await page.close()
  } finally {
    await browser.close()
  }

  console.log(`\n🎉 Crawler de Instagram completado: ${articles.length} posts scrapeados`)
  return articles
}

async function scrapeInstagramPost(context: any, url: string): Promise<ScrapedArticle | null> {
  const page = await context.newPage()

  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await page.waitForTimeout(3000)

    // Cerrar modal de login si aparece
    try {
      const closeButton = page.locator('button:has-text("Not Now"), button:has-text("Ahora no")')
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.first().click()
      }
    } catch (e) {
      // Ignorar
    }

    // Extraer caption/texto del post
    let content = ''

    try {
      // Instagram usa diferentes selectores dependiendo del tipo de post
      const captionSelectors = [
        'h1', // Título del post (caption)
        '[class*="Caption"]',
        'span[class*="Caption"]',
        'div[class*="Caption"]',
      ]

      for (const selector of captionSelectors) {
        const elem = page.locator(selector).first()
        if (await elem.isVisible({ timeout: 2000 })) {
          content = await elem.textContent() || ''
          if (content.trim().length > 20) break
        }
      }

      // Si no encuentra caption, buscar en meta tags
      if (!content || content.length < 20) {
        content = await page.evaluate(() => {
          const metaDesc = document.querySelector('meta[property="og:description"]')
          return metaDesc?.getAttribute('content') || ''
        })
      }
    } catch (error) {
      console.log('⚠️  No se pudo extraer caption:', error)
    }

    // Limpiar contenido
    content = content
      .replace(/\s+/g, ' ')
      .replace(/#\w+/g, '') // Remover hashtags
      .replace(/@\w+/g, '') // Remover menciones
      .trim()

    if (!content || content.length < 20) {
      console.log(`⚠️  Caption muy corto para ${url}`)
      return null
    }

    // Crear título desde las primeras palabras del caption
    const title = content.substring(0, 100) + (content.length > 100 ? '...' : '')

    // Extraer fecha de publicación
    let publishedDate: Date
    try {
      const timeElement = page.locator('time[datetime]').first()
      const datetime = await timeElement.getAttribute('datetime')
      if (datetime) {
        publishedDate = new Date(datetime)
      } else {
        publishedDate = new Date()
      }
    } catch (error) {
      publishedDate = new Date()
    }

    // Extraer imágenes (opcional, para referencia)
    const images = await page.evaluate(() => {
      const imgs: string[] = []
      document.querySelectorAll('article img').forEach((img) => {
        const src = (img as HTMLImageElement).src
        if (src && !src.includes('profile')) {
          imgs.push(src)
        }
      })
      return imgs
    })

    await page.close()

    return {
      title: `Instagram (@focopanama): ${title}`,
      url,
      sourceUrl: url,
      sourceName: 'Foco',
      sourceType: 'social_media' as const,
      content: content + (images.length > 0 ? `\n\n[Contiene ${images.length} imagen(es)]` : ''),
      author: 'Foco Panama',
      publishedDate: publishedDate.toISOString(),
      scrapedAt: new Date().toISOString(),
      category: 'redes sociales',
      imageUrl: images.length > 0 ? images[0] : undefined,
    }
  } catch (error) {
    await page.close()
    throw error
  }
}
