import { Heart, Target, Users, Shield, Brain, Database, Eye, Zap } from 'lucide-react'

export default function SobreNosotrosPage() {
  const values = [
    {
      icon: Shield,
      title: 'Independencia',
      description: 'No estamos afiliados a ningún partido político, grupo empresarial o medio de comunicación.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Eye,
      title: 'Transparencia',
      description: 'Todas nuestras fuentes y metodologías son públicas y verificables.',
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-50',
    },
    {
      icon: Target,
      title: 'Precisión',
      description: 'Combinamos IA avanzada con verificación humana para garantizar resultados precisos.',
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      title: 'Compromiso',
      description: 'Dedicados a combatir la desinformación y promover el periodismo basado en hechos.',
      color: 'from-slate-700 to-blue-800',
      bgColor: 'bg-slate-50',
    },
  ]

  const tech = [
    {
      icon: Brain,
      title: 'IA Avanzada',
      description: 'Modelos de inteligencia artificial especializados para análisis de texto',
    },
    {
      icon: Zap,
      title: 'Scraping 24/7',
      description: 'Monitoreo constante de medios y fuentes oficiales',
    },
    {
      icon: Database,
      title: 'Base de Datos',
      description: 'Miles de artículos y documentos oficiales indexados',
    },
    {
      icon: Target,
      title: 'Análisis de Sesgo',
      description: 'Mapeo de cobertura mediática y detección de sesgos',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero/Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Sobre Nosotros
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            InfoPanama es una plataforma independiente de verificación de información
            para Panamá, comprometida con la transparencia y la verdad.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Mission */}
        <div className="mb-12 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Nuestra Misión</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Ayudar a los panameños a tomar decisiones informadas basadas en hechos verificables.
              En la era de la información, distinguir entre hechos y desinformación se ha vuelto
              cada vez más difícil. InfoPanama nace para ser el puente entre la verdad y la sociedad.
            </p>
          </div>
        </div>

        {/* Why InfoPanama */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">¿Por qué InfoPanama?</h2>
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="space-y-6 text-slate-600 text-lg">
              <p>
                En la era de la información, distinguir entre hechos y desinformación
                se ha vuelto cada vez más difícil. InfoPanama nace para ayudar a los
                panameños a tomar decisiones informadas basadas en hechos verificables.
              </p>
              <p>
                Utilizamos inteligencia artificial de última generación combinada con
                verificación humana para analizar afirmaciones en medios de comunicación
                y fuentes oficiales, garantizando precisión y transparencia en cada verificación.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${value.color}`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">
                        {value.title}
                      </h3>
                      <p className="text-slate-600">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Technology */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Nuestra Tecnología</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tech.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                  </div>
                  <p className="text-slate-600">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-blue-200">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Nuestro Equipo</h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              InfoPanama está compuesto por periodistas, desarrolladores, científicos de datos
              y expertos en verificación de información comprometidos con la verdad y la
              transparencia en el periodismo panameño.
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg">
              Únete al Equipo
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">¿Quieres saber más?</h3>
          <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto">
            Si tienes preguntas, sugerencias o quieres colaborar con nosotros,
            no dudes en contactarnos. Estamos aquí para servir a la comunidad.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg">
              Contáctanos
            </button>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition border-2 border-white/20">
              Ver Metodología
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
