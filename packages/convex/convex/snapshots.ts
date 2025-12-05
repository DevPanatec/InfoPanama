import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'

/**
 * SNAPSHOTS - Gestión de snapshots de páginas web
 * Almacenamiento de HTML, PDF y screenshots en DigitalOcean Spaces
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar todos los snapshots
 */
export const list = query({
  args: {
    articleId: v.optional(v.id('articles')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { articleId, limit = 50 } = args

    // Si hay filtro de artículo, usar el índice
    if (articleId) {
      const snapshots = await ctx.db
        .query('snapshots')
        .withIndex('by_article', (q) => q.eq('articleId', articleId))
        .collect()

      // Ordenar manualmente por fecha de creación descendente
      return snapshots
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
    }

    // Si no hay filtro, usar orden directo
    return await ctx.db.query('snapshots').order('desc').take(limit)
  },
})

/**
 * Obtener snapshot por ID
 */
export const getById = query({
  args: { id: v.id('snapshots') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener snapshot por article ID
 */
export const getByArticleId = query({
  args: { articleId: v.id('articles') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('snapshots')
      .withIndex('by_article', (q) => q.eq('articleId', args.articleId))
      .first()
  },
})

/**
 * Obtener snapshot por hash
 */
export const getByHash = query({
  args: { contentHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('snapshots')
      .withIndex('by_hash', (q) => q.eq('contentHash', args.contentHash))
      .first()
  },
})

/**
 * Snapshots recientes
 */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    return await ctx.db.query('snapshots').order('desc').take(limit)
  },
})

/**
 * Estadísticas de snapshots
 */
export const stats = query({
  handler: async (ctx) => {
    const snapshots = await ctx.db.query('snapshots').collect()

    const withPdf = snapshots.filter((s) => s.pdfPath).length
    const withScreenshot = snapshots.filter((s) => s.screenshotPath).length

    const totalSize = snapshots.reduce((sum, s) => sum + s.fileSize, 0)
    const avgSize =
      snapshots.length > 0 ? totalSize / snapshots.length : 0

    return {
      total: snapshots.length,
      withPdf,
      withScreenshot,
      totalSize,
      avgSize: Math.round(avgSize),
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nuevo snapshot
 */
export const create = mutation({
  args: {
    url: v.string(),
    articleId: v.optional(v.id('articles')),
    htmlPath: v.string(),
    pdfPath: v.optional(v.string()),
    screenshotPath: v.optional(v.string()),
    contentHash: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe un snapshot con el mismo hash
    const existing = await ctx.db
      .query('snapshots')
      .withIndex('by_hash', (q) => q.eq('contentHash', args.contentHash))
      .first()

    if (existing) {
      throw new Error('Snapshot with this content hash already exists')
    }

    const snapshotId = await ctx.db.insert('snapshots', {
      url: args.url,
      articleId: args.articleId,
      htmlPath: args.htmlPath,
      pdfPath: args.pdfPath,
      screenshotPath: args.screenshotPath,
      contentHash: args.contentHash,
      fileSize: args.fileSize,
      createdAt: now,
    })

    return snapshotId
  },
})

/**
 * Actualizar snapshot (agregar PDF o screenshot)
 */
export const update = mutation({
  args: {
    id: v.id('snapshots'),
    pdfPath: v.optional(v.string()),
    screenshotPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    await ctx.db.patch(id, updates)

    return id
  },
})

/**
 * Asociar snapshot a artículo
 */
export const associateWithArticle = mutation({
  args: {
    snapshotId: v.id('snapshots'),
    articleId: v.id('articles'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.snapshotId, {
      articleId: args.articleId,
    })

    return args.snapshotId
  },
})

/**
 * Eliminar snapshot
 * NOTA: Esto solo elimina el registro en la DB, no elimina los archivos en DO Spaces
 * Los archivos en DO Spaces deben eliminarse mediante una acción separada
 */
export const remove = mutation({
  args: { id: v.id('snapshots') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  },
})

/**
 * Eliminar snapshots antiguos (limpieza)
 */
export const cleanupOld = mutation({
  args: {
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000

    const snapshots = await ctx.db.query('snapshots').collect()

    const toDelete = snapshots.filter((s) => s.createdAt < cutoffDate)

    for (const snapshot of toDelete) {
      await ctx.db.delete(snapshot._id)
    }

    return {
      deleted: toDelete.length,
      snapshots: toDelete.map((s) => ({
        id: s._id,
        url: s.url,
        createdAt: s.createdAt,
      })),
    }
  },
})

// ============================================
// INTERNAL MUTATIONS (solo para cron jobs)
// ============================================

/**
 * Registrar evento de crawl para monitoreo
 * (Usado por el cron job para tracking)
 */
export const createCrawlEvent = internalMutation({
  args: {
    timestamp: v.number(),
    status: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Por ahora solo logeamos, en el futuro podríamos guardar en una tabla de eventos
    console.log(`[CRAWL EVENT] ${args.status}: ${args.message}`)
    return {
      success: true,
      timestamp: args.timestamp,
    }
  },
})
