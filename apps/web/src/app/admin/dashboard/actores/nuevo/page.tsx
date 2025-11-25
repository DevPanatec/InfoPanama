'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User } from 'lucide-react'

export default function NuevoPerfilPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('politician')
  const [position, setPosition] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (!name.trim()) {
      alert('El nombre es requerido')
      return
    }
    if (!position.trim()) {
      alert('El cargo/posición es requerido')
      return
    }

    setIsSaving(true)
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false)
      alert('Perfil creado correctamente')
      router.push('/admin/dashboard/actores')
    }, 1000)
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Perfiles
        </button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Nuevo Perfil
        </h1>
        <p className="text-gray-600">Crear un nuevo perfil para monitorear</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              {name ? (
                <span className="text-3xl font-bold">{name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: José Raúl Mulino"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de perfil *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
            >
              <option value="politician">Político</option>
              <option value="institution">Institución</option>
              <option value="organization">Organización</option>
              <option value="media">Medio de Comunicación</option>
            </select>
          </div>

          {/* Cargo/Posición */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cargo/Posición *
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ej: Presidente de Panamá"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descripción del perfil..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Guardando...' : 'Crear Perfil'}
            </button>

            <button
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
