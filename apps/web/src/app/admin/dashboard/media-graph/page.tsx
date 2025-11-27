'use client'

import { useState } from 'react'
import { MediaGraph } from '@/components/graph/MediaGraph'
import { Filter, Download, Plus, Sparkles } from 'lucide-react'

export default function MediaGraphPage() {
  const [minStrength, setMinStrength] = useState(20)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

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

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Grafo de Entidades</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Analizar con IA
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
