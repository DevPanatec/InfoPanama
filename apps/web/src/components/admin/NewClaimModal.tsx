'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

interface NewClaimModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (claim: {
    title: string
    description: string
    claimText: string
    sourceType: string
    sourceUrl?: string
    riskLevel: string
    category?: string
    imageUrl?: string
    actorId?: Id<'actors'>
    sourceId?: Id<'sources'>
  }) => void
}

export function NewClaimModal({ isOpen, onClose, onSubmit }: NewClaimModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [claimText, setClaimText] = useState('')
  const [sourceType, setSourceType] = useState('user_submitted')
  const [sourceUrl, setSourceUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [riskLevel, setRiskLevel] = useState('MEDIUM')
  const [category, setCategory] = useState('')
  const [actorId, setActorId] = useState<Id<'actors'> | ''>('')
  const [sourceId, setSourceId] = useState<Id<'sources'> | ''>('')

  // Obtener lista de actores y fuentes
  const actors = useQuery(api.actors.list, { limit: 100 })
  const sources = useQuery(api.sources.list, {})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && claimText.trim() && description.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        claimText: claimText.trim(),
        sourceType,
        sourceUrl: sourceUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        riskLevel,
        category: category.trim() || undefined,
        actorId: actorId || undefined,
        sourceId: sourceId || undefined,
      })
      setTitle('')
      setDescription('')
      setClaimText('')
      setSourceType('user_submitted')
      setSourceUrl('')
      setImageUrl('')
      setRiskLevel('MEDIUM')
      setCategory('')
      setActorId('')
      setSourceId('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Nueva Verificación
          </h2>
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
              Título de la verificación *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Gobierno anuncia nueva inversión..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Texto de la afirmación *
            </label>
            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              rows={3}
              placeholder='Ej: "El gobierno invertirá $500 millones en infraestructura"'
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
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
              rows={2}
              placeholder="Breve descripción del contexto de la afirmación..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Fuente *
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="user_submitted">Enviada por Usuario</option>
                <option value="auto_extracted">Auto-extraída</option>
                <option value="media_article">Artículo de Medio</option>
                <option value="social_media">Red Social</option>
                <option value="official_source">Fuente Oficial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nivel de Riesgo *
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="LOW">Bajo</option>
                <option value="MEDIUM">Medio</option>
                <option value="HIGH">Alto</option>
                <option value="CRITICAL">Crítico</option>
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
              placeholder="https://ejemplo.com/articulo"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL de la Imagen (opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta imagen se mostrará en la tarjeta de la verificación en la página principal
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría (opcional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Política, Economía, Salud..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Actor Político (opcional)
              </label>
              <select
                value={actorId}
                onChange={(e) => setActorId(e.target.value as Id<'actors'> | '')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="">Sin actor asignado</option>
                {actors?.map((actor) => (
                  <option key={actor._id} value={actor._id}>
                    {actor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fuente/Medio (opcional)
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value as Id<'sources'> | '')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="">Sin fuente asignada</option>
                {sources?.map((source) => (
                  <option key={source._id} value={source._id}>
                    {source.name}
                  </option>
                ))}
              </select>
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
              Crear Verificación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
