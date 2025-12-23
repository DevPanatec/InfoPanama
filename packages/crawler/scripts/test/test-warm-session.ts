import 'dotenv/config'
import { chromium } from 'playwright-core'

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''

async function test() {
  console.log('🧪 Testing with warm session (visit Google first)...\n')

  try {
    console.log('→ Creating session...')
    const response = await fetch('https://www.browserbase.com/v1/sessions', {
      method: 'POST',
      headers: {
        'x-bb-api-key': BROWSERBASE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: BROWSERBASE_PROJECT_ID
      })
    })

    const session = await response.json()
    console.log(`✅ Session: ${session.id}`)

    const browser = await chromium.connectOverCDP(session.connectUrl)
    const context = browser.contexts()[0]
    const page = await context.newPage()
    console.log(`✅ Browser ready`)

    // First visit Google
    console.log(`\n→ Warming up session with Google...`)
    await page.goto('https://www.google.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    console.log(`✅ Google loaded`)
    await page.waitForTimeout(2000)

    // Now try Instagram
    console.log(`\n→ Now trying Instagram...`)
    await page.goto('https://www.instagram.com/focopanama/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
    console.log(`✅ Instagram loaded!`)

    const title = await page.title()
    console.log(`   Title: "${title}"`)

    await browser.close()
    console.log('\n✅ SUCCESS!')

  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}`)
  }
}

test()
