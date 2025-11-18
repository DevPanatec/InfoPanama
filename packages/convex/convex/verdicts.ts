import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * VERDICTS - Gestión de veredictos de verificación
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener veredicto por claim ID
 */
export const getByClaimId = query({
  args: { claimId: v.id('claims') },
  handler: async (ctx, args) => {
    const verdicts = await ctx.db
      .query('verdicts')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .order('desc')
      .take(10)

    return verdicts
  },
})

/**
 * Obtener último veredicto de una claim
 */
export const getLatestByClaimId = query({
  args: { claimId: v.id('claims') },
  handler: async (ctx, args) => {
    const verdict = await ctx.db
      .query('verdicts')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .order('desc')
      .first()

    return verdict
  },
})

/**
 * Obtener veredictos recientes
 */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    return await ctx.db
      .query('verdicts')
      .order('desc')
      .take(limit)
  },
})

/**
 * Obtener estadísticas de veredictos
 */
export const stats = query({
  handler: async (ctx) => {
    const verdicts = await ctx.db.query('verdicts').collect()

    const byVerdict = {
      TRUE: verdicts.filter((v) => v.verdict === 'TRUE').length,
      FALSE: verdicts.filter((v) => v.verdict === 'FALSE').length,
      MIXED: verdicts.filter((v) => v.verdict === 'MIXED').length,
      UNPROVEN: verdicts.filter((v) => v.verdict === 'UNPROVEN').length,
      NEEDS_CONTEXT: verdicts.filter((v) => v.verdict === 'NEEDS_CONTEXT').length,
    }

    const avgConfidence =
      verdicts.reduce((sum, v) => sum + v.confidenceScore, 0) / verdicts.length || 0

    const totalTokens = verdicts.reduce((sum, v) => sum + v.tokensUsed, 0)
    const avgProcessingTime =
      verdicts.reduce((sum, v) => sum + v.processingTime, 0) / verdicts.length || 0

    return {
      total: verdicts.length,
      byVerdict,
      avgConfidence: Math.round(avgConfidence),
      totalTokens,
      avgProcessingTime: Math.round(avgProcessingTime),
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear un nuevo veredicto
 */
export const create = mutation({
  args: {
    claimId: v.id('claims'),
    verdict: v.union(
      v.literal('TRUE'),
      v.literal('FALSE'),
      v.literal('MIXED'),
      v.literal('UNPROVEN'),
      v.literal('NEEDS_CONTEXT')
    ),
    confidenceScore: v.number(),
    explanation: v.string(),
    summary: v.string(),
    evidenceSources: v.array(v.object({
      sourceId: v.id('articles'),
      quote: v.string(),
      relevance: v.number(),
      url: v.string(),
    })),
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTime: v.number(),
    criticReview: v.optional(v.object({
      passed: v.boolean(),
      issues: v.array(v.string()),
      confidence: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Obtener veredictos previos para versioning
    const previousVerdicts = await ctx.db
      .query('verdicts')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .order('desc')
      .take(1)

    const version = previousVerdicts.length > 0 ? previousVerdicts[0].version + 1 : 1
    const previousVersionId = previousVerdicts.length > 0 ? previousVerdicts[0]._id : undefined

    const verdictId = await ctx.db.insert('verdicts', {
      claimId: args.claimId,
      verdict: args.verdict,
      confidenceScore: args.confidenceScore,
      explanation: args.explanation,
      summary: args.summary,
      evidenceSources: args.evidenceSources,
      modelUsed: args.modelUsed,
      tokensUsed: args.tokensUsed,
      processingTime: args.processingTime,
      criticReview: args.criticReview,
      version,
      previousVersionId,
      createdAt: now,
      updatedAt: now,
    })

    return verdictId
  },
})

/**
 * Validar veredicto (por humano)
 */
export const validate = mutation({
  args: {
    verdictId: v.id('verdicts'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.verdictId, {
      validatedBy: args.userId,
      updatedAt: Date.now(),
    })

    return args.verdictId
  },
})

/**
 * Actualizar critic review
 */
export const updateCriticReview = mutation({
  args: {
    verdictId: v.id('verdicts'),
    passed: v.boolean(),
    issues: v.array(v.string()),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.verdictId, {
      criticReview: {
        passed: args.passed,
        issues: args.issues,
        confidence: args.confidence,
      },
      updatedAt: Date.now(),
    })

    return args.verdictId
  },
})
