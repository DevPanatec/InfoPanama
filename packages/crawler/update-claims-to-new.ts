/**
 * Script para cambiar todas las claims de 'published' a 'new'
 * para que puedan ser revisadas antes de publicarse
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/convex/_generated/api'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  console.error('❌ CONVEX_URL no está configurado')
  console.error('   Asegúrate de tener un archivo .env con CONVEX_URL')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function updateClaimsToNew() {
  try {
    console.log('🔄 Obteniendo todas las claims publicadas...\n')

    // Obtener todas las claims con status 'published'
    const publishedClaims = await client.query(api.claims.list, {
      status: 'published',
      limit: 1000,
    })

    console.log(`📊 Total de claims publicadas: ${publishedClaims.length}\n`)

    if (publishedClaims.length === 0) {
      console.log('✅ No hay claims publicadas para actualizar')
      return
    }

    console.log('🔄 Cambiando status de "published" a "new"...\n')

    let updated = 0
    let errors = 0

    for (const claim of publishedClaims) {
      try {
        await client.mutation(api.claims.updateStatus, {
          id: claim._id,
          status: 'new',
        })

        updated++
        console.log(`   ✅ [${updated}/${publishedClaims.length}] ${claim.title.substring(0, 60)}...`)
      } catch (error: any) {
        errors++
        console.error(`   ❌ Error actualizando ${claim._id}: ${error.message}`)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN:')
    console.log('='.repeat(70))
    console.log(`✅ Actualizadas: ${updated}`)
    console.log(`❌ Errores: ${errors}`)
    console.log('='.repeat(70))

    if (updated > 0) {
      console.log('\n💡 Ahora puedes revisar las claims en:')
      console.log('   👉 http://localhost:3000/admin/dashboard/claims')
      console.log('\n   Las claims con status "new" aparecerán para revisión.')
      console.log('   Puedes aprobarlas, rechazarlas o enviarlas a investigación.')
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

updateClaimsToNew()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
