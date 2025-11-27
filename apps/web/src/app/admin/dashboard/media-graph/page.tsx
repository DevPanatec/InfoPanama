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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">Filtros</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fuerza mínima */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Fuerza mínima de relación: {minStrength}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minStrength}
              onChange={(e) => setMinStrength(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Tipos de relación */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Tipos de relación
            </label>
            <div className="flex flex-wrap gap-2">
              {relationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedTypes.includes(type.value) || selectedTypes.length === 0
                      ? `${type.color} text-white`
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <MediaGraph
          minStrength={minStrength}
          relationTypes={selectedTypes.length > 0 ? selectedTypes : undefined}
          height="calc(100vh - 400px)"
        />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-white"></div>
            <span className="text-xs text-slate-600">Actor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-500 bg-white"></div>
            <span className="text-xs text-slate-600">Fuente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-amber-500 bg-white"></div>
            <span className="text-xs text-slate-600">Entidad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-purple-500 bg-white"></div>
            <span className="text-xs text-slate-600">Evento</span>
          </div>
        </div>
      </div>
    </div>
  )
}
