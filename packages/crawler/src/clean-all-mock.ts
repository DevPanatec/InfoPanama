/**
 * Script para eliminar TODOS los datos mock: sources duplicadas y entities mock
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado en .env')
}

const client = new ConvexHttpClient(CONVEX_URL)

async function cleanAllMockData() {
  console.log('🧹 Limpiando TODOS los datos mock...\n')

  try {
    // 1. Eliminar sources mock específicas por ID
    console.log('🗑️  Eliminando sources mock...')
    const mockSourceIds = [
      'k970wdbbz5swsftm76wh5pmer17w0739', // TVN 1
      'k97030dq7vea4yp206e5b0q2r17w2fx0', // TVN 2
      'k970rfd4j99x91pny8p0tb36an7w22tm', // La Prensa mock
    ]

    let sourcesDeleted = 0
    for (const sourceId of mockSourceIds) {
      try {
        console.log(`   ❌ Eliminando source: ${sourceId}`)
        await client.mutation('sources:remove' as any, { id: sourceId })
        sourcesDeleted++
      } catch (error: any) {
        console.log(`   ⚠️  No se pudo eliminar ${sourceId}: ${error.message}`)
      }
    }
    console.log(`   ✅ ${sourcesDeleted} sources mock eliminadas\n`)

    // 2. Eliminar entities mock
    console.log('🗑️  Eliminando entities mock...')
    const entities = (await client.query('entities:list' as any, {})) as any[]

    let entitiesDeleted = 0
    for (const entity of entities) {
      console.log(`   ❌ Eliminando: ${entity.name} (${entity._id})`)
      await client.mutation('entities:remove' as any, { id: entity._id })
      entitiesDeleted++
    }
    console.log(`   ✅ ${entitiesDeleted} entities mock eliminadas\n`)

    // 3. Eliminar claims MOCK (los publicados con imageUrl)
    console.log('🗑️  Eliminando claims mock...')
    const allClaims = (await client.query('claims:list' as any, { limit: 100 })) as any[]

    let claimsDeleted = 0
    for (const claim of allClaims) {
      // Los claims mock tienen imageUrl de Unsplash y status published
      if (claim.imageUrl && claim.imageUrl.includes('unsplash')) {
        console.log(`   ❌ Eliminando claim mock: ${claim.title.substring(0, 50)}...`)
        await client.mutation('claims:remove' as any, { id: claim._id })
        claimsDeleted++
      }
    }
    console.log(`   ✅ ${claimsDeleted} claims mock eliminados\n`)

    // 3. Eliminar actores (por si quedaron)
    console.log('🗑️  Eliminando actores restantes...')
    const actorsResult = await client.mutation('actors:deleteAll' as any)
    console.log(`   ✅ ${actorsResult.deleted} actores eliminados\n`)

    // 4. Eliminar relaciones (por si quedaron)
    console.log('🗑️  Eliminando relaciones restantes...')
    const relationsResult = await client.mutation(
      'entityRelations:deleteAll' as any
    )
    console.log(`   ✅ ${relationsResult.deleted} relaciones eliminadas\n`)

    console.log('✅ ¡Limpieza completa!')
    console.log('\n📊 Resumen:')
    console.log(`   • ${sourcesDeleted} sources mock eliminadas`)
    console.log(`   • ${entitiesDeleted} entities mock eliminadas`)
    console.log(`   • ${actorsResult.deleted} actores eliminados`)
    console.log(`   • ${relationsResult.deleted} relaciones eliminadas`)

    console.log('\n💡 Próximos pasos:')
    console.log('1. Recarga la página del grafo (F5)')
    console.log('2. Haz clic en "Analizar con IA"')
    console.log('3. El grafo se poblará SOLO con datos reales\n')
  } catch (error) {
    console.error('❌ Error limpiando datos:', error)
    process.exit(1)
  }

  process.exit(0)
}

cleanAllMockData()
