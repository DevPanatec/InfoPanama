'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'
import { Calendar, MapPin, ExternalLink, ArrowLeft, Edit, Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    id: Id<'events'>
  }
}

export default function EventoDetailPage({ params }: PageProps) {
  const router = useRouter()
  const event = useQuery(api.events.getById, { id: params.id })

  // Loading state
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const now = Date.now()
  const isPast = event.eventDate < now
  const daysUntil = Math.ceil((event.eventDate - now) / (24 * 60 * 60 * 1000))

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
      <span className={`inline-flex text-sm ${config.color} px-3 py-1.5 rounded-lg font-semibold`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header con botón de regreso */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/dashboard/eventos')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Eventos
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getTypeBadge(event.eventType)}
              {isPast ? (
                <span className="inline-flex text-sm bg-gray-500/10 text-gray-500 px-3 py-1.5 rounded-lg font-semibold">
                  Evento Pasado
                </span>
              ) : (
                <span className="inline-flex text-sm bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg font-semibold">
                  Próximo ({daysUntil} {daysUntil === 1 ? 'día' : 'días'})
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{formatDate(event.eventDate)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/dashboard/eventos/${params.id}/editar`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Descripción</h2>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {/* Fuente */}
      {event.sourceUrl && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Fuente</h2>
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm font-medium">{event.sourceUrl}</span>
          </a>
        </div>
      )}

      {/* Alertas configuradas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Alertas Configuradas</h2>
        </div>
        {event.alertDays && event.alertDays.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {event.alertDays.map((days) => (
              <span
                key={days}
                className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                {days} {days === 1 ? 'día' : 'días'} antes
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay alertas configuradas para este evento</p>
        )}
        {event.lastAlertSent && (
          <p className="text-xs text-gray-500 mt-3">
            Última alerta enviada: {new Date(event.lastAlertSent).toLocaleDateString('es-PA')}
          </p>
        )}
      </div>

      {/* Verificaciones relacionadas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Verificaciones Relacionadas ({event.relatedClaims.length})
        </h2>
        {event.relatedClaims.length > 0 ? (
          <div className="space-y-2">
            {event.relatedClaims.map((claimId) => (
              <div
                key={claimId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-sm text-gray-700">ID: {claimId}</span>
                <Link
                  href={`/admin/dashboard/claims/${claimId}/review`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay verificaciones relacionadas con este evento</p>
        )}
      </div>

      {/* Artículos relacionados */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Artículos Relacionados ({event.relatedArticles.length})
        </h2>
        {event.relatedArticles.length > 0 ? (
          <div className="space-y-2">
            {event.relatedArticles.map((articleId) => (
              <div
                key={articleId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-sm text-gray-700">ID: {articleId}</span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay artículos relacionados con este evento</p>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">Creado:</span>{' '}
            {new Date(event.createdAt).toLocaleDateString('es-PA')}
          </div>
          <div>
            <span className="font-medium">Última actualización:</span>{' '}
            {new Date(event.updatedAt).toLocaleDateString('es-PA')}
          </div>
        </div>
      </div>
    </div>
  )
}
