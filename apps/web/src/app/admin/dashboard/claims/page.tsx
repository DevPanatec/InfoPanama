'use client'

import { CheckCircle2, XCircle, HelpCircle, Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@infopanama/convex'
import { NewClaimModal } from '@/components/admin/NewClaimModal'
import { toast } from 'sonner'

export default function ClaimsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'new' | 'investigating' | 'review' | 'approved' | 'rejected' | 'published' | ''>('')
  const [riskFilter, setRiskFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Obtener claims reales de Convex
  const allClaims = useQuery(api.claims.list, {
    status: statusFilter || undefined,
    limit: 100
  })

  const createClaim = useMutation(api.claims.create)

  const handleNewClaim = async (claimData: {
    title: string
    description: string
    claimText: string
    sourceType: string
    sourceUrl?: string
    imageUrl?: string
    riskLevel: string
    category?: string
    actorId?: any
    sourceId?: any
  }) => {
    const toastId = toast.loading('Creando verificación...')

    try {
      const claimId = await createClaim({
        title: claimData.title,
        description: claimData.description,
        claimText: claimData.claimText,
        sourceType: claimData.sourceType as any,
        sourceUrl: claimData.sourceUrl,
        imageUrl: claimData.imageUrl,
        riskLevel: claimData.riskLevel as any,
        category: claimData.category,
        actorId: claimData.actorId,
        sourceId: claimData.sourceId,
        status: 'new',
      })

      toast.success('Verificación creada correctamente', {
        id: toastId,
        description: 'Redirigiendo a la página de revisión...',
      })

      router.push(`/admin/dashboard/claims/${claimId}/review`)
    } catch (error) {
      console.error('Error al crear verificación:', error)
      toast.error('Error al crear verificación', {
        id: toastId,
        description: 'Por favor, verifica los logs e intenta nuevamente.',
      })
    }
  }

  // Filtrar claims por búsqueda y nivel de riesgo (status ya filtrado en query)
  const filteredClaims = (allClaims || []).filter((claim) => {
    if (!searchQuery && !riskFilter) return true

    const query = searchQuery.toLowerCase().trim()

    // Buscar en múltiples campos
    const matchesSearch = !query || (
      claim.claimText.toLowerCase().includes(query) ||
      (claim.title && claim.title.toLowerCase().includes(query)) ||
      (claim.description && claim.description.toLowerCase().includes(query)) ||
      (claim.sourceUrl && claim.sourceUrl.toLowerCase().includes(query)) ||
      (claim.tags && claim.tags.some(tag => tag.toLowerCase().includes(query))) ||
      // Buscar en el ID del claim también
      claim._id.toLowerCase().includes(query)
    )

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
      review: { className: 'bg-amber-500/10 text-amber-600', label: 'En Revisión' },
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
            <h1 data-tutorial="claims-title" className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              Verificaciones
            </h1>
            <p className="text-gray-600 text-lg">Revisión y gestión de verificaciones generadas por IA</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Nueva Verificación
          </button>
        </div>

        <NewClaimModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewClaim}
        />
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

      {/* Contador de resultados */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-bold text-gray-900">{filteredClaims.length}</span> de{' '}
          <span className="font-bold text-gray-900">{allClaims.length}</span> verificaciones
          {searchQuery && (
            <span className="ml-2 text-blue-600">
              • Búsqueda: "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
        {(searchQuery || statusFilter || riskFilter) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('')
              setRiskFilter('')
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filters con diseño mejorado */}
      <div className="mb-6 flex gap-4">
        <select
          data-tutorial="claims-status-filter"
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
          data-tutorial="claims-risk-filter"
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
            data-tutorial="claims-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, palabra clave, fuente, etiqueta... (ej: Sicarelli, Hombres de Blanco)"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
          />
        </div>
      </div>

      {/* Table con diseño mejorado */}
      <div data-tutorial="claims-list" className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
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
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-semibold text-gray-600 mb-2">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : 'No hay verificaciones que coincidan con los filtros'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchQuery
                        ? 'Intenta con otro término de búsqueda'
                        : 'Ajusta los filtros o limpia la búsqueda'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim, index) => (
              <tr
                key={claim._id}
                className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                    "{claim.claimText}"
                  </p>
                  {claim.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{claim.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">ID: {claim._id}</p>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
