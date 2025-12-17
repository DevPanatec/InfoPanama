import { v } from 'convex/values'
import { action, internalAction } from './_generated/server'
import { internal } from './_generated/api'
import OpenAI from 'openai'

/**
 * GRAPH ANALYSIS - Análisis de grafos con IA
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Analizar artículo y extraer entidades y relaciones
 */
export const analyzeArticle = internalAction({
  args: {
    articleId: v.id('articles'),
  },
  handler: async (ctx, args) => {
    // Obtener el artículo
    const article = await ctx.runQuery(internal.articles.getById, {
      id: args.articleId,
    })

    if (!article) {
      return { success: false, error: 'Article not found' }
    }

    try {
      // Prompt para OpenAI
      const prompt = `Analiza el siguiente artículo de noticias de Panamá y extrae:
1. Entidades (personas, organizaciones, lugares, eventos)
2. Relaciones entre entidades
3. Tipo de cada relación (dueño_de, trabaja_para, afiliado_con, mencionado_con, citado_por, participa_en)

Artículo:
Título: ${article.title}
Contenido: ${article.content.substring(0, 3000)}

Retorna un JSON con este formato:
{
  "entities": [
    { "name": "Nombre", "type": "PERSON|ORGANIZATION|LOCATION|EVENT", "metadata": { "position": "cargo opcional", "description": "descripción opcional" } }
  ],
  "relations": [
    { "source": "Nombre A", "target": "Nombre B", "type": "tipo_relacion", "strength": 50-100, "context": "contexto de la relación" }
  ]
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en análisis de noticias y extracción de entidades. Retorna siempre JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        return { success: false, error: 'No response from OpenAI' }
      }

      const analysis = JSON.parse(content)

      // Guardar entidades y relaciones
      const entityIds = new Map<string, string>()

      // Crear/actualizar entidades
      for (const entity of analysis.entities || []) {
        const normalizedName = entity.name.toLowerCase().trim()

        // Buscar si ya existe
        const existing = await ctx.runQuery(internal.entities.findByName, {
          name: normalizedName,
        })

        let entityId: string
        if (existing) {
          entityId = existing._id
          // Agregar mención
          await ctx.runMutation(internal.entities.addMention, {
            entityId: existing._id,
            articleId: args.articleId,
          })
        } else {
          // Crear nueva entidad
          entityId = await ctx.runMutation(internal.entities.create, {
            name: entity.name,
            normalizedName,
            type: entity.type,
            metadata: entity.metadata,
          })

          // Agregar mención
          await ctx.runMutation(internal.entities.addMention, {
            entityId,
            articleId: args.articleId,
          })
        }

        entityIds.set(entity.name, entityId)
      }

      // Crear relaciones
      for (const relation of analysis.relations || []) {
        const sourceId = entityIds.get(relation.source)
        const targetId = entityIds.get(relation.target)

        if (sourceId && targetId) {
          await ctx.runMutation(internal.entityRelations.create, {
            sourceId,
            targetId,
            type: relation.type,
            strength: relation.strength || 50,
            context: relation.context,
            articleId: args.articleId,
          })
        }
      }

      return {
        success: true,
        entitiesCount: analysis.entities?.length || 0,
        relationsCount: analysis.relations?.length || 0,
      }
    } catch (error) {
      console.error('Error analyzing article:', error)
      return { success: false, error: String(error) }
    }
  },
})

/**
 * Analizar batch de artículos
 */
export const analyzeBatchArticles = action({
  args: {
    articleIds: v.array(v.id('articles')),
  },
  handler: async (ctx, args) => {
    console.log('🔬 Analizando batch de artículos:', args.articleIds.length)

    let successful = 0
    let failed = 0

    for (const articleId of args.articleIds) {
      try {
        const result = await ctx.runAction(internal.graphAnalysis.analyzeArticle, {
          articleId,
        })

        if (result.success) {
          successful++
        } else {
          failed++
        }

        // Pequeño delay para evitar rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error analyzing article ${articleId}:`, error)
        failed++
      }
    }

    return { successful, failed, total: args.articleIds.length }
  },
})

/**
 * Generar relaciones por co-menciones
 */
export const generateCoMentionRelations = action({
  args: {},
  handler: async (ctx) => {
    console.log('🔗 Generando relaciones por co-menciones...')

    try {
      // Obtener todos los artículos
      const articles = await ctx.runQuery(internal.articles.list, { limit: 1000 })

      let relationsCreated = 0
      const entityPairs = new Map<string, number>()

      for (const article of articles) {
        // Obtener entidades mencionadas en este artículo
        const entities = await ctx.runQuery(internal.entities.findByArticle, {
          articleId: article._id,
        })

        // Crear relaciones entre cada par de entidades mencionadas juntas
        for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
            const entity1 = entities[i]
            const entity2 = entities[j]

            // Ordenar los IDs para evitar duplicados (A-B vs B-A)
            const pairKey = [entity1._id, entity2._id].sort().join('-')

            // Incrementar contador de co-menciones
            const currentCount = entityPairs.get(pairKey) || 0
            entityPairs.set(pairKey, currentCount + 1)
          }
        }
      }

      // Crear relaciones basadas en co-menciones
      for (const [pairKey, mentionCount] of entityPairs.entries()) {
        const [sourceId, targetId] = pairKey.split('-')

        // Solo crear relación si hay al menos 2 co-menciones
        if (mentionCount >= 2) {
          try {
            // Verificar si ya existe una relación
            const existing = await ctx.runQuery(internal.entityRelations.getRelation, {
              sourceId,
              targetId,
            })

            if (!existing) {
              // Calcular strength basado en número de co-menciones
              const strength = Math.min(100, 30 + mentionCount * 10)

              await ctx.runMutation(internal.entityRelations.create, {
                sourceId,
                targetId,
                type: 'mentioned_with',
                strength,
                context: `Co-mencionados ${mentionCount} veces`,
              })

              relationsCreated++
            }
          } catch (error) {
            console.error(`Error creating relation ${pairKey}:`, error)
          }
        }
      }

      return {
        success: true,
        relationsCreated,
        uniquePairs: entityPairs.size,
        articlesProcessed: articles.length,
        message: `Se crearon ${relationsCreated} relaciones de co-mención`,
      }
    } catch (error) {
      console.error('Error generating co-mention relations:', error)
      return {
        success: false,
        message: `Error: ${error}`,
      }
    }
  },
})

/**
 * Obtener sugerencias de relaciones para una entidad usando IA
 */
export const getSuggestedRelations = action({
  args: {
    entityId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    try {
      // Obtener la entidad
      const entity = await ctx.runQuery(internal.entities.getById, {
        id: args.entityId,
      })

      if (!entity) {
        throw new Error('Entity not found')
      }

      // Obtener artículos donde se menciona esta entidad
      const articles = []
      for (const articleId of entity.mentionedIn.slice(0, 5)) {
        // Máximo 5 artículos
        const article = await ctx.runQuery(internal.articles.getById, {
          id: articleId,
        })
        if (article) {
          articles.push(article)
        }
      }

      // Obtener relaciones existentes
      const existingRelations = await ctx.runQuery(
        internal.entityRelations.getEntityRelations,
        { entityId: args.entityId }
      )

      // Preparar contexto para la IA
      const articlesContext = articles
        .map(
          (a) => `
Título: ${a.title}
Contenido: ${a.content.substring(0, 1000)}...
`
        )
        .join('\n---\n')

      const existingContext = existingRelations
        .map((r) => `- Relación con ${r.target.label}: ${r.type}`)
        .join('\n')

      const prompt = `Analiza la siguiente entidad y sugiere nuevas relaciones que podrían existir pero no están registradas:

Entidad: ${entity.name}
Tipo: ${entity.type}

Relaciones existentes:
${existingContext || 'Ninguna'}

Contexto de artículos donde se menciona:
${articlesContext}

Basándote en el contexto, sugiere nuevas relaciones posibles con otras entidades que aparecen en los artículos.

Retorna un JSON con este formato:
{
  "suggestions": [
    {
      "targetEntity": "Nombre de la entidad relacionada",
      "relationType": "tipo_relacion",
      "confidence": 0-100,
      "reason": "razón por la que sugieres esta relación",
      "evidence": "cita del artículo que respalda esta relación"
    }
  ]
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en análisis de relaciones y entidades en contextos políticos y de medios. Retorna siempre JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      })

      const content = completion.choices[0]?.message?.content
      const finishReason = completion.choices[0]?.finish_reason

      if (finishReason === 'length') {
        throw new Error('Model response was cut off due to token limit')
      }
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

/**
 * Reanalizar entidades marcadas para revisión
 * Esta acción busca todas las entidades marcadas y rehace el análisis de IA
 * para encontrar nuevas relaciones
 */
export const reanalyzeMarkedEntities = action({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    console.log('🔄 Reanalizando entidades marcadas para revisión...')

    try {
      // Obtener entidades marcadas
      const markedEntities = await ctx.runQuery(internal.entities.getMarkedForReview, {
        limit,
      })

      if (markedEntities.length === 0) {
        return {
          success: true,
          message: 'No hay entidades marcadas para revisión',
          processed: 0,
          newRelations: 0,
        }
      }

      console.log(`📋 Encontradas ${markedEntities.length} entidades marcadas`)

      let processed = 0
      let totalNewRelations = 0

      for (const entity of markedEntities) {
        try {
          console.log(`🔍 Analizando: ${entity.name}`)

          // Obtener sugerencias de la IA
          const suggestions = await ctx.runAction(
            internal.graphAnalysis.getSuggestedRelations,
            { entityId: entity._id }
          )

          // Procesar cada sugerencia
          for (const suggestion of suggestions.suggestions || []) {
            // Solo procesar sugerencias con alta confianza
            if (suggestion.confidence >= 60) {
              // Buscar o crear la entidad target
              const targetEntityName = suggestion.targetEntity.toLowerCase().trim()
              let targetEntity = await ctx.runQuery(internal.entities.findByName, {
                name: targetEntityName,
              })

              if (!targetEntity) {
                // Crear la entidad si no existe
                const targetEntityId = await ctx.runMutation(internal.entities.create, {
                  name: suggestion.targetEntity,
                  normalizedName: targetEntityName,
                  type: 'OTHER', // Tipo por defecto
                })
                targetEntity = await ctx.runQuery(internal.entities.getById, {
                  id: targetEntityId,
                })
              }

              if (targetEntity) {
                // Verificar si ya existe esta relación
                const existingRelation = await ctx.runQuery(
                  internal.entityRelations.getRelation,
                  {
                    sourceId: entity._id,
                    targetId: targetEntity._id,
                  }
                )

                if (!existingRelation) {
                  // Crear nueva relación
                  await ctx.runMutation(internal.entityRelations.create, {
                    sourceId: entity._id,
                    targetId: targetEntity._id,
                    type: suggestion.relationType,
                    strength: suggestion.confidence,
                    context: suggestion.reason,
                  })

                  totalNewRelations++
                  console.log(
                    `✅ Nueva relación: ${entity.name} -> ${targetEntity.name} (${suggestion.relationType})`
                  )
                }
              }
            }
          }

          // Desmarcar la entidad después de procesarla
          await ctx.runMutation(internal.entities.unmarkForReview, {
            entityId: entity._id,
          })

          processed++

          // Delay para evitar rate limits
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } catch (error) {
          console.error(`Error procesando entidad ${entity.name}:`, error)
        }
      }

      return {
        success: true,
        message: `Se procesaron ${processed} entidades y se encontraron ${totalNewRelations} nuevas relaciones`,
        processed,
        newRelations: totalNewRelations,
      }
    } catch (error) {
      console.error('Error reanalizando entidades:', error)
      return {
        success: false,
        message: `Error: ${error}`,
        processed: 0,
        newRelations: 0,
      }
    }
  },
})
