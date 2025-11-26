/**
 * Pipeline OSINT Completo para InfoPanama
 *
 * 1. Crawlea noticias de medios panameños
 * 2. Extrae claims verificables con IA
 * 3. Guarda en Convex para verificación
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'
import { crawlLaPrensa } from './crawlers/la-prensa.js'
import { crawlGacetaOficial } from './crawlers/gaceta-oficial.js'
import { extractClaimsFromArticles } from './processors/claim-extractor.js'
import type { ScrapedArticle } from './types/index.js'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado en .env')
}

const client = new ConvexHttpClient(CONVEX_URL)

async function main() {
  console.log('🚀 Iniciando Pipeline OSINT de InfoPanama\n')
  console.log('=' . repeat(60))

  const startTime = Date.now()

  // FASE 1: CRAWLING
  console.log('\n📰 FASE 1: CRAWLING DE NOTICIAS')
  console.log('=' . repeat(60))

  let articles: ScrapedArticle[] = []

  try {
    // Crawl La Prensa
    console.log('\n🔍 Crawling La Prensa...')
    const prensaArticles = await crawlLaPrensa()
    articles = [...articles, ...prensaArticles]

    // Crawl Gaceta Oficial
    console.log('\n🏛️  Crawling Gaceta Oficial...')
    const gacetaArticles = await crawlGacetaOficial()
    articles = [...articles, ...gacetaArticles]

    console.log(`\n✅ Fase 1 completada: ${articles.length} artículos scrapeados`)
  } catch (error) {
    console.error('❌ Error en fase de crawling:', error)
    process.exit(1)
  }

  // FASE 2: EXTRACCIÓN DE CLAIMS
  console.log('\n\n🤖 FASE 2: EXTRACCIÓN DE CLAIMS CON IA')
  console.log('=' . repeat(60))

  let totalClaimsExtracted = 0

  try {
    const results = await extractClaimsFromArticles(articles)

    // FASE 3: GUARDAR EN CONVEX
    console.log('\n\n💾 FASE 3: GUARDANDO EN BASE DE DATOS')
    console.log('=' . repeat(60))

    for (const { article, claims } of results) {
      if (claims.length === 0) continue

      console.log(`\n📝 Procesando "${article.title.substring(0, 50)}..."`)

      // Primero, crear o buscar la source en Convex
      let sourceId: any

      try {
        // Intentar obtener la source existente
        // const existingSource = await client.query(api.sources.getBySlug, {
        //   slug: article.source.toLowerCase().replace(/\s+/g, '-')
        // })
        // sourceId = existingSource?._id

        // Por ahora, hardcodeamos un sourceId de ejemplo
        // En producción, esto debería buscar/crear la fuente
        console.log(`   Fuente: ${article.source}`)
      } catch (error) {
        console.log(`   ⚠️  Source no encontrado, se usará default`)
      }

      // Guardar cada claim en Convex
      for (const claim of claims) {
        try {
          // Crear el claim en Convex
          const claimId = await client.mutation(api.claims.create, {
            title: `${claim.speaker ? claim.speaker + ': ' : ''}"${claim.text.substring(0, 80)}..."`,
            description: claim.context,
            claimText: claim.text,
            category: claim.category,
            tags: [article.source, article.category || 'General'],
            riskLevel: claim.riskLevel,
            sourceType: 'auto_extracted',
            sourceUrl: article.url,
            // sourceId: sourceId, // Descomentar cuando tengamos sources
            isPublic: true,
            isFeatured: claim.riskLevel === 'HIGH' || claim.riskLevel === 'CRITICAL',
            autoPublished: false, // Requiere revisión manual
            status: 'new', // Nuevo claim para revisión
          })

          console.log(`   ✅ Claim creado: ${claimId}`)
          totalClaimsExtracted++
        } catch (error) {
          console.error(`   ❌ Error guardando claim:`, error)
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`\n✅ Fase 3 completada: ${totalClaimsExtracted} claims guardados`)
  } catch (error) {
    console.error('❌ Error en fase de extracción/guardado:', error)
  }

  // RESUMEN FINAL
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('\n\n🎉 PIPELINE COMPLETADO')
  console.log('=' . repeat(60))
  console.log(`📰 Artículos scrapeados: ${articles.length}`)
  console.log(`🔍 Claims extraídos: ${totalClaimsExtracted}`)
  console.log(`⏱️  Tiempo total: ${duration}s`)
  console.log('=' . repeat(60))

  console.log('\n💡 Próximos pasos:')
  console.log('1. Revisar los claims en http://localhost:3000/admin')
  console.log('2. Aprobar claims para verificación automática')
  console.log('3. Publicar verificaciones en el homepage')

  process.exit(0)
}

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error)
  process.exit(1)
})

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
