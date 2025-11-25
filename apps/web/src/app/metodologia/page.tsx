import { Search, Brain, Database, CheckCircle, Eye, Shield, FileSearch, Zap } from 'lucide-react'

export default function MetodologiaPage() {
  const steps = [
    {
      number: 1,
      title: 'Recolección Automática',
      description: 'Nuestros scrapers monitorean 24/7 medios de comunicación y fuentes oficiales.',
      icon: Search,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      number: 2,
      title: 'Análisis con IA',
      description: 'GPT-4.1 y modelos especializados extraen afirmaciones y analizan contenido.',
      icon: Brain,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      number: 3,
      title: 'Búsqueda de Evidencia',
      description: 'Sistema RAG busca en nuestra base de datos de artículos y documentos oficiales.',
      icon: Database,
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-50 border-sky-200',
    },
    {
      number: 4,
      title: 'Verificación Cruzada',
      description: 'Un segundo modelo de IA valida las conclusiones para evitar alucinaciones.',
      icon: CheckCircle,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    {
      number: 5,
      title: 'Revisión Humana',
      description: 'Editores revisan y aprueban antes de publicar.',
      icon: Eye,
      color: 'from-slate-700 to-blue-800',
      bgColor: 'bg-slate-50 border-slate-200',
    },
  ]

  const verdicts = [
    {
      label: 'Verdadero',
      description: 'La afirmación está respaldada por evidencia sólida.',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Falso',
      description: 'La afirmación está refutada por evidencia verificable.',
      color: 'bg-slate-500',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
    {
      label: 'Mixto',
      description: 'Contiene elementos verdaderos y falsos.',
      color: 'bg-blue-400',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'No Probado',
      description: 'No hay evidencia suficiente para verificar.',
      color: 'bg-slate-600',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100',
    },
    {
      label: 'Necesita Contexto',
      description: 'La afirmación requiere aclaración adicional.',
      color: 'bg-sky-500',
      textColor: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Cómo Verificamos
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Nuestra metodología combina inteligencia artificial de última generación
            con verificación humana para garantizar precisión y transparencia.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Introduction */}
        <div className="mb-12 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Nuestra Metodología</h2>
          <p className="text-slate-600 text-lg">
            InfoPanama utiliza inteligencia artificial de última generación combinada con
            verificación humana para analizar afirmaciones y noticias en Panamá. Nuestro
            proceso de 5 pasos garantiza precisión y transparencia en cada verificación.
          </p>
        </div>

        {/* Process Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Proceso de Verificación</h2>
          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-6">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-xl border ${step.bgColor} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-slate-700">{step.number}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${step.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Verdict Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Categorías de Veredictos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verdicts.map((verdict) => (
              <div
                key={verdict.label}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${verdict.color}`} />
                  <h3 className={`font-bold text-lg ${verdict.textColor}`}>
                    {verdict.label}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {verdict.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FileSearch className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Transparencia Total</h3>
            </div>
            <p className="text-slate-700">
              Todas nuestras verificaciones incluyen las fuentes exactas utilizadas,
              con citas textuales y enlaces a los documentos originales.
            </p>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Velocidad y Precisión</h3>
            </div>
            <p className="text-slate-700">
              La IA permite verificar afirmaciones en minutos, mientras que la revisión
              humana garantiza la precisión de los resultados.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">¿Tienes preguntas sobre nuestra metodología?</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Estamos comprometidos con la transparencia. Contáctanos si tienes dudas sobre
            cómo verificamos la información.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition">
            Contáctanos
          </button>
        </div>
      </div>
    </div>
  )
}
