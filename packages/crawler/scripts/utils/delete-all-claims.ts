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

async function deleteAllClaims() {
  console.log('🗑️  ELIMINANDO TODOS LOS CLAIMS')
  console.log('═'.repeat(60))
  console.log()

  // Obtener todos los claims
  console.log('📊 Obteniendo claims...')
  const allClaims = await client.query(api.claims.list, { limit: 1000 })

  console.log(`   Total de claims: ${allClaims.length}`)

  if (allClaims.length === 0) {
    console.log('\n✅ No hay claims para eliminar')
    return
  }

  console.log()
  console.log('⚠️  ADVERTENCIA: Se eliminarán TODOS los claims')
  console.log(`   Claims a eliminar: ${allClaims.length}`)
  console.log()
  console.log('⏳ Comenzando eliminación en 3 segundos...')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Eliminar claims
  let deleted = 0
  let errors = 0

  for (const claim of allClaims) {
    try {
      await client.mutation(api.claims.remove, { id: claim._id })
      deleted++

      if (deleted % 10 === 0) {
        console.log(`   ✅ Eliminados: ${deleted}/${allClaims.length}`)
      }
    } catch (error) {
      errors++
      console.error(`   ❌ Error eliminando claim ${claim._id}:`, error)
    }
  }

  console.log()
  console.log('═'.repeat(60))
  console.log('✅ ELIMINACIÓN COMPLETADA')
  console.log(`   Eliminados exitosamente: ${deleted}`)
  console.log(`   Errores: ${errors}`)
  console.log('═'.repeat(60))

  // Verificar estado final
  const remaining = await client.query(api.claims.list, {})
  console.log()
  console.log(`📊 Estado final: ${remaining.length} claims en la base de datos`)
}

deleteAllClaims()
  .then(() => {
    console.log('\n🎉 Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
