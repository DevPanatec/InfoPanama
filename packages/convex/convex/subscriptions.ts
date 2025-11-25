import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * SUBSCRIPTIONS - Sistema de suscripciones a tópicos, actores, fuentes
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener suscripciones de un usuario
 */
export const getUserSubscriptions = query({
  args: {
    userId: v.id('users'),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, isActive } = args

    let subscriptionsQuery = ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))

    const subscriptions = await subscriptionsQuery.collect()

    if (isActive !== undefined) {
      return subscriptions.filter((s) => s.isActive === isActive)
    }

    return subscriptions
  },
})

/**
 * Obtener suscripciones activas
 */
export const getActive = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_user_active', (q) =>
        q.eq('userId', args.userId).eq('isActive', true)
      )
      .collect()
  },
})

/**
 * Obtener suscripciones por tipo
 */
export const getByType = query({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category'),
      v.literal('keyword'),
      v.literal('all_claims')
    ),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    return subscriptions.filter((s) => s.type === args.type)
  },
})

/**
 * Verificar si usuario está suscrito a un target
 */
export const isSubscribed = query({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category'),
      v.literal('keyword'),
      v.literal('all_claims')
    ),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_active', (q) =>
        q.eq('userId', args.userId).eq('isActive', true)
      )
      .collect()

    const found = subscriptions.find(
      (s) =>
        s.type === args.type &&
        (args.targetId ? s.targetId === args.targetId : true)
    )

    return !!found
  },
})

/**
 * Obtener todos los usuarios suscritos a un target
 */
export const getSubscribersForTarget = query({
  args: {
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category'),
      v.literal('keyword'),
      v.literal('all_claims')
    ),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .withIndex('by_target', (q) =>
        args.targetId
          ? q.eq('type', args.type).eq('targetId', args.targetId)
          : q.eq('type', args.type)
      )
      .collect()

    return subscriptions.filter((s) => s.isActive)
  },
})

/**
 * Estadísticas de suscripciones
 */
export const stats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const active = subscriptions.filter((s) => s.isActive).length

    const byType = {
      topic: subscriptions.filter((s) => s.type === 'topic').length,
      actor: subscriptions.filter((s) => s.type === 'actor').length,
      source: subscriptions.filter((s) => s.type === 'source').length,
      category: subscriptions.filter((s) => s.type === 'category').length,
      keyword: subscriptions.filter((s) => s.type === 'keyword').length,
      all_claims: subscriptions.filter((s) => s.type === 'all_claims').length,
    }

    const byFrequency = {
      realtime: subscriptions.filter((s) => s.frequency === 'realtime').length,
      daily: subscriptions.filter((s) => s.frequency === 'daily').length,
      weekly: subscriptions.filter((s) => s.frequency === 'weekly').length,
      monthly: subscriptions.filter((s) => s.frequency === 'monthly').length,
    }

    return {
      total: subscriptions.length,
      active,
      byType,
      byFrequency,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear suscripción
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category'),
      v.literal('keyword'),
      v.literal('all_claims')
    ),
    targetId: v.optional(v.string()),
    targetName: v.string(),
    frequency: v.optional(
      v.union(
        v.literal('realtime'),
        v.literal('daily'),
        v.literal('weekly'),
        v.literal('monthly')
      )
    ),
    channels: v.optional(
      v.array(v.union(v.literal('email'), v.literal('web'), v.literal('push')))
    ),
    filters: v.optional(
      v.object({
        verdictTypes: v.optional(v.array(v.string())),
        riskLevels: v.optional(v.array(v.string())),
        minConfidence: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe una suscripción similar
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const duplicate = existing.find(
      (s) => s.type === args.type && s.targetId === args.targetId
    )

    if (duplicate) {
      // Reactivar si estaba inactiva
      if (!duplicate.isActive) {
        await ctx.db.patch(duplicate._id, {
          isActive: true,
          updatedAt: now,
        })
        return duplicate._id
      }
      throw new Error('Subscription already exists')
    }

    const subscriptionId = await ctx.db.insert('subscriptions', {
      userId: args.userId,
      type: args.type,
      targetId: args.targetId,
      targetName: args.targetName,
      frequency: args.frequency || 'daily',
      filters: args.filters,
      channels: args.channels || ['web'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    return subscriptionId
  },
})

/**
 * Actualizar suscripción
 */
export const update = mutation({
  args: {
    subscriptionId: v.id('subscriptions'),
    frequency: v.optional(
      v.union(
        v.literal('realtime'),
        v.literal('daily'),
        v.literal('weekly'),
        v.literal('monthly')
      )
    ),
    channels: v.optional(
      v.array(v.union(v.literal('email'), v.literal('web'), v.literal('push')))
    ),
    filters: v.optional(
      v.object({
        verdictTypes: v.optional(v.array(v.string())),
        riskLevels: v.optional(v.array(v.string())),
        minConfidence: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { subscriptionId, ...updates } = args

    await ctx.db.patch(subscriptionId, {
      ...updates,
      updatedAt: Date.now(),
    })

    return subscriptionId
  },
})

/**
 * Activar suscripción
 */
export const activate = mutation({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      isActive: true,
      updatedAt: Date.now(),
    })

    return args.subscriptionId
  },
})

/**
 * Desactivar suscripción
 */
export const deactivate = mutation({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      isActive: false,
      updatedAt: Date.now(),
    })

    return args.subscriptionId
  },
})

/**
 * Toggle suscripción
 */
export const toggle = mutation({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId)
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    await ctx.db.patch(args.subscriptionId, {
      isActive: !subscription.isActive,
      updatedAt: Date.now(),
    })

    return args.subscriptionId
  },
})

/**
 * Actualizar última notificación enviada
 */
export const updateLastNotified = mutation({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      lastNotified: Date.now(),
      updatedAt: Date.now(),
    })

    return args.subscriptionId
  },
})

/**
 * Eliminar suscripción
 */
export const remove = mutation({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subscriptionId)
    return args.subscriptionId
  },
})

/**
 * Suscribirse rápidamente (helper)
 */
export const quickSubscribe = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category')
    ),
    targetId: v.string(),
    targetName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const duplicate = existing.find(
      (s) => s.type === args.type && s.targetId === args.targetId
    )

    if (duplicate) {
      if (!duplicate.isActive) {
        await ctx.db.patch(duplicate._id, {
          isActive: true,
          updatedAt: now,
        })
      }
      return duplicate._id
    }

    return await ctx.db.insert('subscriptions', {
      userId: args.userId,
      type: args.type,
      targetId: args.targetId,
      targetName: args.targetName,
      frequency: 'daily',
      channels: ['web', 'email'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  },
})

/**
 * Desuscribirse rápidamente (helper)
 */
export const quickUnsubscribe = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category')
    ),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    const subscription = subscriptions.find(
      (s) => s.type === args.type && s.targetId === args.targetId
    )

    if (subscription) {
      await ctx.db.delete(subscription._id)
      return subscription._id
    }

    return null
  },
})

/**
 * Suscripción al newsletter (sin autenticación)
 * Guarda el email en systemConfig para procesamiento posterior
 */
export const subscribeNewsletter = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = args

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido')
    }

    // Guardar en systemConfig como lista de emails para newsletter
    const existingConfig = await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', 'newsletter_emails'))
      .first()

    const now = Date.now()

    if (existingConfig) {
      const emails = (existingConfig.value as string[]) || []

      // Verificar si el email ya está suscrito
      if (emails.includes(email)) {
        throw new Error('Este email ya está suscrito')
      }

      // Agregar el nuevo email
      emails.push(email)

      // En un sistema real, aquí necesitarías un usuario del sistema
      // Por ahora, usaremos un ID de placeholder que deberás reemplazar
      // con un usuario real cuando implementes la autenticación
      const systemUserId = existingConfig.updatedBy

      await ctx.db.patch(existingConfig._id, {
        value: emails,
        updatedBy: systemUserId,
        updatedAt: now,
      })

      return { success: true, message: 'Suscrito exitosamente' }
    }

    // Si no existe la config, necesitamos crear un usuario del sistema primero
    throw new Error('Sistema no inicializado. Por favor, contacta al administrador.')
  },
})
