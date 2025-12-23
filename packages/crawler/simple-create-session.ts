/**
 * Script SIMPLE para crear sesión persistente en Browserbase
 * Solo crea la sesión y te da el ID para agregarlo al .env
 */

import { config } from 'dotenv'

config()

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID

async function createSession() {
  console.log('🔐 Creando sesión persistente en Browserbase...\n')

  if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
    console.error('❌ ERROR: Falta configuración de Browserbase en .env')
    process.exit(1)
  }

  try {
    const response = await fetch('https://www.browserbase.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BB-API-Key': BROWSERBASE_API_KEY,
      },
      body: JSON.stringify({
        projectId: BROWSERBASE_PROJECT_ID,
        keepAlive: true,
        timeout: 3600, // 1 hora
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error: ${response.status} - ${error}`)
    }

    const session = await response.json()

    console.log('✅ Sesión creada exitosamente!\n')
    console.log('📋 Session ID:', session.id)
    console.log('\n' + '═'.repeat(60))
    console.log('PRÓXIMOS PASOS:')
    console.log('═'.repeat(60))
    console.log('\n1. Abre tu archivo packages/crawler/.env')
    console.log('\n2. Agrega esta línea al final:')
    console.log(`\nBROWSERBASE_SESSION_ID=${session.id}`)
    console.log('\n3. Guarda el archivo')
    console.log('\n4. Ejecuta: npm run crawl:foco')
    console.log('\n')

  } catch (error) {
    console.error('\n❌ ERROR:', error)
    process.exit(1)
  }
}

createSession()
