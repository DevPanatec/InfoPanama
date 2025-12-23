import { query } from './_generated/server'

/**
 * GRAPH EXPORT - Exportación del grafo en diferentes formatos
 *
 * Formatos soportados:
 * - JSON: Formato nativo con toda la información
 * - CSV (Nodes): Nodos como CSV
 * - CSV (Edges): Relaciones como CSV
 * - GEXF: Formato compatible con Gephi
 */

/**
 * Exportar grafo completo en formato JSON
 */
export const exportGraphJSON = query({
  handler: async (ctx) => {
    // Obtener todos los actores
    const actors = await ctx.db.query('actors').collect()

    // Obtener todas las fuentes
    const sources = await ctx.db.query('sources').collect()

    // Obtener todas las entidades
    const entities = await ctx.db.query('entities').collect()

    // Obtener todas las relaciones activas
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Estadísticas
    const stats = {
      totalNodes: actors.length + sources.length + entities.length,
      totalEdges: relations.length,
      actors: actors.length,
      sources: sources.length,
      entities: entities.length,
      exportedAt: new Date().toISOString(),
    }

    return {
      meta: stats,
      nodes: {
        actors,
        sources,
        entities,
      },
      edges: relations,
    }
  },
})

/**
 * Exportar nodos en formato CSV
 */
export const exportNodesCSV = query({
  handler: async (ctx) => {
    const rows: string[] = []

    // Header
    rows.push('id,label,type,category,mentionCount,description')

    // Actores
    const actors = await ctx.db.query('actors').collect()
    for (const actor of actors) {
      const description = actor.profile?.description || ''
      rows.push(
        `${actor._id},"${actor.name}",actor,${actor.type},${actor.incidents.length},"${description.replace(/"/g, '""')}"`
      )
    }

    // Sources
    const sources = await ctx.db.query('sources').collect()
    for (const source of sources) {
      const description = source.description || ''
      rows.push(
        `${source._id},"${source.name}",source,${source.type},${source.articleCount},"${description.replace(/"/g, '""')}"`
      )
    }

    // Entities
    const entities = await ctx.db.query('entities').collect()
    for (const entity of entities) {
      const description = entity.metadata?.description || ''
      rows.push(
        `${entity._id},"${entity.name}",entity,${entity.type},${entity.mentionCount},"${description.replace(/"/g, '""')}"`
      )
    }

    return rows.join('\n')
  },
})

/**
 * Exportar relaciones en formato CSV
 */
export const exportEdgesCSV = query({
  handler: async (ctx) => {
    const rows: string[] = []

    // Header
    rows.push('source,target,type,strength,confidence,context')

    // Relaciones
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    for (const rel of relations) {
      const context = (rel.context || '').replace(/"/g, '""')
      rows.push(
        `${rel.sourceId},${rel.targetId},${rel.relationType},${rel.strength},${rel.confidence},"${context}"`
      )
    }

    return rows.join('\n')
  },
})

/**
 * Exportar grafo en formato GEXF (para Gephi)
 */
export const exportGraphGEXF = query({
  handler: async (ctx) => {
    const actors = await ctx.db.query('actors').collect()
    const sources = await ctx.db.query('sources').collect()
    const entities = await ctx.db.query('entities').collect()
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    const totalNodes = actors.length + sources.length + entities.length
    const totalEdges = relations.length

    let gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.3" version="1.3">
  <meta lastmodifieddate="${new Date().toISOString().split('T')[0]}">
    <creator>InfoPanama OSINT Graph</creator>
    <description>Network graph of entities, actors, and media sources in Panama</description>
  </meta>
  <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
      <attribute id="0" title="type" type="string"/>
      <attribute id="1" title="category" type="string"/>
      <attribute id="2" title="description" type="string"/>
      <attribute id="3" title="mentionCount" type="integer"/>
    </attributes>
    <attributes class="edge">
      <attribute id="0" title="relationType" type="string"/>
      <attribute id="1" title="strength" type="float"/>
      <attribute id="2" title="confidence" type="float"/>
      <attribute id="3" title="context" type="string"/>
    </attributes>
    <nodes count="${totalNodes}">
`

    // Agregar actores como nodos
    for (const actor of actors) {
      const description = (actor.profile?.description || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

      gexf += `      <node id="${actor._id}" label="${actor.name}">
        <attvalues>
          <attvalue for="0" value="actor"/>
          <attvalue for="1" value="${actor.type}"/>
          <attvalue for="2" value="${description}"/>
          <attvalue for="3" value="${actor.incidents.length}"/>
        </attvalues>
      </node>
`
    }

    // Agregar sources como nodos
    for (const source of sources) {
      const description = (source.description || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

      gexf += `      <node id="${source._id}" label="${source.name}">
        <attvalues>
          <attvalue for="0" value="source"/>
          <attvalue for="1" value="${source.type}"/>
          <attvalue for="2" value="${description}"/>
          <attvalue for="3" value="${source.articleCount}"/>
        </attvalues>
      </node>
`
    }

    // Agregar entities como nodos
    for (const entity of entities) {
      const description = (entity.metadata?.description || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

      gexf += `      <node id="${entity._id}" label="${entity.name}">
        <attvalues>
          <attvalue for="0" value="entity"/>
          <attvalue for="1" value="${entity.type}"/>
          <attvalue for="2" value="${description}"/>
          <attvalue for="3" value="${entity.mentionCount}"/>
        </attvalues>
      </node>
`
    }

    gexf += `    </nodes>
    <edges count="${totalEdges}">
`

    // Agregar relaciones como edges
    for (let i = 0; i < relations.length; i++) {
      const rel = relations[i]
      const context = (rel.context || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

      gexf += `      <edge id="${i}" source="${rel.sourceId}" target="${rel.targetId}" weight="${rel.strength / 100}">
        <attvalues>
          <attvalue for="0" value="${rel.relationType}"/>
          <attvalue for="1" value="${rel.strength}"/>
          <attvalue for="2" value="${rel.confidence}"/>
          <attvalue for="3" value="${context}"/>
        </attvalues>
      </edge>
`
    }

    gexf += `    </edges>
  </graph>
</gexf>`

    return gexf
  },
})

/**
 * Obtener estadísticas del grafo para mostrar antes de exportar
 */
export const getExportStats = query({
  handler: async (ctx) => {
    const actors = await ctx.db.query('actors').collect()
    const sources = await ctx.db.query('sources').collect()
    const entities = await ctx.db.query('entities').collect()
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Calcular tamaños aproximados
    const jsonSize = JSON.stringify({
      actors,
      sources,
      entities,
      relations,
    }).length

    const csvNodesSize =
      actors.length + sources.length + entities.length * 100 // Aproximado

    const csvEdgesSize = relations.length * 150 // Aproximado

    return {
      totalNodes: actors.length + sources.length + entities.length,
      totalEdges: relations.length,
      breakdown: {
        actors: actors.length,
        sources: sources.length,
        entities: entities.length,
      },
      estimatedSizes: {
        json: `${(jsonSize / 1024).toFixed(2)} KB`,
        csvNodes: `${(csvNodesSize / 1024).toFixed(2)} KB`,
        csvEdges: `${(csvEdgesSize / 1024).toFixed(2)} KB`,
      },
    }
  },
})
