'use client'

import { useState } from 'react'
import { MediaGraph } from '@/components/graph/MediaGraph'
import { Filter, Download, Plus, Sparkles, Loader2 } from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export default function MediaGraphPage() {
  const [minStrength, setMinStrength] = useState(20)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const analyzeBatch = useAction(api.graphAnalysis.analyzeBatchArticles)
  const articles = useQuery(api.articles.list, { limit: 10 })

  const relationTypes = [
    { value: 'owns', label: 'Propiedad', color: 'bg-red-500' },
    { value: 'works_for', label: 'Trabaja para', color: 'bg-blue-500' },
    { value: 'affiliated_with', label: 'Afiliado con', color: 'bg-purple-500' },
    { value: 'mentioned_with', label: 'Mencionado con', color: 'bg-gray-500' },
    { value: 'covers', label: 'Cubre', color: 'bg-green-500' },
    { value: 'supports', label: 'Apoya', color: 'bg-emerald-500' },
    { value: 'opposes', label: 'Se opone', color: 'bg-orange-500' },
  ]

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleAnalyzeWithAI = async () => {
    if (!articles || articles.length === 0) {
      setAnalysisResult('No hay artículos para analizar')
      setTimeout(() => setAnalysisResult(null), 3000)
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const articleIds = articles.map(a => a._id)
      const result = await analyzeBatch({ articleIds })

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

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Grafo de Entidades</h1>
          <div className="flex gap-2">
            <button
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || !articles || articles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analizar con IA
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Relación
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
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

        <p className="text-slate-600">
          Visualización de relaciones entre actores, medios y eventos
        </p>
      </div>

      {/* Graph - Fullscreen estilo Obsidian */}
      <div className="rounded-lg overflow-hidden shadow-2xl">
        <MediaGraph
          minStrength={minStrength}
          relationTypes={selectedTypes.length > 0 ? selectedTypes : undefined}
          height="calc(100vh - 200px)"
        />
      </div>
    </div>
  )
}
