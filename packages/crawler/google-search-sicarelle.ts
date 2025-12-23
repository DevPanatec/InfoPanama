/**
 * Buscar noticias de Sicarelle usando Google
 */

import 'dotenv/config'
import { chromium } from 'playwright'

async function searchGoogle() {
  console.log('🔍 Buscando "Sicarelle" en medios panameños...\n')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    const queries = [
      'site:prensa.com "sicarelle"',
      'site:tvn-2.com "sicarelle"',
      'site:telemetro.com "sicarelle"',
      'site:panamaamerica.com.pa "sicarelle"',
      '"sicarelle" Panamá 2024 OR 2025'
    ]

    const allResults: { url: string; title: string }[] = []

    for (const query of queries) {
      console.log(`\n📍 Query: ${query}`)

      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })

      await page.waitForTimeout(2000)

      const results = await page.evaluate(() => {
        const links: { url: string; title: string }[] = []

        document.querySelectorAll('a').forEach(el => {
          const anchor = el as HTMLAnchorElement
          let url = anchor.href

          // Limpiar URL de Google
          if (url.includes('google.com/url?q=')) {
            try {
              const urlParams = new URLSearchParams(url.split('?')[1])
              url = urlParams.get('q') || url
            } catch (e) {}
          }

          const title = el.textContent?.trim() || ''

          // Filtrar solo URLs de medios panameños
          const validDomains = ['prensa.com', 'tvn-2.com', 'telemetro.com', 'panamaamerica.com']
          const isValid = validDomains.some(domain => url.includes(domain))

          if (isValid && title && !links.find(l => l.url === url) &&
              !url.includes('/search') && !url.includes('google.com')) {
            links.push({ url, title })
          }
        })

        return links
      })

      if (results.length > 0) {
        console.log(`   ✅ Encontrados ${results.length} resultados:`)
        results.forEach((r, i) => {
          if (!allResults.find(ar => ar.url === r.url)) {
            allResults.push(r)
            console.log(`   ${allResults.length}. ${r.title.substring(0, 80)}`)
            console.log(`      ${r.url}\n`)
          }
        })
      } else {
        console.log(`   ❌ No se encontraron resultados`)
      }

      await page.waitForTimeout(2000)
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ TOTAL URLs ÚNICAS ENCONTRADAS: ${allResults.length}`)
    console.log(`${'='.repeat(60)}\n`)

    if (allResults.length > 0) {
      console.log('📋 LISTA DE URLs PARA SCRAPEAR:\n')
      allResults.forEach((r, i) => {
        console.log(`${i + 1}. ${r.url}`)
      })
    }

  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`)
  } finally {
    await browser.close()
  }
}

searchGoogle()
