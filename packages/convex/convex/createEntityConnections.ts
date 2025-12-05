import { mutation } from './_generated/server'

/**
 * Crea conexiones automáticas entre entidades basadas en metadata
 * Lee owners y connections de cada entidad y crea relaciones en entityRelations
 */
export const createEntityConnections = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      connectionsCreated: 0,
      errors: [] as string[],
    }

    // 1. Obtener todas las entidades
    const entities = await ctx.db.query('entities').collect()

    console.log(`📊 Procesando ${entities.length} entidades...`)

    for (const entity of entities) {
      try {
        const metadata = entity.metadata

        if (!metadata) continue

        // 2. Procesar OWNERS (quién es dueño de esta entidad)
        if (metadata.owners && Array.isArray(metadata.owners)) {
          for (const ownerName of metadata.owners) {
            // Buscar la entidad del dueño
            const ownerEntity = await ctx.db
              .query('entities')
              .filter((q) => q.eq(q.field('name'), ownerName))
              .first()

            if (ownerEntity) {
              // Crear relación: owner OWNS entity
              const existingRelation = await ctx.db
                .query('entityRelations')
                .filter((q) =>
                  q.and(
                    q.eq(q.field('sourceId'), ownerEntity._id),
                    q.eq(q.field('targetId'), entity._id),
                    q.eq(q.field('relationType'), 'owns')
                  )
                )
                .first()

              if (!existingRelation) {
                await ctx.db.insert('entityRelations', {
                  sourceId: ownerEntity._id,
                  sourceType: 'entity',
                  targetId: entity._id,
                  targetType: 'entity',
                  relationType: 'owns',
                  strength: 1.0,
                  confidence: 0.95,
                  evidenceArticles: [],
                  evidenceCount: 1,
                  isActive: true,
                  context: `${ownerName} es dueño/accionista de ${entity.name}`,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                })
                results.connectionsCreated++
                console.log(`  ✅ ${ownerName} → owns → ${entity.name}`)
              }
            } else {
              console.log(`  ⚠️  Dueño no encontrado: ${ownerName}`)
            }
          }
        }

        // 3. Procesar CONNECTIONS (conexiones políticas, familiares, etc)
        if (metadata.connections && typeof metadata.connections === 'object') {
          const connections = metadata.connections as Record<string, any>

          // Conexiones políticas
          if (connections.political && Array.isArray(connections.political)) {
            for (const politicalConnection of connections.political) {
              const targetName = politicalConnection.split(' (')[0] // Remover descripción entre paréntesis
              const targetEntity = await ctx.db
                .query('entities')
                .filter((q) => q.eq(q.field('name'), targetName))
                .first()

              if (targetEntity) {
                const existingRelation = await ctx.db
                  .query('entityRelations')
                  .filter((q) =>
                    q.and(
                      q.eq(q.field('sourceId'), entity._id),
                      q.eq(q.field('targetId'), targetEntity._id),
                      q.eq(q.field('relationType'), 'political_connection')
                    )
                  )
                  .first()

                if (!existingRelation) {
                  await ctx.db.insert('entityRelations', {
                    sourceId: entity._id,
                    sourceType: 'entity',
                    targetId: targetEntity._id,
                    targetType: 'entity',
                    relationType: 'political_connection',
                    strength: 0.8,
                    confidence: 0.9,
                    evidenceArticles: [],
                    evidenceCount: 1,
                    isActive: true,
                    context: politicalConnection,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  })
                  results.connectionsCreated++
                  console.log(`  ✅ ${entity.name} → político → ${targetName}`)
                }
              }
            }
          }

          // Conexiones familiares
          if (connections.family && Array.isArray(connections.family)) {
            for (const familyConnection of connections.family) {
              const targetName = familyConnection.split(' (')[0]
              const targetEntity = await ctx.db
                .query('entities')
                .filter((q) => q.eq(q.field('name'), targetName))
                .first()

              if (targetEntity) {
                const existingRelation = await ctx.db
                  .query('entityRelations')
                  .filter((q) =>
                    q.and(
                      q.eq(q.field('sourceId'), entity._id),
                      q.eq(q.field('targetId'), targetEntity._id),
                      q.eq(q.field('relationType'), 'family')
                    )
                  )
                  .first()

                if (!existingRelation) {
                  await ctx.db.insert('entityRelations', {
                    sourceId: entity._id,
                    sourceType: 'entity',
                    targetId: targetEntity._id,
                    targetType: 'entity',
                    relationType: 'family',
                    strength: 0.9,
                    confidence: 0.95,
                    evidenceArticles: [],
                    evidenceCount: 1,
                    isActive: true,
                    context: familyConnection,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  })
                  results.connectionsCreated++
                  console.log(`  ✅ ${entity.name} → familia → ${targetName}`)
                }
              }
            }
          }

          // Conexiones empresariales (companies)
          if (connections.companies && Array.isArray(connections.companies)) {
            for (const companyConnection of connections.companies) {
              const targetName = companyConnection.split(' (')[0]
              const targetEntity = await ctx.db
                .query('entities')
                .filter((q) => q.eq(q.field('name'), targetName))
                .first()

              if (targetEntity) {
                const existingRelation = await ctx.db
                  .query('entityRelations')
                  .filter((q) =>
                    q.and(
                      q.eq(q.field('sourceId'), entity._id),
                      q.eq(q.field('targetId'), targetEntity._id),
                      q.eq(q.field('relationType'), 'business')
                    )
                  )
                  .first()

                if (!existingRelation) {
                  await ctx.db.insert('entityRelations', {
                    sourceId: entity._id,
                    sourceType: 'entity',
                    targetId: targetEntity._id,
                    targetType: 'entity',
                    relationType: 'business',
                    strength: 0.85,
                    confidence: 0.9,
                    evidenceArticles: [],
                    evidenceCount: 1,
                    isActive: true,
                    context: companyConnection,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  })
                  results.connectionsCreated++
                  console.log(`  ✅ ${entity.name} → empresa → ${targetName}`)
                }
              }
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error procesando ${entity.name}: ${error}`)
        console.error(`❌ Error en ${entity.name}:`, error)
      }
    }

    console.log(`\n✅ Conexiones creadas: ${results.connectionsCreated}`)
    console.log(`❌ Errores: ${results.errors.length}`)

    return {
      success: true,
      message: `Creadas ${results.connectionsCreated} conexiones entre entidades`,
      details: results,
    }
  },
})
