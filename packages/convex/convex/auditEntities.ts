/**
 * Auditoría de entidades sin conexiones
 */

import { query } from './_generated/server'

export const findOrphanEntities = query({
  args: {},
  handler: async (ctx) => {
    // Obtener todas las entidades
    const entities = await ctx.db.query('entities').collect()

    // Obtener todas las relaciones activas
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // IDs de entidades que tienen al menos una conexión
    const connectedEntityIds = new Set<string>()
    relations.forEach((rel) => {
      if (rel.sourceType === 'entity') connectedEntityIds.add(rel.sourceId)
      if (rel.targetType === 'entity') connectedEntityIds.add(rel.targetId)
    })

    // Entidades sin conexiones (huérfanas)
    const orphans = entities.filter((e) => !connectedEntityIds.has(e._id))

    // Agrupar por tipo
    const orphansByType: Record<string, typeof orphans> = {}
    orphans.forEach((orphan) => {
      const type = orphan.type || 'OTHER'
      if (!orphansByType[type]) orphansByType[type] = []
      orphansByType[type].push(orphan)
    })

    // Estadísticas
    const stats = {
      totalEntities: entities.length,
      connectedEntities: connectedEntityIds.size,
      orphanEntities: orphans.length,
      orphanPercentage: ((orphans.length / entities.length) * 100).toFixed(1) + '%',
      orphansByType: Object.entries(orphansByType).map(([type, items]) => ({
        type,
        count: items.length,
      })),
    }

    // Muestra de huérfanos (primeros 50)
    const orphanSample = orphans.slice(0, 50).map((e) => ({
      _id: e._id,
      name: e.name,
      type: e.type,
      metadata: e.metadata,
      createdAt: e._creationTime,
    }))

    return {
      stats,
      orphanSample,
      // Lista completa por tipo
      orphansByType: Object.entries(orphansByType).map(([type, items]) => ({
        type,
        count: items.length,
        entities: items.slice(0, 20).map((e) => ({
          name: e.name,
          metadata: e.metadata,
        })),
      })),
    }
  },
})
