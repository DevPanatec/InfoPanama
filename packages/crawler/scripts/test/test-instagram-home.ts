import 'dotenv/config'
import { chromium } from 'playwright-core'

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''

async function test() {
  console.log('🧪 Testing Instagram homepage (not profile)...\n')

  try {
    console.log('→ Conectando a Browserbase...')
    const browser = await chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&projectId=${BROWSERBASE_PROJECT_ID}`
    )
    console.log('✅ Conexión establecida')

    const context = browser.contexts()[0]
    const page = await context.newPage()
    console.log('✅ Página creada')

    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('\n→ Navegando a Instagram homepage...')
    await page.goto('https://www.instagram.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
    console.log('✅ Instagram homepage cargada!')

    const title = await page.title()
    console.log(`   Título: "${title}"`)

    await page.close()
    await browser.close()

    console.log('\n✅ SUCCESS')

  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}`)
  }
}

test()
