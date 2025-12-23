import 'dotenv/config'
import { chromium } from 'playwright-core'

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DE BROWSERBASE\n')
  console.log('='.repeat(60))

  // 1. Verificar credenciales
  console.log('\n📋 1. VERIFICACIÓN DE CREDENCIALES')
  console.log(`   API Key: ${BROWSERBASE_API_KEY ? '✅ ' + BROWSERBASE_API_KEY.substring(0, 20) + '...' : '❌ No configurado'}`)
  console.log(`   Project ID: ${BROWSERBASE_PROJECT_ID ? '✅ ' + BROWSERBASE_PROJECT_ID : '❌ No configurado'}`)

  if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
    console.log('\n❌ Credenciales faltantes. Configura BROWSERBASE_API_KEY y BROWSERBASE_PROJECT_ID en .env')
    process.exit(1)
  }

  // 2. Verificar URL de conexión
  const connectionUrl = `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&projectId=${BROWSERBASE_PROJECT_ID}`
  console.log('\n🔗 2. URL DE CONEXIÓN')
  console.log(`   ${connectionUrl.substring(0, 80)}...`)

  // 3. Intentar conectar
  console.log('\n🔌 3. INTENTANDO CONEXIÓN A BROWSERBASE')
  console.log('   Esto puede tomar 10-30 segundos...')

  try {
    console.log('   → Conectando via CDP...')
    const browser = await chromium.connectOverCDP(connectionUrl)
    console.log('   ✅ Conexión establecida exitosamente!')

    console.log('\n📊 4. INFORMACIÓN DEL NAVEGADOR')
    const contexts = browser.contexts()
    console.log(`   Contextos disponibles: ${contexts.length}`)

    const context = contexts[0]
    console.log('   ✅ Contexto obtenido')

    console.log('\n🌐 5. PRUEBA DE NAVEGACIÓN')
    const page = await context.newPage()
    console.log('   ✅ Página creada')

    console.log('   → Navegando a https://example.com...')
    await page.goto('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    console.log('   ✅ Navegación exitosa!')

    const title = await page.title()
    console.log(`   Título de la página: "${title}"`)

    await page.close()
    await browser.close()

    console.log('\n' + '='.repeat(60))
    console.log('✅ DIAGNÓSTICO COMPLETO: BROWSERBASE FUNCIONA CORRECTAMENTE')
    console.log('='.repeat(60))
    console.log('\n💡 Browserbase está funcionando. Puedes usar el crawler de Instagram.')

  } catch (error: any) {
    console.log('\n' + '='.repeat(60))
    console.log('❌ ERROR EN LA CONEXIÓN')
    console.log('='.repeat(60))
    console.log(`\nError: ${error.message}\n`)

    if (error.message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
      console.log('🔍 POSIBLES CAUSAS:')
      console.log('   1. ⏳ El pago de Browserbase aún no está procesado completamente')
      console.log('   2. 🔑 Las credenciales son incorrectas')
      console.log('   3. 🚫 La cuenta fue suspendida o no tiene plan activo')
      console.log('   4. 🌐 Problema de red o firewall bloqueando WebSocket')
      console.log('\n💡 SOLUCIONES:')
      console.log('   1. Espera 5-10 minutos si el pago es reciente')
      console.log('   2. Verifica en https://www.browserbase.com/dashboard')
      console.log('   3. Revisa que el plan Hobby ($20/mes) esté activo')
      console.log('   4. Contacta soporte: support@browserbase.com')
    }

    console.log('\n📧 Si el problema persiste, envía este diagnóstico a soporte.')
    process.exit(1)
  }
}

diagnose()
