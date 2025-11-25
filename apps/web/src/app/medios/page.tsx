import { Tv, Newspaper, Radio, Globe, TrendingUp, Award } from 'lucide-react'

export default function MediosPage() {
  const medios = [
    { nombre: 'Telemetro', categoria: 'Televisión', credibilidad: 85, tipo: 'tv' },
    { nombre: 'La Prensa', categoria: 'Periódico', credibilidad: 90, tipo: 'newspaper' },
    { nombre: 'TVN', categoria: 'Televisión', credibilidad: 82, tipo: 'tv' },
    { nombre: 'Crítica', categoria: 'Periódico', credibilidad: 75, tipo: 'newspaper' },
    { nombre: 'Panamá América', categoria: 'Periódico', credibilidad: 78, tipo: 'newspaper' },
    { nombre: 'Metro Libre', categoria: 'Periódico', credibilidad: 70, tipo: 'newspaper' },
  ]

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'tv': return Tv
      case 'newspaper': return Newspaper
      case 'radio': return Radio
      default: return Globe
    }
  }

  const getCredibilityColor = (credibilidad: number) => {
    if (credibilidad >= 85) return 'from-blue-500 to-blue-600'
    if (credibilidad >= 75) return 'from-sky-500 to-blue-600'
    return 'from-slate-500 to-blue-700'
  }

  const getCredibilityBg = (credibilidad: number) => {
    if (credibilidad >= 85) return 'bg-blue-50 border-blue-200'
    if (credibilidad >= 75) return 'bg-sky-50 border-sky-200'
    return 'bg-slate-50 border-slate-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Medios de Comunicación
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Análisis de credibilidad y sesgo de los principales medios panameños.
            Transparencia en el periodismo para una sociedad informada.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">6</p>
                <p className="text-sm text-slate-500">Medios Analizados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">82%</p>
                <p className="text-sm text-slate-500">Credibilidad Promedio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">24/7</p>
                <p className="text-sm text-slate-500">Monitoreo Activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medios.map((medio) => {
            const Icon = getIcon(medio.tipo)
            const credibilityColor = getCredibilityColor(medio.credibilidad)
            const credibilityBg = getCredibilityBg(medio.credibilidad)

            return (
              <div
                key={medio.nombre}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
                        {medio.nombre}
                      </h3>
                      <p className="text-sm text-slate-500">{medio.categoria}</p>
                    </div>
                  </div>
                </div>

                {/* Credibility Score */}
                <div className={`mb-4 p-4 rounded-xl border ${credibilityBg}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Credibilidad</span>
                    <span className="text-2xl font-bold text-slate-800">{medio.credibilidad}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${credibilityColor} transition-all duration-500`}
                      style={{ width: `${medio.credibilidad}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg group-hover:scale-[1.02]">
                  Ver Perfil Completo
                </button>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl p-8 border border-slate-200 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Próximamente</h3>
            <p className="text-slate-600">
              Análisis completo de sesgo político, estructura de ownership y patrones
              de cobertura para cada medio de comunicación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
