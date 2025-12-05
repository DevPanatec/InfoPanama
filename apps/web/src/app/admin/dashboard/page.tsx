'use client'

import { FileCheck, Users, Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export default function DashboardPage() {
  const router = useRouter()

  // Obtener estadísticas reales de Convex
  const stats = useQuery(api.claims.getStats, {})
  const recentClaims = useQuery(api.claims.list, { limit: 5 })
  const highRiskClaims = useQuery(api.claims.getHighRisk, { limit: 2 })

  // Loading state
  if (!stats || !recentClaims) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500">Resumen general del sistema de verificación</p>
      </div>

      {/* Stats Cards - Diseño limpio y profesional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 - Total Verificaciones */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/10 p-2.5 rounded-lg">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              12%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total}</div>
          <div className="text-sm text-slate-300">Total Verificaciones</div>
        </div>

        {/* Card 2 - En Investigación */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/10 p-2.5 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              {stats.investigating}
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.investigating}</div>
          <div className="text-sm text-blue-100">En Investigación</div>
        </div>

        {/* Card 3 - Publicadas */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/10 p-2.5 rounded-lg">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <ArrowUpRight className="h-3 w-3" />
              {stats.published}
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.published}</div>
          <div className="text-sm text-slate-300">Publicadas</div>
        </div>

        {/* Card 4 - Claims Alto Riesgo */}
        <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/10 p-2.5 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-rose-400 text-xs font-medium">
              <ArrowDownRight className="h-3 w-3" />
              {highRiskClaims?.length || 0}
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{highRiskClaims?.length || 0}</div>
          <div className="text-sm text-slate-300">Claims Alto Riesgo</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verificaciones Recientes */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Verificaciones Recientes</h2>
            <button
              onClick={() => router.push('/admin/dashboard/claims')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentClaims.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500">
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
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{claim.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{timeAgo}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Alertas Importantes */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Alertas Importantes</h2>
            <span className="bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded-full">2 nuevas</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Alerta Alta */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Actor crítico detectado</p>
                  <p className="text-xs text-slate-600 mt-0.5">Requiere revisión DD inmediata</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-700 font-medium">Alta prioridad</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Hace 10 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta Media */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Claim de alto impacto</p>
                  <p className="text-xs text-slate-600 mt-0.5">Veredicto pendiente de publicación</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-blue-700 font-medium">Media prioridad</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Hace 1 hora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta Baja */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Nuevo actor registrado</p>
                  <p className="text-xs text-slate-600 mt-0.5">Requiere análisis de credibilidad</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-600 font-medium">Baja prioridad</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Hace 3 horas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
