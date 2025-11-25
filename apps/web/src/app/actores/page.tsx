import { User, Users, Building2, Bot, AlertTriangle, Shield, TrendingUp, MessageSquare } from 'lucide-react'

export default function ActoresPage() {
  const actores = [
    {
      nombre: 'José Raúl Mulino',
      tipo: 'person',
      cargo: 'Presidente de Panamá',
      verificaciones: 23,
      credibilidad: 75,
      afiliacion: 'Realizando Metas',
    },
    {
      nombre: 'Laurentino Cortizo',
      tipo: 'person',
      cargo: 'Ex-Presidente de Panamá',
      verificaciones: 45,
      credibilidad: 68,
      afiliacion: 'PRD',
    },
    {
      nombre: 'Ministerio de Salud',
      tipo: 'official',
      cargo: 'Institución Gubernamental',
      verificaciones: 34,
      credibilidad: 82,
      afiliacion: 'Gobierno',
    },
    {
      nombre: 'Asamblea Nacional',
      tipo: 'official',
      cargo: 'Órgano Legislativo',
      verificaciones: 56,
      credibilidad: 71,
      afiliacion: 'Gobierno',
    },
    {
      nombre: 'Cámara de Comercio',
      tipo: 'group',
      cargo: 'Organización Empresarial',
      verificaciones: 12,
      credibilidad: 79,
      afiliacion: 'Sector Privado',
    },
    {
      nombre: 'SUNTRACS',
      tipo: 'group',
      cargo: 'Sindicato',
      verificaciones: 18,
      credibilidad: 73,
      afiliacion: 'Sector Laboral',
    },
  ]

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'person': return User
      case 'official': return Building2
      case 'group': return Users
      case 'troll': return Bot
      default: return User
    }
  }

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'person': return 'Persona'
      case 'official': return 'Institución'
      case 'group': return 'Organización'
      case 'troll': return 'Cuenta Sospechosa'
      default: return tipo
    }
  }

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'person': return 'bg-blue-100 text-blue-700'
      case 'official': return 'bg-sky-100 text-sky-700'
      case 'group': return 'bg-blue-50 text-blue-600'
      case 'troll': return 'bg-slate-200 text-slate-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getCredibilityColor = (credibilidad: number) => {
    if (credibilidad >= 80) return 'from-blue-500 to-blue-600'
    if (credibilidad >= 70) return 'from-sky-500 to-blue-600'
    if (credibilidad >= 60) return 'from-slate-500 to-blue-700'
    return 'from-slate-600 to-slate-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Actores Políticos
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Monitoreo de figuras públicas, instituciones y organizaciones en Panamá.
            Análisis de credibilidad basado en verificaciones de sus declaraciones.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">6</p>
                <p className="text-sm text-slate-500">Actores</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">188</p>
                <p className="text-sm text-slate-500">Verificaciones</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">74%</p>
                <p className="text-sm text-slate-500">Credibilidad Media</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-100 rounded-xl">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">24/7</p>
                <p className="text-sm text-slate-500">Monitoreo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actors Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Actores Monitoreados</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actores.map((actor) => {
              const Icon = getIcon(actor.tipo)
              const credibilityColor = getCredibilityColor(actor.credibilidad)
              const typeColor = getTypeColor(actor.tipo)

              return (
                <div
                  key={actor.nombre}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                          {actor.nombre}
                        </h3>
                        <p className="text-sm text-slate-500">{actor.cargo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${typeColor}`}>
                        {getTypeLabel(actor.tipo)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {actor.verificaciones} verificaciones
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="h-4 w-4" />
                      <span>{actor.afiliacion}</span>
                    </div>
                  </div>

                  {/* Credibility */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Credibilidad</span>
                      <span className="text-lg font-bold text-slate-800">{actor.credibilidad}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${credibilityColor} transition-all duration-500`}
                        style={{ width: `${actor.credibilidad}%` }}
                      />
                    </div>
                  </div>

                  {/* Action */}
                  <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all font-medium text-sm shadow-md hover:shadow-lg group-hover:scale-[1.02]">
                    Ver Perfil Completo
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Metodología</h3>
            </div>
            <p className="text-slate-700">
              La credibilidad se calcula basándose en el historial de verificaciones de
              las declaraciones públicas del actor. Un mayor porcentaje indica mayor precisión
              en sus afirmaciones.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-600 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Importante</h3>
            </div>
            <p className="text-slate-700">
              Este análisis se basa únicamente en declaraciones verificadas públicamente.
              No representa una evaluación completa del actor o institución.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
