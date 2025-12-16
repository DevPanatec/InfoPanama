'use client'

import { FileCheck, Users, Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import OnboardingTutorial from '@/components/admin/OnboardingTutorial'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const [showTutorial, setShowTutorial] = useState(false)

  // Mostrar tutorial solo la primera vez (usando localStorage)
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }, [])

  const handleCompleteTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true')
    setShowTutorial(false)
  }

  // Obtener estadísticas reales de Convex
  const stats = useQuery(api.claims.getStats, {})
  const recentClaims = useQuery(api.claims.list, { limit: 5 })
  const highRiskClaims = useQuery(api.claims.getHighRisk, { limit: 2 })
  const allClaims = useQuery(api.claims.list, { limit: 1000 })
  const allActors = useQuery(api.actors.list, { limit: 100 })

  // Loading state
  if (!stats || !recentClaims || !allClaims || !allActors) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Calcular estadísticas de veredictos
  const publishedClaims = allClaims.filter(c => c.status === 'published')
  const verdictCounts = {
    TRUE: publishedClaims.filter(c => c.verdict === 'TRUE').length,
    FALSE: publishedClaims.filter(c => c.verdict === 'FALSE').length,
    MIXED: publishedClaims.filter(c => c.verdict === 'MIXED').length,
    UNPROVEN: publishedClaims.filter(c => c.verdict === 'UNPROVEN').length,
    NEEDS_CONTEXT: publishedClaims.filter(c => c.verdict === 'NEEDS_CONTEXT').length,
  }

  const totalWithVerdict = Object.values(verdictCounts).reduce((a, b) => a + b, 0)

  // Top actores con más verificaciones
  const actorClaimCounts = allClaims.reduce((acc, claim) => {
    if (claim.actorId) {
      acc[claim.actorId] = (acc[claim.actorId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topActors = Object.entries(actorClaimCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([actorId, count]) => {
      const actor = allActors.find(a => a._id === actorId)
      return actor ? { actor, count } : null
    })
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 data-tutorial="dashboard-title" className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Resumen del sistema de verificación</p>
        </div>

        {/* Stats Cards */}
        <div data-tutorial="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <FileCheck className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Verificaciones</div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.investigating}</div>
                <div className="text-sm text-slate-600">En Investigación</div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.published}</div>
                <div className="text-sm text-slate-600">Publicadas</div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-red-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{highRiskClaims?.length || 0}</div>
                <div className="text-sm text-slate-600">Alto Riesgo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Distribución de Veredictos */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Distribución de Veredictos</h2>
              <p className="text-sm text-slate-500 mt-1">{totalWithVerdict} verificaciones publicadas</p>
            </div>
            <div className="p-6 space-y-4">
              {totalWithVerdict === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay verificaciones publicadas</p>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-900">Verdadero</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {verdictCounts.TRUE} ({Math.round((verdictCounts.TRUE / totalWithVerdict) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-emerald-500 h-3 rounded-full transition-all"
                        style={{ width: `${(verdictCounts.TRUE / totalWithVerdict) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-900">Falso</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {verdictCounts.FALSE} ({Math.round((verdictCounts.FALSE / totalWithVerdict) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all"
                        style={{ width: `${(verdictCounts.FALSE / totalWithVerdict) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-900">Mixto</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {verdictCounts.MIXED} ({Math.round((verdictCounts.MIXED / totalWithVerdict) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-amber-500 h-3 rounded-full transition-all"
                        style={{ width: `${(verdictCounts.MIXED / totalWithVerdict) * 100}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top Actores */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Top Actores</h2>
                <p className="text-sm text-slate-500 mt-1">Políticos más verificados</p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard/actores')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos →
              </button>
            </div>
            <div className="p-6">
              {topActors.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay actores con verificaciones</p>
              ) : (
                <div className="space-y-3">
                  {topActors.map((item, index) => (
                    <div
                      key={item!.actor._id}
                      onClick={() => router.push(`/admin/dashboard/actores/${item!.actor._id}`)}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item!.actor.name}</p>
                        <p className="text-sm text-slate-500">{item!.count} verificaciones</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verificaciones Recientes */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Verificaciones Recientes</h2>
              <p className="text-sm text-slate-500 mt-1">Últimas verificaciones del sistema</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard/claims')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentClaims.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                <p>No hay claims recientes</p>
              </div>
            ) : (
              recentClaims.map((claim) => {
                const getStatusDisplay = (status: string) => {
                  const statusMap: Record<string, { label: string, color: string }> = {
                    'new': { label: 'Nueva', color: 'bg-sky-100 text-sky-700' },
                    'investigating': { label: 'Investigando', color: 'bg-amber-100 text-amber-700' },
                    'review': { label: 'En revisión', color: 'bg-blue-100 text-blue-700' },
                    'approved': { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
                    'rejected': { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
                    'published': { label: 'Publicado', color: 'bg-emerald-100 text-emerald-700' },
                  }
                  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
                }

                const statusDisplay = getStatusDisplay(claim.status)
                const timeAgo = new Date(claim._creationTime).toLocaleString('es-PA', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <div
                    key={claim._id}
                    onClick={() => router.push(`/admin/dashboard/claims/${claim._id}`)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{claim.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{timeAgo}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Tutorial de Onboarding */}
        {showTutorial && (
          <OnboardingTutorial onComplete={handleCompleteTutorial} />
        )}
      </div>
    </div>
  )
}
