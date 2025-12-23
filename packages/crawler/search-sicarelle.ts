import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function search() {
  const claims = await convex.query('claims:list' as any, { status: 'published', limit: 200 })

  const sicarelle = claims.filter((c: any) =>
    c.title?.toLowerCase().includes('sicarelle') ||
    c.claimText?.toLowerCase().includes('sicarelle') ||
    c.tags?.some((t: string) => t.toLowerCase().includes('sicarelle'))
  )

  console.log('📊 Total claims en DB:', claims.length)
  console.log('✅ Claims sobre Sicarelle:', sicarelle.length, '\n')

  sicarelle.forEach((c: any, i: number) => {
    console.log((i + 1) + '. ' + c.title)
    console.log('   Tags:', c.tags?.join(', '))
    console.log('   URL:', c.sourceUrl, '\n')
  })
}

search()
