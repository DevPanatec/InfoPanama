'use client'

import { Users, Plus, Search, TrendingUp, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export default function ActoresPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Queries a Convex
  const actors = useQuery(api.actors.list, { limit: 100 })
  const stats = useQuery(api.actors.stats)

  // Filtrado local
  const filteredActors = actors?.filter((actor) => {
    const matchesSearch = actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          actor.profile?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || actor.type === typeFilter
    return matchesSearch && matchesType
  })

  if (!actors || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-soft-blue">
        <Loader2 className="h-8 w-8 animate-spin text-verifica-blue" />
      </div>
    )
  }

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      person: { color: 'bg-digital-blue/10 text-verifica-blue border-digital-blue/20', label: 'Persona' },
      group: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Grupo' },
      media_outlet: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Medio' },
      official: { color: 'bg-verifica-blue/10 text-deep-blue border-verifica-blue/20', label: 'Oficial' },
    }

    const config = configs[type] || { color: 'bg-gray-100 text-gray-700 border-gray-200', label: type }

    return (
      <span className={`inline-flex text-xs ${config.color} px-3 py-1 rounded-full font-medium border`}>
        {config.label}
      </span>
    )
  }

  const getRiskBadge = (riskLevel: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      LOW: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Bajo' },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medio' },
      HIGH: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Alto' },
      CRITICAL: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Crítico' },
    }

    const config = configs[riskLevel] || { color: 'bg-gray-100 text-gray-700 border-gray-200', label: riskLevel }

    return (
      <span className={`inline-flex text-xs ${config.color} px-3 py-1 rounded-full font-semibold border`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-soft-blue">
      {/* Header */}
      <div className="bg-verifica-blue text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Perfiles Monitoreados</h1>
              <p className="text-blue-100 text-lg">
                Personas e instituciones cuyas declaraciones son verificadas
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard/actores/nuevo')}
              className="px-6 py-3 bg-digital-blue hover:bg-digital-blue/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nuevo Perfil
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-verifica-blue/10 rounded-lg">
                <Users className="h-6 w-6 text-verifica-blue" />
              </div>
              <div>
                <p className="text-3xl font-bold text-deep-blue">{stats.total}</p>
                <p className="text-sm text-blue-gray">Total Actores</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-deep-blue">{stats.monitored}</p>
                <p className="text-sm text-blue-gray">Actores Monitoreados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-deep-blue">
                  {stats.byRisk.HIGH + stats.byRisk.CRITICAL}
                </p>
                <p className="text-sm text-blue-gray">Alto Riesgo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-gray" />
              <input
                type="text"
                placeholder="Buscar perfiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="person">Persona</option>
              <option value="group">Grupo</option>
              <option value="media_outlet">Medio</option>
              <option value="official">Oficial</option>
            </select>
          </div>
        </div>

        {/* Lista de Actores */}
        {filteredActors && filteredActors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActors.map((actor) => (
              <div
                key={actor._id}
                onClick={() => router.push(`/admin/dashboard/actores/${actor._id}`)}
                className="bg-white rounded-lg p-6 border border-slate-200 hover:border-digital-blue hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-verifica-blue flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {actor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-deep-blue group-hover:text-digital-blue transition-colors truncate">
                      {actor.name}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {getTypeBadge(actor.type)}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {actor.profile?.description && (
                  <p className="text-sm text-blue-gray mb-4 line-clamp-2">
                    {actor.profile.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-gray" />
                    <span className="text-sm text-blue-gray">
                      {actor.incidents?.length || 0} claims
                    </span>
                  </div>
                  {getRiskBadge(actor.riskLevel)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-slate-200">
            <Users className="h-16 w-16 text-blue-gray mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-deep-blue mb-2">No hay actores registrados</h3>
            <p className="text-blue-gray mb-6">
              {searchQuery || typeFilter
                ? 'No se encontraron actores con los filtros aplicados'
                : 'Ejecuta el crawler o crea un actor manualmente para comenzar'}
            </p>
            <button
              onClick={() => router.push('/admin/dashboard/actores/nuevo')}
              className="px-6 py-3 bg-digital-blue hover:bg-digital-blue/90 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Actor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
