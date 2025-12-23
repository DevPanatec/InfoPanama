/**
 * Test rápido del fix de sourceName - solo La Prensa
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import OpenAI from 'openai'
import { crawlLaPrensa } from './src/crawlers/la-prensa.js'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Helper functions
async function createClaim(data: any) {
  return await convex.mutation('claims:create' as any, data)
}

async function createArticle(data: any) {
  return await convex.mutation('articles:create' as any, data)
}

async function createSource(data: any) {
  return await convex.mutation('sources:create' as any, data)
}

async function getSourceBySlug(slug: string) {
  return await convex.query('sources:getBySlug' as any, { slug })
}

function generateContentHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

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
}

async function getOrCreateSource(sourceName: string) {
  const config = SOURCE_CONFIG[sourceName]

  if (!config) {
    throw new Error(`Source configuration not found for: ${sourceName}`)
  }

  // Buscar source existente
  let source = await getSourceBySlug(config.slug)

  if (!source) {
    console.log(`   📝 Creando nueva fuente: ${config.name}`)
    const sourceId = await createSource({
      slug: config.slug,
      name: config.name,
      url: config.url,
      type: config.type,
      verifiedSource: true,
    })
    source = { _id: sourceId, name: config.name }
  }

  return source
}

async function extractClaims(articleText: string) {
  const prompt = `Eres un experto en fact-checking. Analiza el siguiente artículo y extrae todas las afirmaciones verificables.

Para cada afirmación, identifica:
1. El texto exacto de la afirmación
2. Quién la hizo (si está especificado)
3. El contexto
4. La categoría (política, economía, salud, seguridad, infraestructura, otros)
5. El nivel de riesgo (LOW, MEDIUM, HIGH, CRITICAL)
6. Si es verificable (true/false)
7. Tu nivel de confianza (0-1)

Artículo:
${articleText}

Responde SOLO con un JSON array de objetos con este formato:
[
  {
    "text": "afirmación exacta",
    "speaker": "nombre o null",
    "context": "contexto relevante",
    "category": "categoría",
    "riskLevel": "nivel",
    "isVerifiable": boolean,
    "confidence": número
  }
]`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('   ❌ Error extrayendo claims:', error)
    return []
  }
}

async function extractActors(claimText: string, context: string) {
  const prompt = `Identifica personas y organizaciones mencionadas en esta afirmación.

Afirmación: "${claimText}"
Contexto: "${context}"

Responde SOLO con un JSON array de strings con nombres de personas u organizaciones:
["Nombre 1", "Nombre 2"]

Si no hay actores, responde: []`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('   ❌ Error extrayendo actores:', error)
    return []
  }
}

async function main() {
  console.log('🧪 TEST RÁPIDO - VERIFICANDO FIX DE SOURCENAME\n')
  console.log('=' .repeat(60))

  try {
    // FASE 1: Crawling
    console.log('\n📰 FASE 1: Crawling La Prensa')
    console.log('-'.repeat(60))

    const articles = await crawlLaPrensa()

    console.log(`\n✅ Scraping completado: ${articles.length} artículos`)

    if (articles.length === 0) {
      console.log('❌ No se encontraron artículos. Abortando test.')
      return
    }

    // Verificar que tengan sourceName
    const firstArticle = articles[0]
    console.log('\n🔍 Verificando estructura del primer artículo:')
    console.log(`   sourceName: ${firstArticle.sourceName || '❌ UNDEFINED'}`)
    console.log(`   sourceUrl: ${firstArticle.sourceUrl || '❌ UNDEFINED'}`)
    console.log(`   sourceType: ${firstArticle.sourceType || '❌ UNDEFINED'}`)
    console.log(`   scrapedAt: ${firstArticle.scrapedAt || '❌ UNDEFINED'}`)

    if (!firstArticle.sourceName) {
      console.log('\n❌ ERROR: sourceName sigue siendo undefined!')
      console.log('   El fix no funcionó correctamente.')
      return
    }

    // FASE 2: Extracción de claims
    console.log('\n\n🤖 FASE 2: Extracción de Claims con IA')
    console.log('-'.repeat(60))

    let totalClaims = 0

    for (const article of articles) {
      console.log(`\n📄 "${article.title.substring(0, 60)}..."`)

      const claims = await extractClaims(
        `${article.title}\n\n${article.content.substring(0, 2000)}`
      )

      console.log(`   ✅ ${claims.length} claims extraídos`)
      totalClaims += claims.length
    }

    console.log(`\n✅ Total claims extraídos: ${totalClaims}`)

    // FASE 3: Guardar a Convex
    console.log('\n\n💾 FASE 3: Guardando a Convex')
    console.log('-'.repeat(60))

    let savedCount = 0

    for (const article of articles) {
      try {
        // Obtener o crear source
        const source = await getOrCreateSource(article.sourceName)

        console.log(`\n📄 Guardando: "${article.title.substring(0, 60)}..."`)
        console.log(`   Source: ${source.name} (ID: ${source._id})`)

        // Generar hash del contenido
        const contentHash = generateContentHash(article.content)

        // Guardar artículo
        const articleId = await createArticle({
          title: article.title,
          url: article.url,
          content: article.content,
          contentHash: contentHash,
          sourceId: source._id,
          publishedDate: new Date(article.publishedDate).getTime(),
          author: article.author || undefined,
        })

        console.log(`   ✅ Artículo guardado (ID: ${articleId})`)

        // Extraer y guardar claims
        const claims = await extractClaims(
          `${article.title}\n\n${article.content.substring(0, 2000)}`
        )

        for (const claim of claims) {
          try {
            const actors = await extractActors(claim.text, claim.context)

            await createClaim({
              text: claim.text,
              speaker: claim.speaker || undefined,
              context: claim.context,
              category: claim.category,
              riskLevel: claim.riskLevel,
              isVerifiable: claim.isVerifiable,
              confidence: claim.confidence,
              sourceId: source._id,
              articleId,
              tags: actors,
            })

            savedCount++
          } catch (error: any) {
            console.error(`   ❌ Error guardando claim: ${error.message}`)
          }
        }

        console.log(`   ✅ ${claims.length} claims guardados`)
      } catch (error: any) {
        console.error(`   ❌ Error guardando artículo: ${error.message}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n🎉 TEST COMPLETADO`)
    console.log(`   ✅ ${savedCount} claims guardados exitosamente`)
    console.log(`\n💡 Verifica en http://localhost:3000/verificaciones`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('❌ Error en test:', error)
    throw error
  }
}

main()
