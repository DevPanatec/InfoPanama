/**
 * Script de prueba para scraping de Foco Panamá (Instagram)
 *
 * Ejecutar:
 * npx tsx test-focopanama.ts
 */

import { crawlFocoPanama, crawlInstagramPost } from './src/crawlers/instagram-focopanama.js'

async function main() {
  console.log('🚀 Iniciando scraping de Foco Panamá (Instagram)...\n')

  // Verificar configuración
  if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID) {
    console.error('❌ ERROR: Falta configuración de Browserbase')
    console.log('\n📝 Agrega estas variables a tu .env:')
    console.log('BROWSERBASE_API_KEY=tu_api_key')
    console.log('BROWSERBASE_PROJECT_ID=tu_project_id')
    console.log('\n🔗 Consigue tus credenciales en: https://browserbase.com')
    process.exit(1)
  }

  console.log('✅ Browserbase configurado correctamente\n')

  // Opción 1: Scrapear múltiples posts de la página
  console.log('📋 OPCIÓN 1: Scrapeando últimos 5 posts de @focopanama\n')
  const articles = await crawlFocoPanama(5)

  if (articles.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('📊 RESUMEN DE POSTS EXTRAÍDOS')
    console.log('='.repeat(80))

    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`)
      console.log(`   📅 Fecha: ${new Date(article.publishedDate).toLocaleDateString('es-ES')}`)
      console.log(`   📝 Caracteres: ${article.content.length}`)
      console.log(`   🖼️  Imagen: ${article.imageUrl ? 'Sí' : 'No'}`)
      console.log(`   🔗 URL: ${article.url}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log(`✅ Total extraído: ${articles.length} artículos`)
    console.log('='.repeat(80))
  } else {
    console.log('\n❌ No se pudieron extraer artículos')
  }

  // Opción 2: Scrapear un post específico (descomenta para probar)
  /*
  console.log('\n\n📋 OPCIÓN 2: Scrapeando post específico\n')
  const singlePost = await crawlInstagramPost(
    'https://www.instagram.com/p/EJEMPLO123/'
  )

  if (singlePost) {
    console.log('\n✅ Post extraído:')
    console.log('   Título:', singlePost.title)
    console.log('   Contenido:', singlePost.content.substring(0, 200) + '...')
  }
  */

  console.log('\n\n✨ Scraping completado!')
}

main().catch(console.error)
