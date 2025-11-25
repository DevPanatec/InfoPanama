'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Clock, Search, Filter, TrendingUp, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'

// Demo data - en producción viene de Convex
const DEMO_CLAIMS = [
  {
    id: 'CLM-001',
    title: 'Gobierno anuncia inversión de $500 millones en infraestructura',
    description: 'El presidente anunció una inversión histórica de $500 millones para proyectos de infraestructura.',
    verdict: 'FALSE',
    riskLevel: 'MEDIUM',
    category: 'Política',
    publishedAt: '2024-01-15',
    views: 12500,
  },
  {
    id: 'CLM-002',
    title: 'Tasa de desempleo baja al 5% en el último trimestre',
    description: 'Cifras oficiales muestran una reducción significativa del desempleo.',
    verdict: 'TRUE',
    riskLevel: 'LOW',
    category: 'Economía',
    publishedAt: '2024-01-14',
    views: 8900,
  },
  {
    id: 'CLM-003',
    title: 'Nuevo hospital será inaugurado en marzo de 2024',
    description: 'Autoridades confirman fecha de apertura de nuevo centro de salud.',
    verdict: 'MIXED',
    riskLevel: 'LOW',
    category: 'Salud',
    publishedAt: '2024-01-13',
    views: 6700,
  },
  {
    id: 'CLM-004',
    title: 'Aumento del 30% en el presupuesto educativo para 2024',
    description: 'Ministerio de Educación anuncia incremento significativo en fondos.',
    verdict: 'MIXED',
    riskLevel: 'MEDIUM',
    category: 'Educación',
    publishedAt: '2024-01-12',
    views: 15200,
  },
  {
    id: 'CLM-005',
    title: 'Panamá registra récord histórico en exportaciones',
    description: 'Cifras del último año superan todas las expectativas económicas.',
    verdict: 'FALSE',
    riskLevel: 'HIGH',
    category: 'Economía',
    publishedAt: '2024-01-11',
    views: 20100,
  },
  {
    id: 'CLM-006',
    title: 'Metro de Panamá extenderá línea 3 hasta 2025',
    description: 'Proyecto de ampliación del sistema de transporte masivo.',
    verdict: 'TRUE',
    riskLevel: 'LOW',
    category: 'Infraestructura',
    publishedAt: '2024-01-10',
    views: 9500,
  },
]

const CATEGORIES = ['Todas', 'Política', 'Economía', 'Salud', 'Educación', 'Infraestructura']
const VERDICTS = ['Todos', 'Verdadero', 'Falso', 'Mixto']
const RISK_LEVELS = ['Todos', 'Bajo', 'Medio', 'Alto', 'Crítico']

export default function VerificacionesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedVerdict, setSelectedVerdict] = useState('Todos')
  const [selectedRisk, setSelectedRisk] = useState('Todos')
  const [sortBy, setSortBy] = useState('recent') // recent, popular, trending

  const verdictConfig = {
    TRUE: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      label: 'Verdadero',
    },
    FALSE: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Falso',
    },
    MIXED: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Mixto',
    },
  }

  const riskConfig = {
    LOW: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Bajo' },
    MEDIUM: { color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Medio' },
    HIGH: { color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Alto' },
    CRITICAL: { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Crítico' },
  }

  // Filtrar claims
  const filteredClaims = DEMO_CLAIMS.filter((claim) => {
    const matchesSearch = claim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Todas' || claim.category === selectedCategory
    const matchesVerdict = selectedVerdict === 'Todos' ||
                          verdictConfig[claim.verdict as keyof typeof verdictConfig].label === selectedVerdict
    const matchesRisk = selectedRisk === 'Todos' ||
                       riskConfig[claim.riskLevel as keyof typeof riskConfig].label === selectedRisk

    return matchesSearch && matchesCategory && matchesVerdict && matchesRisk
  })

  // Ordenar claims
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (sortBy === 'popular') return b.views - a.views
    if (sortBy === 'trending') return b.views - a.views // En producción sería por engagement reciente
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() // recent
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Verificaciones
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Todas las afirmaciones verificadas por InfoPanama. Busca, filtra y descubre la verdad detrás de las noticias.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar verificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sort By */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ordenar por
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'recent', label: 'Más recientes', icon: Clock },
                  { value: 'popular', label: 'Más vistas', icon: TrendingUp },
                  { value: 'trending', label: 'Tendencia', icon: TrendingUp },
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
                        sortBy === option.value
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categoría
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                      selectedCategory === category
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Verdict Filter */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Veredicto</h3>
              <div className="space-y-2">
                {VERDICTS.map((verdict) => (
                  <button
                    key={verdict}
                    onClick={() => setSelectedVerdict(verdict)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                      selectedVerdict === verdict
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {verdict}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Level Filter */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Nivel de Riesgo
              </h3>
              <div className="space-y-2">
                {RISK_LEVELS.map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setSelectedRisk(risk)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                      selectedRisk === risk
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Claims List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {sortedClaims.length} {sortedClaims.length === 1 ? 'Verificación' : 'Verificaciones'}
              </h2>
              {(searchQuery || selectedCategory !== 'Todas' || selectedVerdict !== 'Todos' || selectedRisk !== 'Todos') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('Todas')
                    setSelectedVerdict('Todos')
                    setSelectedRisk('Todos')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Claims List */}
            {sortedClaims.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No se encontraron verificaciones
                </h3>
                <p className="text-slate-500">
                  Intenta ajustar los filtros o la búsqueda
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedClaims.map((claim) => {
                  const config = verdictConfig[claim.verdict as keyof typeof verdictConfig]
                  const VerdictIcon = config.icon
                  const riskCfg = riskConfig[claim.riskLevel as keyof typeof riskConfig]

                  return (
                    <Link
                      key={claim.id}
                      href={`/verificaciones/${claim.id}`}
                      className="block bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Verdict Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                          <VerdictIcon className={`h-6 w-6 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition line-clamp-2">
                              {claim.title}
                            </h3>
                            <span className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${riskCfg.bgColor} ${riskCfg.color}`}>
                              {riskCfg.label}
                            </span>
                          </div>

                          <p className="text-slate-600 mb-4 line-clamp-2">
                            {claim.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(claim.publishedAt).toLocaleDateString('es-PA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-blue-600">{claim.category}</span>
                            <span className="text-slate-300">•</span>
                            <span className={`font-medium ${config.color}`}>{config.label}</span>
                            <span className="text-slate-300">•</span>
                            <span>{claim.views.toLocaleString()} vistas</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Pagination - Placeholder */}
            {sortedClaims.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
                    Anterior
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">
                    1
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    2
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    3
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
