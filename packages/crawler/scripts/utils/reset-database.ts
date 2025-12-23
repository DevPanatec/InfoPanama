import { config } from 'dotenv'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@infopanama/convex'

// Cargar variables de entorno
config()

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  console.error('❌ CONVEX_URL no está definida en .env')
  process.exit(1)
}

const client = new ConvexHttpClient(convexUrl)

async function resetDatabase() {
  console.log('🧹 RESET COMPLETO DE BASE DE DATOS\n')
  console.log('⚠️  Esta operación eliminará:')
  console.log('   - TODOS los claims')
  console.log('   - TODOS los artículos')
  console.log('   - NO eliminará: sources, actors, entities, relations\n')

  // Contar elementos actuales
  const claims = await client.query(api.claims.list, { limit: 1000 })
  const articles = await client.query(api.articles.list, { limit: 1000 })

  console.log(`📊 Estado actual:`)
  console.log(`   Claims: ${claims.length}`)
  console.log(`   Artículos: ${articles.length}`)

  // Confirmación
  console.log(`\n⏳ Eliminando en 5 segundos... (Ctrl+C para cancelar)`)
  await new Promise((resolve) => setTimeout(resolve, 5000))

  console.log('\n🗑️  Eliminando claims...')
  const claimsResult = await client.mutation(api.claims.deleteAll, {})
  console.log(`   ✅ ${claimsResult.deleted} claims eliminados`)

  console.log('\n🗑️  Eliminando artículos...')
  const articlesResult = await client.mutation(api.articles.deleteAll, {})
  console.log(`   ✅ ${articlesResult.deleted} artículos eliminados`)

  console.log('\n✅ Base de datos limpiada!')
  console.log('\n📝 Próximos pasos:')
  console.log('   1. Configurar filtros del crawler (src/config/sources.ts)')
  console.log('   2. Ejecutar: npm run crawl:all')
  console.log('   3. Los nuevos artículos solo incluirán fact-checks e investigaciones')
}

resetDatabase()
  .then(() => {
    console.log('\n🎉 Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
