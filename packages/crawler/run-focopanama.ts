/**
 * Script simple para scrapear Foco Panamá
 *
 * Ejecutar:
 * npx tsx run-focopanama.ts
 */

import 'dotenv/config'
import { crawlFocoInstagram } from './src/crawlers/foco-instagram.js'
import { crawlFocoInstagramPublic } from './src/crawlers/foco-instagram-public.js'

async function main() {
  console.log('═'.repeat(80))
  console.log('🚀 SCRAPING DE FOCO PANAMÁ (@focopanama)')
  console.log('═'.repeat(80))
  console.log()

  console.log('📋 Método: API Pública de Instagram (sin autenticación)')
  console.log('   Más rápido y confiable que Browserbase\n')

  console.log('⏳ Scrapeando Instagram de Foco Panamá...\n')

  const startTime = Date.now()
  const articles = await crawlFocoInstagramPublic()
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log()
  console.log('═'.repeat(80))
  console.log('📊 RESULTADOS')
  console.log('═'.repeat(80))

  if (articles.length > 0) {
    articles.forEach((article, index) => {
      console.log()
      console.log(`${index + 1}. ${article.title}`)
      console.log(`   📅 Fecha: ${new Date(article.publishedDate).toLocaleDateString('es-ES')}`)
      console.log(`   📝 Caracteres: ${article.content.length}`)
      console.log(`   🖼️  Imagen: ${article.imageUrl ? 'Sí' : 'No'}`)
      console.log(`   🔗 ${article.url}`)
    })

    console.log()
    console.log('═'.repeat(80))
    console.log(`✅ Éxito: ${articles.length} posts extraídos en ${duration}s`)
    console.log('═'.repeat(80))
    console.log()
    console.log('💡 Próximos pasos:')
    console.log('   1. Estos posts ya están listos para guardarse en Convex')
    console.log('   2. Ejecuta el crawler principal para procesarlos automáticamente')
    console.log('   3. O guárdalos manualmente con el script de Convex\n')

  } else {
    console.log()
    console.log('❌ No se extrajeron posts')
    console.log()
    console.log('💡 Posibles causas:')
    console.log('   - Instagram bloqueó el acceso temporalmente')
    console.log('   - Los selectores HTML cambiaron')
    console.log('   - Problema de red/timeout')
    console.log()
    console.log('🔧 Soluciones:')
    console.log('   1. Espera 5-10 minutos y vuelve a intentar')
    console.log('   2. Revisa los logs arriba para más detalles')
    console.log('   3. Verifica tu configuración de Browserbase\n')
  }
}

main().catch((error) => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})
