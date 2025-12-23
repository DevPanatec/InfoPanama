/**
 * Buscar claims sobre "Hombres de Blanco"
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function searchHombresBlanco() {
  console.log('🔍 Buscando "Hombres de Blanco" en claims...\n')

  try {
    // Obtener todos los claims
    const claims = await convex.query('claims:list' as any, {
      status: 'published',
      limit: 200
    })

    console.log(`📊 Total claims: ${claims?.length || 0}\n`)

    // Buscar en título, claimText y description
    const results = claims?.filter((claim: any) => {
      const title = claim.title?.toLowerCase() || ''
      const text = claim.claimText?.toLowerCase() || ''
      const desc = claim.description?.toLowerCase() || ''
      const tags = claim.tags?.join(' ').toLowerCase() || ''

      return title.includes('hombres de blanco') ||
             title.includes('hombres') && title.includes('blanco') ||
             text.includes('hombres de blanco') ||
             text.includes('hombres') && text.includes('blanco') ||
             desc.includes('hombres de blanco') ||
             desc.includes('hombres') && desc.includes('blanco') ||
             tags.includes('hombres de blanco')
    })

    if (results && results.length > 0) {
      console.log(`✅ Encontrados ${results.length} claims relacionados:\n`)
      results.forEach((claim: any, i: number) => {
        console.log(`${i + 1}. ${claim.title}`)
        console.log(`   Claim: "${claim.claimText?.substring(0, 100)}..."`)
        console.log(`   Tags: ${claim.tags?.join(', ')}`)
        console.log(`   URL: ${claim.sourceUrl}\n`)
      })
    } else {
      console.log('❌ No se encontraron claims sobre "Hombres de Blanco"')
      console.log('\nMostrando primeros 5 claims para verificar:\n')

      claims?.slice(0, 5).forEach((claim: any, i: number) => {
        console.log(`${i + 1}. ${claim.title}`)
        console.log(`   ${claim.claimText?.substring(0, 80)}...\n`)
      })
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

searchHombresBlanco()
