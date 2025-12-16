'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { CheckCircle2, XCircle, HelpCircle, Loader2, User, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function ActorPublicPage() {
  const params = useParams()
  const slug = params.slug as string

  // Obtener actor por slug
  const actor = useQuery(api.actors.getBySlug, { slug })
  const allClaims = useQuery(api.claims.list, { limit: 1000 })

  if (!actor || !allClaims) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Filtrar claims del actor que estén publicados
  const actorClaims = allClaims.filter(
    (claim) => claim.actorId === actor._id && claim.status === 'published'
  )

  // Calcular estadísticas
  const verdictCounts = {
    TRUE: actorClaims.filter((c) => c.verdict === 'TRUE').length,
    FALSE: actorClaims.filter((c) => c.verdict === 'FALSE').length,
    MIXED: actorClaims.filter((c) => c.verdict === 'MIXED').length,
    UNPROVEN: actorClaims.filter((c) => c.verdict === 'UNPROVEN').length,
    NEEDS_CONTEXT: actorClaims.filter((c) => c.verdict === 'NEEDS_CONTEXT').length,
  }

  const totalVerified = Object.values(verdictCounts).reduce((a, b) => a + b, 0)
  const truthRate =
    totalVerified > 0 ? Math.round((verdictCounts.TRUE / totalVerified) * 100) : 0
  const falseRate =
    totalVerified > 0 ? Math.round((verdictCounts.FALSE / totalVerified) * 100) : 0

  const getVerdictBadge = (verdict: string | null | undefined) => {
    if (!verdict) return null

    const configs: Record<
      string,
      { icon: typeof CheckCircle2; color: string; label: string }
    > = {
      TRUE: { icon: CheckCircle2, color: 'bg-green-500', label: 'Verdadero' },
      FALSE: { icon: XCircle, color: 'bg-red-500', label: 'Falso' },
      MIXED: { icon: HelpCircle, color: 'bg-yellow-500', label: 'Mixto' },
      UNPROVEN: { icon: HelpCircle, color: 'bg-gray-500', label: 'No Comprobado' },
      NEEDS_CONTEXT: { icon: HelpCircle, color: 'bg-blue-500', label: 'Necesita Contexto' },
    }

    const config = configs[verdict] || configs.UNPROVEN
    const Icon = config.icon

    return (
      <div
        className={`${config.color} text-white px-3 py-1 rounded-lg flex items-center gap-2 font-semibold text-sm`}
      >
        <Icon className="h-4 w-4" />
        {config.label}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header del Actor */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Info del Actor */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{actor.name}</h1>

              {/* Type Badge */}
              <div className="flex items-center gap-3 mb-4">
                {actor.type && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {actor.type === 'politician'
                      ? 'Político'
                      : actor.type === 'official'
                      ? 'Funcionario'
                      : actor.type === 'organization'
                      ? 'Organización'
                      : 'Otro'}
                  </span>
                )}
                {actor.riskLevel && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      actor.riskLevel === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : actor.riskLevel === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    Riesgo{' '}
                    {actor.riskLevel === 'HIGH'
                      ? 'Alto'
                      : actor.riskLevel === 'MEDIUM'
                      ? 'Medio'
                      : 'Bajo'}
                  </span>
                )}
              </div>

              {/* Description */}
              {actor.description && (
                <p className="text-slate-600 text-lg leading-relaxed">
                  {actor.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Total Verificaciones</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalVerified}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-slate-500">Tasa de Verdad</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{truthRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-slate-500">Tasa de Falsedad</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{falseRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="h-5 w-5 text-gray-500" />
              <p className="text-sm font-medium text-slate-500">Otros</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {verdictCounts.MIXED + verdictCounts.UNPROVEN + verdictCounts.NEEDS_CONTEXT}
            </p>
          </div>
        </div>

        {/* Distribución de Veredictos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Distribución de Veredictos
          </h2>

          <div className="space-y-3">
            {Object.entries(verdictCounts).map(([verdict, count]) => {
              const percentage = totalVerified > 0 ? (count / totalVerified) * 100 : 0
              const labels: Record<string, string> = {
                TRUE: 'Verdadero',
                FALSE: 'Falso',
                MIXED: 'Mixto',
                UNPROVEN: 'No Comprobado',
                NEEDS_CONTEXT: 'Necesita Contexto',
              }
              const colors: Record<string, string> = {
                TRUE: 'bg-green-500',
                FALSE: 'bg-red-500',
                MIXED: 'bg-yellow-500',
                UNPROVEN: 'bg-gray-500',
                NEEDS_CONTEXT: 'bg-blue-500',
              }

              return (
                <div key={verdict}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      {labels[verdict]}
                    </span>
                    <span className="text-sm text-slate-500">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${colors[verdict]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lista de Verificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Verificaciones Publicadas ({actorClaims.length})
          </h2>

          {actorClaims.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No hay verificaciones publicadas de este actor todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {actorClaims.map((claim) => (
                <Link key={claim._id} href={`/verificaciones/${claim._id}`}>
                  <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      {getVerdictBadge(claim.verdict)}
                      <span className="text-xs text-slate-400">
                        {claim.publishedAt
                          ? new Date(claim.publishedAt).toLocaleDateString('es-PA')
                          : new Date(claim.createdAt).toLocaleDateString('es-PA')}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-1">{claim.title}</h3>
                    <p className="text-sm text-slate-600 italic">"{claim.claimText}"</p>

                    {claim.category && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {claim.category}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
