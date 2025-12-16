import 'dotenv/config'

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''

async function checkSessions() {
  console.log('🔍 Checking Browserbase sessions...\n')

  try {
    // List all sessions via API
    const response = await fetch(`https://www.browserbase.com/v1/sessions`, {
      method: 'GET',
      headers: {
        'x-bb-api-key': BROWSERBASE_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.log(text)
      return
    }

    const data = await response.json()
    console.log('📊 Sessions:', JSON.stringify(data, null, 2))

  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`)
  }
}

checkSessions()
