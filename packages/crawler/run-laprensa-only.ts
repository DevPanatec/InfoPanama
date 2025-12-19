/**
 * Ejecutar solo el crawler de La Prensa con el pipeline completo
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import { crawlLaPrensa } from './src/crawlers/la-prensa.js'
import type { ScrapedArticle } from './src/types/index.js'
import OpenAI from 'openai'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const client = new ConvexHttpClient(CONVEX_URL)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Helper functions
async function createClaim(data: any) {
  return await client.mutation('claims:create' as any, data)
}

async function createArticle(data: any) {
  return await client.mutation('articles:create' as any, data)
}

async function createSource(data: any) {
  return await client.mutation('sources:create' as any, data)
}

async function createActor(data: any) {
  return await client.mutation('actors:create' as any, data)
}

async function getSourceBySlug(slug: string) {
  return await client.query('sources:getBySlug' as any, { slug })
}

async function getActorByName(name: string) {
  return await client.query('actors:getByName' as any, { name })
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

async function extractClaimsWithAI(articleText: string) {
  const prompt = `Eres un experto en fact-checking. Analiza el siguiente artículo y extrae todas las afirmaciones verificables.

Para cada afirmación, identifica:
1. El texto exacto de la afirmación
2. Quién la hizo (si está especificado)
3. El contexto
4. La categoría (política, economía, salud, seguridad, infraestructura, otros)
5. El nivel de riesgo (LOW, MEDIUM, HIGH, CRITICAL)

Artículo:
${articleText}

Responde SOLO con un JSON array:
[
  {
    "text": "afirmación exacta",
    "speaker": "nombre o null",
    "context": "contexto relevante",
    "category": "categoría",
    "riskLevel": "nivel"
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

async function extractActorsFromClaim(claimText: string, context: string) {
  const prompt = `Identifica personas y organizaciones mencionadas.

Afirmación: "${claimText}"
Contexto: "${context}"

Responde SOLO con un JSON array de strings:
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
  console.log('🚀 Pipeline La Prensa - COMPLETO\n')
  console.log('='.repeat(60))

  try {
    // FASE 1: Crawling
    console.log('\n📰 FASE 1: Crawling La Prensa')
    console.log('-'.repeat(60))

    const articles = await crawlLaPrensa()
    console.log(`\n✅ ${articles.length} artículos scrapeados`)

    // FASE 2: Guardar artículos y extraer claims
    console.log('\n\n💾 FASE 2: Guardando artículos y extrayendo claims')
    console.log('-'.repeat(60))

    let totalClaims = 0

    for (const article of articles) {
      try {
        const source = await getOrCreateSource(article.sourceName)

        console.log(`\n📄 "${article.title.substring(0, 60)}..."`)

        // Generar hash del contenido
        const contentHash = generateContentHash(article.content)

        // Guardar artículo
        let articleId
        try {
          articleId = await createArticle({
            title: article.title,
            url: article.url,
            content: article.content,
            htmlContent: article.content,
            sourceId: source._id,
            author: article.author,
            publishedDate: new Date(article.publishedDate).getTime(),
            topics: article.category ? [article.category] : [],
            contentHash: contentHash,
          })
          console.log(`   ✅ Artículo guardado`)
        } catch (error: any) {
          if (error?.message?.includes('already exists')) {
            console.log(`   ℹ️ Artículo duplicado, saltando...`)
            continue
          } else {
            throw error
          }
        }

        // Extraer claims con IA
        const claims = await extractClaimsWithAI(
          `${article.title}\n\n${article.content.substring(0, 2000)}`
        )

        console.log(`   🤖 ${claims.length} claims extraídos`)

        // Guardar cada claim
        for (const claim of claims) {
          try {
            // Extraer actores
            const actors = await extractActorsFromClaim(claim.text, claim.context)

            // Obtener o crear actor principal
            let actorId = null
            if (claim.speaker && claim.speaker !== 'null') {
              try {
                let actor = await getActorByName(claim.speaker)
                if (!actor) {
                  actorId = await createActor({
                    name: claim.speaker,
                    type: 'person',
                    verified: false,
                  })
                } else {
                  actorId = actor._id
                }
              } catch (error) {
                console.log(`   ⚠️ No se pudo crear actor: ${claim.speaker}`)
              }
            }

            // Crear claim con el formato CORRECTO de Convex
            const claimData: any = {
              title: `${claim.speaker ? claim.speaker + ': ' : ''}"${claim.text.substring(0, 80)}..."`,
              description: claim.context,
              claimText: claim.text,
              category: claim.category,
              tags: [article.sourceName, article.category || 'General', ...actors],
              riskLevel: claim.riskLevel,
              sourceType: 'auto_extracted',
              sourceUrl: article.url,
              imageUrl: article.imageUrl,
              isPublic: true,
              isFeatured: claim.riskLevel === 'HIGH' || claim.riskLevel === 'CRITICAL',
              autoPublished: true,
              status: 'published',
            }

            if (actorId) {
              claimData.actorId = actorId
            }

            await createClaim(claimData)
            totalClaims++
          } catch (error: any) {
            console.error(`   ❌ Error guardando claim: ${error.message}`)
          }
        }

        console.log(`   ✅ ${claims.length} claims guardados`)
      } catch (error: any) {
        console.error(`   ❌ Error procesando artículo: ${error.message}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`\n🎉 COMPLETADO`)
    console.log(`   📰 ${articles.length} artículos procesados`)
    console.log(`   ✅ ${totalClaims} claims guardados en Convex`)
    console.log(`\n💡 Verifica en http://localhost:3000/verificaciones`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

main()
