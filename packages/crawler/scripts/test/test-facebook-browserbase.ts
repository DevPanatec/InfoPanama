/**
 * Script de prueba para scraping de Facebook con Browserbase
 *
 * Ejecutar:
 * npx tsx test-facebook-browserbase.ts
 */

import { crawlFacebookPost } from './src/crawlers/facebook-single-post.js'

async function main() {
  console.log('🚀 Iniciando prueba de scraping con Browserbase...\n')

  // Verificar configuración
  if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID) {
    console.error('❌ ERROR: Falta configuración de Browserbase')
    console.log('\n📝 Agrega estas variables a tu .env:')
    console.log('BROWSERBASE_API_KEY=tu_api_key')
    console.log('BROWSERBASE_PROJECT_ID=tu_project_id')
    console.log('\n🔗 Consigue tus credenciales en: https://browserbase.com')
    process.exit(1)
  }

  console.log('✅ Browserbase configurado correctamente')
  console.log(`   API Key: ${process.env.BROWSERBASE_API_KEY?.substring(0, 10)}...`)
  console.log(`   Project: ${process.env.BROWSERBASE_PROJECT_ID}\n`)

  // URL de ejemplo (La Prensa)
  const testUrls = [
    'https://www.facebook.com/prensacom/posts/pfbid02VNzrRh4fB8qZm8RLH7Qwf5Xy3mJ9K',
    // Agrega más URLs de prueba aquí
  ]

  console.log(`📋 URLs a probar: ${testUrls.length}\n`)

  for (const url of testUrls) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`Probando: ${url}`)
    console.log('='.repeat(80))

    const result = await crawlFacebookPost(url)

    if (result) {
      console.log('\n✅ ÉXITO!\n')
      console.log('📄 Título:', result.title)
      console.log('👤 Autor:', result.author)
      console.log('📅 Fecha:', result.publishedDate)
      console.log('📝 Contenido:', result.content.substring(0, 200) + '...')
      console.log('🖼️  Imagen:', result.imageUrl ? 'Sí' : 'No')
      console.log('📊 Tamaño:', result.content.length, 'caracteres')
    } else {
      console.log('\n❌ No se pudo extraer el post\n')
    }
  }

  console.log('\n\n✨ Prueba completada!')
}

main().catch(console.error)
