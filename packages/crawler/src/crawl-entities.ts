/**
 * Crawler enfocado en ENTIDADES para VerificaPty
 *
 * Pipeline:
 * 1. Crawlea noticias de medios panameños
 * 2. Extrae entidades con IA (personas, POI, partidos, instituciones)
 * 3. Guarda entidades en Convex con metadatos completos
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import { crawlLaPrensa } from './crawlers/la-prensa.js'
import { crawlGacetaOficial } from './crawlers/gaceta-oficial.js'
import { extractEntitiesFromArticles } from './processors/entity-extractor.js'
import type { ScrapedArticle } from './types/index.js'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado en .env')
}

const client = new ConvexHttpClient(CONVEX_URL)

// Helpers para Convex
async function createOrUpdateEntity(data: any) {
  // Primero buscar si ya existe
  const existing = await client.query('entities:findByName' as any, {
    name: data.name,
  })

  if (existing) {
    // Actualizar entidad existente - excluir normalizedName
    const { normalizedName, ...updateData } = data
    return await client.mutation('entities:update' as any, {
      id: existing._id,
      ...updateData,
    })
  } else {
    // Crear nueva entidad
    return await client.mutation('entities:create' as any, data)
  }
}

async function getSourceBySlug(slug: string) {
  return await client.query('sources:getBySlug' as any, { slug })
}

async function createArticle(data: any) {
  return await client.mutation('articles:create' as any, data)
}

async function createSource(data: any) {
  return await client.mutation('sources:create' as any, data)
}

async function upsertEntityRelation(data: any) {
  return await client.mutation('entityRelations:upsertRelation' as any, data)
}

async function findEntityByName(name: string) {
  return await client.query('entities:findByName' as any, { name })
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
  'Gaceta Oficial': {
    slug: 'gaceta-oficial',
    name: 'Gaceta Oficial de Panamá',
    url: 'https://www.gacetaoficial.gob.pa',
    type: 'official',
  },
}

async function getOrCreateSource(sourceName: string) {
  const config = SOURCE_CONFIG[sourceName]
  if (!config) {
    throw new Error(`Source configuration not found for: ${sourceName}`)
  }

  let source = await getSourceBySlug(config.slug)

  if (!source) {
    console.log(`   📌 Creando fuente: ${config.name}`)
    await createSource({
      name: config.name,
      slug: config.slug,
      url: config.url,
      type: config.type,
      isTrusted: true,
      credibilityScore: 80,
      scrapingEnabled: true,
      scrapingFrequency: '6h',
    })
    source = await getSourceBySlug(config.slug)
  }

  return source
}

function generateContentHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `${Math.abs(hash)}-${content.length}`
}

async function main() {
  console.log('🚀 Crawler de Entidades - VerificaPty\n')
  console.log('='.repeat(60))

  const startTime = Date.now()

  // FASE 1: CRAWLING
  console.log('\n📰 FASE 1: CRAWLING DE NOTICIAS')
  console.log('='.repeat(60))

  let articles: ScrapedArticle[] = []

  try {
    console.log('\n🔍 Crawling La Prensa...')
    const prensaArticles = await crawlLaPrensa()
    articles = [...articles, ...prensaArticles]

    console.log('\n🏛️  Crawling Gaceta Oficial...')
    const gacetaArticles = await crawlGacetaOficial()
    articles = [...articles, ...gacetaArticles]

    console.log(`\n✅ Fase 1 completada: ${articles.length} artículos scrapeados`)
  } catch (error) {
    console.error('❌ Error en fase de crawling:', error)
    process.exit(1)
  }

  // FASE 2: EXTRACCIÓN DE ENTIDADES CON IA
  console.log('\n\n🤖 FASE 2: EXTRACCIÓN DE ENTIDADES CON IA')
  console.log('='.repeat(60))

  let totalEntitiesExtracted = 0
  let totalPOIs = 0
  let entityResults: any[] = []

  try {
    entityResults = await extractEntitiesFromArticles(articles)

    totalEntitiesExtracted = entityResults.reduce(
      (sum, r) => sum + r.entities.length,
      0
    )
    totalPOIs = entityResults.reduce(
      (sum, r) => sum + r.entities.filter((e: any) => e.isPOI).length,
      0
    )

    console.log(`\n✅ Fase 2 completada:`)
    console.log(`   • ${totalEntitiesExtracted} entidades extraídas`)
    console.log(`   • ${totalPOIs} POIs identificados`)
  } catch (error) {
    console.error('❌ Error en fase de extracción:', error)
    process.exit(1)
  }

  // FASE 3: GUARDAR EN CONVEX
  console.log('\n\n💾 FASE 3: GUARDANDO EN BASE DE DATOS')
  console.log('='.repeat(60))

  let entitiesSaved = 0
  let articlesSaved = 0

  for (const { article, entities } of entityResults) {
    console.log(`\n📝 Procesando "${article.title.substring(0, 50)}..."`)

    // Guardar artículo primero
    try {
      const source = await getOrCreateSource(article.source)
      if (!source || !source._id) {
        throw new Error(`No se pudo obtener sourceId para ${article.source}`)
      }

      const contentHash = generateContentHash(article.content)

      await createArticle({
        title: article.title,
        url: article.url,
        content: article.content,
        htmlContent: article.content,
        sourceId: source._id,
        author: article.author,
        publishedDate: article.publishedDate.getTime(),
        topics: article.category ? [article.category] : [],
        contentHash: contentHash,
      })

      articlesSaved++
      console.log(`   ✅ Artículo guardado`)
    } catch (error: any) {
      if (error?.message?.includes('already exists')) {
        console.log(`   ℹ️  Artículo ya existe (duplicado)`)
      } else {
        console.error(`   ❌ Error guardando artículo:`, error)
      }
    }

    // Guardar entidades
    if (entities.length === 0) {
      console.log(`   ℹ️  No se extrajeron entidades`)
      continue
    }

    console.log(`   💾 Guardando ${entities.length} entidades...`)

    for (const entity of entities) {
      try {
        const normalizedName = entity.name.toLowerCase().trim()

        // Mapear tipo de entidad al schema de Convex
        let convexType: string
        switch (entity.type) {
          case 'PERSON':
          case 'POI':
            convexType = 'PERSON'
            break
          case 'POLITICAL_PARTY':
          case 'INSTITUTION':
          case 'MEDIA':
          case 'ORGANIZATION':
            convexType = 'ORGANIZATION'
            break
          default:
            convexType = 'OTHER'
        }

        await createOrUpdateEntity({
          name: entity.name,
          normalizedName: normalizedName,
          type: convexType,
          metadata: {
            position: entity.role || undefined,
            affiliation: entity.affiliation || undefined,
            description: entity.context || undefined,
          },
        })

        entitiesSaved++

        if (entity.isPOI) {
          console.log(`   🎯 POI guardado: ${entity.name} (${entity.role || 'N/A'})`)
        }
      } catch (error: any) {
        console.error(`   ❌ Error guardando entidad "${entity.name}":`, error.message)
      }
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log(`\n✅ Fase 3 completada:`)
  console.log(`   • ${articlesSaved} artículos guardados`)
  console.log(`   • ${entitiesSaved} entidades guardadas`)

  // FASE 4: PROCESAR RELACIONES
  console.log('\n\n🔗 FASE 4: PROCESANDO RELACIONES ENTRE ENTIDADES')
  console.log('='.repeat(60))

  let relationsSaved = 0

  for (const { entities } of entityResults) {
    for (const entity of entities) {
      if (!entity.relationships) continue

      // Buscar la entidad en la base de datos
      const sourceEntity = await findEntityByName(entity.name)
      if (!sourceEntity) {
        console.log(`   ⚠️  Entidad no encontrada: ${entity.name}`)
        continue
      }

      // Procesar OWNS (quién es dueño de qué)
      if (entity.relationships.owns) {
        for (const targetName of entity.relationships.owns) {
          const targetEntity = await findEntityByName(targetName)
          if (targetEntity) {
            try {
              await upsertEntityRelation({
                sourceId: sourceEntity._id,
                sourceType: 'entity',
                targetId: targetEntity._id,
                targetType: 'entity',
                relationType: 'owns',
                strength: 0.8,
                confidence: 0.7,
                context: `${entity.name} es dueño/accionista de ${targetName}`,
              })
              relationsSaved++
              console.log(`   ✅ ${entity.name} → owns → ${targetName}`)
            } catch (error: any) {
              console.error(`   ❌ Error creando relación owns:`, error.message)
            }
          }
        }
      }

      // Procesar WORKS_FOR
      if (entity.relationships.worksFor) {
        for (const targetName of entity.relationships.worksFor) {
          const targetEntity = await findEntityByName(targetName)
          if (targetEntity) {
            try {
              await upsertEntityRelation({
                sourceId: sourceEntity._id,
                sourceType: 'entity',
                targetId: targetEntity._id,
                targetType: 'entity',
                relationType: 'works_for',
                strength: 0.7,
                confidence: 0.7,
                context: `${entity.name} trabaja para ${targetName}`,
              })
              relationsSaved++
              console.log(`   ✅ ${entity.name} → works_for → ${targetName}`)
            } catch (error: any) {
              console.error(`   ❌ Error creando relación works_for:`, error.message)
            }
          }
        }
      }

      // Procesar MEMBER_OF (afiliación política)
      if (entity.relationships.memberOf) {
        for (const targetName of entity.relationships.memberOf) {
          const targetEntity = await findEntityByName(targetName)
          if (targetEntity) {
            try {
              await upsertEntityRelation({
                sourceId: sourceEntity._id,
                sourceType: 'entity',
                targetId: targetEntity._id,
                targetType: 'entity',
                relationType: 'political_connection',
                strength: 0.9,
                confidence: 0.8,
                context: `${entity.name} es miembro de ${targetName}`,
              })
              relationsSaved++
              console.log(`   ✅ ${entity.name} → political_connection → ${targetName}`)
            } catch (error: any) {
              console.error(`   ❌ Error creando relación political:`, error.message)
            }
          }
        }
      }

      // Procesar RELATED_TO (familia, socios, etc.)
      if (entity.relationships.relatedTo) {
        for (const relatedName of entity.relationships.relatedTo) {
          // Extraer el nombre sin el paréntesis (ej: "Rubén Darío (hermano)" -> "Rubén Darío")
          const cleanName = relatedName.replace(/\s*\([^)]*\)/g, '').trim()
          const targetEntity = await findEntityByName(cleanName)

          if (targetEntity) {
            try {
              // Determinar el tipo de relación basado en el contexto
              let relationType: 'family' | 'business' | 'related_to' = 'related_to'
              if (relatedName.toLowerCase().includes('hermano') ||
                  relatedName.toLowerCase().includes('familia') ||
                  relatedName.toLowerCase().includes('primo') ||
                  relatedName.toLowerCase().includes('padre') ||
                  relatedName.toLowerCase().includes('madre')) {
                relationType = 'family'
              } else if (relatedName.toLowerCase().includes('socio') ||
                         relatedName.toLowerCase().includes('negocio')) {
                relationType = 'business'
              }

              await upsertEntityRelation({
                sourceId: sourceEntity._id,
                sourceType: 'entity',
                targetId: targetEntity._id,
                targetType: 'entity',
                relationType: relationType,
                strength: 0.6,
                confidence: 0.6,
                context: `${entity.name} relacionado con ${relatedName}`,
              })
              relationsSaved++
              console.log(`   ✅ ${entity.name} → ${relationType} → ${cleanName}`)
            } catch (error: any) {
              console.error(`   ❌ Error creando relación ${relatedName}:`, error.message)
            }
          }
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  console.log(`\n✅ Fase 4 completada:`)
  console.log(`   • ${relationsSaved} relaciones creadas`)

  // RESUMEN FINAL
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('\n\n🎉 PIPELINE COMPLETADO')
  console.log('='.repeat(60))
  console.log(`📰 Artículos: ${articles.length} scrapeados, ${articlesSaved} guardados`)
  console.log(
    `🎯 Entidades: ${totalEntitiesExtracted} extraídas, ${entitiesSaved} guardadas`
  )
  console.log(`👥 POIs: ${totalPOIs} identificados`)
  console.log(`🔗 Relaciones: ${relationsSaved} creadas`)
  console.log(`⏱️  Tiempo: ${duration}s`)
  console.log('='.repeat(60))

  console.log('\n💡 Próximos pasos:')
  console.log('1. Revisar el grafo de conexiones en http://localhost:3000/admin/dashboard/media-graph')
  console.log('2. Verificar relaciones políticas, familiares y de negocios')
  console.log('3. Analizar patrones de conexión entre entidades')

  process.exit(0)
}

process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error)
  process.exit(1)
})

main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
