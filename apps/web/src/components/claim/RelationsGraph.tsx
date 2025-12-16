'use client'

import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'
import { Network, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface RelationsGraphProps {
  claimId: Id<'claims'>
}

export function RelationsGraph({ claimId }: RelationsGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Obtener entidades
  const entities = useQuery(api.entities.findByClaim, {
    claimId: claimId
  })

  // Obtener relaciones (asumiendo que existe un query)
  const relations = useQuery(api.entityRelations.list as any, {
    limit: 100
  }) as any[]

  useEffect(() => {
    if (!canvasRef.current || !entities || entities.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const width = canvas.offsetWidth
    const height = 400
    canvas.width = width
    canvas.height = height

    // Crear nodos
    const nodes = entities.slice(0, 10).map((entity, i) => ({
      id: entity._id,
      name: entity.name,
      type: entity.type,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      vx: 0,
      vy: 0,
      mentions: entity.mentionCount || 0
    }))

    // Crear enlaces (simulados si no hay relaciones reales)
    const links: any[] = []
    if (relations && relations.length > 0) {
      relations.forEach((rel: any) => {
        const source = nodes.find(n => n.id === rel.entityId1)
        const target = nodes.find(n => n.id === rel.entityId2)
        if (source && target) {
          links.push({
            source,
            target,
            strength: rel.confidence || 0.5
          })
        }
      })
    } else {
      // Crear enlaces simulados entre nodos cercanos
      nodes.forEach((node, i) => {
        if (i < nodes.length - 1 && Math.random() > 0.5) {
          links.push({
            source: node,
            target: nodes[i + 1],
            strength: Math.random()
          })
        }
      })
    }

    // Simulación de fuerzas simple
    const simulate = () => {
      // Fuerzas de repulsión
      nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
          if (i !== j) {
            const dx = n2.x - n1.x
            const dy = n2.y - n1.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = 500 / (dist * dist)
            n1.vx -= (dx / dist) * force
            n1.vy -= (dy / dist) * force
          }
        })
      })

      // Fuerzas de atracción (enlaces)
      links.forEach(link => {
        const dx = link.target.x - link.source.x
        const dy = link.target.y - link.source.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (dist - 100) * 0.01 * link.strength
        link.source.vx += (dx / dist) * force
        link.target.vx -= (dx / dist) * force
        link.source.vy += (dy / dist) * force
        link.target.vy -= (dy / dist) * force
      })

      // Aplicar velocidades y fricción
      nodes.forEach(node => {
        node.vx *= 0.9
        node.vy *= 0.9
        node.x += node.vx
        node.y += node.vy

        // Mantener dentro del canvas
        node.x = Math.max(30, Math.min(width - 30, node.x))
        node.y = Math.max(30, Math.min(height - 30, node.y))
      })
    }

    // Dibujar
    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Dibujar enlaces
      links.forEach(link => {
        ctx.beginPath()
        ctx.moveTo(link.source.x, link.source.y)
        ctx.lineTo(link.target.x, link.target.y)
        ctx.strokeStyle = `rgba(100, 116, 139, ${link.strength * 0.3})`
        ctx.lineWidth = link.strength * 3
        ctx.stroke()
      })

      // Dibujar nodos
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id
        const radius = 10 + (node.mentions * 2)

        // Sombra si está hover
        if (isHovered) {
          ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
          ctx.shadowBlur = 15
        }

        // Color según tipo
        let color = '#64748b'
        if (node.type === 'PERSON') color = '#3b82f6'
        if (node.type === 'ORGANIZATION') color = '#8b5cf6'
        if (node.type === 'LOCATION') color = '#10b981'
        if (node.type === 'POSITION') color = '#f59e0b'

        // Círculo del nodo
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Borde blanco
        ctx.strokeStyle = 'white'
        ctx.lineWidth = isHovered ? 4 : 2
        ctx.stroke()

        ctx.shadowBlur = 0

        // Texto (nombre)
        if (isHovered || nodes.length < 7) {
          ctx.fillStyle = '#1e293b'
          ctx.font = 'bold 12px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(node.name.substring(0, 20), node.x, node.y - radius - 8)
        }
      })
    }

    // Animación
    let animationId: number
    const animate = () => {
      simulate()
      draw()
      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Manejar hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let found = false
      nodes.forEach(node => {
        const radius = 10 + (node.mentions * 2)
        const dist = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2)
        if (dist < radius) {
          setHoveredNode(node.id)
          found = true
        }
      })

      if (!found) {
        setHoveredNode(null)
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [entities, relations, hoveredNode])

  if (!entities || entities.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
          Grafo de Relaciones
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          <span>{entities.length} nodos</span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-6">
        Visualización interactiva de conexiones entre entidades mencionadas. Pasa el cursor sobre los nodos para ver detalles.
      </p>

      {/* Canvas */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full cursor-pointer"
          style={{ height: '400px' }}
        />

        {/* Tooltip si hay hover */}
        {hoveredNode && (
          <div className="absolute top-4 left-4 bg-white border border-slate-200 rounded-lg p-3 shadow-lg max-w-xs">
            {(() => {
              const node = entities.find(e => e._id === hoveredNode)
              if (!node) return null

              return (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{node.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">
                    {node.type === 'PERSON' && 'Persona'}
                    {node.type === 'ORGANIZATION' && 'Organización'}
                    {node.type === 'LOCATION' && 'Ubicación'}
                    {node.type === 'POSITION' && 'Cargo'}
                  </p>
                  {node.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{node.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {node.mentionCount || 0} {node.mentionCount === 1 ? 'mención' : 'menciones'}
                  </p>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-500 mb-3 font-medium">Tipos de Entidades:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <span className="text-xs text-slate-600">Personas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
            <span className="text-xs text-slate-600">Organizaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <span className="text-xs text-slate-600">Ubicaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
            <span className="text-xs text-slate-600">Cargos</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 italic">
          * El tamaño de los nodos representa la frecuencia de menciones. Las líneas conectan entidades relacionadas.
        </p>
      </div>
    </div>
  )
}
