import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { Id } from './_generated/dataModel'

/**
 * NODE REVIEW - Marcar nodos (actors, sources, entities) para revisión de IA
 * Este módulo maneja el marcado de nodos desde diferentes tablas para revisión
 */

// Tipo helper para los IDs de nodos
type NodeId = Id<'actors'> | Id<'sources'> | Id<'entities'>

/**
 * Determinar qué tabla contiene un nodo intentando obtenerlo de cada tabla
 */
async function getTableFromId(
  ctx: any,
  id: string
): Promise<{ table: 'actors' | 'sources' | 'entities'; data: any } | null> {
  // Intentar obtener de actors
  try {
    const actor = await ctx.db.get(id as Id<'actors'>)
    if (actor) return { table: 'actors', data: actor }
  } catch (e) {
    // No es un actor, continuar
  }

  // Intentar obtener de sources
  try {
    const source = await ctx.db.get(id as Id<'sources'>)
    if (source) return { table: 'sources', data: source }
  } catch (e) {
    // No es un source, continuar
  }

  // Intentar obtener de entities
  try {
    const entity = await ctx.db.get(id as Id<'entities'>)
    if (entity) return { table: 'entities', data: entity }
  } catch (e) {
    // No es una entity
  }

  return null
}

/**
 * Marcar nodo para revisión (funciona con cualquier tabla)
 */
export const markNodeForReview = mutation({
  args: {
    nodeId: v.string(),
    requestedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await getTableFromId(ctx, args.nodeId)

    if (!result) {
      throw new Error(`Node not found: ${args.nodeId}`)
    }

    const { table, data } = result

    // @ts-ignore - Convex IDs are type-safe but we're using dynamic table names
    await ctx.db.patch(args.nodeId, {
      markedForReview: true,
      reviewRequestedAt: Date.now(),
      reviewRequestedBy: args.requestedBy || 'unknown',
      updatedAt: Date.now(),
    })

    console.log(`✅ Nodo marcado para revisión en tabla ${table}:`, args.nodeId)
    return args.nodeId
  },
})

/**
 * Desmarcar nodo de revisión
 */
export const unmarkNodeForReview = mutation({
  args: { nodeId: v.string() },
  handler: async (ctx, args) => {
    const result = await getTableFromId(ctx, args.nodeId)

    if (!result) {
      throw new Error(`Node not found: ${args.nodeId}`)
    }

    const { table } = result

    // @ts-ignore - Convex IDs are type-safe but we're using dynamic table names
    await ctx.db.patch(args.nodeId, {
      markedForReview: false,
      updatedAt: Date.now(),
    })

    console.log(`✅ Nodo desmarcado de revisión en tabla ${table}:`, args.nodeId)
    return args.nodeId
  },
})

/**
 * Obtener todos los nodos marcados para revisión (de todas las tablas)
 */
export const getMarkedNodes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const markedNodes = []

    // Buscar en actors
    const actors = await ctx.db.query('actors').collect()
    for (const actor of actors) {
      if (actor.markedForReview === true) {
        markedNodes.push({
          ...actor,
          _table: 'actors' as const,
        })
      }
    }

    // Buscar en sources
    const sources = await ctx.db.query('sources').collect()
    for (const source of sources) {
      if (source.markedForReview === true) {
        markedNodes.push({
          ...source,
          _table: 'sources' as const,
        })
      }
    }

    // Buscar en entities
    const entities = await ctx.db.query('entities').collect()
    for (const entity of entities) {
      if (entity.markedForReview === true) {
        markedNodes.push({
          ...entity,
          _table: 'entities' as const,
        })
      }
    }

    // Ordenar por reviewRequestedAt (más recientes primero)
    markedNodes.sort((a, b) => (b.reviewRequestedAt || 0) - (a.reviewRequestedAt || 0))

    // Aplicar límite
    return markedNodes.slice(0, limit)
  },
})
