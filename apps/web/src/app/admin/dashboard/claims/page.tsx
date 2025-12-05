'use client'

import { CheckCircle2, XCircle, HelpCircle, Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export default function ClaimsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'new' | 'investigating' | 'review' | 'approved' | 'rejected' | 'published' | ''>('')
  const [riskFilter, setRiskFilter] = useState('')

  // Obtener claims reales de Convex
  const allClaims = useQuery(api.claims.list, {
    status: statusFilter || undefined,
    limit: 100
  })

  // Filtrar claims por búsqueda y nivel de riesgo (status ya filtrado en query)
  const filteredClaims = (allClaims || []).filter((claim) => {
    const matchesSearch = claim.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = !riskFilter || claim.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const getVerdictBadge = (verdict: string | null) => {
    if (!verdict)
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-gray-500/10 text-gray-500 px-2 py-1 rounded-full font-semibold">
          <HelpCircle className="h-3 w-3" />
          Pendiente
        </span>
      )

    const configs: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
      TRUE: { icon: CheckCircle2, className: 'bg-green-500/10 text-green-600', label: 'Verdadero' },
      FALSE: { icon: XCircle, className: 'bg-red-500/10 text-red-600', label: 'Falso' },
    }

    const config = configs[verdict] || configs.FALSE
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 text-xs ${config.className} px-2 py-1 rounded-full font-semibold`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string; label: string }> = {
      new: { className: 'bg-blue-500/10 text-blue-600', label: 'Nueva' },
      investigating: { className: 'bg-yellow-500/10 text-yellow-600', label: 'Investigando' },
      review: { className: 'bg-purple-500/10 text-purple-600', label: 'En Revisión' },
      published: { className: 'bg-green-500/10 text-green-600', label: 'Publicada' },
    }

    const config = configs[status] || configs.new

    return (
      <span className={`inline-flex text-xs ${config.className} px-3 py-1 rounded-full font-semibold`}>
        {config.label}
      </span>
    )
  }

  const getRiskBadge = (level: string) => {
    const configs: Record<string, { className: string; label: string }> = {
      LOW: { className: 'bg-green-500/10 text-green-600', label: 'Bajo' },
      MEDIUM: { className: 'bg-yellow-500/10 text-yellow-600', label: 'Medio' },
      HIGH: { className: 'bg-orange-500/10 text-orange-600', label: 'Alto' },
      CRITICAL: { className: 'bg-red-500/10 text-red-600', label: 'Crítico' },
    }

    const config = configs[level] || configs.LOW

    return (
      <span className={`inline-flex text-xs ${config.className} px-3 py-1 rounded-full font-semibold`}>
        {config.label}
      </span>
    )
  }

  // Loading state
  if (!allClaims) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando verificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Header con gradiente */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Verificaciones
            </h1>
            <p className="text-gray-600 text-lg">Revisión y gestión de verificaciones generadas por IA</p>
          </div>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Las verificaciones son generadas automáticamente por IA</p>
              <p className="text-xs text-blue-700">Tu rol como administrador es revisar, editar si es necesario, y aprobar las verificaciones antes de publicarlas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters con diseño mejorado */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="new">Nueva</option>
          <option value="investigating">Investigando</option>
          <option value="review">En Revisión</option>
          <option value="published">Publicada</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
        >
          <option value="">Todos los riesgos</option>
          <option value="LOW">Bajo</option>
          <option value="MEDIUM">Medio</option>
          <option value="HIGH">Alto</option>
          <option value="CRITICAL">Crítico</option>
        </select>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar verificaciones..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
          />
        </div>
      </div>

      {/* Table con diseño mejorado */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Verificación</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Estado</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Veredicto</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Riesgo</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Fecha</th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((claim, index) => (
              <tr
                key={claim._id}
                className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{claim.title}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {claim._id}</p>
                </td>
                <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                <td className="px-6 py-4">{getVerdictBadge(claim.verdict || null)}</td>
                <td className="px-6 py-4">{getRiskBadge(claim.riskLevel)}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {new Date(claim.createdAt).toLocaleDateString('es-PA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  {claim.status === 'published' ? (
                    <button
                      onClick={() => router.push(`/verificaciones/${claim._id}`)}
                      className="text-sm text-gray-600 hover:text-gray-700 font-semibold hover:underline"
                    >
                      Ver publicada →
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/admin/dashboard/claims/${claim._id}/review`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1 justify-end"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Revisar y Aprobar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
