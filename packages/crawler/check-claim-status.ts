import { ConvexHttpClient } from 'convex/browser'
import { api } from '@infopanama/convex'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no configurado')
}

const client = new ConvexHttpClient(CONVEX_URL)

async function checkStatus() {
  console.log('📊 Verificando estado de claims...\n')

  const statuses = ['new', 'investigating', 'review', 'approved', 'rejected', 'published']

  for (const status of statuses) {
    const claims = await client.query(api.claims.list, { status: status as any, limit: 200 })
    const upper = status.toUpperCase()
    console.log(`  ${upper}: ${claims.length} claims`)
  }

  const all = await client.query(api.claims.list, { limit: 500 })
  console.log(`\n  TOTAL: ${all.length} claims`)
}

checkStatus().then(() => process.exit(0)).catch(console.error)
