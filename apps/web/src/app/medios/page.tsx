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
    if (credibilidad >= 85) return 'bg-verifica-blue'
    if (credibilidad >= 75) return 'bg-digital-blue'
    return 'bg-blue-gray'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-verifica-blue text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Medios de Comunicación
            </h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl">
            Análisis de credibilidad y sesgo de los principales medios panameños.
            Transparencia en el periodismo para una sociedad informada.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-verifica-blue/10 rounded-lg">
                <Newspaper className="h-6 w-6 text-verifica-blue" />
              </div>
              <div>
                <p className="text-3xl font-bold text-deep-blue">6</p>
                <p className="text-sm text-blue-gray">Medios Analizados</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-deep-blue">82%</p>
                <p className="text-sm text-blue-gray">Credibilidad Promedio</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-deep-blue">24/7</p>
                <p className="text-sm text-blue-gray">Monitoreo Activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medios.map((medio) => {
            const Icon = getIcon(medio.tipo)
            const credibilityColor = getCredibilityColor(medio.credibilidad)

            return (
              <div
                key={medio.nombre}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:border-digital-blue hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-verifica-blue/10 rounded-lg">
                    <Icon className="h-6 w-6 text-verifica-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-deep-blue">
                      {medio.nombre}
                    </h3>
                    <p className="text-sm text-blue-gray">{medio.categoria}</p>
                  </div>
                </div>

                {/* Credibility Score */}
                <div className="mb-4 p-4 bg-soft-blue rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-deep-blue">Credibilidad</span>
                    <span className="text-2xl font-bold text-verifica-blue">
                      {medio.credibilidad}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${credibilityColor}`}
                      style={{ width: `${medio.credibilidad}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full px-4 py-2 bg-digital-blue text-white rounded-lg font-medium hover:bg-verifica-blue transition-colors">
                  Ver Perfil Completo
                </button>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 bg-soft-blue rounded-lg p-8 text-center border border-slate-200">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-verifica-blue/10 rounded-full mb-4">
              <TrendingUp className="h-6 w-6 text-verifica-blue" />
            </div>
            <h3 className="text-xl font-bold text-deep-blue mb-2">Próximamente</h3>
            <p className="text-blue-gray">
              Análisis completo de sesgo político, estructura de ownership y patrones
              de cobertura para cada medio de comunicación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
