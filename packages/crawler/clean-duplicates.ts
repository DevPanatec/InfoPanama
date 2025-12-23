/**
 * Script para eliminar claims duplicadas
 * Mantiene solo la MEJOR claim de cada grupo de duplicados
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from '@infopanama/convex'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado. Asegúrate de tener un archivo .env con CONVEX_URL o NEXT_PUBLIC_CONVEX_URL')
}

const client = new ConvexHttpClient(CONVEX_URL)

async function cleanDuplicates() {
  console.log('🧹 Limpiando claims duplicadas...\n')

  // Obtener todas las claims publicadas
  const claims = await client.query(api.claims.list, {
    status: 'published',
    limit: 500,
  })

  console.log(`📊 Total de claims: ${claims.length}\n`)

  // Agrupar por imagen
  const imageMap = new Map<string, any[]>()
  claims.forEach((claim) => {
    if (claim.imageUrl) {
      if (!imageMap.has(claim.imageUrl)) {
        imageMap.set(claim.imageUrl, [])
      }
      imageMap.get(claim.imageUrl)!.push(claim)
    }
  })

  // Encontrar duplicados
  const duplicateGroups = Array.from(imageMap.entries()).filter(([_, cs]) => cs.length > 1)

  if (duplicateGroups.length === 0) {
    console.log('✅ No hay duplicados para limpiar\n')
    return
  }

  console.log(`❌ Encontrados ${duplicateGroups.length} grupos de duplicados\n`)

  let totalDeleted = 0

  // Para cada grupo de duplicados
  for (const [imageUrl, duplicates] of duplicateGroups) {
    console.log(`\n📸 Procesando grupo con ${duplicates.length} duplicados:`)
    console.log(`   Imagen: ${imageUrl.substring(0, 80)}...`)

    // Ordenar por prioridad:
    // 1. isFeatured = true (mantener featured)
    // 2. verdict existe (mantener verificadas)
    // 3. title no es "null" (mantener con título válido)
    // 4. Más reciente (updatedAt)
    const sorted = duplicates.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1
      if (a.verdict && !b.verdict) return -1
      if (!a.verdict && b.verdict) return 1
      if (a.title !== 'null' && b.title === 'null') return -1
      if (a.title === 'null' && b.title !== 'null') return 1
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })

    // Mantener la primera (mejor), eliminar el resto
    const toKeep = sorted[0]
    const toDelete = sorted.slice(1)

    console.log(`   ✅ Manteniendo: "${toKeep.title?.substring(0, 60)}..." (Featured: ${toKeep.isFeatured})`)

    // Eliminar duplicados
    for (const claim of toDelete) {
      try {
        await client.mutation(api.claims.remove, { id: claim._id })
        console.log(`   🗑️  Eliminado: "${claim.title?.substring(0, 60)}..." (ID: ${claim._id})`)
        totalDeleted++
      } catch (error) {
        console.error(`   ❌ Error eliminando ${claim._id}:`, error)
      }
    }
  }

  console.log(`\n✅ Limpieza completada`)
  console.log(`   Claims eliminadas: ${totalDeleted}`)
  console.log(`   Claims restantes: ${claims.length - totalDeleted}`)
}

cleanDuplicates()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
