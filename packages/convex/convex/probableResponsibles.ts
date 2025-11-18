import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * PROBABLE RESPONSIBLES - Análisis de posibles responsables de incidentes
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener posibles responsables de una claim
 */
export const getByClaimId = query({
  args: { claimId: v.id('claims') },
  handler: async (ctx, args) => {
    const responsibles = await ctx.db
      .query('probableResponsibles')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .order('desc')
      .collect()

    // Ordenar por probabilidad
    return responsibles.sort((a, b) => b.probability - a.probability)
  },
})

/**
 * Obtener incidentes de un actor
 */
export const getByActorId = query({
  args: { actorId: v.id('actors') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('probableResponsibles')
      .withIndex('by_actor', (q) => q.eq('actorId', args.actorId))
      .order('desc')
      .collect()
  },
})

/**
 * Obtener responsables confirmados
 */
export const confirmed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const responsibles = await ctx.db
      .query('probableResponsibles')
      .filter((q) => q.eq(q.field('validationStatus'), 'confirmed'))
      .order('desc')
      .take(limit)

    return responsibles
  },
})

/**
 * Responsables pendientes de validación
 */
export const pending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('probableResponsibles')
      .filter((q) => q.eq(q.field('validationStatus'), 'pending'))
      .order('desc')
      .take(limit)
  },
})

/**
 * Top responsables (por frecuencia)
 */
export const topResponsibles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    const responsibles = await ctx.db
      .query('probableResponsibles')
      .filter((q) => q.eq(q.field('validationStatus'), 'confirmed'))
      .collect()

    // Agrupar por actor
    const actorCounts = new Map<string, number>()
    responsibles.forEach((r) => {
      const count = actorCounts.get(r.actorId) || 0
      actorCounts.set(r.actorId, count + 1)
    })

    // Convertir a array y ordenar
    const sorted = Array.from(actorCounts.entries())
      .map(([actorId, count]) => ({ actorId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return sorted
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear análisis de responsable probable
 */
export const create = mutation({
  args: {
    claimId: v.id('claims'),
    actorId: v.id('actors'),
    probability: v.number(),
    confidence: v.number(),
    reasoning: v.string(),
    evidence: v.array(v.object({
      type: v.string(),
      description: v.string(),
      sourceId: v.optional(v.union(v.id('articles'), v.id('sources'))),
      weight: v.number(),
    })),
    patterns: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe un análisis para este par claim-actor
    const existing = await ctx.db
      .query('probableResponsibles')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .filter((q) => q.eq(q.field('actorId'), args.actorId))
      .first()

    if (existing) {
      // Actualizar el existente
      await ctx.db.patch(existing._id, {
        probability: args.probability,
        confidence: args.confidence,
        reasoning: args.reasoning,
        evidence: args.evidence,
        patterns: args.patterns || [],
        updatedAt: now,
      })

      return existing._id
    }

    // Crear nuevo
    const responsibleId = await ctx.db.insert('probableResponsibles', {
      claimId: args.claimId,
      actorId: args.actorId,
      probability: args.probability,
      confidence: args.confidence,
      reasoning: args.reasoning,
      evidence: args.evidence,
      patterns: args.patterns || [],
      validationStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    return responsibleId
  },
})

/**
 * Validar responsable
 */
export const validate = mutation({
  args: {
    id: v.id('probableResponsibles'),
    userId: v.id('users'),
    status: v.union(
      v.literal('confirmed'),
      v.literal('rejected')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      validatedBy: args.userId,
      validationStatus: args.status,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar probabilidad
 */
export const updateProbability = mutation({
  args: {
    id: v.id('probableResponsibles'),
    probability: v.number(),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      probability: args.probability,
      confidence: args.confidence,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Agregar evidencia
 */
export const addEvidence = mutation({
  args: {
    id: v.id('probableResponsibles'),
    evidence: v.object({
      type: v.string(),
      description: v.string(),
      sourceId: v.optional(v.union(v.id('articles'), v.id('sources'))),
      weight: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const responsible = await ctx.db.get(args.id)
    if (!responsible) {
      throw new Error('Probable responsible not found')
    }

    await ctx.db.patch(args.id, {
      evidence: [...responsible.evidence, args.evidence],
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Eliminar análisis
 */
export const remove = mutation({
  args: { id: v.id('probableResponsibles') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})
