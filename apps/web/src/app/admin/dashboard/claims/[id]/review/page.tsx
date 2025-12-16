'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Save, Eye, Sparkles, Loader2, Newspaper, Calendar, User, Link as LinkIcon, Shield, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useQuery, useAction, useMutation } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

export default function ReviewClaimPage() {
  const router = useRouter()
  const params = useParams()
  const claimId = params.id as Id<'claims'>

  // Obtener claim y veredicto de Convex
  const claim = useQuery(api.claims.getById, { id: claimId })
  const verifyClaim = useAction(api.verification.verifyClaim)
  const updateStatusMutation = useMutation(api.claims.updateStatus)
  const updateVerdictMutation = useMutation(api.claims.updateVerdict)

  // Obtener artículo relacionado
  const article = useQuery(
    api.articles.getById,
    claim?.articleId ? { id: claim.articleId } : 'skip'
  )

  // Obtener fuente del artículo
  const source = useQuery(
    api.sources.getById,
    article?.sourceId ? { id: article.sourceId } : 'skip'
  )

  const [verdict, setVerdict] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedAnalysis, setEditedAnalysis] = useState('')
  const [notes, setNotes] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  // Inicializar campos cuando se carga el claim
  useEffect(() => {
    if (claim) {
      setEditedTitle(claim.title)
      setEditedContent(claim.claimText || claim.description || '')
      setVerdict(claim.verdict || null)
    }
  }, [claim])

  // Función para ejecutar verificación con IA
  const handleVerifyWithAI = async () => {
    if (!claim) return

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      console.log('🤖 Ejecutando verificación automática con IA...')
      const result = await verifyClaim({ claimId: claim._id })
      console.log('✅ Verificación completada:', result)

      setVerificationResult(result)
      setVerdict(result.verdict)
      setEditedAnalysis(result.explanation || '')

      // Mostrar modal detallado con toda la información
      const evidenceText = result.evidence && result.evidence.length > 0
        ? `\n\nEvidencia encontrada:\n${result.evidence.map((e: any, i: number) => `${i+1}. ${typeof e === 'string' ? e : e.source || e.description}`).join('\n')}`
        : '\n\n⚠️ No se encontró evidencia específica.'

      const redFlagsText = result.redFlags && result.redFlags.length > 0
        ? `\n\n🚩 Red Flags:\n${result.redFlags.join('\n')}`
        : ''

      const summaryText = result.summary ? `\n\nResumen:\n${result.summary}` : ''

      alert(`✅ Verificación completada con IA!

Veredicto: ${result.verdict}
Confianza: ${result.confidenceScore}%
Tokens usados: ${result.tokensUsed}
Tiempo: ${result.processingTime}ms${summaryText}${evidenceText}${redFlagsText}

📝 Revisa la explicación completa más abajo en "Análisis y Contexto".`)
    } catch (error) {
      console.error('Error al verificar con IA:', error)
      alert('Error al ejecutar verificación con IA. Verifica los logs.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleApprove = async () => {
    if (!verdict) {
      alert('Por favor selecciona un veredicto antes de aprobar')
      return
    }

    try {
      // Actualizar el veredicto
      await updateVerdictMutation({
        id: claimId,
        verdict: verdict as any,
      })

      // Actualizar el estado a publicado
      await updateStatusMutation({
        id: claimId,
        status: 'published',
      })

      alert('✅ Verificación aprobada y publicada exitosamente')
      router.push('/admin/dashboard/claims')
    } catch (error) {
      console.error('Error al aprobar verificación:', error)
      alert('❌ Error al aprobar verificación. Verifica los logs.')
    }
  }

  const handleSaveDraft = async () => {
    try {
      // Solo actualizar el veredicto si se seleccionó uno
      if (verdict) {
        await updateVerdictMutation({
          id: claimId,
          verdict: verdict as any,
        })
      }

      // Actualizar el estado a review (borrador)
      await updateStatusMutation({
        id: claimId,
        status: 'review',
      })

      alert('💾 Cambios guardados como borrador')
    } catch (error) {
      console.error('Error al guardar borrador:', error)
      alert('❌ Error al guardar borrador. Verifica los logs.')
    }
  }

  const handleReject = async () => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta verificación?')) {
      return
    }

    try {
      // Actualizar el estado a rechazado
      await updateStatusMutation({
        id: claimId,
        status: 'rejected',
      })

      alert('🚫 Verificación rechazada')
      router.push('/admin/dashboard/claims')
    } catch (error) {
      console.error('Error al rechazar verificación:', error)
      alert('❌ Error al rechazar verificación. Verifica los logs.')
    }
  }

  // Loading state
  if (!claim) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando verificación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Verificaciones
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              Revisar y Aprobar Verificación
            </h1>
            <p className="text-gray-600">ID: {params.id}</p>
          </div>

          {/* Botón de Verificación con IA */}
          <button
            onClick={handleVerifyWithAI}
            disabled={isVerifying}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Verificar con IA
              </>
            )}
          </button>
        </div>

        {/* Mostrar resultado de verificación si existe */}
        {verificationResult && (
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Verificación IA completada</p>
                <p className="text-sm text-green-700 mt-1">
                  Veredicto: <strong>{verificationResult.verdict}</strong> |
                  Confianza: <strong>{verificationResult.confidenceScore}%</strong> |
                  Tokens usados: {verificationResult.tokensUsed}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta si falta información del artículo/fuente - MEJORADA */}
        {claim && !claim.articleId && (
          <div className="mt-4 p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-900">⚠️ Claim sin artículo asociado</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Información limitada disponible. Revisa manualmente antes de aprobar.
                </p>
              </div>
            </div>

            {/* Mostrar la información que SÍ tenemos */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              {claim.sourceUrl && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    URL DE ORIGEN
                  </p>
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all font-medium"
                  >
                    {claim.sourceUrl}
                  </a>
                </div>
              )}

              {claim.sourceType && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">TIPO DE FUENTE</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{claim.sourceType}</p>
                </div>
              )}

              {claim.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    FECHA DE CREACIÓN DEL CLAIM
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(claim.createdAt).toLocaleString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hace {Math.floor((Date.now() - claim.createdAt) / (1000 * 60 * 60 * 24))} días
                  </p>
                </div>
              )}

              {claim.claimText && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">TEXTO DEL CLAIM</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                    "{claim.claimText}"
                  </p>
                </div>
              )}

              {!claim.sourceUrl && !claim.sourceType && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 italic">
                    No hay información adicional de la fuente disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contexto del Artículo Original */}
          {article && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-bold text-slate-900">Artículo Original</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">TÍTULO DEL ARTÍCULO</p>
                  <p className="text-base font-bold text-slate-900">{article.title}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">CONTENIDO (EXTRACTO)</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg">
                    {article.content.substring(0, 300)}
                    {article.content.length > 300 && '...'}
                  </p>
                  {article.content.length > 300 && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                        Ver contenido completo
                      </summary>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg mt-2">
                        {article.content}
                      </p>
                    </details>
                  )}
                </div>

                {article.topics && article.topics.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">TEMAS</p>
                    <div className="flex flex-wrap gap-2">
                      {article.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Título */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título de la Afirmación
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          {/* Contenido */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contenido
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
            />
          </div>

          {/* Análisis IA */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-500 p-1 rounded">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <label className="text-sm font-semibold text-gray-700">
                Análisis Generado por IA
              </label>
            </div>
            <textarea
              value={editedAnalysis}
              onChange={(e) => setEditedAnalysis(e.target.value)}
              rows={8}
              placeholder="El análisis de la IA aparecerá aquí después de verificar..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
            />
          </div>

          {/* Resumen IA (si existe) */}
          {verificationResult && verificationResult.summary && (
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                📝 Resumen Ejecutivo
              </label>
              <p className="text-sm text-blue-800">{verificationResult.summary}</p>
            </div>
          )}

          {/* Puntos Clave (si existen) */}
          {verificationResult && verificationResult.keyPoints && verificationResult.keyPoints.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔑 Puntos Clave
              </label>
              <ul className="space-y-2">
                {verificationResult.keyPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resultado de Verificación IA */}
          {verificationResult && verificationResult.evidence && verificationResult.evidence.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Evidencia (Generada por IA)
              </label>
              <ul className="space-y-2">
                {verificationResult.evidence.map((item: any, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {typeof item === 'string' ? item : item.source || item.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notas del Administrador */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas del Administrador (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Agrega notas internas sobre esta verificación..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Veredicto */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Veredicto
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setVerdict('TRUE')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  verdict === 'TRUE'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className={`h-5 w-5 ${verdict === 'TRUE' ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${verdict === 'TRUE' ? 'text-green-900' : 'text-gray-700'}`}>
                  Verdadero
                </span>
              </button>

              <button
                onClick={() => setVerdict('FALSE')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  verdict === 'FALSE'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle className={`h-5 w-5 ${verdict === 'FALSE' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${verdict === 'FALSE' ? 'text-red-900' : 'text-gray-700'}`}>
                  Falso
                </span>
              </button>
            </div>
          </div>

          {/* Información del Medio */}
          {article && source && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="h-5 w-5 text-blue-600" />
                <label className="text-sm font-bold text-blue-900">
                  Información del Medio
                </label>
              </div>

              <div className="space-y-3">
                {/* Nombre del medio */}
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">MEDIO</span>
                    {source.isTrusted && (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="font-bold text-gray-900">{source.name}</p>
                  {source.credibilityScore !== undefined && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            source.credibilityScore >= 80 ? 'bg-green-500' :
                            source.credibilityScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${source.credibilityScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {source.credibilityScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Fecha de publicación */}
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs text-gray-500 font-medium">PUBLICADO</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(article.publishedDate).toLocaleString('es-PA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hace {Math.floor((Date.now() - article.publishedDate) / (1000 * 60 * 60 * 24))} días
                  </p>
                </div>

                {/* Autor */}
                {article.author && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500 font-medium">AUTOR</span>
                    </div>
                    <p className="font-semibold text-gray-900">{article.author}</p>
                  </div>
                )}

                {/* URL del artículo original */}
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs text-gray-500 font-medium">URL ORIGINAL</span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all font-medium"
                  >
                    {article.url.length > 40 ? article.url.substring(0, 40) + '...' : article.url}
                  </a>
                </div>

                {/* Snapshot URL si existe */}
                {article.snapshotUrl && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500 font-medium">SNAPSHOT</span>
                    </div>
                    <a
                      href={article.snapshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 hover:underline break-all font-medium"
                    >
                      Ver copia archivada
                    </a>
                  </div>
                )}

                {/* Tipo de fuente */}
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-blue-100">
                  <span>Tipo: <strong>{source.type === 'media' ? 'Medio' : source.type === 'official' ? 'Oficial' : 'Redes Sociales'}</strong></span>
                  {source.isTrusted ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verificado
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No verificado
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fuentes (fallback si no hay artículo) */}
          {(!article || !source) && (
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Información de la Fuente
              </label>
              <ul className="space-y-2">
                {claim.sourceUrl && (
                  <li className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <strong>URL:</strong>{' '}
                    <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {claim.sourceUrl}
                    </a>
                  </li>
                )}
                {claim.sourceType && (
                  <li className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <strong>Tipo:</strong> {claim.sourceType}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Metadatos */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Información
            </label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold capitalize">{claim.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Riesgo:</span>
                <span className="font-semibold">{claim.riskLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creada:</span>
                <span className="font-semibold">
                  {new Date(claim.createdAt).toLocaleDateString('es-PA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {claim.category && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-semibold">{claim.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ver Proceso de Investigación */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <button
              onClick={() => router.push(`/admin/dashboard/claims/${params.id}/proceso`)}
              className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Eye className="h-5 w-5" />
              Ver Proceso de Investigación
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Timeline detallado del análisis de la IA
            </p>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg space-y-3">
            <button
              onClick={handleApprove}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <CheckCircle className="h-5 w-5" />
              Aprobar y Publicar
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Save className="h-5 w-5" />
              Guardar Borrador
            </button>

            <button
              onClick={handleReject}
              className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <XCircle className="h-5 w-5" />
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
