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

  // Obtener TODOS los nodos del grafo OSINT
  const graphData = useQuery(api.entityRelations.getFullGraph)

  // Transformar datos de Convex a formato ReactFlow
  useEffect(() => {
    if (!graphData) return

    // Crear nodos estilo Obsidian
    const flowNodes: Node[] = graphData.nodes.map((node, index) => {
      const Icon = NODE_ICONS[node.type as keyof typeof NODE_ICONS]
      const color = NODE_COLORS[node.type as keyof typeof NODE_COLORS]

      // El label ya viene en node.label desde getFullGraph
      const label = node.label || 'Unknown'

      return {
        id: node.id,
        type: 'default',
        data: {
          label: (
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className="rounded-full p-3 shadow-lg"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`
                }}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-white px-3 py-1 bg-slate-800/90 rounded-full">
                {label}
              </span>
            </div>
          ),
          nodeData: node,
        },
        position: {
          x: Math.cos((index * 2 * Math.PI) / graphData.nodes.length) * 350 + 400,
          y: Math.sin((index * 2 * Math.PI) / graphData.nodes.length) * 350 + 300,
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: '0',
          width: 'auto',
        },
      }
    })

    // Crear edges estilo Obsidian
    const flowEdges: Edge[] = graphData.edges.map((edge) => {
      // Color según el tipo de relación
      let color = '#64748b' // slate-500 por defecto
      if (edge.type === 'owns') color = '#ef4444' // red-500
      if (edge.type === 'supports') color = '#10b981' // green-500
      if (edge.type === 'opposes') color = '#f59e0b' // amber-500

      const strokeWidth = Math.max(2, (edge.strength || 50) / 30)

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep', // Curvas suaves estilo Obsidian
        animated: (edge.strength || 50) > 70,
        style: {
          stroke: color,
          strokeWidth: strokeWidth,
          strokeOpacity: 0.6,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color,
          width: 20,
          height: 20,
        },
        data: edge,
      }
    })

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [graphData, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
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
        className="flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700"
        style={{ height }}
      >
        <div className="text-center max-w-md">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay entidades en el sistema
          </h3>
          <p className="text-sm text-slate-300">
            Agrega actores, fuentes y entidades para comenzar a construir el grafo OSINT.
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
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#334155"
          gap={20}
          size={1}
          className="opacity-30"
        />

        {/* Panel de info del nodo seleccionado - Estilo OSINT */}
        {selectedNode && selectedNode.data.nodeData && (
          <Panel position="top-right" className="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl p-6 border-2 border-blue-500/30 max-w-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-white mb-1">
                    {selectedNode.data.nodeData.label}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-md">
                    <span className="text-xs font-medium text-blue-300">
                      {selectedNode.data.nodeData.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Descripción */}
              {selectedNode.data.nodeData.data.description && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">DESCRIPCIÓN</div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {selectedNode.data.nodeData.data.description}
                  </p>
                </div>
              )}

              {/* Menciones */}
              {selectedNode.data.nodeData.data.mentionCount > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">MENCIONES</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedNode.data.nodeData.data.mentionCount}
                  </div>
                </div>
              )}

              {/* ID para debugging */}
              <div className="pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-500 font-mono">
                  ID: {selectedNode.id}
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Stats - solo si hay datos */}
        {graphData && graphData.nodes.length > 0 && (
          <Panel position="bottom-left" className="bg-slate-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400">Nodos:</span>{' '}
                <span className="text-white font-semibold">{graphData.nodes.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Conexiones:</span>{' '}
                <span className="text-white font-semibold">{graphData.edges.length}</span>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
