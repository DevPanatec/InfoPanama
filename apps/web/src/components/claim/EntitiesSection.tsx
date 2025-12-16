'use client'

import { User, Building2, MapPin, Briefcase, TrendingUp, Network } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

interface EntitiesSectionProps {
  claimId: Id<'claims'>
}

export function EntitiesSection({ claimId }: EntitiesSectionProps) {
  // Obtener entidades relacionadas con este claim
  const entities = useQuery(api.entities.findByClaim, {
    claimId: claimId
  })

  if (!entities || entities.length === 0) {
    return null
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON':
        return User
      case 'ORGANIZATION':
        return Building2
      case 'LOCATION':
        return MapPin
      case 'POSITION':
        return Briefcase
      default:
        return Network
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'PERSON':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: 'bg-blue-500'
        }
      case 'ORGANIZATION':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          icon: 'bg-purple-500'
        }
      case 'LOCATION':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: 'bg-green-500'
        }
      case 'POSITION':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: 'bg-amber-500'
        }
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: 'bg-slate-500'
        }
    }
  }

  const getInvolvementProbability = (entity: any): number => {
    // Calcular probabilidad basada en:
    // 1. Número de menciones
    // 2. Tipo de entidad
    // 3. Contexto (si está disponible)

    const mentionCount = entity.mentionCount || 0
    const baseScore = Math.min(mentionCount * 15, 60) // Max 60 por menciones

    // Bonus por tipo
    let typeBonus = 0
    if (entity.type === 'PERSON') typeBonus = 20
    if (entity.type === 'ORGANIZATION') typeBonus = 15
    if (entity.type === 'POSITION') typeBonus = 10

    // Bonus si tiene descripción
    const descriptionBonus = entity.description ? 10 : 0

    const total = Math.min(baseScore + typeBonus + descriptionBonus, 95)
    return total
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-red-600 bg-red-50'
    if (probability >= 50) return 'text-orange-600 bg-orange-50'
    if (probability >= 25) return 'text-yellow-600 bg-yellow-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getProbabilityLabel = (probability: number) => {
    if (probability >= 75) return 'Alto'
    if (probability >= 50) return 'Medio-Alto'
    if (probability >= 25) return 'Medio'
    return 'Bajo'
  }

  // Ordenar por probabilidad
  const sortedEntities = [...entities].sort((a, b) => {
    return getInvolvementProbability(b) - getInvolvementProbability(a)
  })

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
          Análisis OSINT: Entidades Involucradas
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Network className="h-4 w-4" />
          <span>{entities.length} detectadas</span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-6">
        Análisis de personas, organizaciones y entidades mencionadas con su nivel de involucramiento probable.
      </p>

      <div className="space-y-4">
        {sortedEntities.map((entity) => {
          const Icon = getEntityIcon(entity.type)
          const colors = getEntityColor(entity.type)
          const probability = getInvolvementProbability(entity)
          const probabilityColor = getProbabilityColor(probability)
          const probabilityLabel = getProbabilityLabel(probability)

          return (
            <div
              key={entity._id}
              className={`border ${colors.border} rounded-xl p-5 ${colors.bg} hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        {entity.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {entity.type === 'PERSON' && 'Persona'}
                          {entity.type === 'ORGANIZATION' && 'Organización'}
                          {entity.type === 'LOCATION' && 'Ubicación'}
                          {entity.type === 'POSITION' && 'Cargo'}
                          {entity.type === 'EVENT' && 'Evento'}
                          {entity.type === 'OTHER' && 'Otro'}
                        </span>
                        {entity.mentionCount > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                            {entity.mentionCount} {entity.mentionCount === 1 ? 'mención' : 'menciones'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Probability Badge */}
                    <div className="flex-shrink-0">
                      <div className={`px-4 py-2 rounded-lg ${probabilityColor} border-2 border-current border-opacity-20`}>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{probability}%</div>
                          <div className="text-xs font-medium uppercase">{probabilityLabel}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {entity.description && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {entity.description}
                    </p>
                  )}

                  {/* Aliases */}
                  {entity.aliases && entity.aliases.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">También conocido como:</p>
                      <div className="flex flex-wrap gap-1">
                        {entity.aliases.map((alias: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-white/50 rounded text-slate-600"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Probability Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          probability >= 75 ? 'bg-red-500' :
                          probability >= 50 ? 'bg-orange-500' :
                          probability >= 25 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-500 mb-3 font-medium">Nivel de Involucramiento:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Alto (75%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Medio-Alto (50-74%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Medio (25-49%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-slate-600">Bajo (&lt;25%)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 italic">
          * El porcentaje indica la probabilidad estimada de involucramiento basada en frecuencia de menciones, tipo de entidad y contexto.
        </p>
      </div>
    </div>
  )
}
