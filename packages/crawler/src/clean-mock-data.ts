/**
 * Script para limpiar datos mock del grafo
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado en .env')
}

const client = new ConvexHttpClient(CONVEX_URL)

async function cleanMockData() {
  console.log('🧹 Limpiando datos mock del grafo...\n')

  try {
    // Eliminar todos los actores
    console.log('🗑️  Eliminando actores mock...')
    const actorsResult = await client.mutation('actors:deleteAll' as any)
    console.log(`   ✅ ${actorsResult.deleted} actores eliminados`)

    // Eliminar todas las relaciones
    console.log('🗑️  Eliminando relaciones mock...')
    const relationsResult = await client.mutation(
      'entityRelations:deleteAll' as any
    )
    console.log(`   ✅ ${relationsResult.deleted} relaciones eliminadas`)

    console.log('\n✅ Datos mock eliminados exitosamente')
    console.log('\n💡 Próximos pasos:')
    console.log('1. Ve a http://localhost:3000/admin/dashboard/media-graph')
    console.log('2. Haz clic en "Analizar con IA"')
    console.log('3. El grafo se poblará con datos reales de los artículos\n')
  } catch (error) {
    console.error('❌ Error limpiando datos:', error)
    process.exit(1)
  }

  process.exit(0)
}

cleanMockData()
