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
import { crawlFocoInstagram } from './crawlers/foco-instagram.js'
import { crawlCritica } from './crawlers/critica.js'
import { crawlLaEstrella } from './crawlers/la-estrella.js'
import { crawlCapitalFinanciero } from './crawlers/capital-financiero.js'
import { crawlMetroLibre } from './crawlers/metro-libre.js'
import { crawlRPCRadio } from './crawlers/rpc-radio.js'
import { extractClaimsFromArticles } from './processors/claim-extractor.js'
import { extractActorsFromClaims } from './processors/actor-extractor.js'
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
  'Foco': {
    slug: 'foco',
    name: 'Foco',
    url: 'https://foco.com.pa',
    type: 'media',
  },
  'Crítica': {
    slug: 'critica',
    name: 'Crítica',
    url: 'https://www.critica.com.pa',
    type: 'media',
  },
  'La Estrella de Panamá': {
    slug: 'la-estrella',
    name: 'La Estrella de Panamá',
    url: 'https://www.laestrella.com.pa',
    type: 'media',
  },
  'El Capital Financiero': {
    slug: 'capital-financiero',
    name: 'El Capital Financiero',
    url: 'https://elcapitalfinanciero.com',
    type: 'media',
  },
  'Metro Libre': {
    slug: 'metro-libre',
    name: 'Metro Libre',
    url: 'https://www.metrolibre.com',
    type: 'media',
  },
  'RPC Radio': {
    slug: 'rpc-radio',
    name: 'RPC Radio',
    url: 'https://www.rpc.com.pa',
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

/**
 * Filtrar artículos para SOLO incluir investigaciones y fact-checks SUSTANCIOSOS
 * NO chismes ni noticias informativas ligeras
 */
function isInvestigativeOrFactCheck(article: ScrapedArticle): boolean {
  const title = article.title.toLowerCase()
  const content = article.content.toLowerCase()
  const fullText = `${title} ${content}`

  // PALABRAS CLAVE FUERTES (debe tener al menos una)
  const strongInvestigationKeywords = [
    // Fact-checking EXPLÍCITO
    'verificamos', 'verificación', 'fact-check', 'fact check',
    'es falso que', 'es verdadero que', 'comprobamos',
    'desmentido', 'desmiente', 'fake news', 'desinformación',

    // Investigación SERIA
    'investigación revela', 'fiscalía investiga', 'mp investiga',
    'documentos revelan', 'evidencia muestra', 'pruebas indican',
    'contratos irregulares', 'licitación irregular',

    // Corrupción CONFIRMADA
    'corrupción', 'corrupto', 'soborno', 'sobornos', 'coima',
    'peculado', 'malversación', 'lavado de dinero', 'blanqueo',
    'desvío de fondos', 'enriquecimiento ilícito',

    // Legal/Judicial SERIO
    'procesado por', 'imputado por', 'sentenciado por',
    'tribunal ordena', 'juez ordena detención', 'audiencia de imputación',
    'acusado de corrupción', 'denuncia penal',

    // Transparencia
    'auditoría revela', 'contraloría detecta', 'falta de transparencia',
  ]

  // CHISMES o noticias ligeras (descartar si SOLO tiene estas sin keywords fuertes)
  const lightContentIndicators = [
    // Anuncios simples
    'anunció', 'anuncia', 'inauguró', 'inaugura',
    'visitará', 'asistió', 'participó en evento',
    'declaraciones', 'opinó', 'comentó',

    // Deportes/Entretenimiento
    'mundial', 'copa', 'partido', 'gol', 'campeonato',
    'transmitirá', 'transmisión', 'canal',
    'artista', 'cantante', 'actor', 'concierto', 'estreno',
    'farándula', 'celebridad',

    // Servicios/Clima
    'pronóstico', 'temperatura', 'clima', 'lluvia',
    'tráfico', 'avenida cerrada', 'construcción',
  ]

  // 1. Si tiene palabras FUERTES de investigación → INCLUIR
  const hasStrongKeywords = strongInvestigationKeywords.some(keyword => fullText.includes(keyword))
  if (hasStrongKeywords) {
    return true
  }

  // 2. Si NO tiene palabras fuertes pero es contenido ligero → DESCARTAR
  const isLightContent = lightContentIndicators.some(keyword => fullText.includes(keyword))
  if (isLightContent) {
    return false
  }

  // 3. Verificar si el artículo tiene profundidad (no es solo un anuncio corto)
  const hasSubstance = content.length > 500 // Al menos 500 caracteres de contenido

  // 4. Palabras MODERADAS (solo incluir si tiene sustancia)
  const moderateKeywords = [
    'denuncia', 'acusación', 'controversia', 'polémica',
    'irregularidad', 'sospecha', 'cuestionamiento',
    'demanda', 'querella', 'audiencia', 'tribunal',
  ]

  const hasModerateKeywords = moderateKeywords.some(keyword => fullText.includes(keyword))

  // Solo incluir si tiene palabras moderadas Y contenido sustancioso
  return hasModerateKeywords && hasSubstance
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

    // Crawl Crítica
    console.log('\n📰 Crawling Crítica...')
    const criticaArticles = await crawlCritica()
    articles = [...articles, ...criticaArticles]

    // Crawl La Estrella de Panamá
    console.log('\n📰 Crawling La Estrella de Panamá...')
    const laEstrellaArticles = await crawlLaEstrella()
    articles = [...articles, ...laEstrellaArticles]

    // Crawl El Capital Financiero
    console.log('\n📰 Crawling El Capital Financiero...')
    const capitalArticles = await crawlCapitalFinanciero()
    articles = [...articles, ...capitalArticles]

    // Crawl Metro Libre
    console.log('\n📰 Crawling Metro Libre...')
    const metroLibreArticles = await crawlMetroLibre()
    articles = [...articles, ...metroLibreArticles]

    // Crawl RPC Radio
    console.log('\n📻 Crawling RPC Radio...')
    const rpcArticles = await crawlRPCRadio()
    articles = [...articles, ...rpcArticles]

    // Crawl Foco (sitio web) - DESACTIVADO: dominio foco.com.pa no existe
    // TODO: Verificar dominio correcto de Foco o eliminar si solo usan Instagram
    // console.log('\n📰 Crawling Foco (sitio web)...')
    // const focoArticles = await crawlFoco()
    // articles = [...articles, ...focoArticles]

    // Crawl Foco Instagram
    console.log('\n📸 Crawling Foco Instagram (@focopanama)...')
    try {
      const focoIGArticles = await crawlFocoInstagram()
      articles = [...articles, ...focoIGArticles]
    } catch (error) {
      console.error('⚠️  Error crawling Instagram (puede requerir configuración):', error)
      console.log('   Continuando sin posts de Instagram...')
    }

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

  // FILTRO 1: Excluir Gaceta Oficial
  const withoutGaceta = articles.filter((article) =>
    article.sourceName !== 'Gaceta Oficial de Panamá' &&
    !article.url?.includes('gacetaoficial.gob.pa')
  )
  console.log(`📰 Filtro 1 - Excluyendo Gaceta Oficial: ${withoutGaceta.length} de ${articles.length} artículos`)

  // FILTRO 2: SOLO artículos de investigación y fact-checking
  const newsArticles = withoutGaceta.filter(isInvestigativeOrFactCheck)
  console.log(`🔍 Filtro 2 - SOLO investigaciones y fact-checks: ${newsArticles.length} de ${withoutGaceta.length} artículos`)
  console.log(`   ✅ Incluye: verificaciones, investigaciones, denuncias, corrupción, fraude`)
  console.log(`   ❌ Excluye: deportes, entretenimiento, noticias generales, tráfico, clima`)
  console.log(`   ⚠️  Artículos descartados: ${articles.length - newsArticles.length}`)

  let totalClaimsExtracted = 0
  let totalActorsCreated = 0

  try {
    const results = await extractClaimsFromArticles(newsArticles)

    // FASE 3: GUARDAR EN CONVEX
    console.log('\n\n💾 FASE 3: GUARDANDO EN BASE DE DATOS')
    console.log('='.repeat(60))

    for (const { article, claims } of results) {
      console.log(`\n📝 Procesando "${article.title.substring(0, 50)}..."`)
      console.log(`   Fuente: ${article.sourceName}`)

      // Primero obtener o crear la fuente
      let articleId = null
      try {
        // Obtener o crear source
        const source = await getOrCreateSource(article.sourceName)

        if (!source || !source._id) {
          throw new Error(`No se pudo obtener sourceId para ${article.sourceName}`)
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
          publishedDate: new Date(article.publishedDate).getTime(),
          topics: article.category ? [article.category] : [],
          contentHash: contentHash,
          imageUrl: article.imageUrl, // ✅ Agregar imagen del artículo
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

      // EXTRACCIÓN AUTOMÁTICA DE ACTORES
      console.log(`   👥 Extrayendo actores de ${claims.length} claims...`)
      const actorMap = await extractActorsFromClaims(claims, article.title)

      const actorsCreatedInArticle = Array.from(actorMap.values()).filter(id => id !== null).length
      if (actorsCreatedInArticle > 0) {
        totalActorsCreated += actorsCreatedInArticle
      }

      // Guardar cada claim en Convex
      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i]
        const actorId = actorMap.get(i)

        try {
          // Validar speaker (evitar "null" literal)
          const validSpeaker = claim.speaker && claim.speaker !== 'null' && claim.speaker.toLowerCase() !== 'null'
            ? claim.speaker
            : null

          // Crear título válido
          const claimTitle = validSpeaker
            ? `${validSpeaker}: "${claim.text.substring(0, 80)}..."`
            : `"${claim.text.substring(0, 100)}..."`

          // Crear el claim en Convex con actorId si se encontró/creó uno
          const claimData: any = {
            title: claimTitle,
            description: claim.context || claim.text,
            claimText: claim.text,
            category: claim.category || 'otros',
            tags: [article.sourceName, article.category || 'General'].filter(Boolean),
            riskLevel: claim.riskLevel || 'MEDIUM',
            sourceType: 'auto_extracted',
            sourceUrl: article.url,
            imageUrl: article.imageUrl, // ✅ Agregar imagen del artículo al claim
            isPublic: true,
            isFeatured: claim.riskLevel === 'HIGH' || claim.riskLevel === 'CRITICAL',
            autoPublished: true,
            status: 'new', // 🔍 Requiere revisión manual antes de publicar
          }

          // Agregar actorId si existe
          if (actorId) {
            claimData.actorId = actorId
          }

          const claimId = await createClaim(claimData)

          console.log(`   ✅ Claim creado: ${claimId}${actorId ? ' (con actor asociado)' : ''}`)
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
  console.log(`👥 Actores creados/actualizados: ${totalActorsCreated}`)
  console.log(`⏱️  Tiempo total: ${duration}s`)
  console.log('='.repeat(60))

  console.log('\n💡 Próximos pasos:')
  console.log('1. Revisar los claims en http://localhost:3000/admin/dashboard/claims')
  console.log('2. Verificar actores creados en http://localhost:3000/admin/dashboard/actores')
  console.log('3. Aprobar claims para verificación automática')
  console.log('4. Publicar verificaciones en el homepage')

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
