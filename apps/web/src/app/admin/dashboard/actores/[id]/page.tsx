'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { ArrowLeft, Edit, User, AlertTriangle, Loader2, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default function ActorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const actorId = params.id as string

  const actor = useQuery(api.actors.getById, { id: actorId as any })

  // Obtener todas las verificaciones del actor
  const allClaims = useQuery(api.claims.list, { limit: 1000 })
  const actorClaims = allClaims?.filter(claim => claim.actorId === actorId) || []

  // Loading state
  if (!actor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Calcular estadísticas
  const publishedClaims = actorClaims.filter(c => c.status === 'published')
  const totalVerified = publishedClaims.length

  const verdictCounts = {
    TRUE: publishedClaims.filter(c => c.verdict === 'TRUE').length,
    FALSE: publishedClaims.filter(c => c.verdict === 'FALSE').length,
    MIXED: publishedClaims.filter(c => c.verdict === 'MIXED').length,
    UNPROVEN: publishedClaims.filter(c => c.verdict === 'UNPROVEN').length,
    NEEDS_CONTEXT: publishedClaims.filter(c => c.verdict === 'NEEDS_CONTEXT').length,
  }

  const truthRate = totalVerified > 0
    ? Math.round((verdictCounts.TRUE / totalVerified) * 100)
    : 0

  const falseRate = totalVerified > 0
    ? Math.round((verdictCounts.FALSE / totalVerified) * 100)
    : 0

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      politician: { color: 'bg-purple-500/10 text-purple-500', label: 'Político' },
      government_official: { color: 'bg-blue-500/10 text-blue-500', label: 'Funcionario Gubernamental' },
      candidate: { color: 'bg-green-500/10 text-green-500', label: 'Candidato' },
      organization: { color: 'bg-orange-500/10 text-orange-500', label: 'Organización' },
      party: { color: 'bg-red-500/10 text-red-500', label: 'Partido Político' },
      other: { color: 'bg-gray-500/10 text-gray-500', label: 'Otro' },
    }

    const config = configs[type] || { color: 'bg-gray-500/10 text-gray-500', label: type }

    return (
      <span className={`inline-flex text-sm ${config.color} px-3 py-1.5 rounded-lg font-semibold`}>
        {config.label}
      </span>
    )
  }

  const getVerdictBadge = (verdict: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      TRUE: { color: 'bg-emerald-500', label: 'Verdadero' },
      FALSE: { color: 'bg-red-500', label: 'Falso' },
      MIXED: { color: 'bg-amber-500', label: 'Mixto' },
      UNPROVEN: { color: 'bg-slate-500', label: 'No Comprobado' },
      NEEDS_CONTEXT: { color: 'bg-blue-500', label: 'Necesita Contexto' },
    }

    const config = configs[verdict] || { color: 'bg-gray-500', label: verdict }

    return (
      <span className={`inline-flex text-xs ${config.color} text-white px-2 py-1 rounded font-medium`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header con botón de regreso */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/dashboard/actores')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Actores
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getTypeBadge(actor.type)}
              {actor.riskLevel && (
                <span className={`inline-flex text-sm px-3 py-1.5 rounded-lg font-semibold ${
                  actor.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                  actor.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                  actor.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  Riesgo: {actor.riskLevel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{actor.name}</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Creado: {formatDate(actor.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/dashboard/actores/${actorId}/editar`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Verificadas</span>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalVerified}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-emerald-700 font-medium">Verdaderas</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-700">{truthRate}%</p>
          <p className="text-xs text-emerald-600 mt-1">{verdictCounts.TRUE} declaraciones</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-700 font-medium">Falsas</span>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-700">{falseRate}%</p>
          <p className="text-xs text-red-600 mt-1">{verdictCounts.FALSE} declaraciones</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-700 font-medium">Otras</span>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-700">
            {verdictCounts.MIXED + verdictCounts.UNPROVEN + verdictCounts.NEEDS_CONTEXT}
          </p>
          <p className="text-xs text-amber-600 mt-1">Mixtas, no comprobadas, etc.</p>
        </div>
      </div>

      {/* Descripción */}
      {actor.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Descripción</h2>
          <p className="text-gray-700 leading-relaxed">{actor.description}</p>
        </div>
      )}

      {/* Gráfica de veredictos */}
      {totalVerified > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Distribución de Veredictos</h2>
          <div className="space-y-3">
            {Object.entries(verdictCounts).map(([verdict, count]) => {
              if (count === 0) return null
              const percentage = Math.round((count / totalVerified) * 100)
              const colors: Record<string, string> = {
                TRUE: 'bg-emerald-500',
                FALSE: 'bg-red-500',
                MIXED: 'bg-amber-500',
                UNPROVEN: 'bg-slate-500',
                NEEDS_CONTEXT: 'bg-blue-500',
              }

              return (
                <div key={verdict}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {verdict === 'TRUE' && 'Verdadero'}
                      {verdict === 'FALSE' && 'Falso'}
                      {verdict === 'MIXED' && 'Mixto'}
                      {verdict === 'UNPROVEN' && 'No Comprobado'}
                      {verdict === 'NEEDS_CONTEXT' && 'Necesita Contexto'}
                    </span>
                    <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
      )}

      {/* Verificaciones del actor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Declaraciones Verificadas ({publishedClaims.length})
        </h2>
        {publishedClaims.length > 0 ? (
          <div className="space-y-3">
            {publishedClaims.map((claim) => (
              <Link
                key={claim._id}
                href={`/admin/dashboard/claims/${claim._id}/review`}
                className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {claim.verdict && getVerdictBadge(claim.verdict)}
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        claim.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        claim.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        claim.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {claim.riskLevel}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{claim.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{claim.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(claim.publishedAt || claim.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay verificaciones publicadas para este actor</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">ID del actor:</span> {actorId}
          </div>
          <div>
            <span className="font-medium">Última actualización:</span>{' '}
            {formatDate(actor.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
