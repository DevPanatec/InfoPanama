'use client'

import { MessageSquare, ThumbsUp, Flag } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_COMENTARIOS = [
  {
    id: '1',
    author: 'Usuario123',
    content: 'Excelente verificación, muy bien explicado',
    claimId: 'CLM-001',
    claimTitle: 'Gobierno anuncia nueva inversión',
    createdAt: '2024-01-15 10:30',
    status: 'approved',
    likes: 5,
    reports: 0,
  },
  {
    id: '2',
    author: 'Anónimo456',
    content: 'Esto es falso, no deberían publicar esto',
    claimId: 'CLM-002',
    claimTitle: 'Cifras de desempleo bajan',
    createdAt: '2024-01-15 09:15',
    status: 'pending',
    likes: 0,
    reports: 2,
  },
  {
    id: '3',
    author: 'Troll789',
    content: 'Contenido spam inapropiado...',
    claimId: 'CLM-003',
    claimTitle: 'Nuevo hospital inaugurado',
    createdAt: '2024-01-14 18:45',
    status: 'rejected',
    likes: 0,
    reports: 5,
  },
]

export default function ComentariosPage() {
  const router = useRouter()
  const [comentarios, setComentarios] = useState(DEMO_COMENTARIOS)

  const handleApprove = (id: string) => {
    setComentarios(comentarios.map(c =>
      c.id === id ? { ...c, status: 'approved' } : c
    ))
    alert('Comentario aprobado')
  }

  const handleReject = (id: string) => {
    setComentarios(comentarios.map(c =>
      c.id === id ? { ...c, status: 'rejected' } : c
    ))
    alert('Comentario rechazado')
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Pendiente' },
      approved: { color: 'bg-green-500/10 text-green-500', label: 'Aprobado' },
      rejected: { color: 'bg-red-500/10 text-red-500', label: 'Rechazado' },
    }

    const config = configs[status]

    return (
      <span className={`inline-flex text-xs ${config.color} px-2 py-1 rounded`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Moderación de Comentarios</h1>
        <p className="text-muted-foreground">
          Gestión y moderación de comentarios públicos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div className="text-3xl font-bold">{DEMO_COMENTARIOS.length}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Comentarios</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="h-8 w-8 text-yellow-500" />
            <div className="text-3xl font-bold">
              {DEMO_COMENTARIOS.filter((c) => c.status === 'pending').length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Pendientes</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="h-8 w-8 text-green-500" />
            <div className="text-3xl font-bold">
              {DEMO_COMENTARIOS.filter((c) => c.status === 'approved').length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Aprobados</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="h-8 w-8 text-red-500" />
            <div className="text-3xl font-bold">
              {DEMO_COMENTARIOS.reduce((sum, c) => sum + c.reports, 0)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Reportes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </select>

        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Ordenar por</option>
          <option value="recent">Más recientes</option>
          <option value="reports">Más reportados</option>
          <option value="likes">Más votados</option>
        </select>

        <input
          type="search"
          placeholder="Buscar comentarios..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comentarios.map((comment) => (
          <div
            key={comment.id}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold">{comment.author}</p>
                  {getStatusBadge(comment.status)}
                  {comment.reports > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                      <Flag className="h-3 w-3" />
                      {comment.reports} reportes
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{comment.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Claim: {comment.claimTitle}</span>
                  <span>•</span>
                  <span>{comment.createdAt}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {comment.likes}
                  </span>
                </div>
              </div>
            </div>

            {comment.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => handleApprove(comment.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition text-sm"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleReject(comment.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition text-sm"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => router.push(`/verificaciones/${comment.claimId}`)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:opacity-90 transition text-sm"
                >
                  Ver Claim
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
