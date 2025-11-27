'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { User, Building2, FileText, Calendar, Loader2 } from 'lucide-react'

// Colores por tipo de nodo
const NODE_COLORS = {
  actor: '#3b82f6', // blue-500
  source: '#10b981', // green-500
  entity: '#f59e0b', // amber-500
  event: '#8b5cf6', // purple-500
}

// Iconos por tipo
const NODE_ICONS = {
  actor: User,
  source: Building2,
  entity: FileText,
  event: Calendar,
}

interface MediaGraphProps {
  minStrength?: number
  relationTypes?: string[]
  height?: string
}

export function MediaGraph({
  minStrength = 20,
  relationTypes,
  height = '600px',
}: MediaGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Obtener datos del grafo
  const graphData = useQuery(api.entityRelations.getGraphData, {
    limit: 200,
    minStrength,
    relationTypes,
  })

  const stats = useQuery(api.entityRelations.getGraphStats)

  // Transformar datos de Convex a formato ReactFlow
  useEffect(() => {
    if (!graphData) return

    // Crear nodos
    const flowNodes: Node[] = graphData.nodes.map((node, index) => {
      const Icon = NODE_ICONS[node.type as keyof typeof NODE_ICONS]
      const color = NODE_COLORS[node.type as keyof typeof NODE_COLORS]

      // Obtener nombre según el tipo
      let label = 'Unknown'
      if (node.data) {
        label = node.data.name || node.data.title || node.data.normalizedName || 'Unknown'
      }

      return {
        id: node.id,
        type: 'default',
        data: {
          label: (
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color }} />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ),
          nodeData: node,
        },
        position: {
          x: Math.cos((index * 2 * Math.PI) / graphData.nodes.length) * 300 + 400,
          y: Math.sin((index * 2 * Math.PI) / graphData.nodes.length) * 300 + 300,
        },
        style: {
          background: 'white',
          border: `2px solid ${color}`,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '150px',
        },
      }
    })

    // Crear edges
    const flowEdges: Edge[] = graphData.edges.map((edge) => {
      // Color según el tipo de relación
      let color = '#94a3b8' // slate-400 por defecto
      if (edge.relationType === 'owns') color = '#ef4444' // red-500
      if (edge.relationType === 'supports') color = '#10b981' // green-500
      if (edge.relationType === 'opposes') color = '#f59e0b' // amber-500

      return {
        id: edge._id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'default',
        animated: edge.strength > 70,
        label: edge.relationType.replace(/_/g, ' '),
        labelStyle: { fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: 'white' },
        style: {
          stroke: color,
          strokeWidth: Math.max(1, edge.strength / 25),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color,
        },
        data: edge,
      }
    })

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [graphData, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  if (!graphData) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Cargando grafo...</p>
        </div>
      </div>
    )
  }

  if (graphData.nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200"
        style={{ height }}
      >
        <div className="text-center max-w-md">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay datos disponibles
          </h3>
          <p className="text-sm text-slate-600">
            Aún no existen relaciones en el grafo. Comienza agregando actores, fuentes y
            sus conexiones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        className="bg-slate-50 rounded-lg border border-slate-200"
      >
        <Background />
        <Controls className="bg-white rounded-lg shadow-lg border border-slate-200" />
        <MiniMap
          className="bg-white rounded-lg shadow-lg border border-slate-200"
          nodeColor={(node) => {
            const nodeData = node.data?.nodeData
            if (!nodeData) return '#94a3b8'
            return NODE_COLORS[nodeData.type as keyof typeof NODE_COLORS] || '#94a3b8'
          }}
        />

        {/* Panel de estadísticas */}
        {stats && (
          <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 border border-slate-200">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Estadísticas del Grafo
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600">Nodos:</span>
                <span className="text-xs font-bold text-slate-900">{stats.totalNodes}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600">Relaciones:</span>
                <span className="text-xs font-bold text-slate-900">{stats.totalEdges}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600">Fuerza Prom.:</span>
                <span className="text-xs font-bold text-slate-900">
                  {stats.avgStrength.toFixed(0)}%
                </span>
              </div>
            </div>
          </Panel>
        )}

        {/* Panel de info del nodo seleccionado */}
        {selectedNode && (
          <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 border border-slate-200 max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  {selectedNode.data.nodeData?.data?.name || 'Nodo'}
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-slate-600">
                Tipo: <span className="font-medium">{selectedNode.data.nodeData?.type}</span>
              </div>
              {selectedNode.data.nodeData?.data?.description && (
                <p className="text-xs text-slate-600 line-clamp-3">
                  {selectedNode.data.nodeData.data.description}
                </p>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
