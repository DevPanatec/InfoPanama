'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MediaGraph } from '@/components/graph/MediaGraph'
import { GraphFilters, type GraphFilterOptions } from '@/components/graph/GraphFilters'
import { Download, Plus, Sparkles, Loader2, Link2, RefreshCw, BarChart3, FileJson, FileText } from 'lucide-react'
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
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showMetricsPanel, setShowMetricsPanel] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const hasAutoAnalyzed = useRef(false)

  // Funciones de análisis con IA
  const analyzeBatch = useAction(api.graphAnalysis.analyzeBatchArticles)
  // @ts-ignore - Function has 'any' type to avoid circular dependencies
  const generateCoMentions = useAction(api.graphAnalysis.generateCoMentionRelations)
  const reanalyzeMarked = useAction(api.graphAnalysis.reanalyzeMarkedEntities)
  const articles = useQuery(api.articles.list, { limit: 10 })
  const graphStats = useQuery(api.entityRelations.getGraphStats)
  const markedEntities = useQuery(api.nodeReview.getMarkedNodes, { limit: 50 })
  const exportStats = useQuery(api.graphExport.getExportStats)
  const degreeMetrics = useQuery(api.graphMetrics.calculateDegreeMetrics)
  const importantNodes = useQuery(api.graphMetrics.getMostImportantNodes)

  const handleAnalyzeWithAI = useCallback(async () => {
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
  }, [articles, analyzeBatch])

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

  // Funciones de exportación
  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const data = await import('@infopanama/convex').then(m => m.api.graphExport.exportGraphJSON)
      // Download JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `osint-graph-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setAnalysisResult('✓ Grafo exportado en formato JSON')
      setTimeout(() => setAnalysisResult(null), 3000)
    } catch (error) {
      console.error('Error exportando JSON:', error)
      setAnalysisResult('Error al exportar JSON')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
    }
  }

  const handleExportCSVNodes = async () => {
    setIsExporting(true)
    try {
      const csvData = await import('@infopanama/convex').then(m => m.api.graphExport.exportNodesCSV)
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `osint-nodes-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setAnalysisResult('✓ Nodos exportados en formato CSV')
      setTimeout(() => setAnalysisResult(null), 3000)
    } catch (error) {
      console.error('Error exportando CSV nodes:', error)
      setAnalysisResult('Error al exportar CSV')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
    }
  }

  const handleExportCSVEdges = async () => {
    setIsExporting(true)
    try {
      const csvData = await import('@infopanama/convex').then(m => m.api.graphExport.exportEdgesCSV)
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `osint-edges-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setAnalysisResult('✓ Relaciones exportadas en formato CSV')
      setTimeout(() => setAnalysisResult(null), 3000)
    } catch (error) {
      console.error('Error exportando CSV edges:', error)
      setAnalysisResult('Error al exportar CSV')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
    }
  }

  const handleExportGEXF = async () => {
    setIsExporting(true)
    try {
      const gexfData = await import('@infopanama/convex').then(m => m.api.graphExport.exportGraphGEXF)
      const blob = new Blob([gexfData], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `osint-graph-${new Date().toISOString().split('T')[0]}.gexf`
      a.click()
      URL.revokeObjectURL(url)
      setAnalysisResult('✓ Grafo exportado en formato GEXF (Gephi)')
      setTimeout(() => setAnalysisResult(null), 3000)
    } catch (error) {
      console.error('Error exportando GEXF:', error)
      setAnalysisResult('Error al exportar GEXF')
      setTimeout(() => setAnalysisResult(null), 3000)
    } finally {
      setIsExporting(false)
      setShowExportMenu(false)
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
            {/* Botón Métricas */}
            <button
              onClick={() => setShowMetricsPanel(!showMetricsPanel)}
              className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-purple-700 transition flex items-center gap-2 flex-1 lg:flex-none justify-center"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Métricas</span>
            </button>

            {/* Botón Exportar con menú desplegable */}
            <div className="relative flex-1 lg:flex-none">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="w-full px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition flex items-center gap-2 justify-center"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Exportando...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </>
                )}
              </button>

              {/* Menú de exportación */}
              {showExportMenu && !isExporting && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm flex items-center gap-2"
                    >
                      <FileJson className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">JSON</div>
                        <div className="text-xs text-slate-500">Formato nativo completo</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCSVNodes}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">CSV Nodos</div>
                        <div className="text-xs text-slate-500">Lista de entidades</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCSVEdges}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="font-medium">CSV Relaciones</div>
                        <div className="text-xs text-slate-500">Lista de conexiones</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportGEXF}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm flex items-center gap-2"
                    >
                      <Download className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-medium">GEXF (Gephi)</div>
                        <div className="text-xs text-slate-500">Compatible con Gephi</div>
                      </div>
                    </button>
                  </div>
                  {exportStats && (
                    <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
                      <div className="font-medium mb-1">Estadísticas:</div>
                      <div>{exportStats.totalNodes} nodos, {exportStats.totalEdges} relaciones</div>
                    </div>
                  )}
                </div>
              )}
            </div>
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

      {/* Panel de Métricas */}
      {showMetricsPanel && (
        <div className="mt-6 bg-white rounded-lg shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">📊 Métricas del Grafo</h2>
            <button
              onClick={() => setShowMetricsPanel(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nodos Más Conectados */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-blue-600">🔗</span> Top 10 Más Conectados
              </h3>
              {degreeMetrics ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {degreeMetrics.slice(0, 10).map((node, idx) => (
                    <div key={node.nodeId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">#{idx + 1}</span>
                        <span className="font-medium truncate max-w-[150px]">{node.nodeName}</span>
                      </div>
                      <span className="text-blue-600 font-semibold">{node.degree}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Cargando...</div>
              )}
            </div>

            {/* Nodos Más Importantes (PageRank) */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-purple-600">⭐</span> Top 10 Más Importantes
              </h3>
              {importantNodes ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {importantNodes.slice(0, 10).map((node, idx) => (
                    <div key={node.nodeId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">#{idx + 1}</span>
                        <span className="font-medium truncate max-w-[150px]">{node.nodeName}</span>
                      </div>
                      <span className="text-purple-600 font-semibold">
                        {node.importanceScore.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Cargando...</div>
              )}
            </div>

            {/* Estadísticas Generales */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-green-600">📈</span> Estadísticas Generales
              </h3>
              {graphStats ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Nodos:</span>
                    <span className="font-semibold">{graphStats.totalNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Relaciones:</span>
                    <span className="font-semibold">{graphStats.totalEdges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fuerza Promedio:</span>
                    <span className="font-semibold">{graphStats.avgStrength?.toFixed(1)}%</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Tipos de relaciones:</div>
                    <div className="space-y-1">
                      {Object.entries(graphStats.relationTypes || {}).slice(0, 5).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-xs">
                          <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                          <span className="text-slate-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Cargando...</div>
              )}
            </div>
          </div>

          {/* Distribución de Degree */}
          {degreeMetrics && (
            <div className="mt-6 bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3">📊 Distribución de Conexiones</h3>
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {degreeMetrics.filter(n => n.degree >= 10).length}
                  </div>
                  <div className="text-slate-600">≥10 conexiones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {degreeMetrics.filter(n => n.degree >= 5 && n.degree < 10).length}
                  </div>
                  <div className="text-slate-600">5-9 conexiones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {degreeMetrics.filter(n => n.degree >= 2 && n.degree < 5).length}
                  </div>
                  <div className="text-slate-600">2-4 conexiones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {degreeMetrics.filter(n => n.degree === 1).length}
                  </div>
                  <div className="text-slate-600">1 conexión</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
