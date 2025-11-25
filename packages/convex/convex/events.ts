import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * EVENTS - Gestión de eventos gubernamentales
 * Sistema de alertas para eventos importantes
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar eventos
 */
export const list = query({
  args: {
    eventType: v.optional(
      v.union(
        v.literal('legislative'),
        v.literal('executive'),
        v.literal('judicial'),
        v.literal('election'),
        v.literal('public_hearing'),
        v.literal('other')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventType, limit = 50 } = args

    let eventsQuery = ctx.db.query('events').withIndex('by_date').order('desc')

    const events = await eventsQuery.take(limit)

    if (eventType) {
      return events.filter((e) => e.eventType === eventType)
    }

    return events
  },
})

/**
 * Obtener evento por ID
 */
export const getById = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Buscar eventos
 */
export const search = query({
  args: {
    query: v.string(),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, eventType, limit = 50 } = args

    const results = await ctx.db
      .query('events')
      .withSearchIndex('search_events', (q) => {
        let search = q.search('title', query)

        if (eventType) {
          search = search.eq('eventType', eventType)
        }

        return search
      })
      .take(limit)

    return results
  },
})

/**
 * Eventos próximos
 */
export const upcoming = query({
  args: {
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { days = 30, limit = 50 } = args

    const now = Date.now()
    const futureDate = now + days * 24 * 60 * 60 * 1000

    const events = await ctx.db
      .query('events')
      .withIndex('by_date')
      .order('asc')
      .take(limit)

    return events.filter(
      (event) => event.eventDate >= now && event.eventDate <= futureDate
    )
  },
})

/**
 * Eventos pasados
 */
export const past = query({
  args: {
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { days = 30, limit = 50 } = args

    const now = Date.now()
    const pastDate = now - days * 24 * 60 * 60 * 1000

    const events = await ctx.db
      .query('events')
      .withIndex('by_date')
      .order('desc')
      .take(limit)

    return events.filter(
      (event) => event.eventDate < now && event.eventDate >= pastDate
    )
  },
})

/**
 * Eventos por tipo
 */
export const getByType = query({
  args: {
    eventType: v.union(
      v.literal('legislative'),
      v.literal('executive'),
      v.literal('judicial'),
      v.literal('election'),
      v.literal('public_hearing'),
      v.literal('other')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventType, limit = 50 } = args

    return await ctx.db
      .query('events')
      .withIndex('by_type', (q) => q.eq('eventType', eventType))
      .order('desc')
      .take(limit)
  },
})

/**
 * Eventos que necesitan alerta
 */
export const needingAlerts = query({
  handler: async (ctx) => {
    const now = Date.now()
    const events = await ctx.db.query('events').collect()

    return events.filter((event) => {
      // Verificar si el evento necesita alertas
      if (event.alertDays.length === 0) return false

      // Calcular días hasta el evento
      const daysUntil = Math.floor(
        (event.eventDate - now) / (24 * 60 * 60 * 1000)
      )

      // Verificar si hay una alerta pendiente para hoy
      const shouldAlert = event.alertDays.includes(daysUntil)

      // Verificar si ya se envió la alerta
      const lastAlertDate = event.lastAlertSent
        ? new Date(event.lastAlertSent).setHours(0, 0, 0, 0)
        : 0
      const today = new Date().setHours(0, 0, 0, 0)

      return shouldAlert && lastAlertDate < today
    })
  },
})

/**
 * Estadísticas de eventos
 */
export const stats = query({
  handler: async (ctx) => {
    const events = await ctx.db.query('events').collect()
    const now = Date.now()

    const byType = {
      legislative: events.filter((e) => e.eventType === 'legislative').length,
      executive: events.filter((e) => e.eventType === 'executive').length,
      judicial: events.filter((e) => e.eventType === 'judicial').length,
      election: events.filter((e) => e.eventType === 'election').length,
      public_hearing: events.filter((e) => e.eventType === 'public_hearing')
        .length,
      other: events.filter((e) => e.eventType === 'other').length,
    }

    const upcoming = events.filter((e) => e.eventDate >= now).length
    const past = events.filter((e) => e.eventDate < now).length

    return {
      total: events.length,
      byType,
      upcoming,
      past,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nuevo evento
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    eventDate: v.number(),
    eventType: v.union(
      v.literal('legislative'),
      v.literal('executive'),
      v.literal('judicial'),
      v.literal('election'),
      v.literal('public_hearing'),
      v.literal('other')
    ),
    sourceId: v.optional(v.id('sources')),
    sourceUrl: v.optional(v.string()),
    alertDays: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const eventId = await ctx.db.insert('events', {
      title: args.title,
      description: args.description,
      eventDate: args.eventDate,
      eventType: args.eventType,
      sourceId: args.sourceId,
      sourceUrl: args.sourceUrl,
      relatedClaims: [],
      relatedArticles: [],
      alertDays: args.alertDays || [7, 3, 1], // Default: alertar 7, 3 y 1 días antes
      createdAt: now,
      updatedAt: now,
    })

    return eventId
  },
})

/**
 * Actualizar evento
 */
export const update = mutation({
  args: {
    id: v.id('events'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    eventType: v.optional(
      v.union(
        v.literal('legislative'),
        v.literal('executive'),
        v.literal('judicial'),
        v.literal('election'),
        v.literal('public_hearing'),
        v.literal('other')
      )
    ),
    sourceUrl: v.optional(v.string()),
    alertDays: v.optional(v.array(v.number())),
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
 * Agregar claim relacionado
 */
export const addRelatedClaim = mutation({
  args: {
    eventId: v.id('events'),
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Evitar duplicados
    if (!event.relatedClaims.includes(args.claimId)) {
      await ctx.db.patch(args.eventId, {
        relatedClaims: [...event.relatedClaims, args.claimId],
        updatedAt: Date.now(),
      })
    }

    return args.eventId
  },
})

/**
 * Agregar artículo relacionado
 */
export const addRelatedArticle = mutation({
  args: {
    eventId: v.id('events'),
    articleId: v.id('articles'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Evitar duplicados
    if (!event.relatedArticles.includes(args.articleId)) {
      await ctx.db.patch(args.eventId, {
        relatedArticles: [...event.relatedArticles, args.articleId],
        updatedAt: Date.now(),
      })
    }

    return args.eventId
  },
})

/**
 * Marcar alerta como enviada
 */
export const markAlertSent = mutation({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      lastAlertSent: Date.now(),
      updatedAt: Date.now(),
    })

    return args.eventId
  },
})

/**
 * Eliminar evento
 */
export const remove = mutation({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})
