import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

/**
 * Analizar un artículo para extraer relaciones entre entidades
 */
export const analyzeArticleForRelations = action({
  args: {
    articleId: v.id('articles'),
  },
  handler: async (ctx, args) => {
    // Obtener el artículo
    const article = await ctx.runQuery(api.articles.getById, {
      id: args.articleId,
    })

    if (!article) {
      throw new Error('Article not found')
    }

    // Preparar el prompt para GPT
    const prompt = `Analiza el siguiente artículo y extrae todas las relaciones entre entidades (personas, organizaciones, medios, eventos).

Artículo:
Título: ${article.title}
Contenido: ${article.content || article.summary}
Fuente: ${article.source}

Identifica:
1. Todas las entidades mencionadas (personas, organizaciones, medios)
2. Las relaciones entre ellas (trabaja para, es dueño de, apoya, se opone, etc.)
3. La fuerza de cada relación (0-100) basada en qué tan explícita y significativa es
4. El sentimiento de la relación (-100 a 100, negativo = conflicto, positivo = apoyo)

Responde ÚNICAMENTE con un JSON válido sin markdown, con el siguiente formato:
{
  "entities": [
    {"name": "Nombre", "type": "PERSON|ORGANIZATION|MEDIA"},
    ...
  ],
  "relations": [
    {
      "source": "Nombre Entidad 1",
      "sourceType": "PERSON|ORGANIZATION|MEDIA",
      "target": "Nombre Entidad 2",
      "targetType": "PERSON|ORGANIZATION|MEDIA",
      "relationType": "owns|works_for|affiliated_with|mentioned_with|quoted_by|covers|related_to|opposes|supports",
      "strength": 75,
      "confidence": 85,
      "sentiment": 50,
      "context": "Breve explicación de la relación"
    },
    ...
  ]
}`

    try {
      // Llamar a OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto analista de medios especializado en identificar relaciones entre entidades políticas, mediáticas y sociales. Respondes únicamente con JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parsear respuesta
      const analysis = JSON.parse(content)

      // Crear/actualizar entidades en la base de datos
      const entityMap = new Map<string, string>() // nombre -> id

      for (const entity of analysis.entities) {
        // Buscar si la entidad ya existe
        const existing = await ctx.runQuery(api.entities.findByName, {
          name: entity.name,
        })

        if (existing) {
          entityMap.set(entity.name, existing._id)
          // Agregar mención al artículo
          await ctx.runMutation(api.entities.addMention, {
            entityId: existing._id,
            articleId: args.articleId,
          })
        } else {
          // Crear nueva entidad
          const normalized = entity.name.toLowerCase().trim()
          const newEntityId = await ctx.runMutation(api.entities.create, {
            name: entity.name,
            normalizedName: normalized,
            type: entity.type,
          })
          // Agregar mención al artículo
          await ctx.runMutation(api.entities.addMention, {
            entityId: newEntityId,
            articleId: args.articleId,
          })
          entityMap.set(entity.name, newEntityId)
        }
      }

      // Crear relaciones
      const createdRelations = []
      for (const relation of analysis.relations) {
        const sourceId = entityMap.get(relation.source)
        const targetId = entityMap.get(relation.target)

        if (!sourceId || !targetId) {
          console.warn(
            `Skipping relation: missing entity IDs for ${relation.source} -> ${relation.target}`
          )
          continue
        }

        // Mapear tipo de entidad a tipo del grafo
        const mapEntityType = (type: string) => {
          if (type === 'PERSON') return 'entity'
          if (type === 'ORGANIZATION') return 'entity'
          if (type === 'MEDIA') return 'source'
          return 'entity'
        }

        const relationId = await ctx.runMutation(
          api.entityRelations.upsertRelation,
          {
            sourceId,
            sourceType: mapEntityType(relation.sourceType),
            targetId,
            targetType: mapEntityType(relation.targetType),
            relationType: relation.relationType,
            strength: relation.strength,
            confidence: relation.confidence,
            context: relation.context,
            evidenceArticleIds: [args.articleId],
          }
        )

        createdRelations.push(relationId)
      }

      return {
        success: true,
        entitiesFound: analysis.entities.length,
        relationsCreated: createdRelations.length,
        analysis: analysis,
      }
    } catch (error) {
      console.error('Error analyzing article:', error)
      throw new Error(`Failed to analyze article: ${error}`)
    }
  },
})

/**
 * Analizar múltiples artículos en batch
 */
export const analyzeBatchArticles = action({
  args: {
    articleIds: v.array(v.id('articles')),
  },
  handler: async (ctx, args) => {
    const results = []

    for (const articleId of args.articleIds) {
      try {
        const result = await ctx.runAction(
          api.graphAnalysis.analyzeArticleForRelations,
          {
            articleId,
          }
        )
        results.push({ articleId, ...result })
      } catch (error) {
        results.push({
          articleId,
          success: false,
          error: String(error),
        })
      }
    }

    return {
      total: args.articleIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    }
  },
})

/**
 * Generar relaciones automáticas por co-mención
 * Conecta entidades que aparecen juntas en el mismo artículo
 */
export const generateCoMentionRelations = action({
  args: {
    articleIds: v.optional(v.array(v.id('articles'))),
  },
  handler: async (ctx, args) => {
    console.log('🔄 Iniciando generación de co-menciones...')

    // Si no se especifican artículos, obtener todos
    const articles = args.articleIds
      ? await Promise.all(
          args.articleIds.map((id) => ctx.runQuery(api.articles.getById, { id }))
        )
      : await ctx.runQuery(api.articles.list, { limit: 100 })

    if (!articles || articles.length === 0) {
      return {
        success: false,
        message: 'No hay artículos para procesar',
        articlesProcessed: 0,
        relationsCreated: 0,
      }
    }

    console.log(`📄 Procesando ${articles.length} artículos...`)

    let totalRelationsCreated = 0
    const relationStats = new Map<string, number>() // Para contar co-menciones

    for (const article of articles) {
      if (!article) continue

      // Obtener todas las entidades que mencionan este artículo
      const entities = await ctx.runQuery(api.entities.findByArticle, {
        articleId: article._id,
      })

      if (entities.length < 2) {
        console.log(`⏭️  Artículo ${article._id}: solo ${entities.length} entidad(es), saltando`)
        continue
      }

      console.log(`🔗 Artículo ${article._id}: ${entities.length} entidades encontradas`)

      // Crear relaciones entre cada par de entidades
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const entity1 = entities[i]
          const entity2 = entities[j]

          // Crear clave única para el par (ordenada alfabéticamente)
          const pairKey = [entity1._id, entity2._id].sort().join('|')
          const currentCount = relationStats.get(pairKey) || 0
          relationStats.set(pairKey, currentCount + 1)

          // Calcular strength basado en frecuencia de co-mención
          // Primera mención = 30, cada mención adicional suma 10 (máximo 100)
          const strength = Math.min(100, 30 + currentCount * 10)

          // Confidence aumenta con más co-menciones
          const confidence = Math.min(95, 60 + currentCount * 5)

          try {
            await ctx.runMutation(api.entityRelations.upsertRelation, {
              sourceId: entity1._id,
              sourceType: 'entity',
              targetId: entity2._id,
              targetType: 'entity',
              relationType: 'mentioned_with',
              strength,
              confidence,
              context: `Co-mencionados en: ${article.title}`,
              evidenceArticleIds: [article._id],
            })

            totalRelationsCreated++
          } catch (error) {
            console.error(`Error creando relación ${entity1.name} <-> ${entity2.name}:`, error)
          }
        }
      }
    }

    console.log(`✅ Co-menciones completadas: ${totalRelationsCreated} relaciones creadas`)

    return {
      success: true,
      articlesProcessed: articles.length,
      relationsCreated: totalRelationsCreated,
      uniquePairs: relationStats.size,
    }
  },
})

/**
 * Obtener sugerencias de relaciones usando IA
 */
export const suggestRelations = action({
  args: {
    entityId: v.string(),
    entityName: v.string(),
    entityType: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Basándote en tu conocimiento sobre Panamá y el contexto político/mediático, sugiere posibles relaciones para:

Entidad: ${args.entityName}
Tipo: ${args.entityType}

Sugiere:
1. Entidades relacionadas (personas, organizaciones, medios)
2. Tipo de relación
3. Nivel de confianza de que esta relación existe (0-100)

Responde ÚNICAMENTE con un JSON válido sin markdown:
{
  "suggestions": [
    {
      "targetName": "Nombre de la entidad relacionada",
      "targetType": "PERSON|ORGANIZATION|MEDIA|EVENT",
      "relationType": "owns|works_for|affiliated_with|covers|supports|opposes",
      "confidence": 75,
      "reasoning": "Breve explicación de por qué esta relación es probable"
    }
  ]
}`

    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en política y medios de Panamá. Conoces las relaciones entre figuras políticas, medios de comunicación y organizaciones.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const suggestions = JSON.parse(content)
      return suggestions
    } catch (error) {
      console.error('Error getting suggestions:', error)
      throw new Error(`Failed to get suggestions: ${error}`)
    }
  },
})
