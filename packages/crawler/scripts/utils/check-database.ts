import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error('❌ CONVEX_URL no configurado')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function checkDatabase() {
  console.log('🔍 Verificando estado de la base de datos...\n')

  try {
    // 1. Verificar claims
    const claims = await client.query('claims:list' as any, { limit: 200 }) as any[]
    console.log(`📊 Total de claims: ${claims.length}`)

    if (claims.length === 0) {
      console.log('❌ No hay claims en la base de datos\n')
      console.log('💡 Ejecuta: npm run crawl:all')
      return
    }

    // Agrupar por status
    const byStatus: Record<string, number> = {}
    claims.forEach(claim => {
      byStatus[claim.status] = (byStatus[claim.status] || 0) + 1
    })

    console.log('\n📈 Claims por estado:')
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })

    // Mostrar fechas de los claims más recientes
    const sortedByDate = [...claims].sort((a, b) => b.createdAt - a.createdAt)
    const newest = sortedByDate[0]
    const oldest = sortedByDate[sortedByDate.length - 1]

    console.log('\n📅 Fechas de los claims:')
    console.log(`   Más reciente: ${new Date(newest.createdAt).toLocaleString('es-PA')}`)
    console.log(`   Más antiguo: ${new Date(oldest.createdAt).toLocaleString('es-PA')}`)

    // Mostrar últimos 10 claims
    console.log('\n📰 Últimos 10 claims creados:')
    sortedByDate.slice(0, 10).forEach((c, i) => {
      const date = new Date(c.createdAt).toLocaleDateString('es-PA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      console.log(`   ${i + 1}. [${date}] [${c.status}] ${c.title?.substring(0, 60)}...`)
    })

    // Buscar "Hombres de Blanco"
    const hombresDeBlanco = claims.filter(c =>
      c.title?.toLowerCase().includes('hombres de blanco') ||
      c.claimText?.toLowerCase().includes('hombres de blanco') ||
      c.description?.toLowerCase().includes('hombres de blanco')
    )

    console.log(`\n🔍 Claims con "Hombres de Blanco": ${hombresDeBlanco.length}`)

    if (hombresDeBlanco.length > 0) {
      console.log('\n   Encontrados:')
      hombresDeBlanco.forEach(c => {
        console.log(`   - [${c.status}] ${c.title?.substring(0, 80)}`)
      })
    }

    // 2. Verificar artículos
    const articles = await client.query('articles:list' as any, { limit: 200 }) as any[]
    console.log(`\n📰 Total de artículos: ${articles.length}`)

    // 3. Verificar entidades
    const entities = await client.query('entities:list' as any, { limit: 200 }) as any[]
    console.log(`\n👥 Total de entidades: ${entities.length}`)

    // Buscar entidad "Hombres de Blanco"
    const hdbEntity = entities.find(e =>
      e.name?.toLowerCase().includes('hombres de blanco')
    )

    if (hdbEntity) {
      console.log(`\n   ✅ Entidad "Hombres de Blanco" encontrada:`)
      console.log(`      - Tipo: ${hdbEntity.type}`)
      console.log(`      - Menciones: ${hdbEntity.mentionCount || 0}`)
    } else {
      console.log(`\n   ❌ Entidad "Hombres de Blanco" NO encontrada`)
    }

    // 4. Verificar sources
    const sources = await client.query('sources:list' as any, { limit: 50 }) as any[]
    console.log(`\n📡 Total de fuentes: ${sources.length}`)

    if (sources.length > 0) {
      console.log('   Fuentes disponibles:')
      sources.forEach(s => {
        console.log(`   - ${s.name}`)
      })
    }

    console.log('\n✅ Diagnóstico completo')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkDatabase()
