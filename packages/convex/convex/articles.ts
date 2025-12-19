import { v } from 'convex/values'
import { mutation, query, internalQuery } from './_generated/server'

/**
 * ARTICLES - Gestión de artículos scrapeados de medios
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar artículos con paginación
 */
export const list = query({
  args: {
    sourceId: v.optional(v.id('sources')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sourceId, limit = 20 } = args

    // Build query based on filters
    let articlesQuery
    if (sourceId) {
      articlesQuery = ctx.db.query('articles').withIndex('by_source', (q) =>
        q.eq('sourceId', sourceId)
      )
    } else {
      articlesQuery = ctx.db.query('articles').order('desc')
    }

    return await articlesQuery.take(limit)
  },
})

/**
 * Obtener artículo por ID
 */
export const getById = query({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Buscar artículos por contenido
 */
export const search = query({
  args: {
    query: v.string(),
    sourceId: v.optional(v.id('sources')),
    topics: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, sourceId, topics, limit = 50 } = args

    const results = await ctx.db
      .query('articles')
      .withSearchIndex('search_articles', (q) => {
        let search = q.search('content', query)

        if (sourceId) {
          search = search.eq('sourceId', sourceId)
        }

        return search
      })
      .take(limit)

    // Filtrar por topics si se proporciona
    if (topics && topics.length > 0) {
      return results.filter((article) =>
        topics.some((topic) => article.topics.includes(topic))
      )
    }

    return results
  },
})

/**
 * Obtener artículos recientes
 */
export const recent = query({
  args: {
    limit: v.optional(v.number()),
    sourceId: v.optional(v.id('sources')),
  },
  handler: async (ctx, args) => {
    const { limit = 20, sourceId } = args

    let articlesQuery = ctx.db
      .query('articles')
      .withIndex('by_date')
      .order('desc')

    if (sourceId) {
      const allArticles = await articlesQuery.take(100)
      return allArticles.filter((a) => a.sourceId === sourceId).slice(0, limit)
    }

    return await articlesQuery.take(limit)
  },
})

/**
 * Obtener artículos por hash (deduplicación)
 */
export const getByHash = query({
  args: { contentHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('articles')
      .withIndex('by_hash', (q) => q.eq('contentHash', args.contentHash))
      .first()
  },
})

/**
 * Obtener artículos con embeddings
 */
export const withEmbeddings = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const articles = await ctx.db.query('articles').take(limit)

    return articles.filter((article) => article.hasEmbedding)
  },
})

/**
 * Estadísticas de artículos
 */
export const stats = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query('articles').collect()

    const withEmbeddings = articles.filter((a) => a.hasEmbedding).length
    const withSnapshots = articles.filter((a) => a.snapshotUrl).length

    // Agrupar por fuente
    const bySource = articles.reduce(
      (acc, article) => {
        const sourceId = article.sourceId
        acc[sourceId] = (acc[sourceId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: articles.length,
      withEmbeddings,
      withSnapshots,
      bySource,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear un nuevo artículo
 */
export const create = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    content: v.string(),
    htmlContent: v.optional(v.string()),
    sourceId: v.id('sources'),
    author: v.optional(v.string()),
    publishedDate: v.number(),
    topics: v.optional(v.array(v.string())),
    contentHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe un artículo con el mismo hash
    const existing = await ctx.db
      .query('articles')
      .withIndex('by_hash', (q) => q.eq('contentHash', args.contentHash))
      .first()

    if (existing) {
      throw new Error('Article with this content already exists')
    }

    const articleId = await ctx.db.insert('articles', {
      title: args.title,
      url: args.url,
      content: args.content,
      htmlContent: args.htmlContent,
      sourceId: args.sourceId,
      author: args.author,
      publishedDate: args.publishedDate,
      topics: args.topics || [],
      entities: [],
      hasEmbedding: false,
      extractedClaims: [],
      contentHash: args.contentHash,
      scrapedAt: now,
      createdAt: now,
      updatedAt: now,
    })

    // Actualizar contador de artículos en la fuente
    const source = await ctx.db.get(args.sourceId)
    if (source) {
      await ctx.db.patch(args.sourceId, {
        articleCount: source.articleCount + 1,
        lastScraped: now,
        updatedAt: now,
      })
    }

    return articleId
  },
})

/**
 * Actualizar artículo
 */
export const update = mutation({
  args: {
    id: v.id('articles'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    topics: v.optional(v.array(v.string())),
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
 * Agregar snapshot a artículo
 */
export const addSnapshot = mutation({
  args: {
    articleId: v.id('articles'),
    snapshotUrl: v.string(),
    snapshotHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      snapshotUrl: args.snapshotUrl,
      snapshotHash: args.snapshotHash,
      updatedAt: Date.now(),
    })

    return args.articleId
  },
})

/**
 * Agregar embedding a artículo
 */
export const addEmbedding = mutation({
  args: {
    articleId: v.id('articles'),
    embeddingId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      hasEmbedding: true,
      embeddingId: args.embeddingId,
      updatedAt: Date.now(),
    })

    return args.articleId
  },
})

/**
 * Agregar claim extraído
 */
export const addExtractedClaim = mutation({
  args: {
    articleId: v.id('articles'),
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    await ctx.db.patch(args.articleId, {
      extractedClaims: [...article.extractedClaims, args.claimId],
      updatedAt: Date.now(),
    })

    return args.articleId
  },
})

/**
 * Agregar entidades al artículo
 */
export const addEntities = mutation({
  args: {
    articleId: v.id('articles'),
    entityIds: v.array(v.id('entities')),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    // Combinar entidades existentes con las nuevas (sin duplicados)
    const uniqueEntities = Array.from(
      new Set([...article.entities, ...args.entityIds])
    )

    await ctx.db.patch(args.articleId, {
      entities: uniqueEntities,
      updatedAt: Date.now(),
    })

    return args.articleId
  },
})

/**
 * Agregar análisis de sentimiento
 */
export const addSentiment = mutation({
  args: {
    articleId: v.id('articles'),
    score: v.number(),
    label: v.union(
      v.literal('positive'),
      v.literal('neutral'),
      v.literal('negative')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      sentiment: {
        score: args.score,
        label: args.label,
      },
      updatedAt: Date.now(),
    })

    return args.articleId
  },
})

/**
 * Eliminar artículo
 */
export const remove = mutation({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id)
    if (!article) {
      throw new Error('Article not found')
    }

    // Actualizar contador de la fuente
    const source = await ctx.db.get(article.sourceId)
    if (source && source.articleCount > 0) {
      await ctx.db.patch(article.sourceId, {
        articleCount: source.articleCount - 1,
        updatedAt: Date.now(),
      })
    }

    await ctx.db.delete(args.id)

    return args.id
  },
})

// ============================================
// INTERNAL QUERIES (para cron jobs)
// ============================================

/**
 * Obtener artículos no analizados por IA (para análisis automático)
 */
export const getUnanalyzed = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    // Obtener artículos recientes ordenados por fecha
    const articles = await ctx.db
      .query('articles')
      .withIndex('by_date')
      .order('desc')
      .take(100) // Tomar más para filtrar

    // Filtrar los que NO tienen entidades asociadas
    // (indicador de que no han sido analizados)
    const unanalyzed = []
    for (const article of articles) {
      if (unanalyzed.length >= limit) break

      // Verificar si tiene entidades
      const hasEntities = article.entities && article.entities.length > 0

      if (!hasEntities) {
        unanalyzed.push(article)
      }
    }

    return unanalyzed
  },
})

/**
 * ELIMINAR TODOS LOS ARTÍCULOS - Para limpiar la base de datos
 */
export const deleteAll = mutation({
  args: {},
  handler: async (ctx, args) => {
    const allArticles = await ctx.db.query('articles').collect()

    let deleted = 0
    for (const article of allArticles) {
      await ctx.db.delete(article._id)
      deleted++
    }

    console.log(`🗑️ Eliminados ${deleted} artículos de la base de datos`)

    return {
      message: `✅ Eliminados TODOS los artículos: ${deleted}`,
      deleted,
    }
  },
})
