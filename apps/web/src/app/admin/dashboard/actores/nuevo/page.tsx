'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@infopanama/convex'
import { toast } from 'sonner'

export default function NuevoPerfilPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('person')
  const [riskLevel, setRiskLevel] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const createActor = useMutation(api.actors.create)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre es requerido', {
        description: 'Por favor ingresa un nombre para el actor'
      })
      return
    }

    setIsSaving(true)
    const toastId = toast.loading('Creando actor...')

    try {
      const actorId = await createActor({
        name: name.trim(),
        type: type as any,
        riskLevel: riskLevel as any,
        description: description.trim() || undefined,
      })

      toast.success('Actor creado correctamente', {
        id: toastId,
        description: `${name} ha sido agregado exitosamente`,
      })

      router.push(`/admin/dashboard/actores/${actorId}`)
    } catch (error) {
      console.error('Error al crear actor:', error)
      toast.error('Error al crear el actor', {
        id: toastId,
        description: 'Por favor intenta nuevamente',
      })
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Perfiles
        </button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
          Nuevo Perfil
        </h1>
        <p className="text-gray-600">Crear un nuevo perfil para monitorear</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
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
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de actor *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            >
              <option value="person">Persona</option>
              <option value="group">Grupo</option>
              <option value="media_outlet">Medio de Comunicación</option>
              <option value="official">Oficial</option>
              <option value="verified_account">Cuenta Verificada</option>
              <option value="troll_network">Red Troll</option>
              <option value="botnet">Botnet</option>
              <option value="HB">HB</option>
              <option value="anonymous">Anónimo</option>
            </select>
          </div>

          {/* Nivel de Riesgo */}
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
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
