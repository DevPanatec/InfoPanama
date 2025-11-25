'use client'

import { Users, Plus, Search, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_PERFILES = [
  {
    id: '1',
    name: 'José Raúl Mulino',
    type: 'politician',
    position: 'Presidente de Panamá',
    totalClaims: 24,
    trueClaims: 18,
  },
  {
    id: '2',
    name: 'Ministerio de Salud',
    type: 'institution',
    position: 'Institución Gubernamental',
    totalClaims: 45,
    trueClaims: 38,
  },
  {
    id: '3',
    name: 'Cámara de Comercio',
    type: 'organization',
    position: 'Organización Empresarial',
    totalClaims: 12,
    trueClaims: 9,
  },
  {
    id: '4',
    name: 'TVN Noticias',
    type: 'media',
    position: 'Medio de Comunicación',
    totalClaims: 67,
    trueClaims: 58,
  },
]

export default function ActoresPage() {
  const router = useRouter()
  const [perfiles, setPerfiles] = useState(DEMO_PERFILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filteredPerfiles = perfiles.filter((perfil) => {
    const matchesSearch = perfil.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          perfil.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || perfil.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      politician: { color: 'bg-blue-500/10 text-blue-600', label: 'Político' },
      institution: { color: 'bg-purple-500/10 text-purple-600', label: 'Institución' },
      organization: { color: 'bg-green-500/10 text-green-600', label: 'Organización' },
      media: { color: 'bg-orange-500/10 text-orange-600', label: 'Medio' },
    }

    const config = configs[type] || { color: 'bg-gray-500/10 text-gray-600', label: type }

    return (
      <span className={`inline-flex text-xs ${config.color} px-2 py-1 rounded-full font-semibold`}>
        {config.label}
      </span>
    )
  }

  const getTruthPercentage = (trueClaims: number, totalClaims: number) => {
    if (totalClaims === 0) return 0
    return Math.round((trueClaims / totalClaims) * 100)
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50/50 min-h-screen">
      {/* Header con gradiente */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-2">
            Perfiles Monitoreados
          </h1>
          <p className="text-slate-600 text-lg">
            Personas e instituciones cuyas declaraciones son verificadas
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard/actores/nuevo')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 font-semibold"
        >
          <Plus className="h-5 w-5" />
          Nuevo Perfil
        </button>
      </div>

      {/* Stats con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                <TrendingUp className="h-3 w-3" />
                +2
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{perfiles.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Perfiles</div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/10 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <TrendingUp className="h-3 w-3" />
                +15
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {perfiles.reduce((sum, p) => sum + p.totalClaims, 0)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Declaraciones Verificadas</div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {Math.round((perfiles.reduce((sum, p) => sum + p.trueClaims, 0) / perfiles.reduce((sum, p) => sum + p.totalClaims, 0)) * 100)}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Promedio Veracidad</div>
          </div>
        </div>
      </div>

      {/* Filters con diseño mejorado */}
      <div className="mb-6 flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="politician">Político</option>
          <option value="institution">Institución</option>
          <option value="organization">Organización</option>
          <option value="media">Medio</option>
        </select>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar perfiles..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-sm"
          />
        </div>
      </div>

      {/* Table con diseño mejorado */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-purple-50/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Nombre</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Tipo</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Cargo/Posición</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Verificaciones</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">% Verdaderas</th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPerfiles.map((perfil, index) => {
              const truthPercent = getTruthPercentage(perfil.trueClaims, perfil.totalClaims)
              return (
                <tr
                  key={perfil.id}
                  className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">{perfil.name}</p>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(perfil.type)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{perfil.position}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                      {perfil.totalClaims}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${truthPercent >= 70 ? 'bg-green-500' : truthPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${truthPercent}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${truthPercent >= 70 ? 'text-green-600' : truthPercent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {truthPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/admin/dashboard/actores/${perfil.id}`)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                    >
                      Ver perfil →
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
