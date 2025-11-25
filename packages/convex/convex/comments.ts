import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * COMMENTS - Gestión de comentarios de usuarios en claims
 * Sistema de moderación y engagement
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar comentarios de una claim
 */
export const getByClaimId = query({
  args: {
    claimId: v.id('claims'),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('flagged')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { claimId, status, limit = 50 } = args

    let commentsQuery = ctx.db
      .query('comments')
      .withIndex('by_claim', (q) => q.eq('claimId', claimId))
      .order('desc')

    const comments = await commentsQuery.take(limit)

    if (status) {
      return comments.filter((c) => c.status === status)
    }

    return comments
  },
})

/**
 * Obtener comentario por ID
 */
export const getById = query({
  args: { id: v.id('comments') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener comentarios de un usuario
 */
export const getByUserId = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50 } = args

    return await ctx.db
      .query('comments')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit)
  },
})

/**
 * Comentarios pendientes de moderación
 */
export const pending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('comments')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .order('desc')
      .take(limit)
  },
})

/**
 * Comentarios flagged/reportados
 */
export const flagged = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const comments = await ctx.db
      .query('comments')
      .withIndex('by_status', (q) => q.eq('status', 'flagged'))
      .order('desc')
      .take(limit)

    return comments
  },
})

/**
 * Comentarios más reportados
 */
export const mostReported = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    const comments = await ctx.db.query('comments').collect()

    return comments
      .filter((c) => c.reportCount > 0)
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, limit)
  },
})

/**
 * Comentarios destacados
 */
export const highlighted = query({
  args: {
    claimId: v.optional(v.id('claims')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { claimId, limit = 10 } = args

    let comments = await ctx.db.query('comments').collect()

    comments = comments.filter((c) => c.isHighlighted)

    if (claimId) {
      comments = comments.filter((c) => c.claimId === claimId)
    }

    return comments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  },
})

/**
 * Comentarios mejor valorados
 */
export const topRated = query({
  args: {
    claimId: v.optional(v.id('claims')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { claimId, limit = 20 } = args

    let comments = await ctx.db.query('comments').collect()

    if (claimId) {
      comments = comments.filter((c) => c.claimId === claimId)
    }

    // Filtrar solo aprobados
    comments = comments.filter((c) => c.status === 'approved')

    // Calcular score neto (upvotes - downvotes)
    return comments
      .map((c) => ({
        ...c,
        netScore: c.upvotes - c.downvotes,
      }))
      .sort((a, b) => b.netScore - a.netScore)
      .slice(0, limit)
  },
})

/**
 * Estadísticas de comentarios
 */
export const stats = query({
  handler: async (ctx) => {
    const comments = await ctx.db.query('comments').collect()

    const byStatus = {
      pending: comments.filter((c) => c.status === 'pending').length,
      approved: comments.filter((c) => c.status === 'approved').length,
      rejected: comments.filter((c) => c.status === 'rejected').length,
      flagged: comments.filter((c) => c.status === 'flagged').length,
    }

    const totalUpvotes = comments.reduce((sum, c) => sum + c.upvotes, 0)
    const totalDownvotes = comments.reduce((sum, c) => sum + c.downvotes, 0)
    const totalReports = comments.reduce((sum, c) => sum + c.reportCount, 0)

    const highlighted = comments.filter((c) => c.isHighlighted).length

    return {
      total: comments.length,
      byStatus,
      totalUpvotes,
      totalDownvotes,
      totalReports,
      highlighted,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nuevo comentario
 */
export const create = mutation({
  args: {
    claimId: v.id('claims'),
    userId: v.id('users'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const commentId = await ctx.db.insert('comments', {
      claimId: args.claimId,
      userId: args.userId,
      content: args.content,
      status: 'pending', // Todos los comentarios empiezan como pendientes
      upvotes: 0,
      downvotes: 0,
      isHighlighted: false,
      reportCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    return commentId
  },
})

/**
 * Actualizar estado de moderación
 */
export const updateStatus = mutation({
  args: {
    commentId: v.id('comments'),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('flagged')
    ),
    moderatorId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, {
      status: args.status,
      moderatedBy: args.moderatorId,
      moderatedAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.commentId
  },
})

/**
 * Aprobar comentario
 */
export const approve = mutation({
  args: {
    commentId: v.id('comments'),
    moderatorId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, {
      status: 'approved',
      moderatedBy: args.moderatorId,
      moderatedAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.commentId
  },
})

/**
 * Rechazar comentario
 */
export const reject = mutation({
  args: {
    commentId: v.id('comments'),
    moderatorId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, {
      status: 'rejected',
      moderatedBy: args.moderatorId,
      moderatedAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.commentId
  },
})

/**
 * Agregar upvote
 */
export const upvote = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    await ctx.db.patch(args.commentId, {
      upvotes: comment.upvotes + 1,
      updatedAt: Date.now(),
    })

    return args.commentId
  },
})

/**
 * Agregar downvote
 */
export const downvote = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    await ctx.db.patch(args.commentId, {
      downvotes: comment.downvotes + 1,
      updatedAt: Date.now(),
    })

    return args.commentId
  },
})

/**
 * Reportar comentario
 */
export const report = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    const newReportCount = comment.reportCount + 1

    // Auto-flagear si tiene más de 3 reportes
    const updates: any = {
      reportCount: newReportCount,
      updatedAt: Date.now(),
    }

    if (newReportCount >= 3 && comment.status !== 'flagged') {
      updates.status = 'flagged'
    }

    await ctx.db.patch(args.commentId, updates)

    return args.commentId
  },
})

/**
 * Destacar/quitar destacado
 */
export const toggleHighlight = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    await ctx.db.patch(args.commentId, {
      isHighlighted: !comment.isHighlighted,
      updatedAt: Date.now(),
    })

    return args.commentId
  },
})

/**
 * Eliminar comentario
 */
export const remove = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commentId)
    return args.commentId
  },
})
