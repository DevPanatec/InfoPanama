/**
 * Pipeline OSINT Completo para InfoPanama
 *
 * 1. Crawlea noticias de medios panameños
 * 2. Extrae claims verificables con IA
 * 3. Guarda en Convex para verificación
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import { crawlLaPrensa } from './crawlers/la-prensa.js'
import { crawlGacetaOficial } from './crawlers/gaceta-oficial.js'
import { crawlTVN } from './crawlers/tvn.js'
import { crawlTelemetro } from './crawlers/telemetro.js'
import { crawlPanamaAmerica } from './crawlers/panama-america.js'
import { extractClaimsFromArticles } from './processors/claim-extractor.js'
import type { ScrapedArticle } from './types/index.js'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado en .env')
}

const client = new ConvexHttpClient(CONVEX_URL)

// Helper para llamar mutations/queries de Convex sin tipos generados
async function createClaim(data: any) {
  return await client.mutation('claims:create' as any, data)
}

async function createArticle(data: any) {
  return await client.mutation('articles:create' as any, data)
}

async function createSource(data: any) {
  return await client.mutation('sources:create' as any, data)
}

async function getSourceBySlug(slug: string) {
  return await client.query('sources:getBySlug' as any, { slug })
}

// Mapeo de nombres de fuentes a slugs
const SOURCE_CONFIG: Record<
  string,
  { slug: string; name: string; url: string; type: 'media' | 'official' }
> = {
  'La Prensa': {
    slug: 'la-prensa',
    name: 'La Prensa',
    url: 'https://www.prensa.com',
    type: 'media',
  },
  'Gaceta Oficial': {
    slug: 'gaceta-oficial',
    name: 'Gaceta Oficial de Panamá',
    url: 'https://www.gacetaoficial.gob.pa',
    type: 'official',
  },
  'TVN': {
    slug: 'tvn',
    name: 'TVN',
    url: 'https://www.tvn-2.com',
    type: 'media',
  },
  'Telemetro': {
    slug: 'telemetro',
    name: 'Telemetro',
    url: 'https://www.telemetro.com',
    type: 'media',
  },
  'Panama América': {
    slug: 'panama-america',
    name: 'Panama América',
    url: 'https://www.panamaamerica.com.pa',
    type: 'media',
  },
}

/**
 * Obtener o crear una fuente en Convex
 */
async function getOrCreateSource(sourceName: string) {
  const config = SOURCE_CONFIG[sourceName]

  if (!config) {
    throw new Error(`Source configuration not found for: ${sourceName}`)
  }

  // Intentar obtener la fuente existente
  let source = await getSourceBySlug(config.slug)

  // Si no existe, crearla
  if (!source) {
    console.log(`   📌 Creando nueva fuente: ${config.name}`)
    const sourceId = await createSource({
      name: config.name,
      slug: config.slug,
      url: config.url,
      type: config.type,
      isTrusted: true, // Fuentes oficiales y medios principales son confiables
      credibilityScore: 80,
      scrapingEnabled: true,
      scrapingFrequency: '6h',
    })

    // Obtener la fuente recién creada
    source = await getSourceBySlug(config.slug)
  }

  return source
}

/**
 * Generar hash simple del contenido para detectar duplicados
 */
function generateContentHash(content: string): string {
  // Simple hash basado en contenido y longitud
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `${Math.abs(hash)}-${content.length}`
}

async function main() {
  console.log('🚀 Iniciando Pipeline OSINT de InfoPanama\n')
  console.log('='.repeat(60))

  const startTime = Date.now()

  // FASE 1: CRAWLING
  console.log('\n📰 FASE 1: CRAWLING DE NOTICIAS')
  console.log('='.repeat(60))

  let articles: ScrapedArticle[] = []

  try {
    // Crawl La Prensa
    console.log('\n🔍 Crawling La Prensa...')
    const prensaArticles = await crawlLaPrensa()
    articles = [...articles, ...prensaArticles]

    // Crawl TVN
    console.log('\n📺 Crawling TVN...')
    const tvnArticles = await crawlTVN()
    articles = [...articles, ...tvnArticles]

    // Crawl Telemetro
    console.log('\n📺 Crawling Telemetro...')
    const telemetroArticles = await crawlTelemetro()
    articles = [...articles, ...telemetroArticles]

    // Crawl Panama América
    console.log('\n📰 Crawling Panama América...')
    const panamaAmericaArticles = await crawlPanamaAmerica()
    articles = [...articles, ...panamaAmericaArticles]

    // Crawl Gaceta Oficial (pero se filtrará después)
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
  console.log('='.repeat(60))

  // FILTRAR: Extraer claims de TODOS los medios noticiosos, EXCEPTO Gaceta Oficial (documentos legales)
  const newsArticles = articles.filter((article) =>
    article.source !== 'Gaceta Oficial de Panamá' &&
    !article.url?.includes('gacetaoficial.gob.pa')
  )
  console.log(`📰 Filtrando artículos de noticias: ${newsArticles.length} de ${articles.length} artículos`)
  console.log(`   ✅ Procesando medios: La Prensa, TVN, Telemetro, Panama América y otros`)
  console.log(`   ⚠️  Excluyendo ${articles.length - newsArticles.length} artículos de Gaceta Oficial (no verificables)`)

  let totalClaimsExtracted = 0

  try {
    const results = await extractClaimsFromArticles(newsArticles)

    // FASE 3: GUARDAR EN CONVEX
    console.log('\n\n💾 FASE 3: GUARDANDO EN BASE DE DATOS')
    console.log('='.repeat(60))

    for (const { article, claims } of results) {
      console.log(`\n📝 Procesando "${article.title.substring(0, 50)}..."`)
      console.log(`   Fuente: ${article.source}`)

      // Primero obtener o crear la fuente
      let articleId = null
      try {
        // Obtener o crear source
        const source = await getOrCreateSource(article.source)

        if (!source || !source._id) {
          throw new Error(`No se pudo obtener sourceId para ${article.source}`)
        }

        console.log(`   📄 Guardando artículo en base de datos...`)

        // Generar hash del contenido
        const contentHash = generateContentHash(article.content)

        // Guardar artículo
        articleId = await createArticle({
          title: article.title,
          url: article.url,
          content: article.content,
          htmlContent: article.content, // En el futuro podríamos guardar HTML
          sourceId: source._id,
          author: article.author,
          publishedDate: article.publishedDate.getTime(),
          topics: article.category ? [article.category] : [],
          contentHash: contentHash,
        })

        console.log(`   ✅ Artículo guardado: ${articleId}`)
      } catch (error: any) {
        // Si el error es por duplicado, no es un problema
        if (error?.message?.includes('already exists')) {
          console.log(`   ℹ️ Artículo ya existe en la base de datos (duplicado)`)
        } else {
          console.error(`   ❌ Error guardando artículo:`, error)
        }
      }

      if (claims.length === 0) {
        console.log(`   ℹ️ No se extrajeron claims de este artículo`)
        continue
      }

      // Guardar cada claim en Convex
      for (const claim of claims) {
        try {
          // Crear el claim en Convex
          const claimId = await createClaim({
            title: `${claim.speaker ? claim.speaker + ': ' : ''}"${claim.text.substring(0, 80)}..."`,
            description: claim.context,
            claimText: claim.text,
            category: claim.category,
            tags: [article.source, article.category || 'General'],
            riskLevel: claim.riskLevel,
            sourceType: 'auto_extracted',
            sourceUrl: article.url,
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
  console.log('='.repeat(60))
  console.log(`📰 Artículos scrapeados: ${articles.length}`)
  console.log(`🔍 Claims extraídos: ${totalClaimsExtracted}`)
  console.log(`⏱️  Tiempo total: ${duration}s`)
  console.log('='.repeat(60))

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
