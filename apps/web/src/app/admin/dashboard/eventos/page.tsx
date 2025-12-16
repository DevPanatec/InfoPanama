'use client'

import { Calendar, MapPin, Users, Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@infopanama/convex'
import { toast } from 'sonner'
import { NewEventModal } from '@/components/admin/NewEventModal'

export default function EventosPage() {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Queries a Convex
  const allEvents = useQuery(api.events.list, { limit: 100 })
  const stats = useQuery(api.events.stats)

  // Mutation para crear evento
  const createEvent = useMutation(api.events.create)

  const handleNewEvent = async (eventData: {
    title: string
    description: string
    eventDate: number
    eventType: string
    sourceUrl?: string
    alertDays?: number[]
  }) => {
    const toastId = toast.loading('Creando evento...')

    try {
      const eventId = await createEvent({
        title: eventData.title,
        description: eventData.description,
        eventDate: eventData.eventDate,
        eventType: eventData.eventType as any,
        sourceUrl: eventData.sourceUrl,
        alertDays: eventData.alertDays,
      })

      toast.success('Evento creado correctamente', {
        id: toastId,
        description: 'El evento ha sido agregado al calendario',
      })

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al crear evento:', error)
      toast.error('Error al crear evento', {
        id: toastId,
        description: 'Por favor, verifica los datos e intenta nuevamente.',
      })
    }
  }

  // Loading state
  if (!allEvents || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const now = Date.now()

  // Filtrado local
  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || event.eventType === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      legislative: { color: 'bg-slate-500/10 text-slate-500', label: 'Legislativo' },
      executive: { color: 'bg-blue-500/10 text-blue-500', label: 'Ejecutivo' },
      judicial: { color: 'bg-purple-500/10 text-purple-500', label: 'Judicial' },
      election: { color: 'bg-green-500/10 text-green-500', label: 'Elección' },
      public_hearing: { color: 'bg-orange-500/10 text-orange-500', label: 'Audiencia Pública' },
      other: { color: 'bg-gray-500/10 text-gray-500', label: 'Otro' },
    }

    const config = configs[type] || { color: 'bg-gray-500/10 text-gray-500', label: type }

    return (
      <span className={`inline-flex text-xs ${config.color} px-2 py-1 rounded`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (eventDate: number) => {
    if (eventDate >= now) {
      return (
        <span className="inline-flex text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
          Próximo
        </span>
      )
    } else {
      return (
        <span className="inline-flex text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
          Pasado
        </span>
      )
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos Gubernamentales</h1>
          <p className="text-muted-foreground">
            Monitoreo de eventos oficiales y declaraciones
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Modal para crear evento */}
      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewEvent}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Eventos</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-amber-500" />
            <div className="text-3xl font-bold">
              {stats.upcoming}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Eventos Próximos</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-green-500" />
            <div className="text-3xl font-bold">
              {allEvents.reduce((sum, e) => sum + e.relatedClaims.length, 0)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Verificaciones Relacionadas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background"
        >
          <option value="">Todos los tipos</option>
          <option value="legislative">Legislativo</option>
          <option value="executive">Ejecutivo</option>
          <option value="judicial">Judicial</option>
          <option value="election">Elección</option>
          <option value="public_hearing">Audiencia Pública</option>
          <option value="other">Otro</option>
        </select>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar eventos..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="p-6 bg-blue-50 rounded-full mb-6">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || typeFilter ? 'No se encontraron eventos' : 'No hay eventos registrados'}
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              {searchQuery || typeFilter
                ? 'Intenta ajustar los filtros de búsqueda para ver más resultados'
                : 'Crea tu primer evento gubernamental para comenzar el seguimiento'}
            </p>
            {!searchQuery && !typeFilter && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Crear Primer Evento
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium">Evento</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Fecha</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Estado</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Verificaciones</th>
                <th className="text-right px-6 py-3 text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evento) => (
                <tr key={evento._id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <p className="font-medium">{evento.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {evento.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(evento.eventType)}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(evento.eventDate)}</td>
                  <td className="px-6 py-4">{getStatusBadge(evento.eventDate)}</td>
                  <td className="px-6 py-4 text-sm">{evento.relatedClaims.length}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/admin/dashboard/eventos/${evento._id}`)}
                      className="text-sm text-primary hover:underline mr-3"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => router.push(`/admin/dashboard/eventos/${evento._id}/editar`)}
                      className="text-sm text-primary hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
