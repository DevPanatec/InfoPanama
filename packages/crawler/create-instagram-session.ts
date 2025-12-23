/**
 * Script para crear una sesión persistente en Browserbase
 * y hacer login manual en Instagram
 *
 * USO:
 * 1. npm run create-session
 * 2. El script abrirá Instagram en Browserbase
 * 3. Inicia sesión manualmente cuando se abra
 * 4. El script guardará el Session ID en .env
 */

import { chromium } from 'playwright-core'
import { config } from 'dotenv'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

config()

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID

async function createInstagramSession() {
  console.log('🔐 CREANDO SESIÓN PERSISTENTE DE INSTAGRAM')
  console.log('═'.repeat(60))
  console.log()

  if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
    console.error('❌ ERROR: Falta configuración de Browserbase en .env')
    console.error('   BROWSERBASE_API_KEY y BROWSERBASE_PROJECT_ID son requeridos')
    process.exit(1)
  }

  try {
    // Paso 1: Crear sesión usando la API de Browserbase
    console.log('📋 Paso 1: Creando sesión persistente en Browserbase...')

    const createSessionResponse = await fetch('https://www.browserbase.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BB-API-Key': BROWSERBASE_API_KEY,
      },
      body: JSON.stringify({
        projectId: BROWSERBASE_PROJECT_ID,
        keepAlive: true, // Sesión persistente
        timeout: 3600, // 1 hora de timeout (en segundos)
      }),
    })

    if (!createSessionResponse.ok) {
      const error = await createSessionResponse.text()
      throw new Error(`Error creando sesión: ${createSessionResponse.status} - ${error}`)
    }

    const session = await createSessionResponse.json()
    const sessionId = session.id

    console.log(`   ✅ Sesión creada: ${sessionId}`)
    console.log()

    // Obtener el Debug Connection URL para Chrome DevTools
    const debugUrl = `https://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&sessionId=${sessionId}`

    console.log('═'.repeat(60))
    console.log('👤 ACCIÓN REQUERIDA - CONECTAR TU CHROME LOCAL:')
    console.log('═'.repeat(60))
    console.log()
    console.log('Sigue estos pasos para hacer login en Instagram:')
    console.log()
    console.log('1. Abre Google Chrome en tu computadora')
    console.log()
    console.log('2. En la barra de direcciones, pega esto:')
    console.log('   chrome://inspect/#devices')
    console.log()
    console.log('3. Haz clic en "Configure..." junto a "Discover network targets"')
    console.log()
    console.log('4. Agrega esta URL:')
    console.log(`   ${debugUrl}`)
    console.log()
    console.log('5. Deberías ver "Browserbase Session" aparecer en la lista')
    console.log()
    console.log('6. Haz clic en "inspect" debajo de "Browserbase Session"')
    console.log()
    console.log('7. Se abrirá DevTools - haz clic en la pestaña que dice "Instagram"')
    console.log()
    console.log('8. Ahora SÍ podrás interactuar con la página')
    console.log()
    console.log('9. Haz login en Instagram y navega a @focopanama')
    console.log()
    console.log('10. Una vez que veas los posts, vuelve aquí y presiona ENTER')
    console.log()
    console.log('═'.repeat(60))
    console.log()

    // Paso 2: Conectar a la sesión con Playwright para abrir Instagram
    const browser = await chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&projectId=${BROWSERBASE_PROJECT_ID}&sessionId=${sessionId}`
    )

    const context = browser.contexts()[0]
    const page = await context.newPage()

    // Abrir Instagram
    await page.goto('https://www.instagram.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    console.log('✅ Instagram abierto en Browserbase')
    console.log('   Ahora sigue los pasos arriba para conectar tu Chrome local')
    console.log()

    // Esperar input del usuario
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve()
      })
    })

    // Verificar que el login funcionó
    console.log()
    console.log('📋 Verificando autenticación...')

    await page.goto('https://www.instagram.com/focopanama/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    await page.waitForTimeout(3000)

    const postsFound = await page.evaluate(() => {
      const postLinks = document.querySelectorAll('a[href*="/p/"]')
      return postLinks.length
    })

    console.log(`   📊 Posts encontrados: ${postsFound}`)

    if (postsFound > 0) {
      console.log('   ✅ Autenticación exitosa!')
    } else {
      console.log('   ⚠️  No se encontraron posts. Puede que necesites iniciar sesión.')
    }
    console.log()

    await browser.close()

    // Paso 6: Guardar Session ID en .env
    console.log('📋 Paso 5: Guardando Session ID en .env...')

    const envPath = join(process.cwd(), '.env')
    let envContent = readFileSync(envPath, 'utf-8')

    // Remover línea anterior de BROWSERBASE_SESSION_ID si existe
    envContent = envContent.replace(/BROWSERBASE_SESSION_ID=.*/g, '')

    // Agregar nueva línea
    envContent = envContent.trim() + '\n\n# Sesión persistente de Instagram (creada automáticamente)\n'
    envContent += `BROWSERBASE_SESSION_ID=${sessionId}\n`

    writeFileSync(envPath, envContent)

    console.log(`   ✅ Session ID guardado en .env`)
    console.log()

    // Resumen final
    console.log('═'.repeat(60))
    console.log('🎉 SESIÓN CREADA EXITOSAMENTE')
    console.log('═'.repeat(60))
    console.log()
    console.log(`📝 Session ID: ${sessionId}`)
    console.log()
    console.log('Próximos pasos:')
    console.log('1. Ejecuta: npm run crawl:foco')
    console.log('2. El crawler usará automáticamente la sesión autenticada')
    console.log('3. Deberías ver posts con imágenes de @focopanama')
    console.log()
    console.log('💡 Nota: La sesión permanecerá activa. No necesitas repetir este proceso.')
    console.log()

  } catch (error) {
    console.error()
    console.error('❌ ERROR:', error)
    console.error()
    console.error('Si el error es sobre permisos de API:')
    console.error('  1. Verifica que tu API key sea correcta')
    console.error('  2. Verifica que tu plan de Browserbase permita sesiones persistentes')
    console.error()
    process.exit(1)
  }
}

createInstagramSession()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
