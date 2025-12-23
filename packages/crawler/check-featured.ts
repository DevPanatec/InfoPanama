import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function check() {
  const claims = await convex.query('claims:list' as any, { status: 'published', limit: 200 })

  const featured = claims.filter((c: any) => c.isFeatured)
  const featuredWithoutImage = featured.filter((c: any) => !c.imageUrl)

  console.log('📊 Featured claims:', featured.length)
  console.log('❌ Featured sin imagen:', featuredWithoutImage.length, '\n')

  if (featuredWithoutImage.length > 0) {
    console.log('Featured sin imágenes:')
    featuredWithoutImage.forEach((c: any, i: number) => {
      console.log((i + 1) + '. [' + c._id + '] ' + c.title?.substring(0, 60))
      console.log('   isFeatured:', c.isFeatured, '| imageUrl:', c.imageUrl || 'NULL')
      console.log('   riskLevel:', c.riskLevel)
      console.log('   Tags:', c.tags?.join(', '), '\n')
    })
  }
}

check()
