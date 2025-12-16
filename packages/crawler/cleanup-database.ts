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

async function cleanupDatabase() {
  console.log('🧹 Iniciando limpieza de base de datos...\n')

  // 1. Obtener todos los claims (sin límite)
  const allClaims = await client.query(api.claims.list, { limit: 1000 })
  console.log(`📊 Total de claims encontrados: ${allClaims.length}`)

  // 2. Identificar claims a eliminar
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const toDelete: string[] = []
  const seen = new Map<string, any>()

  for (const claim of allClaims) {
    // Criterio 1: Claims "new" antiguos (más de 7 días)
    if (claim.status === 'new' && claim.createdAt < sevenDaysAgo) {
      toDelete.push(claim._id)
      continue
    }

    // Criterio 2: Duplicados (mismo título)
    const key = claim.title?.toLowerCase().trim()
    if (key && seen.has(key)) {
      // Mantener el más reciente
      const existing = seen.get(key)
      if (claim.createdAt > existing.createdAt) {
        toDelete.push(existing._id)
        seen.set(key, claim)
      } else {
        toDelete.push(claim._id)
      }
    } else if (key) {
      seen.set(key, claim)
    }
  }

  console.log(`\n🗑️  Claims a eliminar: ${toDelete.length}`)
  console.log(`   - Claims "new" antiguos (>7 días)`)
  console.log(`   - Claims duplicados`)

  // 3. Confirmar antes de borrar
  if (toDelete.length === 0) {
    console.log('\n✅ No hay claims para eliminar')
    return
  }

  console.log(`\n⚠️  Se eliminarán ${toDelete.length} claims de ${allClaims.length} totales`)
  console.log(`📊 Quedarán: ${allClaims.length - toDelete.length} claims`)

  // Esperar 3 segundos antes de borrar
  console.log('\n⏳ Eliminando en 3 segundos...')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // 4. Eliminar claims
  let deleted = 0
  for (const claimId of toDelete) {
    try {
      await client.mutation(api.claims.remove, { id: claimId as any })
      deleted++
      if (deleted % 10 === 0) {
        console.log(`   Eliminados: ${deleted}/${toDelete.length}`)
      }
    } catch (error) {
      console.error(`   Error eliminando ${claimId}:`, error)
    }
  }

  console.log(`\n✅ Limpieza completada!`)
  console.log(`   Eliminados: ${deleted} claims`)
  console.log(`   Restantes: ${allClaims.length - deleted} claims`)

  // 5. Verificar nuevo estado
  const remainingClaims = await client.query(api.claims.list, {})
  console.log(`\n📊 Estado final:`)
  console.log(`   Total claims: ${remainingClaims.length}`)

  const byStatus = remainingClaims.reduce((acc: any, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  console.log(`   Por estado:`)
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`      ${status}: ${count}`)
  })
}

cleanupDatabase()
  .then(() => {
    console.log('\n🎉 Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
