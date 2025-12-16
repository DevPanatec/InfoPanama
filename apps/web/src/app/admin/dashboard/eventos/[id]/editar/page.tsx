'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api, type Id } from '@infopanama/convex'
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface PageProps {
  params: {
    id: Id<'events'>
  }
}

export default function EditarEventoPage({ params }: PageProps) {
  const router = useRouter()
  const event = useQuery(api.events.getById, { id: params.id })
  const updateEvent = useMutation(api.events.update)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState('other')
  const [sourceUrl, setSourceUrl] = useState('')
  const [alertDays, setAlertDays] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos del evento cuando se obtiene
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description)
      setEventDate(new Date(event.eventDate).toISOString().split('T')[0])
      setEventType(event.eventType)
      setSourceUrl(event.sourceUrl || '')
      setAlertDays(event.alertDays || [])
    }
  }, [event])

  // Loading state
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const toggleAlertDay = (day: number) => {
    setAlertDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !eventDate) {
      toast.error('Campos requeridos incompletos', {
        description: 'Por favor completa todos los campos obligatorios'
      })
      return
    }

    setIsSaving(true)
    const toastId = toast.loading('Guardando cambios...')

    try {
      await updateEvent({
        id: params.id,
        title: title.trim(),
        description: description.trim(),
        eventDate: new Date(eventDate).getTime(),
        eventType: eventType as any,
        sourceUrl: sourceUrl.trim() || undefined,
        alertDays: alertDays.length > 0 ? alertDays : undefined,
      })

      toast.success('Evento actualizado correctamente', {
        id: toastId,
        description: 'Los cambios han sido guardados',
      })

      router.push(`/admin/dashboard/eventos/${params.id}`)
    } catch (error) {
      console.error('Error al actualizar evento:', error)
      toast.error('Error al guardar cambios', {
        id: toastId,
        description: 'Por favor intenta nuevamente',
      })
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/admin/dashboard/eventos/${params.id}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Evento
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Evento</h1>
        </div>
        <p className="text-gray-600">
          Modifica los detalles del evento gubernamental
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título del Evento *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Sesión ordinaria de la Asamblea Nacional"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Breve descripción del evento y su importancia..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha del Evento *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Evento *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              disabled={isSaving}
            >
              <option value="legislative">Legislativo</option>
              <option value="executive">Ejecutivo</option>
              <option value="judicial">Judicial</option>
              <option value="election">Elección</option>
              <option value="public_hearing">Audiencia Pública</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL de la Fuente (opcional)
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://ejemplo.com/evento"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Alertas Previas (opcional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Selecciona cuándo quieres recibir recordatorios antes del evento
          </p>
          <div className="flex gap-3">
            {[1, 3, 7].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleAlertDay(day)}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                  alertDays.includes(day)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {day} {day === 1 ? 'día' : 'días'} antes
              </button>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={() => router.push(`/admin/dashboard/eventos/${params.id}`)}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">ID del evento:</span> {params.id}
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
