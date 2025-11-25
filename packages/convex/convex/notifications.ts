import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * NOTIFICATIONS - Sistema de notificaciones para usuarios
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener notificaciones de un usuario
 */
export const getUserNotifications = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50, includeRead = true } = args

    let notificationsQuery = ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')

    const notifications = await notificationsQuery.take(limit)

    if (!includeRead) {
      return notifications.filter((n) => !n.isRead)
    }

    return notifications
  },
})

/**
 * Obtener notificaciones no leídas
 */
export const getUnread = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50 } = args

    return await ctx.db
      .query('notifications')
      .withIndex('by_user_read', (q) => q.eq('userId', userId).eq('isRead', false))
      .order('desc')
      .take(limit)
  },
})

/**
 * Contar notificaciones no leídas
 */
export const getUnreadCount = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_read', (q) =>
        q.eq('userId', args.userId).eq('isRead', false)
      )
      .collect()

    return unread.length
  },
})

/**
 * Obtener notificaciones por tipo
 */
export const getByType = query({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('new_claim'),
      v.literal('verdict_published'),
      v.literal('comment_reply'),
      v.literal('comment_mention'),
      v.literal('event_reminder'),
      v.literal('subscription_update'),
      v.literal('claim_request_status'),
      v.literal('system_announcement')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, type, limit = 50 } = args

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(100)

    return notifications.filter((n) => n.type === type).slice(0, limit)
  },
})

/**
 * Obtener notificaciones recientes (últimas 24 horas)
 */
export const getRecent = query({
  args: {
    userId: v.id('users'),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, hours = 24 } = args
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(100)

    return notifications.filter((n) => n.createdAt >= cutoffTime)
  },
})

/**
 * Estadísticas de notificaciones
 */
export const stats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const unread = notifications.filter((n) => !n.isRead).length
    const byType = notifications.reduce(
      (acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byPriority = {
      low: notifications.filter((n) => n.priority === 'low').length,
      normal: notifications.filter((n) => n.priority === 'normal').length,
      high: notifications.filter((n) => n.priority === 'high').length,
      urgent: notifications.filter((n) => n.priority === 'urgent').length,
    }

    return {
      total: notifications.length,
      unread,
      byType,
      byPriority,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear notificación
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('new_claim'),
      v.literal('verdict_published'),
      v.literal('comment_reply'),
      v.literal('comment_mention'),
      v.literal('event_reminder'),
      v.literal('subscription_update'),
      v.literal('claim_request_status'),
      v.literal('system_announcement')
    ),
    title: v.string(),
    message: v.string(),
    relatedEntityType: v.optional(
      v.union(
        v.literal('claim'),
        v.literal('verdict'),
        v.literal('comment'),
        v.literal('event'),
        v.literal('claimRequest')
      )
    ),
    relatedEntityId: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      relatedEntityType: args.relatedEntityType,
      relatedEntityId: args.relatedEntityId,
      isRead: false,
      priority: args.priority || 'normal',
      actionUrl: args.actionUrl,
      createdAt: Date.now(),
    })

    return notificationId
  },
})

/**
 * Marcar como leída
 */
export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    })

    return args.notificationId
  },
})

/**
 * Marcar todas como leídas
 */
export const markAllAsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_read', (q) =>
        q.eq('userId', args.userId).eq('isRead', false)
      )
      .collect()

    const now = Date.now()

    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt: now,
      })
    }

    return { marked: unread.length }
  },
})

/**
 * Marcar como no leída
 */
export const markAsUnread = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: false,
      readAt: undefined,
    })

    return args.notificationId
  },
})

/**
 * Eliminar notificación
 */
export const remove = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId)
    return args.notificationId
  },
})

/**
 * Eliminar todas las notificaciones leídas
 */
export const deleteAllRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const read = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const readNotifications = read.filter((n) => n.isRead)

    for (const notification of readNotifications) {
      await ctx.db.delete(notification._id)
    }

    return { deleted: readNotifications.length }
  },
})

/**
 * Eliminar notificaciones antiguas
 */
export const deleteOldNotifications = mutation({
  args: {
    userId: v.id('users'),
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const oldNotifications = notifications.filter(
      (n) => n.createdAt < cutoffTime && n.isRead
    )

    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id)
    }

    return { deleted: oldNotifications.length }
  },
})

/**
 * Notificar a múltiples usuarios
 */
export const notifyMultiple = mutation({
  args: {
    userIds: v.array(v.id('users')),
    type: v.union(
      v.literal('new_claim'),
      v.literal('verdict_published'),
      v.literal('comment_reply'),
      v.literal('comment_mention'),
      v.literal('event_reminder'),
      v.literal('subscription_update'),
      v.literal('claim_request_status'),
      v.literal('system_announcement')
    ),
    title: v.string(),
    message: v.string(),
    relatedEntityType: v.optional(
      v.union(
        v.literal('claim'),
        v.literal('verdict'),
        v.literal('comment'),
        v.literal('event'),
        v.literal('claimRequest')
      )
    ),
    relatedEntityId: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const notificationIds = []

    for (const userId of args.userIds) {
      const id = await ctx.db.insert('notifications', {
        userId,
        type: args.type,
        title: args.title,
        message: args.message,
        relatedEntityType: args.relatedEntityType,
        relatedEntityId: args.relatedEntityId,
        isRead: false,
        priority: args.priority || 'normal',
        actionUrl: args.actionUrl,
        createdAt: now,
      })
      notificationIds.push(id)
    }

    return { created: notificationIds.length, ids: notificationIds }
  },
})
