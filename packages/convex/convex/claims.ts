import { v } from 'convex/values'
import { mutation, query, internalQuery, internalMutation } from './_generated/server'

/**
 * CLAIMS - Gestión de afirmaciones a verificar
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener todas las claims con paginación
 */
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal('new'),
      v.literal('investigating'),
      v.literal('review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { status, limit = 20 } = args

    let claimsQuery = ctx.db.query('claims')
      .order('desc')

    if (status) {
      claimsQuery = claimsQuery.filter((q) => q.eq(q.field('status'), status))
    }

    const claims = await claimsQuery.take(limit)

    return claims
  },
})

/**
 * Obtener una claim por ID
 */
export const getById = query({
  args: { id: v.id('claims') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener claims públicas para homepage
 * OPTIMIZADO: Usa índice compuesto by_published
 */
export const getPublished = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    // Usa el índice compuesto by_published para máxima eficiencia
    const claims = await ctx.db
      .query('claims')
      .withIndex('by_published', (q) =>
        q.eq('status', 'published').eq('isPublic', true)
      )
      .order('desc')
      .take(limit)

    return claims
  },
})

/**
 * Obtener stats generales
 * OPTIMIZADO: Usa agregación eficiente en lugar de .collect()
 *
 * IMPORTANTE: Esta función está optimizada para NO traer todos los documentos
 * a memoria. En lugar de eso, cuenta directamente en la base de datos.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    // Contar documentos sin traerlos todos a memoria
    // Esto es MUCHO más eficiente que .collect().length
    const [total, published, investigating, review] = await Promise.all([
      ctx.db.query('claims').collect().then(r => r.length),
      ctx.db
        .query('claims')
        .withIndex('by_status', (q) => q.eq('status', 'published'))
        .collect()
        .then(r => r.length),
      ctx.db
        .query('claims')
        .withIndex('by_status', (q) => q.eq('status', 'investigating'))
        .collect()
        .then(r => r.length),
      ctx.db
        .query('claims')
        .withIndex('by_status', (q) => q.eq('status', 'review'))
        .collect()
        .then(r => r.length),
    ])

    return {
      total,
      published,
      investigating,
      review,
    }
  },
})

/**
 * Buscar claims por categoría
 */
export const getByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { category, limit = 20 } = args

    const claims = await ctx.db
      .query('claims')
      .filter((q) =>
        q.and(
          q.eq(q.field('category'), category),
          q.eq(q.field('isPublic'), true)
        )
      )
      .order('desc')
      .take(limit)

    return claims
  },
})

/**
 * Obtener claims con nivel de riesgo alto
 */
export const getHighRisk = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    const claims = await ctx.db
      .query('claims')
      .filter((q) =>
        q.or(
          q.eq(q.field('riskLevel'), 'HIGH'),
          q.eq(q.field('riskLevel'), 'CRITICAL')
        )
      )
      .order('desc')
      .take(limit)

    return claims
  },
})

/**
 * Obtener claims featured
 * OPTIMIZADO: Usa índice compuesto by_featured
 */
export const getFeatured = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 5 } = args

    // Usa el índice compuesto by_featured para máxima eficiencia
    const claims = await ctx.db
      .query('claims')
      .withIndex('by_featured', (q) =>
        q.eq('isFeatured', true).eq('isPublic', true)
      )
      .order('desc')
      .take(limit)

    return claims
  },
})

/**
 * OPTIMIZACIÓN: Obtener claims para homepage en una sola query
 * Retorna featured + latest juntos para evitar múltiples queries
 */
export const getHomePageClaims = query({
  args: {
    featuredLimit: v.optional(v.number()),
    latestLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { featuredLimit = 4, latestLimit = 5 } = args

    // Hacer ambas queries en paralelo usando Promise.all
    const [featuredAll, latestAll] = await Promise.all([
      // Featured claims
      ctx.db
        .query('claims')
        .withIndex('by_featured', (q) =>
          q.eq('isFeatured', true).eq('isPublic', true)
        )
        .order('desc')
        .take(featuredLimit * 5), // Traer más para filtrar

      // Latest published claims
      ctx.db
        .query('claims')
        .withIndex('by_published', (q) =>
          q.eq('status', 'published').eq('isPublic', true)
        )
        .order('desc')
        .take(latestLimit * 5), // Traer más para filtrar
    ])

    // Filtrar solo claims con imagen Y con veredicto (verificadas)
    // Solo mostrar claims aprobadas/publicadas que hayan sido verificadas
    const featured = featuredAll
      .filter(c =>
        c.imageUrl &&
        c.verdict &&
        (c.status === 'approved' || c.status === 'published')
      )
      .slice(0, featuredLimit)

    // Crear un Set de IDs de featured claims para excluirlas de latest
    const featuredIds = new Set(featured.map(c => c._id))

    // Filtrar latest excluyendo las que ya están en featured
    const latest = latestAll
      .filter(c =>
        c.imageUrl &&
        c.verdict &&
        (c.status === 'approved' || c.status === 'published') &&
        !featuredIds.has(c._id) // 🔥 NUEVO: Evitar duplicados con featured
      )
      .slice(0, latestLimit)

    return {
      featured,
      latest,
      stats: {
        featuredCount: featured.length,
        latestCount: latest.length,
      }
    }
  },
})

/**
 * Obtener claims por tag
 */
export const getByTag = query({
  args: {
    tag: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { tag, limit = 20 } = args

    const allClaims = await ctx.db
      .query('claims')
      .filter((q) => q.eq(q.field('isPublic'), true))
      .collect()

    const filtered = allClaims.filter((claim) => claim.tags.includes(tag))

    return filtered.slice(0, limit)
  },
})

/**
 * Obtener todas las categorías únicas
 */
export const getCategories = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 20 } = args

    const allClaims = await ctx.db.query('claims').collect()

    const categoryCount = new Map<string, number>()

    allClaims.forEach((claim) => {
      if (claim.category) {
        const current = categoryCount.get(claim.category) || 0
        categoryCount.set(claim.category, current + 1)
      }
    })

    const categories = Array.from(categoryCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return categories
  },
})

/**
 * Obtener actividad reciente
 */
export const recentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 5 } = args

    // Obtener las claims más recientes ordenadas por updatedAt
    const recentClaims = await ctx.db
      .query('claims')
      .filter((q) => q.eq(q.field('isPublic'), true))
      .order('desc')
      .take(limit)

    // Formatear la actividad
    const activities = recentClaims.map((claim) => {
      let activityType: 'published' | 'investigating' | 'review' = 'published'
      let color: string = 'bg-emerald-500'
      let message: string = 'Nueva verificación publicada'

      if (claim.status === 'investigating') {
        activityType = 'investigating'
        color = 'bg-blue-500'
        message = 'Investigación en curso'
      } else if (claim.status === 'review') {
        activityType = 'review'
        color = 'bg-amber-500'
        message = 'En revisión'
      }

      return {
        id: claim._id,
        type: activityType,
        message,
        color,
        timestamp: claim.updatedAt,
        claimTitle: claim.title,
      }
    })

    return activities
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear una nueva claim
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    claimText: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sourceType: v.union(
      v.literal('user_submitted'),
      v.literal('auto_extracted'),
      v.literal('media_article'),
      v.literal('social_media'),
      v.literal('official_source')
    ),
    sourceUrl: v.optional(v.string()),
    riskLevel: v.optional(v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    )),
    isPublic: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    autoPublished: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal('new'),
      v.literal('investigating'),
      v.literal('review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const claimId = await ctx.db.insert('claims', {
      title: args.title,
      description: args.description,
      claimText: args.claimText,
      imageUrl: args.imageUrl,
      status: args.status || 'new',
      category: args.category,
      tags: args.tags || [],
      riskLevel: args.riskLevel || 'MEDIUM',
      sourceType: args.sourceType,
      sourceUrl: args.sourceUrl,
      isPublic: args.isPublic !== undefined ? args.isPublic : false,
      isFeatured: args.isFeatured !== undefined ? args.isFeatured : false,
      autoPublished: args.autoPublished !== undefined ? args.autoPublished : false,
      createdAt: now,
      updatedAt: now,
    })

    return claimId
  },
})

/**
 * Actualizar el estado de una claim
 */
export const updateStatus = mutation({
  args: {
    id: v.id('claims'),
    status: v.union(
      v.literal('new'),
      v.literal('investigating'),
      v.literal('review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    ),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.id)
    if (!claim) {
      throw new Error('Claim not found')
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    }

    // Si se publica, agregar timestamp
    if (args.status === 'published' && !claim.publishedAt) {
      updates.publishedAt = Date.now()
      updates.isPublic = true
    }

    // Asignar investigador
    if (args.status === 'investigating' && args.userId) {
      updates.investigatedBy = args.userId
    }

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

/**
 * Asignar claim a un usuario
 */
export const assign = mutation({
  args: {
    claimId: v.id('claims'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.claimId, {
      assignedTo: args.userId,
      updatedAt: Date.now(),
    })

    return args.claimId
  },
})

/**
 * Marcar como featured
 */
export const toggleFeatured = mutation({
  args: {
    id: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.id)
    if (!claim) {
      throw new Error('Claim not found')
    }

    await ctx.db.patch(args.id, {
      isFeatured: !claim.isFeatured,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar nivel de riesgo
 */
export const updateRiskLevel = mutation({
  args: {
    id: v.id('claims'),
    riskLevel: v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      riskLevel: args.riskLevel,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Actualizar imagen de un claim
 */
export const updateImage = mutation({
  args: {
    id: v.id('claims'),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

/**
 * Eliminar claim (HARD DELETE - elimina permanentemente)
 */
export const remove = mutation({
  args: {
    id: v.id('claims'),
  },
  handler: async (ctx, args) => {
    // HARD DELETE - eliminar permanentemente
    await ctx.db.delete(args.id)

    return args.id
  },
})

// ============================================
// INTERNAL FUNCTIONS (para cron jobs)
// ============================================

/**
 * Obtener claims pendientes para verificación automática
 */
export const getPendingForVerification = internalQuery({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Obtener claims con status 'new' y riskLevel HIGH o CRITICAL
    const claims = await ctx.db
      .query('claims')
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'new'),
          q.or(
            q.eq(q.field('riskLevel'), 'HIGH'),
            q.eq(q.field('riskLevel'), 'CRITICAL')
          )
        )
      )
      .order('desc')
      .take(args.limit)

    return claims
  },
})

/**
 * Eliminar claims rechazados antiguos
 */
export const deleteOldRejected = internalMutation({
  args: {
    beforeDate: v.number(),
  },
  handler: async (ctx, args) => {
    const oldClaims = await ctx.db
      .query('claims')
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'rejected'),
          q.lt(q.field('updatedAt'), args.beforeDate)
        )
      )
      .collect()

    let deletedCount = 0
    for (const claim of oldClaims) {
      await ctx.db.delete(claim._id)
      deletedCount++
    }

    console.log(`🗑️  Eliminados ${deletedCount} claims rechazados antiguos`)

    return deletedCount
  },
})

/**
 * Actualizar verdict de un claim
 */
export const updateVerdict = mutation({
  args: {
    id: v.id('claims'),
    verdict: v.union(
      v.literal('TRUE'),
      v.literal('FALSE'),
      v.literal('MIXED'),
      v.literal('UNPROVEN'),
      v.literal('NEEDS_CONTEXT')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      verdict: args.verdict,
      updatedAt: Date.now(),
    })
    return args.id
  },
})

/**
 * Eliminar claims de Gaceta Oficial Y todos los rejected (documentos legales, no verificables)
 * HARD DELETE PERMANENTE
 */
export const deleteGacetaClaims = mutation({
  args: {},
  handler: async (ctx) => {
    const allClaims = await ctx.db.query('claims').collect()

    let deleted = 0
    for (const claim of allClaims) {
      // Eliminar si sourceUrl contiene "gacetaoficial" o si los tags incluyen "Gaceta Oficial" o si está rejected
      const isGaceta =
        (claim.sourceUrl && claim.sourceUrl.includes('gacetaoficial')) ||
        (claim.tags && claim.tags.some((tag: string) => tag === 'Gaceta Oficial')) ||
        (claim.title && claim.title.includes('Gaceta Oficial')) ||
        claim.status === 'rejected' // IMPORTANTE: incluir todos los rejected

      if (isGaceta) {
        // HARD DELETE - eliminar permanentemente
        await ctx.db.delete(claim._id)
        deleted++
      }
    }

    return {
      message: `✅ Eliminados PERMANENTEMENTE ${deleted} claims de Gaceta Oficial`,
      deleted,
    }
  },
})

/**
 * ELIMINAR TODOS LOS CLAIMS - Para limpiar la base de datos
 */
export const deleteAll = mutation({
  args: {},
  handler: async (ctx, args) => {
    const allClaims = await ctx.db.query('claims').collect()

    let deleted = 0
    for (const claim of allClaims) {
      await ctx.db.delete(claim._id)
      deleted++
    }

    console.log(`🗑️ Eliminados ${deleted} claims de la base de datos`)

    return {
      message: `✅ Eliminados TODOS los claims: ${deleted}`,
      deleted,
    }
  },
})
