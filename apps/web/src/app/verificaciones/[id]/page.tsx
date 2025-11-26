'use client'

import { CheckCircle2, XCircle, AlertTriangle, Calendar, ExternalLink, ArrowLeft, Clock, Shield, Copy, Twitter, Facebook } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  // Obtener el claim de Convex
  const claim = useQuery(api.claims.getById, {
    id: params.id as Id<'claims'>
  })

  if (!claim) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando verificación...</p>
        </div>
      </div>
    )
  }

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
    UNPROVEN: {
      icon: AlertTriangle,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500',
      bgLight: 'bg-slate-50',
      borderColor: 'border-slate-200',
      label: 'No Comprobado',
    },
    NEEDS_CONTEXT: {
      icon: AlertTriangle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Necesita Contexto',
    },
  }

  // Default a MIXED si no hay veredicto
  const verdict = claim.status === 'published' ? 'MIXED' : 'UNPROVEN'
  const config = verdictConfig[verdict as keyof typeof verdictConfig] || verdictConfig.MIXED
  const VerdictIcon = config.icon

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al Inicio
          </Link>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Publicado: {formatDate(claim.publishedAt || claim.createdAt)}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              claim.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
              claim.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
              claim.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {claim.riskLevel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
            {claim.title}
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
              <p className="text-lg text-slate-800 leading-relaxed">{claim.claimText}</p>
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Descripción
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">{claim.description}</p>
            </div>

            {/* Source Info */}
            {claim.sourceUrl && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Fuente Original
                </h2>
                <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">
                          {claim.sourceType === 'auto_extracted' && 'Extraído Automáticamente'}
                          {claim.sourceType === 'official_source' && 'Fuente Oficial'}
                          {claim.sourceType === 'media_article' && 'Artículo de Medio'}
                          {claim.sourceType === 'social_media' && 'Redes Sociales'}
                          {claim.sourceType === 'user_submitted' && 'Enviado por Usuario'}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 break-all">{claim.sourceUrl}</p>
                    </div>
                    <a
                      href={claim.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Category & Tags */}
            {(claim.category || claim.tags.length > 0) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Categorías y Etiquetas
                </h2>
                <div className="space-y-4">
                  {claim.category && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Categoría:</p>
                      <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {claim.category}
                      </span>
                    </div>
                  )}
                  {claim.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Etiquetas:</p>
                      <div className="flex flex-wrap gap-2">
                        {claim.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                Estado de Verificación
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    claim.status === 'published' ? 'bg-green-100 text-green-700' :
                    claim.status === 'review' ? 'bg-amber-100 text-amber-700' :
                    claim.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {claim.status === 'published' && 'Publicado'}
                    {claim.status === 'review' && 'En Revisión'}
                    {claim.status === 'investigating' && 'Investigando'}
                    {claim.status === 'new' && 'Nuevo'}
                    {claim.status === 'approved' && 'Aprobado'}
                    {claim.status === 'rejected' && 'Rechazado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nivel de Riesgo:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    claim.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    claim.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    claim.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {claim.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
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
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    <div className="w-0.5 h-full bg-slate-200 mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-slate-400 mb-1">{formatDate(claim.createdAt)}</p>
                    <p className="text-sm text-slate-600">Claim detectada</p>
                  </div>
                </div>

                {claim.publishedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-slate-400 mb-1">{formatDate(claim.publishedAt)}</p>
                      <p className="text-sm text-slate-600">Publicada</p>
                    </div>
                  </div>
                )}
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
