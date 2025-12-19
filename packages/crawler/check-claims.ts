/**
 * Script para verificar claims en Convex
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)

async function checkClaims() {
  console.log('🔍 Verificando claims en Convex...\n')

  // Verificar claims con diferentes queries
  try {
    // Query 1: Listar todas las claims
    const allClaims = await convex.query('claims:list' as any, {})
    console.log(`📊 Total claims en DB: ${allClaims?.length || 0}`)

    if (allClaims && allClaims.length > 0) {
      console.log('\n✅ Primeras 3 claims encontradas:')
      allClaims.slice(0, 3).forEach((claim: any, i: number) => {
        console.log(`\n${i + 1}. ${claim.title || claim.claimText?.substring(0, 60) || 'Sin título'}`)
        console.log(`   Status: ${claim.status}`)
        console.log(`   isPublic: ${claim.isPublic}`)
        console.log(`   ID: ${claim._id}`)
      })
    }

    // Query 2: Claims públicas (las que se muestran en la página)
    const publishedClaims = await convex.query('claims:getPublished' as any, { limit: 50 })
    console.log(`\n📢 Claims publicadas (isPublic=true, status=published): ${publishedClaims?.length || 0}`)

    if (publishedClaims && publishedClaims.length > 0) {
      console.log('\n✅ Primeras 3 claims publicadas:')
      publishedClaims.slice(0, 3).forEach((claim: any, i: number) => {
        console.log(`\n${i + 1}. ${claim.title || claim.claimText?.substring(0, 60)}`)
        console.log(`   Status: ${claim.status}`)
        console.log(`   isPublic: ${claim.isPublic}`)
      })
    }

    // Query 3: Estadísticas
    const stats = await convex.query('claims:getStats' as any, {})
    console.log('\n📈 Estadísticas de claims:')
    console.log(JSON.stringify(stats, null, 2))

  } catch (error: any) {
    console.error('❌ Error consultando claims:', error.message)
  }
}

checkClaims()
