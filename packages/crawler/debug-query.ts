/**
 * Debug - probar query exacto de la página
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function debugQuery() {
  console.log('🔍 Probando query EXACTO de la página...\n')
  console.log(`CONVEX_URL: ${CONVEX_URL}\n`)

  try {
    // Query exacto de la página (línea 21-24)
    const result = await convex.query('claims:list' as any, {
      status: 'published',
      limit: 200
    })

    console.log(`✅ Query exitoso`)
    console.log(`📊 Total claims retornados: ${result?.length || 0}\n`)

    if (result && result.length > 0) {
      console.log('Primeros 3 claims:')
      result.slice(0, 3).forEach((claim: any, i: number) => {
        console.log(`\n${i + 1}. ID: ${claim._id}`)
        console.log(`   title: ${claim.title}`)
        console.log(`   status: ${claim.status}`)
        console.log(`   isPublic: ${claim.isPublic}`)
        console.log(`   claimText: ${claim.claimText?.substring(0, 50)}...`)
      })
    } else {
      console.log('❌ No se encontraron claims')
      console.log('\nProbando sin filtro de status...')

      const allClaims = await convex.query('claims:list' as any, {
        limit: 200
      })
      console.log(`Total claims SIN filtro: ${allClaims?.length || 0}`)
    }

  } catch (error: any) {
    console.error('❌ Error en query:', error.message)
    console.error('Stack:', error.stack)
  }
}

debugQuery()
