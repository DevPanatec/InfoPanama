import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * ENTITIES - Gestión de entidades extraídas mediante NER (Named Entity Recognition)
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar todas las entidades
 */
export const list = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('PERSON'),
        v.literal('ORGANIZATION'),
        v.literal('LOCATION'),
        v.literal('EVENT'),
        v.literal('DATE'),
        v.literal('OTHER')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type, limit = 50 } = args

    if (type) {
      return await ctx.db
        .query('entities')
        .withIndex('by_type', (q) => q.eq('type', type))
        .order('desc')
        .take(limit)
    }

    return await ctx.db.query('entities').order('desc').take(limit)
  },
})

/**
 * Obtener entidad por ID
 */
export const getById = query({
  args: { id: v.id('entities') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener entidad por nombre normalizado
 */
export const getByName = query({
  args: { normalizedName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('entities')
      .withIndex('by_name', (q) => q.eq('normalizedName', args.normalizedName))
      .first()
  },
})

/**
 * Buscar entidad por nombre (alias para getByName)
 */
export const findByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.name.toLowerCase().trim()
    return await ctx.db
      .query('entities')
      .withIndex('by_name', (q) => q.eq('normalizedName', normalized))
      .first()
  },
})

/**
 * Obtener entidades mencionadas en un artículo específico
 */
export const findByArticle = query({
  args: { articleId: v.id('articles') },
  handler: async (ctx, args) => {
    const allEntities = await ctx.db.query('entities').collect()

    // Filtrar entidades que tienen este artículo en su array mentionedIn
    return allEntities.filter((entity) =>
      entity.mentionedIn.includes(args.articleId)
    )
  },
})

/**
 * Encontrar entidades por claim (via su artículo asociado)
 */
export const findByClaim = query({
  args: { claimId: v.id('claims') },
  handler: async (ctx, args) => {
    // Obtener el claim
    const claim = await ctx.db.get(args.claimId)
    if (!claim) return []

    // Si el claim tiene articleId, buscar entidades por artículo
    if (claim.articleId) {
      const allEntities = await ctx.db.query('entities').collect()
      return allEntities.filter((entity) =>
        entity.mentionedIn.includes(claim.articleId!)
      )
    }

    // Si no tiene articleId, retornar vacío
    return []
  },
})

/**
 * Buscar entidades
 */
export const search = query({
  args: {
    query: v.string(),
    type: v.optional(
      v.union(
        v.literal('PERSON'),
        v.literal('ORGANIZATION'),
        v.literal('LOCATION'),
        v.literal('EVENT'),
        v.literal('DATE'),
        v.literal('OTHER')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, type, limit = 50 } = args

    const results = await ctx.db
      .query('entities')
      .withSearchIndex('search_entities', (q) => {
        let search = q.search('name', query)

        if (type) {
          search = search.eq('type', type)
        }

        return search
      })
      .take(limit)

    return results
  },
})

/**
 * Entidades más mencionadas
 */
export const topMentioned = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('PERSON'),
        v.literal('ORGANIZATION'),
        v.literal('LOCATION'),
        v.literal('EVENT'),
        v.literal('DATE'),
        v.literal('OTHER')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type, limit = 20 } = args

    let entities = await ctx.db.query('entities').collect()

    if (type) {
      entities = entities.filter((e) => e.type === type)
    }

    // Ordenar por mentionCount descendente
    return entities
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, limit)
  },
})

/**
 * Entidades por tipo
 */
export const getByType = query({
  args: {
    type: v.union(
      v.literal('PERSON'),
      v.literal('ORGANIZATION'),
      v.literal('LOCATION'),
      v.literal('EVENT'),
      v.literal('DATE'),
      v.literal('OTHER')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type, limit = 50 } = args

    return await ctx.db
      .query('entities')
      .withIndex('by_type', (q) => q.eq('type', type))
      .take(limit)
  },
})

/**
 * Estadísticas de entidades
 */
export const stats = query({
  handler: async (ctx) => {
    const entities = await ctx.db.query('entities').collect()

    const byType = {
      PERSON: entities.filter((e) => e.type === 'PERSON').length,
      ORGANIZATION: entities.filter((e) => e.type === 'ORGANIZATION').length,
      LOCATION: entities.filter((e) => e.type === 'LOCATION').length,
      EVENT: entities.filter((e) => e.type === 'EVENT').length,
      DATE: entities.filter((e) => e.type === 'DATE').length,
      OTHER: entities.filter((e) => e.type === 'OTHER').length,
    }

    const totalMentions = entities.reduce((sum, e) => sum + e.mentionCount, 0)
    const avgMentions =
      entities.length > 0 ? totalMentions / entities.length : 0

    return {
      total: entities.length,
      byType,
      totalMentions,
      avgMentions: Math.round(avgMentions),
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nueva entidad
 */
export const create = mutation({
  args: {
    name: v.string(),
    normalizedName: v.string(),
    type: v.union(
      v.literal('PERSON'),
      v.literal('ORGANIZATION'),
      v.literal('LOCATION'),
      v.literal('EVENT'),
      v.literal('DATE'),
      v.literal('OTHER')
    ),
    aliases: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        position: v.optional(v.string()),
        affiliation: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe una entidad con el mismo nombre normalizado
    const existing = await ctx.db
      .query('entities')
      .withIndex('by_name', (q) => q.eq('normalizedName', args.normalizedName))
      .first()

    if (existing) {
      // Si ya existe, incrementar el contador de menciones
      await ctx.db.patch(existing._id, {
        mentionCount: existing.mentionCount + 1,
        updatedAt: now,
      })
      return existing._id
    }

    // Crear nueva entidad
    const entityId = await ctx.db.insert('entities', {
      name: args.name,
      normalizedName: args.normalizedName,
      type: args.type,
      aliases: args.aliases || [],
      mentionedIn: [],
      mentionCount: 1,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    })

    return entityId
  },
})

/**
 * Actualizar entidad
 */
export const update = mutation({
  args: {
    id: v.id('entities'),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal('PERSON'),
        v.literal('ORGANIZATION'),
        v.literal('LOCATION'),
        v.literal('EVENT'),
        v.literal('DATE'),
        v.literal('OTHER')
      )
    ),
    aliases: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        position: v.optional(v.string()),
        affiliation: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return id
  },
})

/**
 * Agregar alias a entidad
 */
export const addAlias = mutation({
  args: {
    entityId: v.id('entities'),
    alias: v.string(),
  },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId)
    if (!entity) {
      throw new Error('Entity not found')
    }

    // Evitar duplicados
    if (!entity.aliases.includes(args.alias)) {
      await ctx.db.patch(args.entityId, {
        aliases: [...entity.aliases, args.alias],
        updatedAt: Date.now(),
      })
    }

    return args.entityId
  },
})

/**
 * Agregar mención en artículo
 */
export const addMention = mutation({
  args: {
    entityId: v.id('entities'),
    articleId: v.id('articles'),
  },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId)
    if (!entity) {
      throw new Error('Entity not found')
    }

    // Evitar duplicados
    const alreadyMentioned = entity.mentionedIn.includes(args.articleId)

    if (!alreadyMentioned) {
      await ctx.db.patch(args.entityId, {
        mentionedIn: [...entity.mentionedIn, args.articleId],
        mentionCount: entity.mentionCount + 1,
        updatedAt: Date.now(),
      })
    }

    return args.entityId
  },
})

/**
 * Incrementar contador de menciones
 */
export const incrementMentionCount = mutation({
  args: { entityId: v.id('entities') },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId)
    if (!entity) {
      throw new Error('Entity not found')
    }

    await ctx.db.patch(args.entityId, {
      mentionCount: entity.mentionCount + 1,
      updatedAt: Date.now(),
    })

    return args.entityId
  },
})

/**
 * Fusionar entidades duplicadas
 */
export const merge = mutation({
  args: {
    primaryId: v.id('entities'),
    duplicateId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    const primary = await ctx.db.get(args.primaryId)
    const duplicate = await ctx.db.get(args.duplicateId)

    if (!primary || !duplicate) {
      throw new Error('One or both entities not found')
    }

    // Combinar aliases
    const combinedAliases = Array.from(
      new Set([
        ...primary.aliases,
        ...duplicate.aliases,
        duplicate.name,
      ])
    )

    // Combinar menciones
    const combinedMentions = Array.from(
      new Set([...primary.mentionedIn, ...duplicate.mentionedIn])
    )

    // Actualizar entidad principal
    await ctx.db.patch(args.primaryId, {
      aliases: combinedAliases,
      mentionedIn: combinedMentions,
      mentionCount: primary.mentionCount + duplicate.mentionCount,
      updatedAt: Date.now(),
    })

    // Eliminar duplicado
    await ctx.db.delete(args.duplicateId)

    return args.primaryId
  },
})

/**
 * Eliminar entidad
 */
export const remove = mutation({
  args: { id: v.id('entities') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

/**
 * Marcar entidad para revisión de IA
 */
export const markForReview = mutation({
  args: {
    entityId: v.id('entities'),
    requestedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId)
    if (!entity) {
      throw new Error('Entity not found')
    }

    await ctx.db.patch(args.entityId, {
      markedForReview: true,
      reviewRequestedAt: Date.now(),
      reviewRequestedBy: args.requestedBy || 'unknown',
      updatedAt: Date.now(),
    })

    return args.entityId
  },
})

/**
 * Desmarcar entidad de revisión
 */
export const unmarkForReview = mutation({
  args: { entityId: v.id('entities') },
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId)
    if (!entity) {
      throw new Error('Entity not found')
    }

    await ctx.db.patch(args.entityId, {
      markedForReview: false,
      updatedAt: Date.now(),
    })

    return args.entityId
  },
})

/**
 * Obtener entidades marcadas para revisión
 */
export const getMarkedForReview = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const allEntities = await ctx.db.query('entities').collect()

    return allEntities
      .filter((e) => e.markedForReview === true)
      .sort((a, b) => (b.reviewRequestedAt || 0) - (a.reviewRequestedAt || 0))
      .slice(0, limit)
  },
})
