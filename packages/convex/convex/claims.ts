import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * CLAIMS - Gestión de afirmaciones a verificar
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener todas las claims con paginación
 */
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal('new'),
      v.literal('investigating'),
      v.literal('review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { status, limit = 20 } = args

    let claimsQuery = ctx.db.query('claims')
      .order('desc')

    if (status) {
      claimsQuery = claimsQuery.filter((q) => q.eq(q.field('status'), status))
    }

    const claims = await claimsQuery.take(limit)

    return claims
  },
})

/**
 * Obtener una claim por ID
 */
export const getById = query({
  args: { id: v.id('claims') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Buscar claims
 */
export const search = query({
  args: {
    query: v.string(),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { query, status, category, riskLevel } = args

    // Usando full-text search
    const results = await ctx.db
      .query('claims')
      .withSearchIndex('search_claims', (q) => {
        let search = q.search('claimText', query)

        if (status) {
          search = search.eq('status', status)
        }
        if (category) {
          search = search.eq('category', category)
        }
        if (riskLevel) {
          search = search.eq('riskLevel', riskLevel)
        }

        return search
      })
      .take(50)

    return results
  },
})

/**
 * Obtener claims públicas para el frontend
 */
export const publicClaims = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    const claims = await ctx.db
      .query('claims')
      .filter((q) => q.eq(q.field('isPublic'), true))
      .filter((q) => q.eq(q.field('status'), 'published'))
      .order('desc')
      .take(limit)

    return claims
  },
})

/**
 * Obtener claims featured
 */
export const featuredClaims = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('claims')
      .filter((q) => q.eq(q.field('isFeatured'), true))
      .filter((q) => q.eq(q.field('isPublic'), true))
      .order('desc')
      .take(5)
  },
})

/**
 * Obtener estadísticas de claims
 */
export const stats = query({
  handler: async (ctx) => {
    const total = await ctx.db.query('claims').collect()
    const published = total.filter((c) => c.status === 'published')
    const investigating = total.filter((c) => c.status === 'investigating')
    const review = total.filter((c) => c.status === 'review')

    const bySeverity = {
      LOW: total.filter((c) => c.riskLevel === 'LOW').length,
      MEDIUM: total.filter((c) => c.riskLevel === 'MEDIUM').length,
      HIGH: total.filter((c) => c.riskLevel === 'HIGH').length,
      CRITICAL: total.filter((c) => c.riskLevel === 'CRITICAL').length,
    }

    return {
      total: total.length,
      published: published.length,
      investigating: investigating.length,
      review: review.length,
      bySeverity,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear una nueva claim
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    claimText: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sourceType: v.union(
      v.literal('user_submitted'),
      v.literal('auto_extracted'),
      v.literal('media_article'),
      v.literal('social_media'),
      v.literal('official_source')
    ),
    sourceUrl: v.optional(v.string()),
    riskLevel: v.optional(v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const claimId = await ctx.db.insert('claims', {
      title: args.title,
      description: args.description,
      claimText: args.claimText,
      status: 'new',
      category: args.category,
      tags: args.tags || [],
      riskLevel: args.riskLevel || 'MEDIUM',
      sourceType: args.sourceType,
      sourceUrl: args.sourceUrl,
      isPublic: false,
      isFeatured: false,
      autoPublished: false,
      createdAt: now,
      updatedAt: now,
    })

    return claimId
  },
})

/**
 * Actualizar el estado de una claim
 */
export const updateStatus = mutation({
  args: {
    id: v.id('claims'),
    status: v.union(
      v.literal('new'),
      v.literal('investigating'),
      v.literal('review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    ),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.id)
    if (!claim) {
      throw new Error('Claim not found')
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    }

    // Si se publica, agregar timestamp
    if (args.status === 'published' && !claim.publishedAt) {
      updates.publishedAt = Date.now()
      updates.isPublic = true
    }

    // Asignar investigador
    if (args.status === 'investigating' && args.userId) {
      updates.investigatedBy = args.userId
    }

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

/**
 * Asignar claim a un usuario
 */
export const assign = mutation({
  args: {
    claimId: v.id('claims'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.claimId, {
      assignedTo: args.userId,
      updatedAt: Date.now(),
    })

    return args.claimId
  },
})

/**
 * Marcar como featured
 */
export const toggleFeatured = mutation({
  args: {
    id: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.id)
    if (!claim) {
      throw new Error('Claim not found')
    }

    await ctx.db.patch(args.id, {
      isFeatured: !claim.isFeatured,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar nivel de riesgo
 */
export const updateRiskLevel = mutation({
  args: {
    id: v.id('claims'),
    riskLevel: v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      riskLevel: args.riskLevel,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Eliminar claim (soft delete - cambiar a rejected)
 */
export const remove = mutation({
  args: {
    id: v.id('claims'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'rejected',
      isPublic: false,
      updatedAt: Date.now(),
    })

    return args.id
  },
})
