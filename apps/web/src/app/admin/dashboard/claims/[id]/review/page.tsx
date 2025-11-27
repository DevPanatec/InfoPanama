'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Save, Eye, Sparkles, Loader2 } from 'lucide-react'
import { useQuery, useAction, useMutation } from 'convex/react'
import { api } from '@infopanama/convex'
import { Id } from '@infopanama/convex/convex/_generated/dataModel'

export default function ReviewClaimPage() {
  const router = useRouter()
  const params = useParams()
  const claimId = params.id as Id<'claims'>

  // Obtener claim y veredicto de Convex
  const claim = useQuery(api.claims.getById, { id: claimId })
  const verifyClaim = useAction(api.verification.verifyClaim)

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
      console.log('🤖 Ejecutando verificación con GPT-5 mini...')
      const result = await verifyClaim({ claimId: claim._id })
      console.log('✅ Verificación completada:', result)

      setVerificationResult(result)
      setVerdict(result.verdict)
      setEditedAnalysis(result.explanation || '')

      alert(`Verificación completada con IA!\n\nVeredicto: ${result.verdict}\nConfianza: ${result.confidenceScore}%\n\nRevisa el análisis generado.`)
    } catch (error) {
      console.error('Error al verificar con IA:', error)
      alert('Error al ejecutar verificación con IA. Verifica los logs.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleApprove = () => {
    if (!verdict) {
      alert('Por favor selecciona un veredicto antes de aprobar')
      return
    }

    // Aquí iría la lógica para aprobar y publicar
    alert('Verificación aprobada y publicada')
    router.push('/admin/dashboard/claims')
  }

  const handleSaveDraft = () => {
    // Aquí iría la lógica para guardar como borrador
    alert('Cambios guardados como borrador')
  }

  const handleReject = () => {
    // Aquí iría la lógica para rechazar
    if (confirm('¿Estás seguro de que deseas rechazar esta verificación?')) {
      alert('Verificación rechazada')
      router.push('/admin/dashboard/claims')
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Revisar y Aprobar Verificación
            </h1>
            <p className="text-gray-600">ID: {params.id}</p>
          </div>

          {/* Botón de Verificación con IA */}
          <button
            onClick={handleVerifyWithAI}
            disabled={isVerifying}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Verificar con GPT-5 mini
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
            />
          </div>

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

          {/* Fuentes */}
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
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold"
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
