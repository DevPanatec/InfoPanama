'use client'

import { Calendar, MapPin, Users, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_EVENTOS = [
  {
    id: '1',
    title: 'Discurso presidencial sobre economía',
    date: '2024-01-20',
    location: 'Palacio de las Garzas',
    type: 'speech',
    relatedClaims: 3,
    status: 'monitored',
  },
  {
    id: '2',
    title: 'Sesión de la Asamblea Nacional',
    date: '2024-01-18',
    location: 'Asamblea Nacional',
    type: 'legislative',
    relatedClaims: 5,
    status: 'monitored',
  },
  {
    id: '3',
    title: 'Anuncio de nuevo proyecto de infraestructura',
    date: '2024-01-15',
    location: 'Ministerio de Obras Públicas',
    type: 'announcement',
    relatedClaims: 2,
    status: 'completed',
  },
]

export default function EventosPage() {
  const router = useRouter()
  const [eventos, setEventos] = useState(DEMO_EVENTOS)

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      speech: { color: 'bg-blue-500/10 text-blue-500', label: 'Discurso' },
      legislative: { color: 'bg-purple-500/10 text-purple-500', label: 'Legislativo' },
      announcement: { color: 'bg-green-500/10 text-green-500', label: 'Anuncio' },
      press: { color: 'bg-orange-500/10 text-orange-500', label: 'Rueda de Prensa' },
    }

    const config = configs[type]

    return (
      <span className={`inline-flex text-xs ${config.color} px-2 py-1 rounded`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      scheduled: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Programado' },
      monitored: { color: 'bg-blue-500/10 text-blue-500', label: 'Monitoreando' },
      completed: { color: 'bg-green-500/10 text-green-500', label: 'Completado' },
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos Gubernamentales</h1>
          <p className="text-muted-foreground">
            Monitoreo de eventos oficiales y declaraciones
          </p>
        </div>
        <button
          onClick={() => alert('Funcionalidad de crear evento próximamente')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="text-3xl font-bold">{DEMO_EVENTOS.length}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Eventos</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="text-3xl font-bold">
              {DEMO_EVENTOS.filter((e) => e.status === 'monitored').length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">En Monitoreo</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-green-500" />
            <div className="text-3xl font-bold">
              {DEMO_EVENTOS.reduce((sum, e) => sum + e.relatedClaims, 0)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Verificaciones Relacionadas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todos los tipos</option>
          <option value="speech">Discurso</option>
          <option value="legislative">Legislativo</option>
          <option value="announcement">Anuncio</option>
          <option value="press">Rueda de Prensa</option>
        </select>

        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todos los estados</option>
          <option value="scheduled">Programado</option>
          <option value="monitored">Monitoreando</option>
          <option value="completed">Completado</option>
        </select>

        <input
          type="search"
          placeholder="Buscar eventos..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
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
            {eventos.map((evento) => (
              <tr key={evento.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-6 py-4">
                  <p className="font-medium">{evento.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {evento.location}
                  </div>
                </td>
                <td className="px-6 py-4">{getTypeBadge(evento.type)}</td>
                <td className="px-6 py-4 text-sm">{evento.date}</td>
                <td className="px-6 py-4">{getStatusBadge(evento.status)}</td>
                <td className="px-6 py-4 text-sm">{evento.relatedClaims}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => alert(`Ver detalles del evento: ${evento.title}`)}
                    className="text-sm text-primary hover:underline mr-3"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => alert(`Editar evento: ${evento.title}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
