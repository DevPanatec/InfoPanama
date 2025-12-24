'use client'

import { User, Users, Building2, Bot, AlertTriangle, Shield, TrendingUp, MessageSquare } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import Link from 'next/link'

export default function ActoresPage() {
  // Obtener actores reales de Convex
  const actoresData = useQuery(api.actors.list, {})

  // Calcular estadísticas mientras se cargan los datos
  const actores = actoresData || []
  const totalActores = actores.length
  const totalVerificaciones = actores.reduce((sum: number, a: any) => sum + (a.claimsCount || 0), 0)
  const credibilidadMedia = actores.length > 0
    ? Math.round(actores.reduce((sum: number, a: any) => sum + (a.credibilityScore || 0), 0) / actores.length)
    : 0

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'person': return User
      case 'official': return Building2
      case 'group': return Users
      case 'organization': return Building2
      case 'troll_network': return Bot
      case 'botnet': return Bot
      case 'media_outlet': return Building2
      default: return User
    }
  }

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'person': return 'Persona'
      case 'official': return 'Institución'
      case 'group': return 'Organización'
      case 'organization': return 'Organización'
      case 'troll_network': return 'Red de Trolls'
      case 'botnet': return 'Red de Bots'
      case 'media_outlet': return 'Medio de Comunicación'
      case 'HB': return 'Honeybadger'
      default: return tipo
    }
  }

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'person': return 'bg-blue-100 text-blue-700'
      case 'official': return 'bg-sky-100 text-sky-700'
      case 'group': return 'bg-blue-50 text-blue-600'
      case 'organization': return 'bg-sky-50 text-sky-600'
      case 'troll_network': return 'bg-red-100 text-red-700'
      case 'botnet': return 'bg-red-100 text-red-700'
      case 'media_outlet': return 'bg-purple-100 text-purple-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getCredibilityColor = (credibilidad: number) => {
    if (credibilidad >= 80) return 'from-blue-500 to-blue-600'
    if (credibilidad >= 70) return 'from-sky-500 to-blue-600'
    if (credibilidad >= 60) return 'from-slate-500 to-blue-700'
    return 'from-slate-600 to-slate-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Actores Políticos
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Monitoreo de figuras públicas, instituciones y organizaciones en Panamá.
            Análisis de credibilidad basado en verificaciones de sus declaraciones.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalActores}</p>
                <p className="text-sm text-slate-500">Actores</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalVerificaciones}</p>
                <p className="text-sm text-slate-500">Declaraciones</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{credibilidadMedia || 0}%</p>
                <p className="text-sm text-slate-500">Credibilidad Media</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-100 rounded-xl">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">24/7</p>
                <p className="text-sm text-slate-500">Monitoreo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actors Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Actores Monitoreados</h2>
          </div>

          {!actoresData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-4">Cargando actores...</p>
            </div>
          ) : actores.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">No hay actores registrados aún</p>
              <p className="text-slate-500 mt-2">Los actores se crearán automáticamente cuando el crawler detecte nuevas figuras públicas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actores.map((actor: any) => {
                const Icon = getIcon(actor.type || 'person')
                const credibilityScore = actor.credibilityScore || 0
                const credibilityColor = getCredibilityColor(credibilityScore)
                const typeColor = getTypeColor(actor.type || 'person')
                const claimsCount = actor.claimsCount || 0

                return (
                  <Link
                    key={actor._id}
                    href={`/actores/${actor.slug || actor._id}`}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                            {actor.name}
                          </h3>
                          <p className="text-sm text-slate-500">{actor.description || 'Actor político'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${typeColor}`}>
                          {getTypeLabel(actor.type || 'person')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {claimsCount} declaraciones
                        </span>
                      </div>

                      {actor.verified && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Shield className="h-4 w-4" />
                          <span>Verificado</span>
                        </div>
                      )}
                    </div>

                    {/* Credibility */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Credibilidad</span>
                        <span className="text-lg font-bold text-slate-800">{credibilityScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${credibilityColor} transition-all duration-500`}
                          style={{ width: `${credibilityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all font-medium text-sm shadow-md hover:shadow-lg group-hover:scale-[1.02] text-center">
                      Ver Perfil Completo
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Metodología</h3>
            </div>
            <p className="text-slate-700">
              La credibilidad se calcula basándose en el historial de verificaciones de
              las declaraciones públicas del actor. Un mayor porcentaje indica mayor precisión
              en sus afirmaciones.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-600 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Importante</h3>
            </div>
            <p className="text-slate-700">
              Este análisis se basa únicamente en declaraciones verificadas públicamente.
              No representa una evaluación completa del actor o institución.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
