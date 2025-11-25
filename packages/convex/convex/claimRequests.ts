import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * CLAIM REQUESTS - Solicitudes de verificación por parte de usuarios
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar todas las solicitudes
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('investigating'),
        v.literal('rejected'),
        v.literal('duplicate'),
        v.literal('completed')
      )
    ),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, priority, limit = 50 } = args

    let requestsQuery = ctx.db.query('claimRequests').order('desc')

    const requests = await requestsQuery.take(limit)

    let filtered = requests

    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }

    if (priority) {
      filtered = filtered.filter((r) => r.priority === priority)
    }

    return filtered
  },
})

/**
 * Obtener solicitud por ID
 */
export const getById = query({
  args: { id: v.id('claimRequests') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener solicitudes de un usuario
 */
export const getByUserId = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50 } = args

    return await ctx.db
      .query('claimRequests')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener solicitudes pendientes
 */
export const pending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('claimRequests')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener solicitudes por estado
 */
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('investigating'),
      v.literal('rejected'),
      v.literal('duplicate'),
      v.literal('completed')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, limit = 50 } = args

    return await ctx.db
      .query('claimRequests')
      .withIndex('by_status', (q) => q.eq('status', status))
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener solicitudes más votadas
 */
export const topVoted = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    const requests = await ctx.db
      .query('claimRequests')
      .withIndex('by_upvotes')
      .order('desc')
      .take(limit)

    // Filtrar solo pendientes o aprobadas
    return requests.filter(
      (r) => r.status === 'pending' || r.status === 'approved'
    )
  },
})

/**
 * Obtener solicitudes por prioridad
 */
export const getByPriority = query({
  args: {
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('urgent')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { priority, limit = 50 } = args

    return await ctx.db
      .query('claimRequests')
      .withIndex('by_priority', (q) => q.eq('priority', priority))
      .order('desc')
      .take(limit)
  },
})

/**
 * Estadísticas de solicitudes
 */
export const stats = query({
  handler: async (ctx) => {
    const requests = await ctx.db.query('claimRequests').collect()

    const byStatus = {
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      investigating: requests.filter((r) => r.status === 'investigating')
        .length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      duplicate: requests.filter((r) => r.status === 'duplicate').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    }

    const byPriority = {
      low: requests.filter((r) => r.priority === 'low').length,
      medium: requests.filter((r) => r.priority === 'medium').length,
      high: requests.filter((r) => r.priority === 'high').length,
      urgent: requests.filter((r) => r.priority === 'urgent').length,
    }

    const totalUpvotes = requests.reduce((sum, r) => sum + r.upvotes, 0)
    const avgUpvotes = requests.length > 0 ? totalUpvotes / requests.length : 0

    return {
      total: requests.length,
      byStatus,
      byPriority,
      totalUpvotes,
      avgUpvotes: Math.round(avgUpvotes),
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear solicitud de verificación
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    claimText: v.string(),
    description: v.string(),
    sourceUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe una solicitud similar (evitar spam)
    const recentRequests = await ctx.db
      .query('claimRequests')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(10)

    const duplicate = recentRequests.find(
      (r) =>
        r.claimText.toLowerCase() === args.claimText.toLowerCase() &&
        r.status !== 'rejected'
    )

    if (duplicate) {
      throw new Error('Ya existe una solicitud similar')
    }

    const requestId = await ctx.db.insert('claimRequests', {
      userId: args.userId,
      claimText: args.claimText,
      description: args.description,
      sourceUrl: args.sourceUrl,
      category: args.category,
      status: 'pending',
      priority: args.priority || 'medium',
      upvotes: 0,
      upvotedBy: [],
      createdAt: now,
      updatedAt: now,
    })

    return requestId
  },
})

/**
 * Actualizar estado de solicitud
 */
export const updateStatus = mutation({
  args: {
    requestId: v.id('claimRequests'),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('investigating'),
      v.literal('rejected'),
      v.literal('duplicate'),
      v.literal('completed')
    ),
    reviewedBy: v.id('users'),
    reviewNotes: v.optional(v.string()),
    claimId: v.optional(v.id('claims')),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (args.reviewNotes) {
      updates.reviewNotes = args.reviewNotes
    }

    if (args.claimId) {
      updates.claimId = args.claimId
    }

    await ctx.db.patch(args.requestId, updates)

    return args.requestId
  },
})

/**
 * Aprobar solicitud
 */
export const approve = mutation({
  args: {
    requestId: v.id('claimRequests'),
    reviewedBy: v.id('users'),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: 'approved',
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Rechazar solicitud
 */
export const reject = mutation({
  args: {
    requestId: v.id('claimRequests'),
    reviewedBy: v.id('users'),
    reviewNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: 'rejected',
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Marcar como duplicado
 */
export const markAsDuplicate = mutation({
  args: {
    requestId: v.id('claimRequests'),
    duplicateOf: v.id('claimRequests'),
    reviewedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: 'duplicate',
      duplicateOf: args.duplicateOf,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Actualizar prioridad
 */
export const updatePriority = mutation({
  args: {
    requestId: v.id('claimRequests'),
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('urgent')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      priority: args.priority,
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Dar upvote a solicitud
 */
export const upvote = mutation({
  args: {
    requestId: v.id('claimRequests'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    // Verificar si ya votó
    if (request.upvotedBy.includes(args.userId)) {
      throw new Error('Already upvoted')
    }

    await ctx.db.patch(args.requestId, {
      upvotes: request.upvotes + 1,
      upvotedBy: [...request.upvotedBy, args.userId],
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Quitar upvote
 */
export const removeUpvote = mutation({
  args: {
    requestId: v.id('claimRequests'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    // Verificar si había votado
    if (!request.upvotedBy.includes(args.userId)) {
      throw new Error('Not upvoted')
    }

    await ctx.db.patch(args.requestId, {
      upvotes: Math.max(0, request.upvotes - 1),
      upvotedBy: request.upvotedBy.filter((id) => id !== args.userId),
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Vincular con claim creado
 */
export const linkToClaim = mutation({
  args: {
    requestId: v.id('claimRequests'),
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      claimId: args.claimId,
      status: 'completed',
      updatedAt: Date.now(),
    })

    return args.requestId
  },
})

/**
 * Eliminar solicitud
 */
export const remove = mutation({
  args: { requestId: v.id('claimRequests') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.requestId)
    return args.requestId
  },
})

/**
 * Actualizar información de la solicitud
 */
export const update = mutation({
  args: {
    requestId: v.id('claimRequests'),
    claimText: v.optional(v.string()),
    description: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { requestId, ...updates } = args

    await ctx.db.patch(requestId, {
      ...updates,
      updatedAt: Date.now(),
    })

    return requestId
  },
})
