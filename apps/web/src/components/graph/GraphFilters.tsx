'use client'

import { Filter, X, Search } from 'lucide-react'
import { useState } from 'react'

interface GraphFiltersProps {
  onFiltersChange: (filters: GraphFilterOptions) => void
  stats?: {
    totalNodes: number
    totalEdges: number
    relationTypes: Record<string, number>
  }
  onSearchEntity?: (query: string) => void
  onZoomChange?: (zoom: number) => void
}

export interface GraphFilterOptions {
  minStrength: number
  selectedRelationTypes: string[]
  selectedEntityTypes: string[]
  showIsolatedNodes: boolean
  searchQuery?: string
  zoomLevel?: number
}

const RELATION_TYPES = [
  { value: 'owns', label: 'Propiedad', color: 'bg-red-500' },
  { value: 'works_for', label: 'Trabaja para', color: 'bg-blue-500' },
  { value: 'affiliated_with', label: 'Afiliado con', color: 'bg-purple-500' },
  { value: 'mentioned_with', label: 'Co-mención', color: 'bg-gray-500' },
  { value: 'quoted_by', label: 'Citado por', color: 'bg-green-500' },
  { value: 'covers', label: 'Cubre', color: 'bg-emerald-500' },
  { value: 'supports', label: 'Apoya', color: 'bg-teal-500' },
  { value: 'opposes', label: 'Se opone', color: 'bg-orange-500' },
  { value: 'participates_in', label: 'Participa en', color: 'bg-indigo-500' },
  { value: 'related_to', label: 'Relacionado con', color: 'bg-slate-500' },
]

const ENTITY_TYPES = [
  { value: 'person', label: 'Persona/Político', color: 'bg-blue-500' },
  { value: 'organization', label: 'Organización', color: 'bg-purple-500' },
  { value: 'media', label: 'Medio', color: 'bg-red-500' },
  { value: 'event', label: 'Evento', color: 'bg-green-500' },
  { value: 'poi', label: 'POI', color: 'bg-orange-500' },
]

export function GraphFilters({ onFiltersChange, stats, onSearchEntity, onZoomChange }: GraphFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [minStrength, setMinStrength] = useState(0)
  const [selectedRelationTypes, setSelectedRelationTypes] = useState<string[]>([])
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([])
  const [showIsolatedNodes, setShowIsolatedNodes] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleFilterChange = (updates: Partial<GraphFilterOptions>) => {
    const newFilters = {
      minStrength,
      selectedRelationTypes,
      selectedEntityTypes,
      showIsolatedNodes,
      searchQuery,
      zoomLevel,
      ...updates,
    }

    // Actualizar estado local
    if (updates.minStrength !== undefined) setMinStrength(updates.minStrength)
    if (updates.selectedRelationTypes !== undefined) setSelectedRelationTypes(updates.selectedRelationTypes)
    if (updates.selectedEntityTypes !== undefined) setSelectedEntityTypes(updates.selectedEntityTypes)
    if (updates.showIsolatedNodes !== undefined) setShowIsolatedNodes(updates.showIsolatedNodes)
    if (updates.searchQuery !== undefined) setSearchQuery(updates.searchQuery)
    if (updates.zoomLevel !== undefined) setZoomLevel(updates.zoomLevel)

    // Notificar cambios
    onFiltersChange(newFilters)
  }

  const [searchInput, setSearchInput] = useState('')

  const handleSearch = () => {
    setSearchQuery(searchInput)
    handleFilterChange({ searchQuery: searchInput })
    onSearchEntity?.(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    handleFilterChange({ searchQuery: '' })
    onSearchEntity?.('')
  }

  const handleZoom = (zoom: number) => {
    setZoomLevel(zoom)
    handleFilterChange({ zoomLevel: zoom })
    onZoomChange?.(zoom)
  }

  const toggleRelationType = (type: string) => {
    const newTypes = selectedRelationTypes.includes(type)
      ? selectedRelationTypes.filter((t) => t !== type)
      : [...selectedRelationTypes, type]
    handleFilterChange({ selectedRelationTypes: newTypes })
  }

  const toggleEntityType = (type: string) => {
    const newTypes = selectedEntityTypes.includes(type)
      ? selectedEntityTypes.filter((t) => t !== type)
      : [...selectedEntityTypes, type]
    handleFilterChange({ selectedEntityTypes: newTypes })
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setZoomLevel(100)
    handleFilterChange({
      minStrength: 0,
      selectedRelationTypes: [],
      selectedEntityTypes: [],
      showIsolatedNodes: true,
      searchQuery: '',
      zoomLevel: 100,
    })
    onSearchEntity?.('')
    onZoomChange?.(100)
  }

  const activeFiltersCount =
    (minStrength > 0 ? 1 : 0) +
    selectedRelationTypes.length +
    selectedEntityTypes.length +
    (!showIsolatedNodes ? 1 : 0)

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-white hover:bg-gray-750 transition"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Filtros del Grafo</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
            {/* Stats */}
            {stats && (
              <div className="bg-gray-900 rounded-lg p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-gray-400">Nodos</div>
                    <div className="text-white font-semibold">{stats.totalNodes}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Conexiones</div>
                    <div className="text-white font-semibold">{stats.totalEdges}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Entity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar Entidad
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                    placeholder="Ej: Sicarelli, Mulino..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </button>
              </div>
              {searchQuery && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Buscando: <span className="text-white font-medium">"{searchQuery}"</span>
                  </span>
                  <button
                    onClick={handleClearSearch}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Limpiar
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Escribe un nombre y presiona "Buscar" o Enter
              </p>
            </div>

            {/* Zoom/Dimensions Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dimensiones/Zoom: {zoomLevel}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={zoomLevel}
                onChange={(e) => handleZoom(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Strength Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuerza Mínima: {minStrength}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minStrength}
                onChange={(e) => handleFilterChange({ minStrength: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Entity Types Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipos de Entidad
              </label>
              <div className="space-y-2">
                {ENTITY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => toggleEntityType(type.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      selectedEntityTypes.includes(type.value)
                        ? 'bg-gray-700 border border-blue-500'
                        : 'bg-gray-900 border border-gray-700 hover:bg-gray-750'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    <span className="text-sm text-white flex-1 text-left">{type.label}</span>
                    {selectedEntityTypes.includes(type.value) && (
                      <span className="text-xs text-blue-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Relation Types Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipos de Relación
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {RELATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => toggleRelationType(type.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      selectedRelationTypes.includes(type.value)
                        ? 'bg-gray-700 border border-blue-500'
                        : 'bg-gray-900 border border-gray-700 hover:bg-gray-750'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    <span className="text-sm text-white flex-1 text-left">{type.label}</span>
                    {selectedRelationTypes.includes(type.value) && (
                      <span className="text-xs text-blue-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Isolated Nodes */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showIsolatedNodes}
                  onChange={(e) => handleFilterChange({ showIsolatedNodes: e.target.checked })}
                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Mostrar nodos sin conexiones</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
            >
              Resetear Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
