import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * TOPICS - Gestión de tópicos/categorías
 * Soporte para jerarquía de tópicos
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar todos los tópicos
 */
export const list = query({
  args: {
    parentId: v.optional(v.id('topics')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { parentId, limit = 100 } = args

    let topicsQuery = ctx.db.query('topics')

    if (parentId !== undefined) {
      // Si parentId es undefined, buscar tópicos raíz (sin padre)
      topicsQuery = topicsQuery.withIndex('by_parent', (q) =>
        parentId === null ? q.eq('parentId', undefined) : q.eq('parentId', parentId)
      )
    }

    return await topicsQuery.take(limit)
  },
})

/**
 * Obtener tópico por ID
 */
export const getById = query({
  args: { id: v.id('topics') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener tópico por slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('topics')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()
  },
})

/**
 * Obtener tópicos raíz (sin padre)
 */
export const getRootTopics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const allTopics = await ctx.db.query('topics').take(limit)

    return allTopics.filter((topic) => !topic.parentId)
  },
})

/**
 * Obtener sub-tópicos de un tópico
 */
export const getChildren = query({
  args: { parentId: v.id('topics') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('topics')
      .withIndex('by_parent', (q) => q.eq('parentId', args.parentId))
      .collect()
  },
})

/**
 * Obtener tópicos más usados
 */
export const topTopics = query({
  args: {
    sortBy: v.optional(v.union(v.literal('articles'), v.literal('claims'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sortBy = 'articles', limit = 20 } = args

    const topics = await ctx.db.query('topics').collect()

    // Ordenar por el campo especificado
    const sorted = topics.sort((a, b) => {
      if (sortBy === 'articles') {
        return b.articleCount - a.articleCount
      } else {
        return b.claimCount - a.claimCount
      }
    })

    return sorted.slice(0, limit)
  },
})

/**
 * Obtener tópicos trending (más buscados)
 */
export const trendingTopics = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 5 } = args

    const topics = await ctx.db.query('topics').collect()

    // Ordenar por la suma de artículos y claims (actividad total)
    const sorted = topics.sort((a, b) => {
      const scoreA = a.articleCount + a.claimCount
      const scoreB = b.articleCount + b.claimCount
      return scoreB - scoreA
    })

    return sorted.slice(0, limit).map((topic) => ({
      id: topic._id,
      title: topic.name,
      count: topic.articleCount + topic.claimCount,
      slug: topic.slug,
    }))
  },
})

/**
 * Obtener jerarquía completa de un tópico
 */
export const getHierarchy = query({
  args: { topicId: v.id('topics') },
  handler: async (ctx, args) => {
    const hierarchy = []
    let currentTopic = await ctx.db.get(args.topicId)

    while (currentTopic) {
      hierarchy.unshift(currentTopic)

      if (currentTopic.parentId) {
        currentTopic = await ctx.db.get(currentTopic.parentId)
      } else {
        break
      }
    }

    return hierarchy
  },
})

/**
 * Estadísticas de tópicos
 */
export const stats = query({
  handler: async (ctx) => {
    const topics = await ctx.db.query('topics').collect()

    const rootTopics = topics.filter((t) => !t.parentId).length
    const totalArticles = topics.reduce((sum, t) => sum + t.articleCount, 0)
    const totalClaims = topics.reduce((sum, t) => sum + t.claimCount, 0)

    const avgArticlesPerTopic =
      topics.length > 0 ? totalArticles / topics.length : 0
    const avgClaimsPerTopic =
      topics.length > 0 ? totalClaims / topics.length : 0

    return {
      total: topics.length,
      rootTopics,
      totalArticles,
      totalClaims,
      avgArticlesPerTopic: Math.round(avgArticlesPerTopic),
      avgClaimsPerTopic: Math.round(avgClaimsPerTopic),
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nuevo tópico
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id('topics')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe un tópico con el mismo slug
    const existing = await ctx.db
      .query('topics')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()

    if (existing) {
      throw new Error('Topic with this slug already exists')
    }

    const topicId = await ctx.db.insert('topics', {
      name: args.name,
      slug: args.slug,
      description: args.description,
      parentId: args.parentId,
      articleCount: 0,
      claimCount: 0,
      createdAt: now,
    })

    return topicId
  },
})

/**
 * Actualizar tópico
 */
export const update = mutation({
  args: {
    id: v.id('topics'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    parentId: v.optional(v.id('topics')),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Validar que el tópico no sea su propio padre
    if (updates.parentId && updates.parentId === id) {
      throw new Error('A topic cannot be its own parent')
    }

    // Validar que no se cree un ciclo en la jerarquía
    if (updates.parentId) {
      let currentParent = await ctx.db.get(updates.parentId)
      while (currentParent) {
        if (currentParent._id === id) {
          throw new Error('Cannot create circular hierarchy')
        }
        if (currentParent.parentId) {
          currentParent = await ctx.db.get(currentParent.parentId)
        } else {
          break
        }
      }
    }

    await ctx.db.patch(id, updates)

    return id
  },
})

/**
 * Incrementar contador de artículos
 */
export const incrementArticleCount = mutation({
  args: { topicId: v.id('topics') },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId)
    if (!topic) {
      throw new Error('Topic not found')
    }

    await ctx.db.patch(args.topicId, {
      articleCount: topic.articleCount + 1,
    })

    return args.topicId
  },
})

/**
 * Incrementar contador de claims
 */
export const incrementClaimCount = mutation({
  args: { topicId: v.id('topics') },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId)
    if (!topic) {
      throw new Error('Topic not found')
    }

    await ctx.db.patch(args.topicId, {
      claimCount: topic.claimCount + 1,
    })

    return args.topicId
  },
})

/**
 * Decrementar contador de artículos
 */
export const decrementArticleCount = mutation({
  args: { topicId: v.id('topics') },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId)
    if (!topic) {
      throw new Error('Topic not found')
    }

    await ctx.db.patch(args.topicId, {
      articleCount: Math.max(0, topic.articleCount - 1),
    })

    return args.topicId
  },
})

/**
 * Fusionar tópicos
 */
export const merge = mutation({
  args: {
    primaryId: v.id('topics'),
    duplicateId: v.id('topics'),
  },
  handler: async (ctx, args) => {
    const primary = await ctx.db.get(args.primaryId)
    const duplicate = await ctx.db.get(args.duplicateId)

    if (!primary || !duplicate) {
      throw new Error('One or both topics not found')
    }

    // Combinar contadores
    await ctx.db.patch(args.primaryId, {
      articleCount: primary.articleCount + duplicate.articleCount,
      claimCount: primary.claimCount + duplicate.claimCount,
    })

    // Mover sub-tópicos del duplicado al primario
    const children = await ctx.db
      .query('topics')
      .withIndex('by_parent', (q) => q.eq('parentId', args.duplicateId))
      .collect()

    for (const child of children) {
      await ctx.db.patch(child._id, {
        parentId: args.primaryId,
      })
    }

    // Eliminar duplicado
    await ctx.db.delete(args.duplicateId)

    return args.primaryId
  },
})

/**
 * Eliminar tópico
 */
export const remove = mutation({
  args: {
    id: v.id('topics'),
  },
  handler: async (ctx, args) => {
    // Verificar si hay sub-tópicos
    const children = await ctx.db
      .query('topics')
      .withIndex('by_parent', (q) => q.eq('parentId', args.id))
      .collect()

    if (children.length > 0) {
      throw new Error(
        'Cannot delete topic with children. Remove or reassign children first.'
      )
    }

    await ctx.db.delete(args.id)

    return args.id
  },
})
