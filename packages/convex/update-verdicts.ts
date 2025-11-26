import { ConvexHttpClient } from 'convex/browser'
import { api } from './convex/_generated/api.js'

const CONVEX_URL = 'https://accomplished-rhinoceros-93.convex.cloud'
const client = new ConvexHttpClient(CONVEX_URL)

async function updateVerdicts() {
  console.log('📝 Actualizando claims con verdicts de ejemplo...\n')
  
  const verdicts = ['TRUE', 'FALSE', 'MIXED', 'UNPROVEN', 'NEEDS_CONTEXT', 'TRUE']
  const claims = [
    'jh777f582syjmnn4b0ye0hry5h7w51j5', // MEF Desempleo
    'jh78x3zfp1jhzsgydm7vg50h4h7w5d49', // Criminalidad
    'jh7dfxgh15ka1wgzdwn86f77e97w58hm', // Hospitales
    'jh7cj8qakfpcs7yfskjzzff4957w48ss', // Presupuesto
    'jh72m86pdrc4h8vecn4kw40j017w4037', // Mortalidad
    'jh7ac74tkrxt1k22zhmdd0gfh17w4abm'  // Canal
  ]
  
  for (let i = 0; i < claims.length; i++) {
    const claimId = claims[i]
    const verdict = verdicts[i]
    
    try {
      // Usar la función patch directamente via HTTP
      await fetch(`${CONVEX_URL}/api/run/claims:patch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'claims:patch',
          args: [{ id: claimId, verdict }],
          format: 'json'
        })
      })
      
      console.log(`✅ Actualizado claim ${i+1} -> ${verdict}`)
    } catch (error) {
      console.error(`❌ Error:`, error)
    }
  }
  
  console.log('\n🎉 Verdicts actualizados!')
}

updateVerdicts().catch(console.error)
