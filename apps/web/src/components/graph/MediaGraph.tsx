'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { NetworkGraph } from './NetworkGraph'
import { NodeDetailsPanel } from './NodeDetailsPanel'
import { Loader2, Building2 } from 'lucide-react'
import type { GraphFilterOptions } from './GraphFilters'

interface NetworkNode {
  id: string | number
  label: string
  group?: 'person' | 'organization' | 'media' | 'event' | 'poi'
  title?: string
  value?: number
}

interface NetworkEdge {
  id?: string | number
  from: string | number
  to: string | number
  label?: string
  value?: number
  title?: string
  strength?: number
  type?: string
}

interface MediaGraphProps {
  filters?: GraphFilterOptions
  height?: string
}

export function MediaGraph({
  filters,
  height = '600px',
}: MediaGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Obtener TODOS los nodos del grafo OSINT
  const graphData = useQuery(api.entityRelations.getFullGraph)

  // Transformar y filtrar datos de Convex a formato Vis.js
  const { nodes, edges } = useMemo(() => {
    if (!graphData) return { nodes: [], edges: [] }

    console.log('🔍 Aplicando filtros:', filters)
    console.log('📊 Datos del grafo:', {
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.edges.length,
    })

    // Mapear tipos de Convex a tipos de nodo del grafo
    const typeMap: Record<string, 'person' | 'organization' | 'media' | 'event' | 'poi'> = {
      actor: 'person',
      source: 'media',
      entity: 'organization',
      event: 'event',
    }

    // Filtrar edges por strength y tipo de relación
    let filteredEdges = [...graphData.edges]

    // Aplicar filtro de fuerza mínima
    if (filters?.minStrength !== undefined && filters.minStrength > 0) {
      const beforeCount = filteredEdges.length
      filteredEdges = filteredEdges.filter((e) => (e.strength || 0) >= filters.minStrength!)
      console.log(`✂️  Filtro de fuerza ${filters.minStrength}%: ${beforeCount} → ${filteredEdges.length} edges`)
    }

    // Aplicar filtro de tipos de relación
    if (filters?.selectedRelationTypes && filters.selectedRelationTypes.length > 0) {
      const beforeCount = filteredEdges.length
      filteredEdges = filteredEdges.filter((e) =>
        filters.selectedRelationTypes!.includes(e.type)
      )
      console.log(`✂️  Filtro de relaciones: ${beforeCount} → ${filteredEdges.length} edges`)
    }

    // Obtener IDs de nodos que tienen conexiones
    const connectedNodeIds = new Set<string>()
    filteredEdges.forEach((edge) => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })

    // Filtrar nodos
    let filteredNodes = [...graphData.nodes]

    // Filtrar por tipo de entidad
    if (filters?.selectedEntityTypes && filters.selectedEntityTypes.length > 0) {
      const beforeCount = filteredNodes.length
      filteredNodes = filteredNodes.filter((n) => {
        const mappedType = typeMap[n.type] || 'organization'
        return filters.selectedEntityTypes!.includes(mappedType)
      })
      console.log(`✂️  Filtro de tipos: ${beforeCount} → ${filteredNodes.length} nodes`)
    }

    // Filtrar nodos aislados si está deshabilitado
    if (filters?.showIsolatedNodes === false) {
      const beforeCount = filteredNodes.length
      filteredNodes = filteredNodes.filter((n) => connectedNodeIds.has(n.id))
      console.log(`✂️  Filtro de aislados: ${beforeCount} → ${filteredNodes.length} nodes`)
    }

    // Crear nodos para Vis.js
    const visNodes: NetworkNode[] = filteredNodes.map((node) => {
      const nodeType = typeMap[node.type] || 'organization'
      const mentionCount = node.data?.mentionCount || 0

      // Tamaño basado en menciones (entre 16 y 40)
      const size = Math.min(40, Math.max(16, 16 + mentionCount * 2))

      return {
        id: node.id,
        label: node.label,
        group: nodeType,
        title: `${node.label} (${node.type})`, // Tooltip
        value: size,
      }
    })

    // Crear edges para Vis.js (solo los que conectan nodos filtrados)
    const filteredNodeIds = new Set(visNodes.map((n) => n.id))
    const visEdges: NetworkEdge[] = filteredEdges
      .filter((edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target))
      .map((edge, index) => {
        // Grosor basado en strength (entre 1 y 5)
        const width = Math.max(1, Math.min(5, (edge.strength || 50) / 20))

        // Etiqueta del tipo de relación
        const relationLabel = edge.type.replace(/_/g, ' ')

        return {
          id: edge.id || `edge-${index}`,
          from: edge.source,
          to: edge.target,
          label: relationLabel,
          value: width,
          title: `${relationLabel} (${Math.round(edge.strength || 0)}% strength)`,
          strength: edge.strength,
          type: edge.type,
        }
      })

    return { nodes: visNodes, edges: visEdges }
  }, [graphData, filters])

  // Encontrar nodo por búsqueda
  const searchedNode = useMemo(() => {
    if (!filters?.searchQuery || filters.searchQuery.length === 0) {
      return null
    }

    const query = filters.searchQuery.toLowerCase().trim()

    // IMPORTANTE: Buscar primero en TODOS los nodos (sin filtrar)
    // para asegurarnos de que el nodo existe en la base de datos
    const allNodesFromDB = graphData?.nodes || []
    const existsInDB = allNodesFromDB.find((n) =>
      n.label.toLowerCase().includes(query)
    )

    // Buscar nodo en los nodos VISIBLES (después de filtros)
    const found = nodes.find((n) =>
      n.label.toLowerCase().includes(query)
    )

    console.log('🔍 Búsqueda detallada:', {
      query: filters.searchQuery,
      totalNodesInDB: allNodesFromDB.length,
      visibleNodesAfterFilters: nodes.length,
      existsInDB: existsInDB ? `SÍ: "${existsInDB.label}"` : 'NO',
      foundInVisible: found ? `SÍ: "${found.label}" (${found.id})` : 'NO - OCULTO POR FILTROS',
      sampleVisibleNodes: nodes.slice(0, 5).map(n => n.label).join(', ')
    })

    if (existsInDB && !found) {
      console.warn(`⚠️ El nodo "${existsInDB.label}" existe en la BD pero está OCULTO por filtros activos`)
    }

    return found || null
  }, [filters?.searchQuery, nodes, graphData])

  // Log de búsqueda
  useEffect(() => {
    if (filters?.searchQuery && filters.searchQuery.length > 0) {
      if (searchedNode) {
        console.log(`✅ Centrando en: "${searchedNode.label}" (${searchedNode.id})`)
      } else {
        console.log(`❌ No encontrado: "${filters.searchQuery}"`)
        console.log(`💡 Nodos disponibles:`, nodes.map(n => n.label).slice(0, 10))
      }
    }
  }, [filters?.searchQuery, searchedNode, nodes])

  // Obtener detalles del nodo seleccionado
  const selectedNode = selectedNodeId
    ? graphData?.nodes.find((n) => n.id === selectedNodeId)
    : null

  // Transformar a formato esperado por NodeDetailsPanel
  const nodeDetails = selectedNode
    ? {
        id: selectedNode.id,
        name: selectedNode.label,
        type: (() => {
          const typeMap: Record<string, 'person' | 'organization' | 'media' | 'event' | 'poi'> = {
            actor: 'person',
            source: 'media',
            entity: 'organization',
            event: 'event',
          }
          return typeMap[selectedNode.type] || 'organization'
        })(),
        metadata: {
          description: (selectedNode.data as any)?.description || '',
          position: (selectedNode.data as any)?.position || undefined,
          affiliation: (selectedNode.data as any)?.affiliation || undefined,
        },
        connections: graphData?.edges
          .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
          .map((e) => ({
            targetId: e.source === selectedNode.id ? e.target : e.source,
            targetName:
              graphData?.nodes.find((n) =>
                n.id === (e.source === selectedNode.id ? e.target : e.source)
              )?.label || 'Unknown',
            relationType: e.type,
            strength: e.strength || 0,
            context: e.context || '',
          })) || [],
        evidence: [], // TODO: Implementar evidencia
        mentionCount: selectedNode.data?.mentionCount || 0,
        firstMentioned: new Date().toISOString(), // TODO: Obtener fecha real
        lastMentioned: new Date().toISOString(), // TODO: Obtener fecha real
      }
    : null

  // Loading state
  if (!graphData) {
    return (
      <div
        className="flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Grafos</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (graphData.nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700"
        style={{ height }}
      >
        <div className="text-center max-w-md">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay entidades en el sistema
          </h3>
          <p className="text-sm text-gray-400">
            Usa el botón "Analizar con IA" para extraer entidades de los artículos,
            o el botón "Generar Co-menciones" para crear relaciones automáticamente.
          </p>
        </div>
      </div>
    )
  }

  // Renderizar grafo
  return (
    <div className="flex" style={{ height }}>
      <div className="flex-1">
        <NetworkGraph
          nodes={nodes}
          edges={edges}
          onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
          height={height}
          focusNode={searchedNode?.id as string | undefined}
          zoomLevel={filters?.zoomLevel}
        />
      </div>
      {selectedNodeId && (
        <NodeDetailsPanel
          node={nodeDetails}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  )
}
