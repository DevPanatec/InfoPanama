/**
 * Quitar isFeatured a claims sin imagen
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function unfeatured() {
  console.log('🔧 Quitando isFeatured a claims sin imagen...\n')

  const claims = await convex.query('claims:list' as any, { status: 'published', limit: 200 })

  const featured = claims.filter((c: any) => c.isFeatured)
  const featuredWithoutImage = featured.filter((c: any) => !c.imageUrl)

  console.log(`📊 Featured total: ${featured.length}`)
  console.log(`❌ Featured sin imagen: ${featuredWithoutImage.length}\n`)

  if (featuredWithoutImage.length === 0) {
    console.log('✅ No hay claims featured sin imagen')
    return
  }

  console.log('Actualizando...\n')

  for (const claim of featuredWithoutImage) {
    try {
      await convex.mutation('claims:toggleFeatured' as any, {
        id: claim._id
      })
      console.log(`✅ ${claim.title?.substring(0, 60)}...`)
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`)
    }
  }

  console.log(`\n✅ Completado: ${featuredWithoutImage.length} claims actualizados`)
}

unfeatured()
