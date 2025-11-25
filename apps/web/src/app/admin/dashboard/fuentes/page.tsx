'use client'

import { Newspaper, TrendingUp, Plus, Search, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewSourceModal } from '@/components/admin/NewSourceModal'

const DEMO_FUENTES = [
  // Medios de comunicación (credibilidad más baja)
  {
    id: '1',
    name: 'TVN Noticias',
    type: 'media',
    isTrusted: false,
    credibilityScore: 68,
    articleCount: 1234,
    lastScraped: '2024-01-15 10:30',
  },
  {
    id: '2',
    name: 'La Prensa',
    type: 'media',
    isTrusted: true,
    credibilityScore: 72,
    articleCount: 2456,
    lastScraped: '2024-01-15 10:25',
  },
  {
    id: '3',
    name: 'Telemetro',
    type: 'media',
    isTrusted: false,
    credibilityScore: 65,
    articleCount: 1567,
    lastScraped: '2024-01-15 09:15',
  },
  {
    id: '4',
    name: 'Mi Diario',
    type: 'media',
    isTrusted: false,
    credibilityScore: 58,
    articleCount: 987,
    lastScraped: '2024-01-15 09:00',
  },
  {
    id: '5',
    name: 'Panamá América',
    type: 'media',
    isTrusted: false,
    credibilityScore: 62,
    articleCount: 1345,
    lastScraped: '2024-01-15 08:45',
  },
  {
    id: '6',
    name: 'Critica',
    type: 'media',
    isTrusted: false,
    credibilityScore: 55,
    articleCount: 1123,
    lastScraped: '2024-01-15 08:30',
  },
  // Fuentes oficiales (credibilidad alta)
  {
    id: '7',
    name: 'Presidencia de la República',
    type: 'official',
    isTrusted: true,
    credibilityScore: 95,
    articleCount: 456,
    lastScraped: '2024-01-15 08:15',
  },
  {
    id: '8',
    name: 'Ministerio de Salud (MINSA)',
    type: 'official',
    isTrusted: true,
    credibilityScore: 94,
    articleCount: 567,
    lastScraped: '2024-01-15 08:00',
  },
  {
    id: '9',
    name: 'Ministerio de Economía y Finanzas (MEF)',
    type: 'official',
    isTrusted: true,
    credibilityScore: 93,
    articleCount: 423,
    lastScraped: '2024-01-15 07:45',
  },
  {
    id: '10',
    name: 'Asamblea Nacional',
    type: 'official',
    isTrusted: true,
    credibilityScore: 92,
    articleCount: 389,
    lastScraped: '2024-01-15 07:30',
  },
]

export default function FuentesPage() {
  const router = useRouter()
  const [fuentes, setFuentes] = useState(DEMO_FUENTES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [trustFilter, setTrustFilter] = useState('')

  const handleNewSource = (newSource: { name: string; type: string; isTrusted: boolean; credibilityScore: number }) => {
    const source = {
      id: String(fuentes.length + 1),
      name: newSource.name,
      type: newSource.type,
      isTrusted: newSource.isTrusted,
      credibilityScore: newSource.credibilityScore,
      articleCount: 0,
      lastScraped: new Date().toLocaleString('es-PA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }
    setFuentes([source, ...fuentes])
  }

  const filteredFuentes = fuentes.filter((fuente) => {
    const matchesSearch = fuente.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || fuente.type === typeFilter
    const matchesTrust = !trustFilter ||
      (trustFilter === 'trusted' && fuente.isTrusted) ||
      (trustFilter === 'untrusted' && !fuente.isTrusted)
    return matchesSearch && matchesType && matchesTrust
  })

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50/50 min-h-screen">
      {/* Header con gradiente */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-2">
            Fuentes de Información
          </h1>
          <p className="text-slate-600 text-lg">
            Gestión de medios y fuentes oficiales
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 font-semibold"
        >
          <Plus className="h-5 w-5" />
          Nueva Fuente
        </button>
      </div>

      <NewSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewSource}
      />

      {/* Stats con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                <TrendingUp className="h-3 w-3" />
                +2
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{fuentes.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Fuentes</div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/10 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <TrendingUp className="h-3 w-3" />
                +234
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {fuentes.reduce((sum, f) => sum + f.articleCount, 0)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Artículos Totales</div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-600">
                <TrendingUp className="h-3 w-3" />
                100%
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {fuentes.filter((f) => f.isTrusted).length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Fuentes Confiables</div>
          </div>
        </div>
      </div>

      {/* Filters con diseño mejorado */}
      <div className="mb-6 flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 font-medium text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="media">Medio</option>
          <option value="official">Oficial</option>
        </select>

        <select
          value={trustFilter}
          onChange={(e) => setTrustFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 font-medium text-sm"
        >
          <option value="">Todas</option>
          <option value="trusted">Solo Confiables</option>
          <option value="untrusted">No Confiables</option>
        </select>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar fuentes..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 font-medium text-sm"
          />
        </div>
      </div>

      {/* Table con diseño mejorado */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-green-50/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Fuente</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Tipo</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Credibilidad</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Artículos</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Última Actualización</th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFuentes.map((fuente, index) => (
              <tr
                key={fuente.id}
                className="border-t border-gray-100 hover:bg-green-50/30 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{fuente.name}</p>
                    {fuente.isTrusted && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle className="h-3 w-3" />
                        Confiable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ID: {fuente.id}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex text-xs px-3 py-1 rounded-full font-semibold ${
                    fuente.type === 'official'
                      ? 'bg-purple-500/10 text-purple-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {fuente.type === 'official' ? 'Oficial' : 'Medio'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 max-w-[120px] overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${fuente.credibilityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 min-w-[45px]">{fuente.credibilityScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                    {fuente.articleCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {fuente.lastScraped}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => router.push(`/admin/dashboard/fuentes/${fuente.id}/editar`)}
                    className="text-sm text-green-600 hover:text-green-700 font-semibold hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
