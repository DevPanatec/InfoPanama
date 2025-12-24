/**
 * Script para publicar todas las claims que no están publicadas
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/convex/_generated/api'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  console.error('❌ CONVEX_URL no está configurado')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function publishAllClaims() {
  try {
    console.log('🔄 Obteniendo todas las claims...\n')

    const allClaims = await client.query(api.claims.list, {
      limit: 1000,
    })

    const unpublished = allClaims.filter((c: any) => c.status !== 'published')

    console.log('📊 RESUMEN:')
    console.log('='.repeat(70))
    console.log(`Total de claims: ${allClaims.length}`)
    console.log(`Ya publicadas: ${allClaims.length - unpublished.length}`)
    console.log(`Por publicar: ${unpublished.length}`)
    console.log('='.repeat(70))

    if (unpublished.length === 0) {
      console.log('\n✅ Todas las claims ya están publicadas')
      return
    }

    console.log('\n🚀 Publicando claims...\n')

    let updated = 0
    let errors = 0

    for (const claim of unpublished) {
      try {
        await client.mutation(api.claims.updateStatus, {
          id: claim._id,
          status: 'published',
        })

        updated++
        const title = claim.title || 'Sin título'
        console.log(`   ✅ [${updated}/${unpublished.length}] ${title.substring(0, 60)}...`)
      } catch (error: any) {
        errors++
        console.error(`   ❌ Error publicando ${claim._id}: ${error.message}`)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 RESULTADO FINAL:')
    console.log('='.repeat(70))
    console.log(`✅ Publicadas: ${updated}`)
    console.log(`❌ Errores: ${errors}`)
    console.log('='.repeat(70))

    if (updated > 0) {
      console.log('\n💡 Las claims ahora están disponibles en:')
      console.log('   👉 http://localhost:3000')
      console.log('   👉 http://localhost:3000/verificaciones')
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

publishAllClaims()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
