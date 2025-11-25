'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

// Demo data - esto vendría de la base de datos
const DEMO_FUENTES: Record<string, {
  id: string
  name: string
  type: string
  isTrusted: boolean
  credibilityScore: number
  url?: string
  description?: string
}> = {
  '1': {
    id: '1',
    name: 'TVN Noticias',
    type: 'media',
    isTrusted: true,
    credibilityScore: 85,
    url: 'https://www.tvn-2.com',
    description: 'Canal de televisión panameño con cobertura nacional de noticias.',
  },
  '2': {
    id: '2',
    name: 'La Prensa',
    type: 'media',
    isTrusted: true,
    credibilityScore: 88,
    url: 'https://www.prensa.com',
    description: 'Periódico panameño fundado en 1980, reconocido por su periodismo investigativo.',
  },
  '3': {
    id: '3',
    name: 'Telemetro',
    type: 'media',
    isTrusted: true,
    credibilityScore: 82,
    url: 'https://www.telemetro.com',
    description: 'Canal de televisión con programación de noticias y entretenimiento.',
  },
  '4': {
    id: '4',
    name: 'Mi Diario',
    type: 'media',
    isTrusted: true,
    credibilityScore: 75,
    url: 'https://www.midiario.com',
    description: 'Periódico digital panameño.',
  },
  '5': {
    id: '5',
    name: 'Panamá América',
    type: 'media',
    isTrusted: true,
    credibilityScore: 80,
    url: 'https://www.panamaamerica.com.pa',
    description: 'Periódico panameño con amplia cobertura nacional.',
  },
  '6': {
    id: '6',
    name: 'Critica',
    type: 'media',
    isTrusted: true,
    credibilityScore: 78,
    url: 'https://www.critica.com.pa',
    description: 'Periódico panameño con noticias locales y nacionales.',
  },
  '7': {
    id: '7',
    name: 'Presidencia de la República',
    type: 'official',
    isTrusted: true,
    credibilityScore: 98,
    url: 'https://www.presidencia.gob.pa',
    description: 'Sitio oficial de la Presidencia de la República de Panamá.',
  },
  '8': {
    id: '8',
    name: 'Ministerio de Salud (MINSA)',
    type: 'official',
    isTrusted: true,
    credibilityScore: 97,
    url: 'https://www.minsa.gob.pa',
    description: 'Ministerio encargado de la salud pública en Panamá.',
  },
  '9': {
    id: '9',
    name: 'Ministerio de Economía y Finanzas (MEF)',
    type: 'official',
    isTrusted: true,
    credibilityScore: 96,
    url: 'https://www.mef.gob.pa',
    description: 'Ministerio encargado de las finanzas públicas de Panamá.',
  },
  '10': {
    id: '10',
    name: 'Asamblea Nacional',
    type: 'official',
    isTrusted: true,
    credibilityScore: 95,
    url: 'https://www.asamblea.gob.pa',
    description: 'Órgano legislativo de la República de Panamá.',
  },
}

export default function EditarFuentePage() {
  const router = useRouter()
  const params = useParams()
  const fuenteId = params.id as string

  const fuenteOriginal = DEMO_FUENTES[fuenteId]

  const [name, setName] = useState(fuenteOriginal?.name || '')
  const [type, setType] = useState(fuenteOriginal?.type || 'media')
  const [isTrusted, setIsTrusted] = useState(fuenteOriginal?.isTrusted ?? true)
  const [credibilityScore, setCredibilityScore] = useState(fuenteOriginal?.credibilityScore || 75)
  const [url, setUrl] = useState(fuenteOriginal?.url || '')
  const [description, setDescription] = useState(fuenteOriginal?.description || '')

  if (!fuenteOriginal) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-green-50/30 min-h-screen">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Fuente no encontrada</h1>
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    alert('Cambios guardados correctamente')
    router.push('/admin/dashboard/fuentes')
  }

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta fuente?')) {
      // Aquí iría la lógica para eliminar
      alert('Fuente eliminada')
      router.push('/admin/dashboard/fuentes')
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-green-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Fuentes
        </button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Editar Fuente
        </h1>
        <p className="text-gray-600">Modifica la información de la fuente</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la fuente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL del sitio web
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de fuente
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
            >
              <option value="media">Medio de comunicación</option>
              <option value="official">Fuente oficial</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descripción de la fuente..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none resize-none"
            />
          </div>

          {/* Credibilidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Puntuación de credibilidad: {credibilityScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={credibilityScore}
              onChange={(e) => setCredibilityScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Confiable */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrusted}
                onChange={(e) => setIsTrusted(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Marcar como fuente confiable
              </span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Save className="h-5 w-5" />
              Guardar Cambios
            </button>

            <button
              onClick={handleDelete}
              className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Trash2 className="h-5 w-5" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
