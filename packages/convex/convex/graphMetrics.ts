import { query } from './_generated/server'
import { Id } from './_generated/dataModel'

/**
 * GRAPH METRICS - Métricas avanzadas del grafo
 *
 * Incluye:
 * - Degree Centrality (grado de conexión)
 * - Betweenness Centrality (importancia en conexiones)
 * - PageRank (importancia ponderada)
 * - Clustering Coefficient (agrupamiento)
 */

interface NodeMetrics {
  nodeId: string
  nodeName: string
  nodeType: 'actor' | 'source' | 'entity'
  degree: number // Total de conexiones
  inDegree: number // Conexiones entrantes
  outDegree: number // Conexiones salientes
  weightedDegree: number // Degree ponderado por strength
  betweenness?: number // Centralidad de intermediación
  pageRank?: number // Importancia de PageRank
  clusteringCoefficient?: number // Coeficiente de agrupamiento
}

/**
 * Calcular métricas de degree (grado) para todos los nodos
 */
export const calculateDegreeMetrics = query({
  handler: async (ctx) => {
    const metrics: NodeMetrics[] = []

    // Obtener todas las relaciones activas
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Mapa de nodos y sus conexiones
    const nodeConnections = new Map<
      string,
      { in: number; out: number; weighted: number; name: string; type: string }
    >()

    // Procesar relaciones
    for (const rel of relations) {
      // Source (saliente)
      const sourceKey = rel.sourceId
      if (!nodeConnections.has(sourceKey)) {
        nodeConnections.set(sourceKey, {
          in: 0,
          out: 0,
          weighted: 0,
          name: '',
          type: rel.sourceType,
        })
      }
      const sourceData = nodeConnections.get(sourceKey)!
      sourceData.out += 1
      sourceData.weighted += rel.strength / 100

      // Target (entrante)
      const targetKey = rel.targetId
      if (!nodeConnections.has(targetKey)) {
        nodeConnections.set(targetKey, {
          in: 0,
          out: 0,
          weighted: 0,
          name: '',
          type: rel.targetType,
        })
      }
      const targetData = nodeConnections.get(targetKey)!
      targetData.in += 1
      targetData.weighted += rel.strength / 100
    }

    // Obtener nombres de nodos
    for (const [nodeId, data] of nodeConnections.entries()) {
      let nodeName = 'Unknown'

      // Intentar obtener de actors
      if (data.type === 'actor') {
        const actor = await ctx.db.get(nodeId as Id<'actors'>)
        if (actor) nodeName = actor.name
      }

      // Intentar obtener de sources
      if (data.type === 'source') {
        const source = await ctx.db.get(nodeId as Id<'sources'>)
        if (source) nodeName = source.name
      }

      // Intentar obtener de entities
      if (data.type === 'entity') {
        const entity = await ctx.db.get(nodeId as Id<'entities'>)
        if (entity) nodeName = entity.name
      }

      metrics.push({
        nodeId,
        nodeName,
        nodeType: data.type as any,
        degree: data.in + data.out,
        inDegree: data.in,
        outDegree: data.out,
        weightedDegree: data.weighted,
      })
    }

    // Ordenar por degree (más conectados primero)
    metrics.sort((a, b) => b.degree - a.degree)

    return metrics
  },
})

/**
 * Calcular PageRank simplificado
 * PageRank mide la importancia de un nodo basado en la calidad de sus conexiones
 */
export const calculatePageRank = query({
  handler: async (ctx) => {
    const dampingFactor = 0.85
    const iterations = 20
    const tolerance = 0.0001

    // Obtener todas las relaciones activas
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Construir grafo
    const nodeIds = new Set<string>()
    const outLinks = new Map<string, string[]>()
    const inLinks = new Map<string, string[]>()

    for (const rel of relations) {
      nodeIds.add(rel.sourceId)
      nodeIds.add(rel.targetId)

      // Out links
      if (!outLinks.has(rel.sourceId)) {
        outLinks.set(rel.sourceId, [])
      }
      outLinks.get(rel.sourceId)!.push(rel.targetId)

      // In links
      if (!inLinks.has(rel.targetId)) {
        inLinks.set(rel.targetId, [])
      }
      inLinks.get(rel.targetId)!.push(rel.sourceId)
    }

    const numNodes = nodeIds.size
    const initialRank = 1 / numNodes

    // Inicializar PageRank
    const pageRank = new Map<string, number>()
    for (const nodeId of nodeIds) {
      pageRank.set(nodeId, initialRank)
    }

    // Iterar PageRank
    for (let i = 0; i < iterations; i++) {
      const newRank = new Map<string, number>()
      let maxChange = 0

      for (const nodeId of nodeIds) {
        let rank = (1 - dampingFactor) / numNodes

        // Sumar contribución de nodos que apuntan a este
        const incoming = inLinks.get(nodeId) || []
        for (const inNode of incoming) {
          const inNodeRank = pageRank.get(inNode) || 0
          const outLinksCount = outLinks.get(inNode)?.length || 1
          rank += dampingFactor * (inNodeRank / outLinksCount)
        }

        newRank.set(nodeId, rank)
        maxChange = Math.max(maxChange, Math.abs(rank - (pageRank.get(nodeId) || 0)))
      }

      // Actualizar ranks
      for (const [nodeId, rank] of newRank) {
        pageRank.set(nodeId, rank)
      }

      // Convergencia
      if (maxChange < tolerance) {
        console.log(`PageRank converged at iteration ${i}`)
        break
      }
    }

    // Convertir a array y obtener nombres
    const results: Array<{
      nodeId: string
      nodeName: string
      pageRank: number
    }> = []

    for (const [nodeId, rank] of pageRank) {
      let nodeName = 'Unknown'

      // Obtener nombre del nodo
      try {
        const actor = await ctx.db.get(nodeId as Id<'actors'>)
        if (actor) nodeName = actor.name
      } catch (e) {
        try {
          const source = await ctx.db.get(nodeId as Id<'sources'>)
          if (source) nodeName = source.name
        } catch (e2) {
          try {
            const entity = await ctx.db.get(nodeId as Id<'entities'>)
            if (entity) nodeName = entity.name
          } catch (e3) {
            // No encontrado
          }
        }
      }

      results.push({ nodeId, nodeName, pageRank: rank })
    }

    // Ordenar por PageRank (más importantes primero)
    results.sort((a, b) => b.pageRank - a.pageRank)

    return results
  },
})

/**
 * Identificar hubs (nodos muy conectados) y authorities (nodos muy referenciados)
 */
export const identifyHubsAndAuthorities = query({
  handler: async (ctx) => {
    const metrics = await calculateDegreeMetrics(ctx)

    // Calcular umbrales para hubs y authorities
    const avgOutDegree =
      metrics.reduce((sum, m) => sum + m.outDegree, 0) / metrics.length
    const avgInDegree =
      metrics.reduce((sum, m) => sum + m.inDegree, 0) / metrics.length

    const hubThreshold = avgOutDegree * 1.5
    const authorityThreshold = avgInDegree * 1.5

    // Identificar hubs (muchas conexiones salientes)
    const hubs = metrics
      .filter((m) => m.outDegree >= hubThreshold)
      .map((m) => ({
        nodeId: m.nodeId,
        nodeName: m.nodeName,
        nodeType: m.nodeType,
        outDegree: m.outDegree,
        score: m.outDegree / avgOutDegree,
      }))
      .sort((a, b) => b.score - a.score)

    // Identificar authorities (muchas conexiones entrantes)
    const authorities = metrics
      .filter((m) => m.inDegree >= authorityThreshold)
      .map((m) => ({
        nodeId: m.nodeId,
        nodeName: m.nodeName,
        nodeType: m.nodeType,
        inDegree: m.inDegree,
        score: m.inDegree / avgInDegree,
      }))
      .sort((a, b) => b.score - a.score)

    return {
      hubs: hubs.slice(0, 20), // Top 20 hubs
      authorities: authorities.slice(0, 20), // Top 20 authorities
      thresholds: {
        hub: hubThreshold,
        authority: authorityThreshold,
      },
    }
  },
})

/**
 * Detectar comunidades simples usando Louvain simplificado
 * (Agrupa nodos que están muy conectados entre sí)
 */
export const detectCommunities = query({
  handler: async (ctx) => {
    // Obtener todas las relaciones activas
    const relations = await ctx.db
      .query('entityRelations')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Construir mapa de adyacencia
    const adjacency = new Map<string, Set<string>>()

    for (const rel of relations) {
      if (!adjacency.has(rel.sourceId)) {
        adjacency.set(rel.sourceId, new Set())
      }
      if (!adjacency.has(rel.targetId)) {
        adjacency.set(rel.targetId, new Set())
      }

      adjacency.get(rel.sourceId)!.add(rel.targetId)
      adjacency.get(rel.targetId)!.add(rel.sourceId)
    }

    // Asignar comunidad inicial (cada nodo en su propia comunidad)
    const community = new Map<string, number>()
    let communityId = 0

    for (const nodeId of adjacency.keys()) {
      community.set(nodeId, communityId++)
    }

    // Iterar hasta convergencia (simplificado - máximo 10 iteraciones)
    for (let iter = 0; iter < 10; iter++) {
      let changes = 0

      for (const [nodeId, neighbors] of adjacency) {
        // Contar vecinos en cada comunidad
        const communityCounts = new Map<number, number>()

        for (const neighbor of neighbors) {
          const neighborCommunity = community.get(neighbor)!
          communityCounts.set(
            neighborCommunity,
            (communityCounts.get(neighborCommunity) || 0) + 1
          )
        }

        // Encontrar la comunidad con más vecinos
        let maxCount = 0
        let bestCommunity = community.get(nodeId)!

        for (const [comm, count] of communityCounts) {
          if (count > maxCount) {
            maxCount = count
            bestCommunity = comm
          }
        }

        // Cambiar a mejor comunidad si es diferente
        if (bestCommunity !== community.get(nodeId)) {
          community.set(nodeId, bestCommunity)
          changes++
        }
      }

      // Convergencia
      if (changes === 0) {
        console.log(`Communities converged at iteration ${iter}`)
        break
      }
    }

    // Agrupar nodos por comunidad
    const communities = new Map<number, string[]>()

    for (const [nodeId, commId] of community) {
      if (!communities.has(commId)) {
        communities.set(commId, [])
      }
      communities.get(commId)!.push(nodeId)
    }

    // Convertir a array
    const results = Array.from(communities.entries())
      .map(([id, nodes]) => ({
        communityId: id,
        size: nodes.length,
        nodes: nodes,
      }))
      .filter((c) => c.size > 1) // Solo comunidades con más de 1 nodo
      .sort((a, b) => b.size - a.size)

    return {
      totalCommunities: results.length,
      communities: results.slice(0, 10), // Top 10 comunidades más grandes
    }
  },
})

/**
 * Obtener el nodo más importante del grafo (combinando múltiples métricas)
 */
export const getMostImportantNodes = query({
  handler: async (ctx) => {
    const degreeMetrics = await calculateDegreeMetrics(ctx)
    const pageRankMetrics = await calculatePageRank(ctx)

    // Combinar métricas
    const combined = degreeMetrics.map((dm) => {
      const pr = pageRankMetrics.find((pr) => pr.nodeId === dm.nodeId)

      return {
        nodeId: dm.nodeId,
        nodeName: dm.nodeName,
        nodeType: dm.nodeType,
        degree: dm.degree,
        weightedDegree: dm.weightedDegree,
        pageRank: pr?.pageRank || 0,
        importanceScore:
          (dm.degree / 10) * 0.3 + // Peso de degree
          (dm.weightedDegree / 10) * 0.3 + // Peso de weighted degree
          (pr?.pageRank || 0) * 100 * 0.4, // Peso de PageRank
      }
    })

    // Ordenar por importance score
    combined.sort((a, b) => b.importanceScore - a.importanceScore)

    return combined.slice(0, 20) // Top 20 nodos más importantes
  },
})
