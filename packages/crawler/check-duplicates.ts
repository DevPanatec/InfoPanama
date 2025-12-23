/**
 * Script para detectar claims duplicadas en la base de datos
 * Busca claims con el mismo título o imagen
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from '@infopanama/convex'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado. Asegúrate de tener un archivo .env con CONVEX_URL o NEXT_PUBLIC_CONVEX_URL')
}

const client = new ConvexHttpClient(CONVEX_URL)

async function checkDuplicates() {
  console.log('🔍 Verificando duplicados en la base de datos...\n')

  // Obtener todas las claims publicadas
  const claims = await client.query(api.claims.list, {
    status: 'published',
    limit: 500,
  })

  console.log(`📊 Total de claims publicadas: ${claims.length}\n`)

  // Detectar duplicados por título
  const titleMap = new Map<string, any[]>()
  claims.forEach((claim) => {
    const title = claim.title?.trim().toLowerCase()
    if (title) {
      if (!titleMap.has(title)) {
        titleMap.set(title, [])
      }
      titleMap.get(title)!.push(claim)
    }
  })

  // Mostrar duplicados por título
  const titleDuplicates = Array.from(titleMap.entries()).filter(([_, cs]) => cs.length > 1)
  if (titleDuplicates.length > 0) {
    console.log('❌ DUPLICADOS POR TÍTULO:')
    titleDuplicates.forEach(([title, duplicateClaims]) => {
      console.log(`\n  "${title}"`)
      console.log(`  Cantidad: ${duplicateClaims.length} claims`)
      duplicateClaims.forEach((c, i) => {
        console.log(`    ${i + 1}. ID: ${c._id} | Featured: ${c.isFeatured} | Imagen: ${c.imageUrl ? '✓' : '✗'}`)
      })
    })
    console.log('')
  } else {
    console.log('✅ No hay duplicados por título\n')
  }

  // Detectar duplicados por imagen
  const imageMap = new Map<string, any[]>()
  claims.forEach((claim) => {
    if (claim.imageUrl) {
      if (!imageMap.has(claim.imageUrl)) {
        imageMap.set(claim.imageUrl, [])
      }
      imageMap.get(claim.imageUrl)!.push(claim)
    }
  })

  // Mostrar duplicados por imagen
  const imageDuplicates = Array.from(imageMap.entries()).filter(([_, cs]) => cs.length > 1)
  if (imageDuplicates.length > 0) {
    console.log('❌ DUPLICADOS POR IMAGEN:')
    imageDuplicates.forEach(([imageUrl, duplicateClaims]) => {
      console.log(`\n  Imagen: ${imageUrl}`)
      console.log(`  Cantidad: ${duplicateClaims.length} claims`)
      duplicateClaims.forEach((c, i) => {
        console.log(`    ${i + 1}. ID: ${c._id} | Título: "${c.title}" | Featured: ${c.isFeatured}`)
      })
    })
    console.log('')
  } else {
    console.log('✅ No hay duplicados por imagen\n')
  }

  // Resumen
  console.log('📈 RESUMEN:')
  console.log(`  Total claims: ${claims.length}`)
  console.log(`  Duplicados por título: ${titleDuplicates.length}`)
  console.log(`  Duplicados por imagen: ${imageDuplicates.length}`)

  if (titleDuplicates.length > 0 || imageDuplicates.length > 0) {
    console.log('\n⚠️  Se encontraron duplicados. Considera eliminarlos para evitar confusión.')
  } else {
    console.log('\n✅ No se encontraron duplicados.')
  }
}

checkDuplicates()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
