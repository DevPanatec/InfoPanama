import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { Doc, Id } from './_generated/dataModel'

/**
 * Obtener grafo completo OSINT con TODOS los nodos y relaciones
 * Siempre muestra todos los actores, fuentes y entidades, tengan o no relaciones
 */
export const getFullGraph = query({
  args: {},
  handler: async (ctx) => {
    // Obtener todos los actores
    const actors = await ctx.db.query('actors').collect()

    // Obtener todas las fuentes
    const sources = await ctx.db.query('sources').collect()

    // Obtener todas las entidades
    const entities = await ctx.db.query('entities').collect()

    // Obtener todas las relaciones activas
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Crear nodos
    const nodes = []

    // Agregar actores como nodos
    for (const actor of actors) {
      nodes.push({
        id: actor._id,
        type: 'actor',
        label: actor.name,
        data: {
          ...actor,
          mentionCount: 0, // TODO: Calculate from relations
        },
      })
    }

    // Agregar fuentes como nodos
    for (const source of sources) {
      nodes.push({
        id: source._id,
        type: 'source',
        label: source.name,
        data: {
          ...source,
          description: source.description || '',
          mentionCount: source.articleCount || 0,
        },
      })
    }

    // Agregar entidades como nodos (SOLO PERSON y ORGANIZATION - ignorar fechas, locaciones, etc)
    for (const entity of entities) {
      // Filtrar solo entidades relevantes para el grafo OSINT
      if (entity.type === 'PERSON' || entity.type === 'ORGANIZATION') {
        nodes.push({
          id: entity._id,
          type: 'entity',
          label: entity.name,
          data: {
            ...entity,
            description: entity.metadata?.description || '',
            position: entity.metadata?.position || undefined,
            affiliation: entity.metadata?.affiliation || undefined,
            mentionCount: entity.mentionCount || 0,
          },
        })
      }
    }

    // Crear edges (conexiones)
    const edges = relations.map((rel) => ({
      id: rel._id,
      source: rel.sourceId,
      target: rel.targetId,
      type: rel.relationType,
      strength: rel.strength,
      confidence: rel.confidence,
      context: rel.context,
      data: rel,
    }))

    return { nodes, edges }
  },
})

/**
 * Obtener todas las relaciones activas para el grafo
 */
export const getGraphData = query({
  args: {
    limit: v.optional(v.number()),
    minStrength: v.optional(v.number()),
    relationTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    const minStrength = args.minStrength ?? 0

    let relationsQuery = ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))

    // Filtrar por fuerza mínima
    if (minStrength > 0) {
      relationsQuery = relationsQuery.filter((q) =>
        q.gte(q.field('strength'), minStrength)
      )
    }

    const relations = await relationsQuery.take(limit)

    // Filtrar por tipo de relación si se especifica
    const filteredRelations = args.relationTypes?.length
      ? relations.filter((r) => args.relationTypes!.includes(r.relationType))
      : relations

    // Obtener todos los nodos únicos
    const nodeIds = new Map<string, { id: string; type: string }>()

    for (const relation of filteredRelations) {
      nodeIds.set(relation.sourceId, {
        id: relation.sourceId,
        type: relation.sourceType,
      })
      nodeIds.set(relation.targetId, {
        id: relation.targetId,
        type: relation.targetType,
      })
    }

    // Obtener detalles de cada nodo
    const nodes = await Promise.all(
      Array.from(nodeIds.values()).map(async (node) => {
        let data: any = null

        switch (node.type) {
          case 'actor':
            data = await ctx.db.get(node.id as Id<'actors'>)
            break
          case 'source':
            data = await ctx.db.get(node.id as Id<'sources'>)
            break
          case 'entity':
            data = await ctx.db.get(node.id as Id<'entities'>)
            break
          case 'event':
            data = await ctx.db.get(node.id as Id<'events'>)
            break
        }

        return {
          id: node.id,
          type: node.type,
          data: data,
        }
      })
    )

    return {
      nodes: nodes.filter((n) => n.data !== null),
      edges: filteredRelations,
    }
  },
})

/**
 * Obtener relaciones de una entidad específica
 */
export const getEntityRelations = query({
  args: {
    entityId: v.string(),
    entityType: v.union(
      v.literal('actor'),
      v.literal('source'),
      v.literal('entity'),
      v.literal('event')
    ),
  },
  handler: async (ctx, args) => {
    // Relaciones donde la entidad es source
    const outgoing = await ctx.db
      .query('entityRelations')
      .withIndex('by_source', (q) =>
        q.eq('sourceId', args.entityId).eq('sourceType', args.entityType)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Relaciones donde la entidad es target
    const incoming = await ctx.db
      .query('entityRelations')
      .withIndex('by_target', (q) =>
        q.eq('targetId', args.entityId).eq('targetType', args.entityType)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    return {
      outgoing,
      incoming,
      total: outgoing.length + incoming.length,
    }
  },
})

/**
 * Crear o actualizar una relación
 */
export const upsertRelation = mutation({
  args: {
    sourceId: v.string(),
    sourceType: v.union(
      v.literal('actor'),
      v.literal('source'),
      v.literal('entity'),
      v.literal('event')
    ),
    targetId: v.string(),
    targetType: v.union(
      v.literal('actor'),
      v.literal('source'),
      v.literal('entity'),
      v.literal('event')
    ),
    relationType: v.union(
      v.literal('owns'),
      v.literal('works_for'),
      v.literal('affiliated_with'),
      v.literal('mentioned_with'),
      v.literal('quoted_by'),
      v.literal('covers'),
      v.literal('participates_in'),
      v.literal('related_to'),
      v.literal('opposes'),
      v.literal('supports'),
      v.literal('political_connection'),
      v.literal('family'),
      v.literal('business')
    ),
    strength: v.number(),
    confidence: v.number(),
    context: v.optional(v.string()),
    evidenceArticleIds: v.optional(v.array(v.id('articles'))),
  },
  handler: async (ctx, args) => {
    // Buscar si ya existe la relación
    const existing = await ctx.db
      .query('entityRelations')
      .withIndex('by_source', (q) =>
        q.eq('sourceId', args.sourceId).eq('sourceType', args.sourceType)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('targetId'), args.targetId),
          q.eq(q.field('targetType'), args.targetType),
          q.eq(q.field('relationType'), args.relationType)
        )
      )
      .first()

    const now = Date.now()
    const evidenceArticles = args.evidenceArticleIds ?? []

    if (existing) {
      // Actualizar existente
      await ctx.db.patch(existing._id, {
        strength: args.strength,
        confidence: args.confidence,
        context: args.context,
        evidenceArticles: [
          ...new Set([...existing.evidenceArticles, ...evidenceArticles]),
        ],
        evidenceCount:
          existing.evidenceCount + (args.evidenceArticleIds?.length ?? 0),
        updatedAt: now,
      })
      return existing._id
    } else {
      // Crear nueva
      const relationId = await ctx.db.insert('entityRelations', {
        sourceId: args.sourceId,
        sourceType: args.sourceType,
        targetId: args.targetId,
        targetType: args.targetType,
        relationType: args.relationType,
        strength: args.strength,
        confidence: args.confidence,
        context: args.context,
        evidenceArticles: evidenceArticles,
        evidenceCount: evidenceArticles.length,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      return relationId
    }
  },
})

/**
 * Desactivar una relación
 */
export const deactivateRelation = mutation({
  args: {
    relationId: v.id('entityRelations'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.relationId, {
      isActive: false,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Obtener estadísticas del grafo
 */
export const getGraphStats = query({
  handler: async (ctx) => {
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    const nodeIds = new Set<string>()
    const relationTypes = new Map<string, number>()

    for (const relation of relations) {
      nodeIds.add(relation.sourceId)
      nodeIds.add(relation.targetId)

      const count = relationTypes.get(relation.relationType) ?? 0
      relationTypes.set(relation.relationType, count + 1)
    }

    return {
      totalNodes: nodeIds.size,
      totalEdges: relations.length,
      relationTypes: Object.fromEntries(relationTypes),
      avgStrength:
        relations.reduce((sum, r) => sum + r.strength, 0) / relations.length ||
        0,
    }
  },
})

/**
 * Eliminar todas las relaciones (para limpiar datos mock)
 */
export const deleteAll = mutation({
  handler: async (ctx) => {
    const relations = await ctx.db.query('entityRelations').collect()

    for (const relation of relations) {
      await ctx.db.delete(relation._id)
    }

    return { deleted: relations.length }
  },
})
