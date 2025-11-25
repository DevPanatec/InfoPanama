'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Building2, CheckCircle, XCircle, Calendar, ExternalLink } from 'lucide-react'

// Demo data - esto vendría de la base de datos
const DEMO_PERFILES: Record<string, {
  id: string
  name: string
  type: string
  position: string
  description: string
  totalClaims: number
  trueClaims: number
  falseClaims: number
  image?: string
  claims: Array<{
    id: string
    title: string
    verdict: 'TRUE' | 'FALSE'
    date: string
  }>
}> = {
  '1': {
    id: '1',
    name: 'José Raúl Mulino',
    type: 'politician',
    position: 'Presidente de Panamá',
    description: 'Presidente constitucional de la República de Panamá desde julio de 2024.',
    totalClaims: 24,
    trueClaims: 18,
    falseClaims: 6,
    claims: [
      { id: '1', title: 'Gobierno anuncia nueva inversión en infraestructura', verdict: 'TRUE', date: '2024-01-15' },
      { id: '2', title: 'Reducción del desempleo al 3%', verdict: 'FALSE', date: '2024-01-10' },
      { id: '3', title: 'Aumento del salario mínimo en 2024', verdict: 'TRUE', date: '2024-01-08' },
      { id: '4', title: 'Nuevo hospital será inaugurado en diciembre', verdict: 'TRUE', date: '2024-01-05' },
    ]
  },
  '2': {
    id: '2',
    name: 'Ministerio de Salud',
    type: 'institution',
    position: 'Institución Gubernamental',
    description: 'Ministerio encargado de la salud pública en Panamá.',
    totalClaims: 45,
    trueClaims: 38,
    falseClaims: 7,
    claims: [
      { id: '5', title: 'Vacunación COVID alcanza 80% de cobertura', verdict: 'TRUE', date: '2024-01-12' },
      { id: '6', title: 'Nuevo centro de salud en Colón', verdict: 'TRUE', date: '2024-01-09' },
      { id: '7', title: 'Reducción de casos de dengue', verdict: 'FALSE', date: '2024-01-06' },
    ]
  },
  '3': {
    id: '3',
    name: 'Cámara de Comercio',
    type: 'organization',
    position: 'Organización Empresarial',
    description: 'Cámara de Comercio, Industrias y Agricultura de Panamá.',
    totalClaims: 12,
    trueClaims: 9,
    falseClaims: 3,
    claims: [
      { id: '8', title: 'Crecimiento económico del 5%', verdict: 'TRUE', date: '2024-01-11' },
      { id: '9', title: 'Aumento de exportaciones', verdict: 'TRUE', date: '2024-01-07' },
    ]
  },
  '4': {
    id: '4',
    name: 'TVN Noticias',
    type: 'media',
    position: 'Medio de Comunicación',
    description: 'Canal de televisión panameño con cobertura nacional.',
    totalClaims: 67,
    trueClaims: 58,
    falseClaims: 9,
    claims: [
      { id: '10', title: 'Tráfico en corredor sur aumentó 20%', verdict: 'TRUE', date: '2024-01-14' },
      { id: '11', title: 'Precios de combustible estables', verdict: 'FALSE', date: '2024-01-13' },
    ]
  }
}

export default function PerfilPage() {
  const router = useRouter()
  const params = useParams()
  const perfilId = params.id as string

  const perfil = DEMO_PERFILES[perfilId]

  if (!perfil) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50/30 min-h-screen">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Perfil no encontrado</h1>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  const truthPercent = Math.round((perfil.trueClaims / perfil.totalClaims) * 100)

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string; icon: typeof User }> = {
      politician: { color: 'bg-blue-500/10 text-blue-600', label: 'Político', icon: User },
      institution: { color: 'bg-purple-500/10 text-purple-600', label: 'Institución', icon: Building2 },
      organization: { color: 'bg-green-500/10 text-green-600', label: 'Organización', icon: Building2 },
      media: { color: 'bg-orange-500/10 text-orange-600', label: 'Medio', icon: Building2 },
    }

    const config = configs[type] || { color: 'bg-gray-500/10 text-gray-600', label: type, icon: User }

    return (
      <span className={`inline-flex items-center gap-1 text-sm ${config.color} px-3 py-1 rounded-full font-semibold`}>
        {config.label}
      </span>
    )
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del perfil */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card principal */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {perfil.name.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{perfil.name}</h1>
              <p className="text-gray-600 mb-3">{perfil.position}</p>
              {getTypeBadge(perfil.type)}
              <p className="text-sm text-gray-500 mt-4">{perfil.description}</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Estadísticas de Veracidad</h3>

            <div className="space-y-4">
              {/* Barra de progreso */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Porcentaje de veracidad</span>
                  <span className={`font-bold ${truthPercent >= 70 ? 'text-green-600' : truthPercent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {truthPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${truthPercent >= 70 ? 'bg-green-500' : truthPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${truthPercent}%` }}
                  />
                </div>
              </div>

              {/* Números */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{perfil.totalClaims}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{perfil.trueClaims}</div>
                  <div className="text-xs text-gray-500">Verdaderas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{perfil.falseClaims}</div>
                  <div className="text-xs text-gray-500">Falsas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de verificaciones */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Historial de Verificaciones</h3>
              <p className="text-sm text-gray-500">Declaraciones verificadas de este perfil</p>
            </div>

            <div className="divide-y divide-gray-100">
              {perfil.claims.map((claim) => (
                <div key={claim.id} className="p-4 hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1">{claim.title}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {claim.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {claim.verdict === 'TRUE' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full font-semibold">
                          <CheckCircle className="h-3 w-3" />
                          Verdadero
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-600 px-2 py-1 rounded-full font-semibold">
                          <XCircle className="h-3 w-3" />
                          Falso
                        </span>
                      )}
                      <button
                        onClick={() => router.push(`/verificaciones/${claim.id}`)}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {perfil.claims.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No hay verificaciones registradas para este perfil
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
