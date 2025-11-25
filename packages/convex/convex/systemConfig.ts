import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * SYSTEM CONFIG - Configuración del sistema
 * Almacenamiento key-value para configuraciones dinámicas
 */

// ============================================
// QUERIES
// ============================================

/**
 * Obtener todas las configuraciones
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 100 } = args

    return await ctx.db.query('systemConfig').take(limit)
  },
})

/**
 * Obtener configuración por clave
 */
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()
  },
})

/**
 * Obtener valor de configuración por clave
 */
export const getValue = query({
  args: {
    key: v.string(),
    defaultValue: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (!config) {
      return args.defaultValue ?? null
    }

    return config.value
  },
})

/**
 * Obtener múltiples configuraciones por claves
 */
export const getMultiple = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, args) => {
    const configs = await ctx.db.query('systemConfig').collect()

    const result: Record<string, any> = {}

    for (const key of args.keys) {
      const config = configs.find((c) => c.key === key)
      result[key] = config ? config.value : null
    }

    return result
  },
})

/**
 * Obtener configuraciones con patrón
 */
export const getByPattern = query({
  args: { pattern: v.string() },
  handler: async (ctx, args) => {
    const configs = await ctx.db.query('systemConfig').collect()

    // Filtrar por patrón (ej: "feature.*" para todas las feature flags)
    const regex = new RegExp(
      '^' + args.pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    )

    return configs.filter((c) => regex.test(c.key))
  },
})

/**
 * Estadísticas de configuración
 */
export const stats = query({
  handler: async (ctx) => {
    const configs = await ctx.db.query('systemConfig').collect()

    // Agrupar por prefijo
    const prefixes: Record<string, number> = {}

    configs.forEach((config) => {
      const prefix = config.key.split('.')[0] || 'other'
      prefixes[prefix] = (prefixes[prefix] || 0) + 1
    })

    return {
      total: configs.length,
      byPrefix: prefixes,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Establecer configuración
 */
export const set = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updatedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Buscar si ya existe
    const existing = await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (existing) {
      // Actualizar existente
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description || existing.description,
        updatedBy: args.updatedBy,
        updatedAt: Date.now(),
      })

      return existing._id
    }

    // Crear nuevo
    const configId = await ctx.db.insert('systemConfig', {
      key: args.key,
      value: args.value,
      description: args.description,
      updatedBy: args.updatedBy,
      updatedAt: Date.now(),
    })

    return configId
  },
})

/**
 * Actualizar configuración existente
 */
export const update = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    updatedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (!config) {
      throw new Error(`Config key "${args.key}" not found`)
    }

    await ctx.db.patch(config._id, {
      value: args.value,
      updatedBy: args.updatedBy,
      updatedAt: Date.now(),
    })

    return config._id
  },
})

/**
 * Actualizar descripción
 */
export const updateDescription = mutation({
  args: {
    key: v.string(),
    description: v.string(),
    updatedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (!config) {
      throw new Error(`Config key "${args.key}" not found`)
    }

    await ctx.db.patch(config._id, {
      description: args.description,
      updatedBy: args.updatedBy,
      updatedAt: Date.now(),
    })

    return config._id
  },
})

/**
 * Establecer múltiples configuraciones
 */
export const setMultiple = mutation({
  args: {
    configs: v.array(
      v.object({
        key: v.string(),
        value: v.any(),
        description: v.optional(v.string()),
      })
    ),
    updatedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const ids = []

    for (const config of args.configs) {
      // Buscar si ya existe
      const existing = await ctx.db
        .query('systemConfig')
        .withIndex('by_key', (q) => q.eq('key', config.key))
        .first()

      if (existing) {
        // Actualizar existente
        await ctx.db.patch(existing._id, {
          value: config.value,
          description: config.description || existing.description,
          updatedBy: args.updatedBy,
          updatedAt: Date.now(),
        })
        ids.push(existing._id)
      } else {
        // Crear nuevo
        const id = await ctx.db.insert('systemConfig', {
          key: config.key,
          value: config.value,
          description: config.description,
          updatedBy: args.updatedBy,
          updatedAt: Date.now(),
        })
        ids.push(id)
      }
    }

    return ids
  },
})

/**
 * Eliminar configuración
 */
export const remove = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('systemConfig')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (!config) {
      throw new Error(`Config key "${args.key}" not found`)
    }

    await ctx.db.delete(config._id)

    return config._id
  },
})

/**
 * Inicializar configuraciones por defecto
 */
export const initDefaults = mutation({
  args: { updatedBy: v.id('users') },
  handler: async (ctx, args) => {
    const defaults = [
      {
        key: 'feature.agent_mode',
        value: false,
        description: 'Habilitar modo agente para verificación automática',
      },
      {
        key: 'feature.auto_publish',
        value: false,
        description: 'Publicar claims automáticamente después de verificación',
      },
      {
        key: 'feature.dd_module',
        value: true,
        description: 'Módulo de debida diligencia habilitado',
      },
      {
        key: 'feature.hb_detection',
        value: true,
        description: 'Detección de Hombres de Blanco habilitada',
      },
      {
        key: 'moderation.auto_approve_threshold',
        value: 0.9,
        description:
          'Umbral de confianza para auto-aprobar verificaciones (0-1)',
      },
      {
        key: 'moderation.auto_flag_reports',
        value: 3,
        description: 'Cantidad de reportes para auto-flagear comentario',
      },
      {
        key: 'scraping.frequency_hours',
        value: 6,
        description: 'Frecuencia de scraping en horas',
      },
      {
        key: 'scraping.max_articles_per_source',
        value: 50,
        description: 'Máximo de artículos a scrapear por fuente',
      },
      {
        key: 'ai.model',
        value: 'gpt-4-turbo-preview',
        description: 'Modelo de IA para verificación',
      },
      {
        key: 'ai.max_tokens',
        value: 4096,
        description: 'Máximo de tokens por request',
      },
      {
        key: 'rate_limit.requests_per_minute',
        value: 100,
        description: 'Límite de requests por minuto',
      },
    ]

    const ids = []

    for (const config of defaults) {
      // Solo crear si no existe
      const existing = await ctx.db
        .query('systemConfig')
        .withIndex('by_key', (q) => q.eq('key', config.key))
        .first()

      if (!existing) {
        const id = await ctx.db.insert('systemConfig', {
          ...config,
          updatedBy: args.updatedBy,
          updatedAt: Date.now(),
        })
        ids.push(id)
      }
    }

    return {
      created: ids.length,
      total: defaults.length,
    }
  },
})
