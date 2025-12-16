'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@infopanama/convex'
import { ArrowLeft, Save, Loader2, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function EditarActorPage() {
  const router = useRouter()
  const params = useParams()
  const actorId = params.id as string

  const actor = useQuery(api.actors.getById, { id: actorId as any })
  const updateActor = useMutation(api.actors.update)

  const [name, setName] = useState('')
  const [type, setType] = useState('politician')
  const [riskLevel, setRiskLevel] = useState('LOW')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos del actor cuando se obtiene
  useEffect(() => {
    if (actor) {
      setName(actor.name)
      setType(actor.type)
      setRiskLevel(actor.riskLevel || 'LOW')
      setDescription(actor.description || '')
    }
  }, [actor])

  // Loading state
  if (!actor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre es requerido', {
        description: 'Por favor ingresa un nombre para el actor'
      })
      return
    }

    setIsSaving(true)
    const toastId = toast.loading('Guardando cambios...')

    try {
      await updateActor({
        id: actorId as any,
        name: name.trim(),
        type: type as any,
        riskLevel: riskLevel as any,
        description: description.trim() || undefined,
      })

      toast.success('Actor actualizado correctamente', {
        id: toastId,
        description: `${name} ha sido actualizado exitosamente`,
      })

      router.push(`/admin/dashboard/actores/${actorId}`)
    } catch (error) {
      console.error('Error al actualizar actor:', error)
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
          onClick={() => router.push(`/admin/dashboard/actores/${actorId}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Actor
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Actor</h1>
        </div>
        <p className="text-gray-600">
          Modifica la información del actor político
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre del Actor *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Actor *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              disabled={isSaving}
            >
              <option value="politician">Político</option>
              <option value="government_official">Funcionario Gubernamental</option>
              <option value="candidate">Candidato</option>
              <option value="organization">Organización</option>
              <option value="party">Partido Político</option>
              <option value="other">Otro</option>
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
              disabled={isSaving}
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
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Breve descripción del actor, su posición, partido político, etc."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
            disabled={isSaving}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={() => router.push(`/admin/dashboard/actores/${actorId}`)}
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
            <span className="font-medium">ID del actor:</span> {actorId}
          </div>
          <div>
            <span className="font-medium">Última actualización:</span>{' '}
            {new Date(actor.updatedAt).toLocaleDateString('es-PA')}
          </div>
        </div>
      </div>
    </div>
  )
}
