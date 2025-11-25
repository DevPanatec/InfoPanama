'use client'

import { CheckCircle2, XCircle, AlertTriangle, Calendar, User, ExternalLink, ArrowLeft, Clock, Shield, TrendingUp, Copy, Twitter, Facebook } from 'lucide-react'
import Link from 'next/link'

// Demo data - en producción viene de Convex
const DEMO_CLAIM = {
  id: 'CLM-001',
  title: 'Gobierno anuncia inversión de $500 millones en infraestructura',
  claimText: 'El presidente anunció una inversión histórica de $500 millones para proyectos de infraestructura en todo el país durante los próximos 2 años.',
  verdict: 'FALSE',
  verdictText: 'Falso',
  verdictExplanation: 'El anuncio de inversión de $500 millones es incorrecto. El monto real comprometido es de $350 millones. Los $500 millones mencionados incluyen fondos proyectados que aún no están asegurados ni aprobados.',
  publishedAt: '2024-01-15',
  updatedAt: '2024-01-15',
  author: 'Equipo InfoPanama',
  riskLevel: 'MEDIUM',
  impactScore: 75,
  sources: [
    {
      id: '1',
      name: 'La Prensa',
      url: 'https://laprensa.pa/...',
      credibility: 90,
      excerpt: 'Presidente anuncia $500M en infraestructura...',
    },
    {
      id: '2',
      name: 'Presidencia de Panamá',
      url: 'https://presidencia.gob.pa/...',
      credibility: 95,
      excerpt: 'Plan de infraestructura contempla $350M confirmados...',
    },
    {
      id: '3',
      name: 'TVN Noticias',
      url: 'https://tvn-2.com/...',
      credibility: 85,
      excerpt: 'Anuncio presidencial sobre obras públicas...',
    },
  ],
  actors: [
    {
      id: '1',
      name: 'Empresa Sicarelli S.A.',
      role: 'Contratista principal',
      involvementLevel: 70,
      description: 'Análisis de IA sugiere posible relación con la información'
    },
    {
      id: '2',
      name: 'Constructora XYZ',
      role: 'Subcontratista',
      involvementLevel: 30,
      description: 'Participación secundaria identificada'
    },
  ],
  relatedClaims: [
    { id: '2', title: 'Obras de infraestructura iniciarán en marzo', verdict: 'TRUE' },
    { id: '3', title: 'Presupuesto 2024 incluye fondos adicionales', verdict: 'FALSE' },
  ],
  timeline: [
    { date: '2024-01-10', event: 'Claim detectada en redes sociales' },
    { date: '2024-01-12', event: 'Investigación iniciada' },
    { date: '2024-01-14', event: 'Fuentes oficiales verificadas' },
    { date: '2024-01-15', event: 'Veredicto publicado' },
  ],
}

export default function ClaimDetailPage() {
  const verdictConfig = {
    TRUE: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      label: 'Verdadero',
    },
    FALSE: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Falso',
    },
    MIXED: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Mixto',
    },
  }

  const config = verdictConfig[DEMO_CLAIM.verdict as keyof typeof verdictConfig] || verdictConfig.MIXED
  const VerdictIcon = config.icon

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Back Button */}
          <Link
            href="/verificaciones"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Verificaciones
          </Link>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Publicado: {new Date(DEMO_CLAIM.publishedAt).toLocaleDateString('es-PA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono text-xs bg-slate-700/50 px-2 py-1 rounded">{DEMO_CLAIM.id}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
            {DEMO_CLAIM.title}
          </h1>

          {/* Verdict Badge - Large */}
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${config.bgColor} shadow-lg`}>
            <VerdictIcon className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Claim Text */}
            <div className={`${config.bgLight} border-l-4 ${config.borderColor} p-6 rounded-r-2xl`}>
              <h2 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Afirmación Original
              </h2>
              <p className="text-lg text-slate-800 leading-relaxed">{DEMO_CLAIM.claimText}</p>
            </div>

            {/* Verdict Explanation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Nuestro Veredicto
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">{DEMO_CLAIM.verdictExplanation}</p>
            </div>

            {/* Sources */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Fuentes Verificadas
              </h2>
              <div className="space-y-4">
                {DEMO_CLAIM.sources.map((source) => (
                  <div
                    key={source.id}
                    className="group border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-800">{source.name}</h3>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                            {source.credibility}% credibilidad
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{source.excerpt}</p>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actors */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Análisis de Actores Relacionados
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Análisis probabilístico basado en patrones detectados por IA. No constituye acusaciones.
              </p>
              <div className="space-y-4">
                {DEMO_CLAIM.actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <User className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{actor.name}</p>
                        <p className="text-sm text-slate-500">{actor.role}</p>
                        <p className="text-xs text-slate-400 mt-1 italic">{actor.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500">Nivel de relación estimado</span>
                        <span className="text-sm font-bold text-slate-700">{actor.involvementLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            actor.involvementLevel >= 70
                              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                              : actor.involvementLevel >= 40
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-blue-400 to-blue-500'
                          }`}
                          style={{ width: `${actor.involvementLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-slate-800 mb-4">Compartir</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition text-slate-600 hover:text-blue-600"
                >
                  <Copy className="h-5 w-5" />
                  <span className="text-xs">Copiar</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition text-slate-600 hover:text-blue-400">
                  <Twitter className="h-5 w-5" />
                  <span className="text-xs">Twitter</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition text-slate-600 hover:text-blue-600">
                  <Facebook className="h-5 w-5" />
                  <span className="text-xs">Facebook</span>
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-4">
                {DEMO_CLAIM.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      {index < DEMO_CLAIM.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-slate-400 mb-1">{item.date}</p>
                      <p className="text-sm text-slate-600">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Claims */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Relacionadas
              </h3>
              <div className="space-y-3">
                {DEMO_CLAIM.relatedClaims.map((related) => (
                  <Link
                    key={related.id}
                    href={`/verificaciones/${related.id}`}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition"
                  >
                    <p className="text-sm text-slate-700 mb-2 line-clamp-2">{related.title}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        related.verdict === 'TRUE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {related.verdict === 'TRUE' ? 'Verdadero' : 'Falso'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Methodology Link */}
            <Link
              href="/metodologia"
              className="block p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-center font-semibold hover:from-blue-500 hover:to-blue-600 transition shadow-lg shadow-blue-600/30"
            >
              Ver Metodología →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
