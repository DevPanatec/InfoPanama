'use client'

import { X, Calendar } from 'lucide-react'
import { useState } from 'react'

interface NewEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: {
    title: string
    description: string
    eventDate: number
    eventType: string
    sourceUrl?: string
    alertDays?: number[]
  }) => void
}

export function NewEventModal({ isOpen, onClose, onSubmit }: NewEventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState('other')
  const [sourceUrl, setSourceUrl] = useState('')
  const [alertDays, setAlertDays] = useState<number[]>([])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && description.trim() && eventDate) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        eventDate: new Date(eventDate).getTime(),
        eventType,
        sourceUrl: sourceUrl.trim() || undefined,
        alertDays: alertDays.length > 0 ? alertDays : undefined,
      })
      // Reset form
      setTitle('')
      setDescription('')
      setEventDate('')
      setEventType('other')
      setSourceUrl('')
      setAlertDays([])
      onClose()
    }
  }

  const toggleAlertDay = (day: number) => {
    setAlertDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Nuevo Evento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descripción del evento y su importancia..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
              required
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
                required
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
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                    alertDays.includes(day)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {day} {day === 1 ? 'día' : 'días'} antes
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Crear Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
