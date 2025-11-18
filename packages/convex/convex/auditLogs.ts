import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * AUDIT LOGS - Logs de auditoría inmutables
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener logs recientes
 */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('auditLogs')
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener logs por usuario
 */
export const getByUser = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('auditLogs')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener logs por entidad
 */
export const getByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('auditLogs')
      .withIndex('by_entity', (q) =>
        q.eq('entityType', args.entityType).eq('entityId', args.entityId)
      )
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener logs en rango de tiempo
 */
export const getByTimeRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 100 } = args

    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_timestamp')
      .order('desc')
      .take(limit)

    return logs.filter(
      (log) => log.timestamp >= args.startTime && log.timestamp <= args.endTime
    )
  },
})

/**
 * Buscar logs por acción
 */
export const getByAction = query({
  args: {
    action: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const logs = await ctx.db
      .query('auditLogs')
      .order('desc')
      .take(limit)

    return logs.filter((log) => log.action === args.action)
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear log de auditoría
 * IMPORTANTE: Los logs son INMUTABLES - no se pueden editar ni borrar
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    userEmail: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.object({
      before: v.any(),
      after: v.any(),
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert('auditLogs', {
      userId: args.userId,
      userEmail: args.userEmail,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      changes: args.changes,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    })

    return logId
  },
})

/**
 * Helper: Log de creación
 */
export const logCreate = mutation({
  args: {
    userId: v.id('users'),
    userEmail: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    entityData: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      userId: args.userId,
      userEmail: args.userEmail,
      action: 'CREATE',
      entityType: args.entityType,
      entityId: args.entityId,
      changes: {
        before: null,
        after: args.entityData,
      },
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    })
  },
})

/**
 * Helper: Log de actualización
 */
export const logUpdate = mutation({
  args: {
    userId: v.id('users'),
    userEmail: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    before: v.any(),
    after: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      userId: args.userId,
      userEmail: args.userEmail,
      action: 'UPDATE',
      entityType: args.entityType,
      entityId: args.entityId,
      changes: {
        before: args.before,
        after: args.after,
      },
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    })
  },
})

/**
 * Helper: Log de eliminación
 */
export const logDelete = mutation({
  args: {
    userId: v.id('users'),
    userEmail: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    entityData: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      userId: args.userId,
      userEmail: args.userEmail,
      action: 'DELETE',
      entityType: args.entityType,
      entityId: args.entityId,
      changes: {
        before: args.entityData,
        after: null,
      },
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    })
  },
})

/**
 * Helper: Log de aprobación
 */
export const logApprove = mutation({
  args: {
    userId: v.id('users'),
    userEmail: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      userId: args.userId,
      userEmail: args.userEmail,
      action: 'APPROVE',
      entityType: args.entityType,
      entityId: args.entityId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    })
  },
})

/**
 * Helper: Log de rechazo
 */
export const logReject = mutation({
  args: {
    userId: v.id('users'),
    userEmail: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      userId: args.userId,
      userEmail: args.userEmail,
      action: 'REJECT',
      entityType: args.entityType,
      entityId: args.entityId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    })
  },
})
