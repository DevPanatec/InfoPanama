import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function check() {
  const claims = await convex.query('claims:list' as any, { status: 'published', limit: 200 })

  const withImages = claims.filter((c: any) => c.imageUrl)
  const withoutImages = claims.filter((c: any) => !c.imageUrl)

  console.log('📊 Total claims:', claims.length)
  console.log('✅ Con imágenes:', withImages.length)
  console.log('❌ Sin imágenes:', withoutImages.length, '\n')

  console.log('Claims sin imágenes (primeros 15):')
  withoutImages.slice(0, 15).forEach((c: any, i: number) => {
    console.log((i + 1) + '. ' + c.title?.substring(0, 80))
    console.log('   Tags:', c.tags?.join(', '))
  })
}

check()
