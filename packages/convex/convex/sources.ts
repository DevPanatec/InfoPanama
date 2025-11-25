import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * SOURCES - Gestión de fuentes de información (medios, oficiales, redes sociales)
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar todas las fuentes
 */
export const list = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('media'),
        v.literal('official'),
        v.literal('social_media')
      )
    ),
    isTrusted: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type, isTrusted, limit = 50 } = args

    let sourcesQuery = ctx.db.query('sources')

    if (type) {
      sourcesQuery = sourcesQuery.withIndex('by_type', (q) => q.eq('type', type))
    }

    const sources = await sourcesQuery.take(limit)

    // Filtrar por isTrusted si se proporciona
    if (isTrusted !== undefined) {
      return sources.filter((s) => s.isTrusted === isTrusted)
    }

    return sources
  },
})

/**
 * Obtener fuente por ID
 */
export const getById = query({
  args: { id: v.id('sources') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener fuente por slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sources')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()
  },
})

/**
 * Buscar fuentes por nombre
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, limit = 50 } = args

    return await ctx.db
      .query('sources')
      .withSearchIndex('search_sources', (q) => q.search('name', query))
      .take(limit)
  },
})

/**
 * Fuentes confiables
 */
export const trusted = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    return await ctx.db
      .query('sources')
      .withIndex('by_trusted', (q) => q.eq('isTrusted', true))
      .take(limit)
  },
})

/**
 * Fuentes con scraping habilitado
 */
export const scrapingEnabled = query({
  handler: async (ctx) => {
    const sources = await ctx.db.query('sources').collect()

    return sources.filter((s) => s.scrapingEnabled)
  },
})

/**
 * Fuentes por tipo
 */
export const getByType = query({
  args: {
    type: v.union(
      v.literal('media'),
      v.literal('official'),
      v.literal('social_media')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type, limit = 50 } = args

    return await ctx.db
      .query('sources')
      .withIndex('by_type', (q) => q.eq('type', type))
      .take(limit)
  },
})

/**
 * Estadísticas de fuentes
 */
export const stats = query({
  handler: async (ctx) => {
    const sources = await ctx.db.query('sources').collect()

    const byType = {
      media: sources.filter((s) => s.type === 'media').length,
      official: sources.filter((s) => s.type === 'official').length,
      social_media: sources.filter((s) => s.type === 'social_media').length,
    }

    const trusted = sources.filter((s) => s.isTrusted).length
    const scrapingEnabled = sources.filter((s) => s.scrapingEnabled).length

    const totalArticles = sources.reduce((sum, s) => sum + s.articleCount, 0)
    const avgCredibility =
      sources.reduce((sum, s) => sum + s.credibilityScore, 0) / sources.length ||
      0

    return {
      total: sources.length,
      byType,
      trusted,
      scrapingEnabled,
      totalArticles,
      avgCredibility: Math.round(avgCredibility),
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nueva fuente
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    url: v.string(),
    type: v.union(
      v.literal('media'),
      v.literal('official'),
      v.literal('social_media')
    ),
    category: v.optional(v.string()),
    isTrusted: v.optional(v.boolean()),
    credibilityScore: v.optional(v.number()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    scrapingEnabled: v.optional(v.boolean()),
    scrapingFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe una fuente con el mismo slug
    const existing = await ctx.db
      .query('sources')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()

    if (existing) {
      throw new Error('Source with this slug already exists')
    }

    const sourceId = await ctx.db.insert('sources', {
      name: args.name,
      slug: args.slug,
      url: args.url,
      type: args.type,
      category: args.category,
      isTrusted: args.isTrusted ?? false,
      credibilityScore: args.credibilityScore ?? 50,
      logo: args.logo,
      description: args.description,
      scrapingEnabled: args.scrapingEnabled ?? false,
      scrapingFrequency: args.scrapingFrequency,
      articleCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    return sourceId
  },
})

/**
 * Actualizar fuente
 */
export const update = mutation({
  args: {
    id: v.id('sources'),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    category: v.optional(v.string()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    isTrusted: v.optional(v.boolean()),
    credibilityScore: v.optional(v.number()),
    scrapingEnabled: v.optional(v.boolean()),
    scrapingFrequency: v.optional(v.string()),
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
 * Actualizar credibilidad
 */
export const updateCredibility = mutation({
  args: {
    id: v.id('sources'),
    credibilityScore: v.number(),
    isTrusted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      credibilityScore: args.credibilityScore,
      updatedAt: Date.now(),
    }

    if (args.isTrusted !== undefined) {
      updates.isTrusted = args.isTrusted
    }

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

/**
 * Actualizar ownership
 */
export const updateOwnership = mutation({
  args: {
    id: v.id('sources'),
    owner: v.optional(v.string()),
    ownership: v.optional(
      v.object({
        entity: v.string(),
        type: v.string(),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      owner: args.owner,
      ownership: args.ownership,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar bias score
 */
export const updateBiasScore = mutation({
  args: {
    id: v.id('sources'),
    overall: v.number(),
    sentiment: v.number(),
    framing: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      biasScore: {
        overall: args.overall,
        sentiment: args.sentiment,
        framing: args.framing,
      },
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar configuración de scraping
 */
export const updateScrapingConfig = mutation({
  args: {
    id: v.id('sources'),
    scrapingEnabled: v.boolean(),
    scrapingFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      scrapingEnabled: args.scrapingEnabled,
      scrapingFrequency: args.scrapingFrequency,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Marcar como scrapeado
 */
export const markAsScraped = mutation({
  args: { id: v.id('sources') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastScraped: Date.now(),
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Eliminar fuente
 */
export const remove = mutation({
  args: { id: v.id('sources') },
  handler: async (ctx, args) => {
    // Verificar si hay artículos asociados
    const articles = await ctx.db
      .query('articles')
      .withIndex('by_source', (q) => q.eq('sourceId', args.id))
      .take(1)

    if (articles.length > 0) {
      throw new Error(
        'Cannot delete source with associated articles. Delete articles first.'
      )
    }

    await ctx.db.delete(args.id)

    return args.id
  },
})
