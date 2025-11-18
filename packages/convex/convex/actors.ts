import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * ACTORS - Gestión de actores informativos y debida diligencia
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar todos los actores
 */
export const list = query({
  args: {
    type: v.optional(v.union(
      v.literal('person'),
      v.literal('group'),
      v.literal('troll_network'),
      v.literal('botnet'),
      v.literal('HB'),
      v.literal('anonymous'),
      v.literal('verified_account'),
      v.literal('media_outlet'),
      v.literal('official')
    )),
    riskLevel: v.optional(v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    )),
    kyaStatus: v.optional(v.union(
      v.literal('verified'),
      v.literal('suspicious'),
      v.literal('flagged'),
      v.literal('blocked')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type, riskLevel, kyaStatus, limit = 50 } = args

    let actorsQuery = ctx.db.query('actors')

    if (type) {
      actorsQuery = actorsQuery.withIndex('by_type', (q) => q.eq('type', type))
    }

    if (riskLevel) {
      actorsQuery = actorsQuery.filter((q) => q.eq(q.field('riskLevel'), riskLevel))
    }

    if (kyaStatus) {
      actorsQuery = actorsQuery.filter((q) => q.eq(q.field('kyaStatus'), kyaStatus))
    }

    const actors = await actorsQuery.take(limit)

    return actors
  },
})

/**
 * Obtener actor por ID
 */
export const getById = query({
  args: { id: v.id('actors') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Buscar actores
 */
export const search = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    kyaStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { query, type, riskLevel, kyaStatus } = args

    const results = await ctx.db
      .query('actors')
      .withSearchIndex('search_actors', (q) => {
        let search = q.search('name', query)

        if (type) {
          search = search.eq('type', type)
        }
        if (riskLevel) {
          search = search.eq('riskLevel', riskLevel)
        }
        if (kyaStatus) {
          search = search.eq('kyaStatus', kyaStatus)
        }

        return search
      })
      .take(50)

    return results
  },
})

/**
 * Actores de alto riesgo
 */
export const highRisk = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    return await ctx.db
      .query('actors')
      .withIndex('by_risk', (q) => q.eq('riskLevel', 'HIGH'))
      .take(limit)
  },
})

/**
 * Actores críticos
 */
export const critical = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    return await ctx.db
      .query('actors')
      .withIndex('by_risk', (q) => q.eq('riskLevel', 'CRITICAL'))
      .take(limit)
  },
})

/**
 * Actores monitoreados
 */
export const monitored = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('actors')
      .filter((q) => q.eq(q.field('isMonitored'), true))
      .collect()
  },
})

/**
 * Estadísticas de actores
 */
export const stats = query({
  handler: async (ctx) => {
    const actors = await ctx.db.query('actors').collect()

    const byType = {
      person: actors.filter((a) => a.type === 'person').length,
      group: actors.filter((a) => a.type === 'group').length,
      troll_network: actors.filter((a) => a.type === 'troll_network').length,
      botnet: actors.filter((a) => a.type === 'botnet').length,
      HB: actors.filter((a) => a.type === 'HB').length,
      anonymous: actors.filter((a) => a.type === 'anonymous').length,
      verified_account: actors.filter((a) => a.type === 'verified_account').length,
      media_outlet: actors.filter((a) => a.type === 'media_outlet').length,
      official: actors.filter((a) => a.type === 'official').length,
    }

    const byRisk = {
      LOW: actors.filter((a) => a.riskLevel === 'LOW').length,
      MEDIUM: actors.filter((a) => a.riskLevel === 'MEDIUM').length,
      HIGH: actors.filter((a) => a.riskLevel === 'HIGH').length,
      CRITICAL: actors.filter((a) => a.riskLevel === 'CRITICAL').length,
    }

    const byKYA = {
      verified: actors.filter((a) => a.kyaStatus === 'verified').length,
      suspicious: actors.filter((a) => a.kyaStatus === 'suspicious').length,
      flagged: actors.filter((a) => a.kyaStatus === 'flagged').length,
      blocked: actors.filter((a) => a.kyaStatus === 'blocked').length,
    }

    return {
      total: actors.length,
      monitored: actors.filter((a) => a.isMonitored).length,
      blocked: actors.filter((a) => a.isBlocked).length,
      byType,
      byRisk,
      byKYA,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear un nuevo actor
 */
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal('person'),
      v.literal('group'),
      v.literal('troll_network'),
      v.literal('botnet'),
      v.literal('HB'),
      v.literal('anonymous'),
      v.literal('verified_account'),
      v.literal('media_outlet'),
      v.literal('official')
    ),
    riskLevel: v.optional(v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    )),
    riskScore: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const actorId = await ctx.db.insert('actors', {
      name: args.name,
      type: args.type,
      profile: {
        description: args.description,
        relationships: [],
      },
      riskLevel: args.riskLevel || 'MEDIUM',
      riskScore: args.riskScore || 50,
      kyaStatus: 'suspicious',
      dueDiligence: {
        complianceStatus: 'review_needed',
      },
      incidents: [],
      articlesAuthored: [],
      isMonitored: false,
      isBlocked: false,
      createdAt: now,
      updatedAt: now,
    })

    return actorId
  },
})

/**
 * Actualizar perfil de actor
 */
export const updateProfile = mutation({
  args: {
    id: v.id('actors'),
    description: v.optional(v.string()),
    history: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.id)
    if (!actor) {
      throw new Error('Actor not found')
    }

    await ctx.db.patch(args.id, {
      profile: {
        ...actor.profile,
        description: args.description || actor.profile.description,
        history: args.history,
      },
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar nivel de riesgo
 */
export const updateRisk = mutation({
  args: {
    id: v.id('actors'),
    riskLevel: v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    ),
    riskScore: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      riskLevel: args.riskLevel,
      riskScore: args.riskScore,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar estado KYA
 */
export const updateKYA = mutation({
  args: {
    id: v.id('actors'),
    kyaStatus: v.union(
      v.literal('verified'),
      v.literal('suspicious'),
      v.literal('flagged'),
      v.literal('blocked')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      kyaStatus: args.kyaStatus,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Completar debida diligencia
 */
export const completeDueDiligence = mutation({
  args: {
    id: v.id('actors'),
    userId: v.id('users'),
    findings: v.string(),
    complianceStatus: v.union(
      v.literal('compliant'),
      v.literal('review_needed'),
      v.literal('non_compliant')
    ),
    legalFramework: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.id)
    if (!actor) {
      throw new Error('Actor not found')
    }

    await ctx.db.patch(args.id, {
      dueDiligence: {
        ...actor.dueDiligence,
        completedAt: Date.now(),
        completedBy: args.userId,
        findings: args.findings,
        complianceStatus: args.complianceStatus,
        legalFramework: args.legalFramework,
      },
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Agregar incidente a actor
 */
export const addIncident = mutation({
  args: {
    actorId: v.id('actors'),
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId)
    if (!actor) {
      throw new Error('Actor not found')
    }

    await ctx.db.patch(args.actorId, {
      incidents: [...actor.incidents, args.claimId],
      lastActivity: Date.now(),
      updatedAt: Date.now(),
    })

    return args.actorId
  },
})

/**
 * Monitorear/desmonitorear actor
 */
export const toggleMonitor = mutation({
  args: { id: v.id('actors') },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.id)
    if (!actor) {
      throw new Error('Actor not found')
    }

    await ctx.db.patch(args.id, {
      isMonitored: !actor.isMonitored,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Bloquear/desbloquear actor
 */
export const toggleBlock = mutation({
  args: { id: v.id('actors') },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.id)
    if (!actor) {
      throw new Error('Actor not found')
    }

    await ctx.db.patch(args.id, {
      isBlocked: !actor.isBlocked,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Agregar relación entre actores
 */
export const addRelationship = mutation({
  args: {
    actorId: v.id('actors'),
    relatedActorId: v.id('actors'),
    relationshipType: v.string(),
    strength: v.number(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId)
    if (!actor) {
      throw new Error('Actor not found')
    }

    const relationships = actor.profile.relationships || []

    // Evitar duplicados
    const existingIndex = relationships.findIndex(
      (r) => r.actorId === args.relatedActorId
    )

    if (existingIndex >= 0) {
      relationships[existingIndex] = {
        actorId: args.relatedActorId,
        relationshipType: args.relationshipType,
        strength: args.strength,
      }
    } else {
      relationships.push({
        actorId: args.relatedActorId,
        relationshipType: args.relationshipType,
        strength: args.strength,
      })
    }

    await ctx.db.patch(args.actorId, {
      profile: {
        ...actor.profile,
        relationships,
      },
      updatedAt: Date.now(),
    })

    return args.actorId
  },
})
