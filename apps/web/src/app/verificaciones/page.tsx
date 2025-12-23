'use client'

import { CheckCircle2, XCircle, HelpCircle, Loader2, Search, Filter, X, ArrowRight } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerificacionesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'all' // 🔥 NUEVO: Leer categoría del URL

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory) // 🔥 NUEVO: Inicializar con URL
  const [selectedRisk, setSelectedRisk] = useState<string>('all')

  // Queries - 🔥 OPTIMIZADO: Solo 50 claims en lugar de 200
  const allClaims = useQuery(api.claims.list, {
    status: 'published',
    limit: 50 // 🔥 REDUCIDO de 200 a 50 para velocidad
  })

  const categories = useQuery(api.claims.getCategories, {})

  // Filtrar claims localmente
  const filteredClaims = allClaims?.filter((claim) => {
    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = claim.title?.toLowerCase().includes(query)
      const matchesText = claim.claimText?.toLowerCase().includes(query)
      const matchesDescription = claim.description?.toLowerCase().includes(query)
      const matchesTags = claim.tags?.some(tag => tag.toLowerCase().includes(query))

      if (!matchesTitle && !matchesText && !matchesDescription && !matchesTags) {
        return false
      }
    }

    // Filtro de veredicto
    if (selectedVerdict !== 'all' && claim.verdict !== selectedVerdict) {
      return false
    }

    // Filtro de categoría
    if (selectedCategory !== 'all' && claim.category !== selectedCategory) {
      return false
    }

    // Filtro de nivel de riesgo
    if (selectedRisk !== 'all' && claim.riskLevel !== selectedRisk) {
      return false
    }

    return true
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedVerdict('all')
    setSelectedCategory('all')
    setSelectedRisk('all')
    router.push('/verificaciones')
  }

  const hasActiveFilters = searchQuery || selectedVerdict !== 'all' || selectedCategory !== 'all' || selectedRisk !== 'all'

  if (!allClaims || !categories) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-soft-blue/30">
        <Loader2 className="h-8 w-8 animate-spin text-digital-blue" />
      </div>
    )
  }

  const getVerdictInfo = (verdict: string | undefined | null) => {
    const configs: Record<string, { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }> = {
      TRUE: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-500', label: 'Verdadero' },
      FALSE: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-500', label: 'Falso' },
      MIXED: { icon: HelpCircle, color: 'text-amber-600', bgColor: 'bg-amber-500', label: 'Mixto' },
      UNPROVEN: { icon: HelpCircle, color: 'text-slate-600', bgColor: 'bg-slate-500', label: 'No Comprobado' },
      NEEDS_CONTEXT: { icon: HelpCircle, color: 'text-blue-600', bgColor: 'bg-blue-500', label: 'Necesita Contexto' },
    }

    return configs[verdict || 'UNPROVEN'] || configs.UNPROVEN
  }

  return (
    <div className="min-h-screen bg-soft-blue/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-verifica-blue via-deep-blue to-verifica-blue text-white py-12 mb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Verificaciones</h1>
          <p className="text-lg text-soft-blue max-w-3xl">
            Verificaciones completadas y aprobadas por nuestro equipo de fact-checking
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-7xl">
        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-lg">
          {/* Búsqueda */}
          <div className="mb-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-gray h-5 w-5 group-focus-within:text-digital-blue transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, texto, descripción o tags..."
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-digital-blue transition-all text-deep-blue placeholder:text-blue-gray hover:border-digital-blue"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Veredicto */}
            <div>
              <label className="block text-sm font-semibold text-deep-blue mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Veredicto
              </label>
              <select
                value={selectedVerdict}
                onChange={(e) => setSelectedVerdict(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-digital-blue transition-all bg-white text-deep-blue font-medium hover:border-digital-blue"
              >
                <option value="all">Todos</option>
                <option value="TRUE">Verdadero</option>
                <option value="FALSE">Falso</option>
                <option value="MIXED">Mixto</option>
                <option value="UNPROVEN">No Comprobado</option>
                <option value="NEEDS_CONTEXT">Necesita Contexto</option>
              </select>
            </div>

            {/* Filtro de Categoría */}
            <div>
              <label className="block text-sm font-semibold text-deep-blue mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-digital-blue transition-all bg-white text-deep-blue font-medium hover:border-digital-blue"
              >
                <option value="all">Todas</option>
                {categories.map((cat: any) => (
                  <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
                ))}
              </select>
            </div>

            {/* Filtro de Riesgo */}
            <div>
              <label className="block text-sm font-semibold text-deep-blue mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Nivel de Riesgo
              </label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-digital-blue transition-all bg-white text-deep-blue font-medium hover:border-digital-blue"
              >
                <option value="all">Todos</option>
                <option value="CRITICAL">Crítico</option>
                <option value="HIGH">Alto</option>
                <option value="MEDIUM">Medio</option>
                <option value="LOW">Bajo</option>
              </select>
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-blue-gray font-medium">
                {filteredClaims?.length || 0} resultado{(filteredClaims?.length || 0) !== 1 ? 's' : ''} encontrado{(filteredClaims?.length || 0) !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-deep-blue bg-soft-blue rounded-lg hover:bg-digital-blue hover:text-white transition-all font-semibold"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Resultados */}
        {!filteredClaims || filteredClaims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="max-w-md mx-auto">
              <HelpCircle className="h-16 w-16 text-blue-gray mx-auto mb-4 opacity-50" />
              <p className="text-lg text-deep-blue font-semibold mb-2">No se encontraron verificaciones</p>
              <p className="text-blue-gray">
                {searchQuery || hasActiveFilters ? 'Intenta ajustar tus filtros de búsqueda' : 'No hay verificaciones publicadas todavía'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClaims.map((claim: any) => {
              const verdictInfo = getVerdictInfo(claim.verdict)
              const Icon = verdictInfo.icon

              return (
                <Link
                  key={claim._id}
                  href={`/verificaciones/${claim._id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-digital-blue hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex gap-6">
                      {/* Image or Icon */}
                      <div className="flex-shrink-0">
                        {claim.imageUrl ? (
                          <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 relative">
                            <img
                              src={claim.imageUrl}
                              alt={claim.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className={`absolute bottom-2 right-2 w-8 h-8 ${verdictInfo.bgColor} rounded-lg flex items-center justify-center shadow-lg`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className={`w-32 h-32 ${verdictInfo.bgColor} rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}>
                            <Icon className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header: Verdict + Risk Level */}
                        <div className="flex items-start justify-between mb-3 gap-4">
                          <div className={`flex items-center gap-2 ${verdictInfo.color} font-bold text-sm`}>
                            <Icon className="h-5 w-5" />
                            {verdictInfo.label}
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                              claim.riskLevel === 'CRITICAL'
                                ? 'bg-red-100 text-red-700'
                                : claim.riskLevel === 'HIGH'
                                ? 'bg-orange-100 text-orange-700'
                                : claim.riskLevel === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {claim.riskLevel === 'CRITICAL'
                              ? 'Crítico'
                              : claim.riskLevel === 'HIGH'
                              ? 'Alto'
                              : claim.riskLevel === 'MEDIUM'
                              ? 'Medio'
                              : 'Bajo'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold mb-2 text-deep-blue group-hover:text-digital-blue transition-colors line-clamp-2">
                          {claim.title}
                        </h3>

                        {/* Claim text */}
                        {claim.claimText && (
                          <p className="text-base mb-3 text-blue-gray italic line-clamp-2 leading-relaxed">
                            "{claim.claimText}"
                          </p>
                        )}

                        {/* Description */}
                        {claim.description && (
                          <p className="text-sm text-blue-gray mb-3 line-clamp-2 leading-relaxed">
                            {claim.description}
                          </p>
                        )}

                        {/* Tags y Categoría */}
                        <div className="flex flex-wrap gap-2 items-center mb-3">
                          {claim.category && (
                            <span className="px-3 py-1 bg-digital-blue/10 text-digital-blue rounded-full text-xs font-bold">
                              {claim.category}
                            </span>
                          )}
                          {claim.tags && claim.tags.length > 0 && claim.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-soft-blue text-blue-gray rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-digital-blue font-semibold text-sm group-hover:gap-3 transition-all">
                          Leer verificación completa
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
