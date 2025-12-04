'use client'

import { useEffect, useRef } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import type { Options } from 'vis-network'

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
}

interface NetworkGraphProps {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  onNodeClick?: (nodeId: string) => void
  height?: string
  focusNode?: string
  zoomLevel?: number
}

export function NetworkGraph({
  nodes,
  edges,
  onNodeClick,
  height = '600px',
  focusNode,
  zoomLevel = 100
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Configuración de colores por tipo de nodo
    const nodeColors = {
      person: '#3B82F6',      // Azul - Personas/Políticos
      organization: '#8B5CF6', // Morado - Organizaciones
      media: '#EF4444',        // Rojo - Medios
      event: '#10B981',        // Verde - Eventos
      poi: '#F59E0B',          // Naranja - Person of Interest
    }

    // Preparar nodos con colores
    const nodesWithColors = nodes.map(node => ({
      ...node,
      color: {
        background: nodeColors[node.group || 'person'],
        border: nodeColors[node.group || 'person'],
        highlight: {
          background: nodeColors[node.group || 'person'],
          border: '#1F2937',
        },
        hover: {
          background: nodeColors[node.group || 'person'],
          border: '#1F2937',
        }
      },
      font: {
        color: '#FFFFFF',
        size: 14,
      },
      borderWidth: 2,
      borderWidthSelected: 4,
    }))

    // DataSets para nodos y edges
    const nodesDataSet = new DataSet(nodesWithColors)
    const edgesDataSet = new DataSet(edges)

    const data = {
      nodes: nodesDataSet,
      edges: edgesDataSet,
    }

    // Opciones de configuración del grafo
    const options: Options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          size: 14,
          color: '#FFFFFF',
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 2,
        color: {
          color: '#6B7280',
          highlight: '#1F2937',
          hover: '#1F2937',
        },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5,
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5,
          },
        },
        font: {
          size: 12,
          color: '#6B7280',
          strokeWidth: 0,
        },
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -8000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1,
        },
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        navigationButtons: true,
        keyboard: true,
        zoomView: true,
        dragView: true,
      },
      layout: {
        improvedLayout: true,
        randomSeed: 42,
      },
    }

    // Crear la red
    const network = new Network(containerRef.current, data, options)
    networkRef.current = network

    // Evento de click en nodo
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0]
        if (onNodeClick) {
          onNodeClick(nodeId as string)
        }
      }
    })

    // Evento de doble click para centrar
    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        network.focus(params.nodes[0], {
          scale: 1.5,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad',
          },
        })
      }
    })

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy()
        networkRef.current = null
      }
    }
  }, [nodes, edges, onNodeClick])

  // Efecto para centrar en nodo buscado
  useEffect(() => {
    if (focusNode && networkRef.current) {
      console.log('🎯 NetworkGraph: Intentando centrar en nodo:', focusNode)

      try {
        // Verificar que el nodo existe
        const nodeExists = nodes.find(n => n.id === focusNode)
        console.log('🔎 Nodo existe en dataset:', nodeExists ? 'SÍ' : 'NO', nodeExists)

        if (!nodeExists) {
          console.error('❌ El nodo no existe en el dataset de vis-network')
          return
        }

        // IMPORTANTE: Desactivar física temporalmente para que el zoom se mantenga
        networkRef.current.setOptions({ physics: { enabled: false } })
        console.log('⏸️  Física desactivada temporalmente')

        // Deseleccionar todo
        networkRef.current.unselectAll()

        // Centrar y hacer zoom GRANDE en el nodo
        networkRef.current.focus(focusNode, {
          scale: 5.0,  // Zoom MUY grande para enfoque total en el nodo
          offset: { x: 0, y: 0 },
          locked: false,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad',
          },
        })

        console.log('✅ Focus aplicado correctamente')

        // Seleccionar el nodo visualmente después de la animación
        setTimeout(() => {
          if (networkRef.current) {
            networkRef.current.selectNodes([focusNode])
            console.log('✅ Nodo seleccionado visualmente')

            // Reactivar física después de 2 segundos
            setTimeout(() => {
              if (networkRef.current) {
                networkRef.current.setOptions({ physics: { enabled: true } })
                console.log('▶️  Física reactivada')
              }
            }, 2000)
          }
        }, 1100)
      } catch (error) {
        console.error('❌ Error al centrar en nodo:', error)
        console.log('Nodo ID:', focusNode)
        console.log('Nodos disponibles:', nodes.slice(0, 5))
      }
    } else if (!focusNode && networkRef.current) {
      // Si no hay búsqueda activa, deseleccionar todo y asegurar que física esté activa
      networkRef.current.unselectAll()
      networkRef.current.setOptions({ physics: { enabled: true } })
    }
  }, [focusNode, nodes])

  // Efecto para zoom manual (NO se ejecuta durante búsqueda)
  useEffect(() => {
    // Si hay un nodo en focus (búsqueda activa), NO aplicar zoom manual
    // porque el efecto de focusNode ya maneja el zoom
    if (focusNode) {
      console.log('🔍 Búsqueda activa - ignorando zoom manual')
      return
    }

    if (networkRef.current && zoomLevel) {
      const scale = zoomLevel / 100
      console.log('🔎 Aplicando zoom manual:', scale)
      networkRef.current.moveTo({
        scale,
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      })
    }
  }, [zoomLevel, focusNode])

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        style={{ height }}
        className="border border-gray-700 rounded-lg bg-gray-900"
      />

      {/* Leyenda de colores */}
      <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2 text-white">Tipos de Nodos</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
            <span className="text-gray-300">Persona/Político</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
            <span className="text-gray-300">Organización</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="text-gray-300">Medio de Comunicación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-gray-300">Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="text-gray-300">Person of Interest</span>
          </div>
        </div>
      </div>

      {/* Controles de ayuda */}
      <div className="absolute top-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-300">
        <div className="space-y-1">
          <div><strong>Click:</strong> Seleccionar nodo</div>
          <div><strong>Doble click:</strong> Centrar y zoom</div>
          <div><strong>Scroll:</strong> Zoom in/out</div>
          <div><strong>Arrastrar:</strong> Mover vista</div>
        </div>
      </div>
    </div>
  )
}
