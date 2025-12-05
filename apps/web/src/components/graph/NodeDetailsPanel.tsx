'use client'

import { X, User, Building2, Newspaper, Calendar, Star, ExternalLink } from 'lucide-react'

interface Evidence {
  type: 'source' | 'document' | 'mention'
  title: string
  url?: string
  date: string
  reliability: number
}

interface Connection {
  targetId: string
  targetName: string
  relationType: string
  strength: number
  context: string
}

interface NodeDetails {
  id: string
  name: string
  type: 'person' | 'organization' | 'media' | 'event' | 'poi'
  metadata: {
    position?: string
    affiliation?: string
    description?: string
  }
  connections: Connection[]
  evidence: Evidence[]
  mentionCount: number
  firstMentioned: string
  lastMentioned: string
}

interface NodeDetailsPanelProps {
  node: NodeDetails | null
  onClose: () => void
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  if (!node) return null

  const getNodeIcon = () => {
    switch (node.type) {
      case 'person':
      case 'poi':
        return <User className="w-5 h-5" />
      case 'organization':
        return <Building2 className="w-5 h-5" />
      case 'media':
        return <Newspaper className="w-5 h-5" />
      case 'event':
        return <Calendar className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getNodeTypeLabel = () => {
    const labels = {
      person: 'Persona',
      organization: 'Organización',
      media: 'Medio de Comunicación',
      event: 'Evento',
      poi: 'Person of Interest',
    }
    return labels[node.type]
  }

  const getNodeColor = () => {
    const colors = {
      person: 'bg-blue-500',
      organization: 'bg-purple-500',
      media: 'bg-red-500',
      event: 'bg-green-500',
      poi: 'bg-orange-500',
    }
    return colors[node.type]
  }

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`${getNodeColor()} p-2 rounded-lg text-white`}>
            {getNodeIcon()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{node.name}</h2>
            <p className="text-sm text-gray-400">{getNodeTypeLabel()}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* POI Badge */}
        {node.type === 'poi' && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-500 font-medium">
              Person of Interest - Alta Relevancia
            </span>
          </div>
        )}

        {/* Metadata */}
        {node.metadata.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Descripción
            </h3>
            <p className="text-sm text-gray-400">{node.metadata.description}</p>
          </div>
        )}

        {node.metadata.position && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Cargo</h3>
            <p className="text-sm text-gray-400">{node.metadata.position}</p>
          </div>
        )}

        {node.metadata.affiliation && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Afiliación
            </h3>
            <p className="text-sm text-gray-400">{node.metadata.affiliation}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{node.mentionCount}</div>
            <div className="text-xs text-gray-400">Menciones</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{node.connections.length}</div>
            <div className="text-xs text-gray-400">Conexiones</div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Timeline</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div>
              <span className="font-medium">Primera mención:</span>{' '}
              {new Date(node.firstMentioned).toLocaleDateString('es-PA')}
            </div>
            <div>
              <span className="font-medium">Última mención:</span>{' '}
              {new Date(node.lastMentioned).toLocaleDateString('es-PA')}
            </div>
          </div>
        </div>

        {/* Connections */}
        {node.connections.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Conexiones ({node.connections.length})
            </h3>
            <div className="space-y-2">
              {node.connections.slice(0, 5).map((conn, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {conn.targetName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(conn.strength)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {conn.relationType.replace(/_/g, ' ')}
                  </div>
                  {conn.context && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {conn.context}
                    </div>
                  )}
                </div>
              ))}
              {node.connections.length > 5 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  +{node.connections.length - 5} conexiones más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evidence */}
        {node.evidence.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Evidencia ({node.evidence.length})
            </h3>
            <div className="space-y-2">
              {node.evidence.slice(0, 5).map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 rounded-lg p-3 hover:bg-gray-850 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm text-white line-clamp-2 flex-1">
                      {ev.title}
                    </span>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(ev.date).toLocaleDateString('es-PA')}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confianza: {Math.round(ev.reliability)}%
                    </span>
                  </div>
                </div>
              ))}
              {node.evidence.length > 5 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  +{node.evidence.length - 5} fuentes más
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
