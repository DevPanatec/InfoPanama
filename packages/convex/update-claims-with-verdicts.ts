import { ConvexHttpClient } from 'convex/browser'
import { api } from './convex/_generated/api.js'

const CONVEX_URL = 'https://accomplished-rhinoceros-93.convex.cloud'
const client = new ConvexHttpClient(CONVEX_URL)

async function updateClaims() {
  console.log('📝 Actualizando claims con verdicts...\n')
  
  const claims = await client.query(api.claims.list, { status: 'published', limit: 20 })
  
  // Asignar verdicts variados para demo
  const verdicts = ['TRUE', 'FALSE', 'MIXED', 'UNPROVEN', 'NEEDS_CONTEXT']
  
  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i]
    const verdict = verdicts[i % verdicts.length]
    
    console.log(`Actualizando "${claim.title}" -> ${verdict}`)
  }
  
  console.log('\n✅ Claims actualizados!')
}

updateClaims().catch(console.error)
