'use client'

import { CheckCircle2, XCircle, AlertTriangle, Calendar, ExternalLink, ArrowLeft, Clock, Shield, Copy, Twitter, Facebook, User, Building2, Newspaper, Check, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'
import { useState } from 'react'
import { toast } from 'sonner'
import Head from 'next/head'
import { EntitiesSection } from '@/components/claim/EntitiesSection'
import { RelationsGraph } from '@/components/claim/RelationsGraph'

export default async function ClaimDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  // This component needs to be converted to use client component pattern properly
  return <ClaimDetailClient id={params.id} />
}

function ClaimDetailClient({ id }: { id: string }) {
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  // Obtener el claim de Convex
  const claim = useQuery(api.claims.getById, {
    id: id as Id<'claims'>
  })

  // Obtener actor si existe
  const actor = useQuery(
    api.actors.getById,
    claim?.actorId ? { id: claim.actorId } : 'skip'
  )

  // Obtener fuente si existe
  const source = useQuery(
    api.sources.getById,
    claim?.sourceId ? { id: claim.sourceId } : 'skip'
  )

  // Obtener verificaciones relacionadas (misma categoría o tags)
  const relatedClaims = useQuery(
    api.verification.getRelatedClaims,
    claim ? { claimId: id as Id<'claims'>, limit: 3 } : 'skip'
  )

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

  // Verificar que el claim esté publicado
  if (claim.status !== 'published') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verificación No Disponible</h2>
          <p className="text-slate-600">
            Esta verificación aún no ha sido publicada o no está disponible públicamente.
          </p>
          <Link
            href="/verificaciones"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Verificaciones Publicadas
          </Link>
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

  // Usar el veredicto real del claim, o UNPROVEN si no hay
  const verdict = claim.verdict || 'UNPROVEN'
  const config = verdictConfig[verdict as keyof typeof verdictConfig] || verdictConfig.UNPROVEN
  const VerdictIcon = config.icon

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PA', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Share functions
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${claim.title} - Verificación: ${config.label}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    toast.success('Link copiado', {
      description: 'El enlace ha sido copiado al portapapeles'
    })
    setShareMenuOpen(false)
  }

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    setShareMenuOpen(false)
  }

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
    setShareMenuOpen(false)
  }

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`
    window.open(whatsappUrl, '_blank')
    setShareMenuOpen(false)
  }

  return (
    <>
      <Head>
        <title>{claim.title} | InfoPanama</title>
        <meta name="description" content={claim.description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={claim.title} />
        <meta property="og:description" content={claim.description} />
        {claim.imageUrl && <meta property="og:image" content={claim.imageUrl} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={claim.title} />
        <meta name="twitter:description" content={claim.description} />
        {claim.imageUrl && <meta name="twitter:image" content={claim.imageUrl} />}
      </Head>

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
                Riesgo: {claim.riskLevel}
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

              {/* Actor Info (si existe) */}
              {actor && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                    Quién lo dijo
                  </h2>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{actor.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          actor.type === 'politician' ? 'bg-purple-100 text-purple-700' :
                          actor.type === 'government_official' ? 'bg-blue-100 text-blue-700' :
                          actor.type === 'candidate' ? 'bg-green-100 text-green-700' :
                          actor.type === 'organization' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {actor.type === 'politician' && 'Político'}
                          {actor.type === 'government_official' && 'Funcionario'}
                          {actor.type === 'candidate' && 'Candidato'}
                          {actor.type === 'organization' && 'Organización'}
                          {actor.type === 'party' && 'Partido'}
                          {actor.type === 'other' && 'Otro'}
                        </span>
                        {actor.riskLevel && (
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            actor.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            actor.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            actor.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            Riesgo: {actor.riskLevel}
                          </span>
                        )}
                      </div>
                      {actor.description && (
                        <p className="text-slate-600 text-sm leading-relaxed">{actor.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Nuestra Verificación
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{claim.description}</p>
                </div>
              </div>

              {/* OSINT: Entidades Involucradas */}
              <EntitiesSection claimId={id as Id<'claims'>} />

              {/* OSINT: Grafo de Relaciones */}
              <RelationsGraph claimId={id as Id<'claims'>} />

              {/* Source/Media Info (mejorada) */}
              {source && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                    Medio de Comunicación
                  </h2>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                        <Newspaper className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{source.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          source.type === 'newspaper' ? 'bg-slate-100 text-slate-700' :
                          source.type === 'tv' ? 'bg-blue-100 text-blue-700' :
                          source.type === 'radio' ? 'bg-purple-100 text-purple-700' :
                          source.type === 'digital' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {source.type === 'newspaper' && 'Periódico'}
                          {source.type === 'tv' && 'Televisión'}
                          {source.type === 'radio' && 'Radio'}
                          {source.type === 'digital' && 'Digital'}
                          {source.type === 'social_media' && 'Redes Sociales'}
                          {source.type === 'official' && 'Oficial'}
                        </span>
                        {source.credibilityScore && (
                          <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                            Credibilidad: {source.credibilityScore}/10
                          </span>
                        )}
                      </div>
                      {claim.sourceUrl && (
                        <a
                          href={claim.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver artículo original
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Source URL (si no hay source pero sí URL) */}
              {!source && claim.sourceUrl && (
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

              {/* Related Claims */}
              {relatedClaims && relatedClaims.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                    Verificaciones Relacionadas
                  </h2>
                  <div className="space-y-4">
                    {relatedClaims.map((relatedClaim) => {
                      const relatedVerdict = relatedClaim.verdict || 'UNPROVEN'
                      const relatedConfig = verdictConfig[relatedVerdict as keyof typeof verdictConfig] || verdictConfig.UNPROVEN
                      const RelatedIcon = relatedConfig.icon

                      return (
                        <Link
                          key={relatedClaim._id}
                          href={`/verificaciones/${relatedClaim._id}`}
                          className="block group"
                        >
                          <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-12 h-12 ${relatedConfig.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <RelatedIcon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition line-clamp-2">
                                  {relatedClaim.title}
                                </h3>
                                <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                  {relatedClaim.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatShortDate(relatedClaim.publishedAt || relatedClaim.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Share Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartir Verificación
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-slate-700 hover:text-blue-600 border border-transparent hover:border-blue-200"
                  >
                    <Copy className="h-5 w-5" />
                    <span className="text-sm font-medium">Copiar enlace</span>
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition text-slate-700 hover:text-blue-500 border border-transparent hover:border-blue-200"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="text-sm font-medium">Twitter</span>
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition text-slate-700 hover:text-blue-600 border border-transparent hover:border-blue-200"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="text-sm font-medium">Facebook</span>
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition text-slate-700 hover:text-green-600 border border-transparent hover:border-green-200"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Timeline Mejorado */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Proceso de Verificación
                </h3>
                <div className="space-y-4">
                  {/* Creada */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      <div className="w-0.5 h-full bg-slate-200 mt-1" />
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-xs text-slate-400 mb-1">{formatShortDate(claim.createdAt)}</p>
                      <p className="text-sm text-slate-700 font-medium">Detectada</p>
                      <p className="text-xs text-slate-500 mt-1">Declaración identificada</p>
                    </div>
                  </div>

                  {/* En revisión */}
                  {claim.status !== 'new' && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <div className="w-0.5 h-full bg-slate-200 mt-1" />
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm text-slate-700 font-medium">En Revisión</p>
                        <p className="text-xs text-slate-500 mt-1">Proceso de fact-checking</p>
                      </div>
                    </div>
                  )}

                  {/* Verificada */}
                  {claim.verdict && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 ${config.bgColor} rounded-full`} />
                        <div className="w-0.5 h-full bg-slate-200 mt-1" />
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm text-slate-700 font-medium">Verificada</p>
                        <p className="text-xs text-slate-500 mt-1">Veredicto: {config.label}</p>
                      </div>
                    </div>
                  )}

                  {/* Publicada */}
                  {claim.publishedAt && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-xs text-slate-400 mb-1">{formatShortDate(claim.publishedAt)}</p>
                        <p className="text-sm text-slate-700 font-medium">Publicada</p>
                        <p className="text-xs text-slate-500 mt-1">Disponible públicamente</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-blue-900">
                  Información Adicional
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Nivel de Riesgo:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      claim.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      claim.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      claim.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {claim.riskLevel}
                    </span>
                  </div>
                  {claim.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Categoría:</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {claim.category}
                      </span>
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
    </>
  )
}
