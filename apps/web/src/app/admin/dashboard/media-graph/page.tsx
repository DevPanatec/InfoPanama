'use client'

import { useState, useEffect, useRef } from 'react'
import { MediaGraph } from '@/components/graph/MediaGraph'
import { GraphFilters, type GraphFilterOptions } from '@/components/graph/GraphFilters'
import { Download, Plus, Sparkles, Loader2, Link2, RefreshCw } from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export default function MediaGraphPage() {
  const [filters, setFilters] = useState<GraphFilterOptions>({
    minStrength: 0,
    selectedRelationTypes: [],
    selectedEntityTypes: [],
    showIsolatedNodes: true,
    searchQuery: '',
    zoomLevel: 100,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingCoMentions, setIsGeneratingCoMentions] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const hasAutoAnalyzed = useRef(false)

  // Funciones de análisis con IA
  const analyzeBatch = useAction(api.graphAnalysis.analyzeBatchArticles)
  // @ts-ignore - Function has 'any' type to avoid circular dependencies
  const generateCoMentions = useAction(api.graphAnalysis.generateCoMentionRelations)
  const reanalyzeMarked = useAction(api.graphAnalysis.reanalyzeMarkedEntities)
  const articles = useQuery(api.articles.list, { limit: 10 })
  const graphStats = useQuery(api.entityRelations.getGraphStats)
  const markedEntities = useQuery(api.entities.getMarkedForReview, { limit: 50 })

  const handleAnalyzeWithAI = async () => {
    console.log('🔍 handleAnalyzeWithAI llamado', { articles: articles?.length })

    if (!articles || articles.length === 0) {
      setAnalysisResult('No hay artículos para analizar')
      setTimeout(() => setAnalysisResult(null), 3000)
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const articleIds = articles.map(a => a._id)
      console.log('📤 Enviando artículos para análisis:', articleIds)
      const result = await analyzeBatch({ articleIds })
      console.log('✅ Resultado del análisis:', result)

      setAnalysisResult(
        `✓ Análisis completado: ${result.successful} artículos procesados exitosamente, ${result.failed} fallaron`
      )
      setTimeout(() => setAnalysisResult(null), 5000)
    } catch (error) {
      console.error('Error analyzing articles:', error)
      setAnalysisResult('Error al analizar artículos')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateCoMentions = async () => {
    console.log('🔗 Generando co-menciones...')

    setIsGeneratingCoMentions(true)
    setAnalysisResult(null)

    try {
      const result = await generateCoMentions({})
      console.log('✅ Co-menciones generadas:', result)

      if (result.success) {
        setAnalysisResult(
          `✓ Co-menciones generadas: ${result.relationsCreated} conexiones creadas entre ${result.uniquePairs} pares únicos de entidades (${result.articlesProcessed} artículos procesados)`
        )
      } else {
        setAnalysisResult(result.message || 'Error al generar co-menciones')
      }
      setTimeout(() => setAnalysisResult(null), 6000)
    } catch (error) {
      console.error('Error generando co-menciones:', error)
      setAnalysisResult('Error al generar co-menciones')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsGeneratingCoMentions(false)
    }
  }

  const handleReanalyzeMarked = async () => {
    console.log('🔄 Reanalizando entidades marcadas...')

    if (!markedEntities || markedEntities.length === 0) {
      setAnalysisResult('No hay entidades marcadas para revisión')
      setTimeout(() => setAnalysisResult(null), 3000)
      return
    }

    setIsReanalyzing(true)
    setAnalysisResult(null)

    try {
      const result = await reanalyzeMarked({ limit: 10 })
      console.log('✅ Resultado del reanálisis:', result)

      if (result.success) {
        setAnalysisResult(
          `✓ Reanálisis completado: ${result.processed} entidades procesadas, ${result.newRelations} nuevas relaciones encontradas`
        )
      } else {
        setAnalysisResult(result.message || 'Error al reanalizar entidades')
      }
      setTimeout(() => setAnalysisResult(null), 6000)
    } catch (error) {
      console.error('Error reanalizando entidades:', error)
      setAnalysisResult('Error al reanalizar entidades')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsReanalyzing(false)
    }
  }

  // Auto-analizar si no hay datos en el grafo
  useEffect(() => {
    if (
      !hasAutoAnalyzed.current &&
      graphStats &&
      graphStats.totalNodes === 0 &&
      articles &&
      articles.length > 0 &&
      !isAnalyzing
    ) {
      hasAutoAnalyzed.current = true
      handleAnalyzeWithAI()
    }
  }, [graphStats, articles, isAnalyzing, handleAnalyzeWithAI])

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900" data-tutorial="dashboard-title">
            Grafo OSINT de Entidades
          </h1>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <GraphFilters
              onFiltersChange={setFilters}
              stats={graphStats}
              onSearchEntity={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
              onZoomChange={(zoom) => setFilters(prev => ({ ...prev, zoomLevel: zoom }))}
            />
            <button
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || !articles || articles.length === 0}
              className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center gap-2 flex-1 lg:flex-none justify-center"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Analizar con IA</span>
                </>
              )}
            </button>
            <button
              onClick={handleGenerateCoMentions}
              disabled={isGeneratingCoMentions}
              className="px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center gap-2 flex-1 lg:flex-none justify-center"
            >
              {isGeneratingCoMentions ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generando...</span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Co-menciones</span>
                </>
              )}
            </button>
            <button
              onClick={handleReanalyzeMarked}
              disabled={isReanalyzing || !markedEntities || markedEntities.length === 0}
              className="px-3 md:px-4 py-2 bg-amber-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center gap-2 flex-1 lg:flex-none justify-center relative"
              title={`Reanalizar ${markedEntities?.length || 0} entidades marcadas`}
            >
              {isReanalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Reanalizando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reanalizar</span>
                  {markedEntities && markedEntities.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {markedEntities.length}
                    </span>
                  )}
                </>
              )}
            </button>
            <button className="px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 flex-1 lg:flex-none justify-center">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva</span>
            </button>
            <button className="px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 flex-1 lg:flex-none justify-center">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {analysisResult && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            analysisResult.startsWith('✓')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {analysisResult}
          </div>
        )}

        {/* Active Search/Filters Indicator */}
        {(filters.searchQuery ||
          filters.minStrength > 0 ||
          filters.selectedRelationTypes.length > 0 ||
          filters.selectedEntityTypes.length > 0 ||
          !filters.showIsolatedNodes) && (
          <div className="mb-4 px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Filtros activos:</span>
              {filters.searchQuery && (
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">
                  Búsqueda: "{filters.searchQuery}"
                </span>
              )}
              {filters.minStrength > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">
                  Fuerza ≥ {filters.minStrength}%
                </span>
              )}
              {filters.selectedEntityTypes.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">
                  {filters.selectedEntityTypes.length} tipo(s) de entidad
                </span>
              )}
              {filters.selectedRelationTypes.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">
                  {filters.selectedRelationTypes.length} tipo(s) de relación
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-slate-600">
          Visualización de relaciones entre actores, medios y eventos
        </p>
      </div>

      {/* Graph - Responsive y adaptable */}
      <div className="rounded-lg overflow-hidden shadow-2xl">
        <MediaGraph
          filters={filters}
          height="calc(100vh - 280px)"
        />
      </div>
    </div>
  )
}
