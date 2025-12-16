import 'dotenv/config'
import { chromium } from 'playwright-core'

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''

async function test() {
  console.log('🧪 Testing Browserbase via REST API + CDP...\n')

  try {
    // 1. Create a session via REST API
    console.log('→ Creating session via REST API...')
    const response = await fetch('https://www.browserbase.com/v1/sessions', {
      method: 'POST',
      headers: {
        'x-bb-api-key': BROWSERBASE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: BROWSERBASE_PROJECT_ID,
        browserSettings: {
          viewport: {
            width: 1280,
            height: 720
          }
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status} ${await response.text()}`)
    }

    const session = await response.json()
    console.log(`✅ Session created: ${session.id}`)

    // 2. Connect to the session
    console.log(`→ Connecting to session...`)
    const browser = await chromium.connectOverCDP(session.connectUrl)
    console.log(`✅ Connected to browser`)

    const context = browser.contexts()[0]
    const page = await context.newPage()
    console.log(`✅ Page created`)

    // 3. Navigate to Instagram
    console.log(`→ Navigating to Instagram...`)
    await page.goto('https://www.instagram.com/focopanama/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
    console.log(`✅ Instagram loaded!`)

    const title = await page.title()
    console.log(`   Title: "${title}"`)

    await page.close()
    await browser.close()

    console.log('\n✅ SUCCESS: Instagram scraping works via Browserbase API!')

  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}`)
  }
}

test()
