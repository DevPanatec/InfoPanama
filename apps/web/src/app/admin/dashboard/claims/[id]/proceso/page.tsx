'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import {
  ArrowLeft,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  Brain,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react'

// Demo data del proceso de investigación (FALLBACK)
const DEMO_PROCESO = {
  claimId: '1',
  title: 'Gobierno anuncia nueva inversión en infraestructura de $500 millones',
  startTime: '2024-01-15 10:30:00',
  endTime: '2024-01-15 10:32:45',
  duration: '2 min 45 seg',
  verdict: 'TRUE',
  confidence: 95,
  steps: [
    {
      id: 1,
      type: 'identification',
      title: 'Identificación de declaración',
      timestamp: '10:30:00',
      duration: '2 seg',
      status: 'completed',
      description: 'Declaración detectada en conferencia de prensa del Presidente',
      details: {
        source: 'Conferencia de prensa - Palacio de las Garzas',
        speaker: 'José Raúl Mulino',
        date: '15 de enero de 2024',
        claim: 'El gobierno invertirá $500 millones en proyectos de infraestructura para el próximo año fiscal.'
      }
    },
    {
      id: 2,
      type: 'search_official',
      title: 'Búsqueda en fuentes oficiales',
      timestamp: '10:30:02',
      duration: '15 seg',
      status: 'completed',
      description: 'Consultando bases de datos gubernamentales',
      details: {
        sourcesSearched: [
          { name: 'Ministerio de Economía y Finanzas', found: true, relevance: 'Alta' },
          { name: 'Presidencia de la República', found: true, relevance: 'Alta' },
          { name: 'Contraloría General', found: true, relevance: 'Media' },
          { name: 'Asamblea Nacional', found: false, relevance: 'Baja' }
        ],
        documentsFound: 3
      }
    },
    {
      id: 3,
      type: 'document_analysis',
      title: 'Análisis de documentos oficiales',
      timestamp: '10:30:17',
      duration: '30 seg',
      status: 'completed',
      description: 'Extrayendo y verificando información de documentos encontrados',
      details: {
        documents: [
          {
            name: 'Comunicado oficial MEF - 15/01/2024',
            url: 'https://mef.gob.pa/comunicados/2024-001',
            keyFindings: 'Confirma inversión de $500 millones aprobada para infraestructura vial y transporte'
          },
          {
            name: 'Presupuesto Nacional 2024 - Anexo C',
            url: 'https://mef.gob.pa/presupuesto/2024/anexo-c',
            keyFindings: 'Detalla distribución: $300M vías, $150M transporte público, $50M puentes'
          },
          {
            name: 'Resolución de Gabinete No. 5-2024',
            url: 'https://presidencia.gob.pa/resoluciones/2024-005',
            keyFindings: 'Aprueba plan de infraestructura con monto total de $500 millones'
          }
        ]
      }
    },
    {
      id: 4,
      type: 'search_media',
      title: 'Verificación cruzada con medios',
      timestamp: '10:30:47',
      duration: '20 seg',
      status: 'completed',
      description: 'Comparando con cobertura de medios de comunicación',
      details: {
        mediaSearched: [
          { name: 'La Prensa', found: true, consistent: true, headline: 'MEF confirma inversión de $500M en infraestructura' },
          { name: 'TVN Noticias', found: true, consistent: true, headline: 'Gobierno anuncia millonaria inversión' },
          { name: 'Telemetro', found: true, consistent: false, headline: 'Inversión podría superar los $600 millones' },
          { name: 'Critica', found: false, consistent: null, headline: null }
        ],
        consistency: '75%'
      }
    },
    {
      id: 5,
      type: 'data_verification',
      title: 'Verificación de datos numéricos',
      timestamp: '10:31:07',
      duration: '25 seg',
      status: 'completed',
      description: 'Validando cifras y montos mencionados',
      details: {
        verifications: [
          { item: 'Monto total: $500 millones', verified: true, source: 'Presupuesto Nacional 2024' },
          { item: 'Año fiscal: 2024', verified: true, source: 'Resolución de Gabinete' },
          { item: 'Sector: Infraestructura', verified: true, source: 'Comunicado MEF' }
        ],
        allVerified: true
      }
    },
    {
      id: 6,
      type: 'context_analysis',
      title: 'Análisis de contexto',
      timestamp: '10:31:32',
      duration: '20 seg',
      status: 'completed',
      description: 'Evaluando contexto histórico y comparativo',
      details: {
        historicalContext: 'Inversión 30% mayor que el año anterior ($385M en 2023)',
        politicalContext: 'Anuncio realizado 6 meses después de inicio de gobierno',
        economicContext: 'PIB proyectado crecer 5.2% en 2024'
      }
    },
    {
      id: 7,
      type: 'contradiction_check',
      title: 'Búsqueda de contradicciones',
      timestamp: '10:31:52',
      duration: '15 seg',
      status: 'completed',
      description: 'Identificando posibles inconsistencias',
      details: {
        contradictions: [
          {
            source: 'Telemetro',
            issue: 'Reporta $600 millones en lugar de $500 millones',
            resolution: 'Error del medio - documento oficial confirma $500M',
            severity: 'Baja'
          }
        ],
        majorContradictions: false
      }
    },
    {
      id: 8,
      type: 'conclusion',
      title: 'Generación de conclusión',
      timestamp: '10:32:07',
      duration: '38 seg',
      status: 'completed',
      description: 'Sintetizando hallazgos y determinando veredicto',
      details: {
        verdict: 'VERDADERO',
        confidence: 95,
        reasoning: 'La declaración es verificable con múltiples fuentes oficiales. El monto de $500 millones está confirmado en el Presupuesto Nacional 2024 y en comunicados oficiales del MEF. La única inconsistencia menor proviene de un medio que reportó un monto diferente, pero los documentos oficiales son consistentes.',
        keyEvidence: [
          'Presupuesto Nacional 2024 - Anexo C',
          'Comunicado oficial MEF',
          'Resolución de Gabinete No. 5-2024'
        ]
      }
    }
  ]
}

export default function ProcesoInvestigacionPage() {
  const router = useRouter()
  const params = useParams()
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const claimId = params.id as Id<'claims'>

  // Obtener el claim
  const claim = useQuery(api.claims.getById, { id: claimId })

  // Obtener el veredicto más reciente
  const verdict = useQuery(api.verdicts.getByClaimId, { claimId })

  // Obtener los pasos de investigación
  const investigationSteps = useQuery(api.verification.getInvestigationSteps, { claimId })

  // Loading state
  if (claim === undefined || investigationSteps === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando proceso de investigación...</p>
        </div>
      </div>
    )
  }

  // Si no hay claim, mostrar error
  if (!claim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Claim no encontrado</p>
        </div>
      </div>
    )
  }

  // Si no hay pasos de investigación, usar demo data como fallback
  const hasRealData = investigationSteps && investigationSteps.length > 0

  // Transformar datos reales al formato esperado
  const proceso = hasRealData ? {
    claimId: claim._id,
    title: claim.title,
    startTime: investigationSteps[0]?.timestamp
      ? new Date(investigationSteps[0].timestamp).toLocaleString('es-PA')
      : 'N/A',
    endTime: investigationSteps[investigationSteps.length - 1]?.timestamp
      ? new Date(investigationSteps[investigationSteps.length - 1].timestamp).toLocaleString('es-PA')
      : 'N/A',
    duration: investigationSteps[0] && investigationSteps[investigationSteps.length - 1]
      ? `${Math.round((investigationSteps[investigationSteps.length - 1].timestamp - investigationSteps[0].timestamp) / 1000)} seg`
      : 'N/A',
    verdict: verdict?.verdict || claim.verdict || 'UNPROVEN',
    confidence: verdict?.confidenceScore || 0,
    steps: investigationSteps.map(step => ({
      id: step.stepNumber,
      type: step.stepType,
      title: step.title,
      timestamp: new Date(step.timestamp).toLocaleTimeString('es-PA'),
      duration: `${Math.round(step.duration / 1000)} seg`,
      status: step.status,
      description: step.description,
      details: step.details,
      findings: step.findings
    }))
  } : DEMO_PROCESO

  const getStepIcon = (type: string) => {
    const icons: Record<string, typeof Search> = {
      identification: FileText,
      search_official: Database,
      document_analysis: FileText,
      search_media: Globe,
      data_verification: CheckCircle,
      context_analysis: Brain,
      contradiction_check: AlertTriangle,
      conclusion: CheckCircle,
      preparation: Database,
      source_search: Database,
      ai_analysis: Brain,
      evidence_evaluation: CheckCircle,
      verdict_determination: CheckCircle
    }
    return icons[type] || Search
  }

  const getStepColor = (type: string) => {
    const colors: Record<string, string> = {
      identification: 'bg-blue-500',
      search_official: 'bg-slate-500',
      document_analysis: 'bg-indigo-500',
      search_media: 'bg-orange-500',
      data_verification: 'bg-green-500',
      context_analysis: 'bg-cyan-500',
      contradiction_check: 'bg-yellow-500',
      conclusion: 'bg-emerald-500',
      preparation: 'bg-indigo-500',
      source_search: 'bg-slate-500',
      ai_analysis: 'bg-cyan-500',
      evidence_evaluation: 'bg-green-500',
      verdict_determination: 'bg-emerald-500'
    }
    return colors[type] || 'bg-gray-500'
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
          Volver a Revisión
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              Proceso de Investigación
            </h1>
            <p className="text-gray-600">Timeline detallado del análisis realizado por la IA</p>
          </div>

          {/* Indicador de tipo de datos */}
          {!hasRealData && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Mostrando datos de demostración</span>
            </div>
          )}
          {hasRealData && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Datos reales de verificación</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Declaración</p>
            <p className="font-semibold text-gray-900 text-sm">{proceso.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Duración total</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="font-semibold text-gray-900">{proceso.duration}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Veredicto</p>
            <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-semibold ${
              proceso.verdict === 'TRUE'
                ? 'bg-green-500/10 text-green-600'
                : 'bg-red-500/10 text-red-600'
            }`}>
              {proceso.verdict === 'TRUE' ? (
                <><CheckCircle className="h-4 w-4" /> Verdadero</>
              ) : (
                <><XCircle className="h-4 w-4" /> Falso</>
              )}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Confianza</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${proceso.confidence}%` }}
                />
              </div>
              <span className="font-semibold text-green-600">{proceso.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {proceso.steps.map((step, index) => {
          const Icon = getStepIcon(step.type)
          const isExpanded = expandedStep === step.id

          return (
            <div key={step.id} className="relative">
              {/* Línea conectora */}
              {index < proceso.steps.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200" />
              )}

              <div
                className={`bg-white rounded-2xl border-2 transition-all cursor-pointer ${
                  isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                {/* Header del paso */}
                <div className="p-4 flex items-center gap-4">
                  <div className={`${getStepColor(step.type)} p-3 rounded-xl text-white flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">{step.timestamp}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{step.duration}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Completado
                    </span>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="ml-16 space-y-3">
                      {/* Si hay findings (datos reales), mostrar eso primero */}
                      {(step as any).findings && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-2">Hallazgos:</p>
                          <p className="text-sm text-blue-800 whitespace-pre-line">{(step as any).findings}</p>
                        </div>
                      )}

                      {/* Si hay details (objeto), mostrar según el tipo */}
                      {step.details && typeof step.details === 'object' && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <p className="text-sm font-medium text-gray-900 mb-2">Detalles técnicos:</p>
                          <pre className="text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Renderizar detalles específicos según el tipo de paso (solo para mock data) */}
                      {step.type === 'identification' && step.details && step.details.source && (
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Fuente:</span> {step.details.source}</p>
                          <p><span className="font-medium">Declarante:</span> {step.details.speaker}</p>
                          <p><span className="font-medium">Fecha:</span> {step.details.date}</p>
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <p className="font-medium mb-1">Declaración:</p>
                            <p className="italic text-gray-700">"{step.details.claim}"</p>
                          </div>
                        </div>
                      )}

                      {step.type === 'search_official' && step.details && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Fuentes consultadas:</p>
                          <div className="space-y-1">
                            {step.details.sourcesSearched?.map((source: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                <span>{source.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs ${source.found ? 'text-green-600' : 'text-gray-400'}`}>
                                    {source.found ? 'Encontrado' : 'No encontrado'}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    source.relevance === 'Alta' ? 'bg-green-100 text-green-600' :
                                    source.relevance === 'Media' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {source.relevance}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            Documentos encontrados: <span className="font-semibold">{step.details.documentsFound}</span>
                          </p>
                        </div>
                      )}

                      {step.type === 'document_analysis' && step.details && (
                        <div className="space-y-3">
                          {step.details.documents?.map((doc: any, i: number) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg border">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-medium text-sm">{doc.name}</p>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                              <p className="text-sm text-gray-600">{doc.keyFindings}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {step.type === 'search_media' && step.details && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Medios consultados:</p>
                          <div className="space-y-1">
                            {step.details.mediaSearched?.map((media: any, i: number) => (
                              <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{media.name}</span>
                                  {media.found && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      media.consistent ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                      {media.consistent ? 'Consistente' : 'Inconsistente'}
                                    </span>
                                  )}
                                </div>
                                {media.headline && (
                                  <p className="text-gray-600 text-xs">"{media.headline}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            Consistencia general: <span className="font-semibold">{step.details.consistency}</span>
                          </p>
                        </div>
                      )}

                      {step.type === 'data_verification' && step.details && (
                        <div className="space-y-2">
                          {step.details.verifications?.map((v: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <span>{v.item}</span>
                              <div className="flex items-center gap-2">
                                {v.verified ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-xs text-gray-500">{v.source}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {step.type === 'context_analysis' && step.details && (
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Contexto histórico:</span> {step.details.historicalContext}</p>
                          <p><span className="font-medium">Contexto político:</span> {step.details.politicalContext}</p>
                          <p><span className="font-medium">Contexto económico:</span> {step.details.economicContext}</p>
                        </div>
                      )}

                      {step.type === 'contradiction_check' && step.details && (
                        <div className="space-y-2">
                          {step.details.contradictions && step.details.contradictions.length > 0 ? (
                            step.details.contradictions.map((c: any, i: number) => (
                              <div key={i} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-sm font-medium text-yellow-800">{c.source}</p>
                                <p className="text-sm text-yellow-700">{c.issue}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Resolución:</span> {c.resolution}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-green-600">No se encontraron contradicciones significativas</p>
                          )}
                        </div>
                      )}

                      {step.type === 'conclusion' && step.details && (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-lg ${
                            step.details.verdict === 'VERDADERO' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                          }`}>
                            <p className="font-semibold mb-2">Razonamiento:</p>
                            <p className="text-sm text-gray-700">{step.details.reasoning}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Evidencia clave:</p>
                            <ul className="space-y-1">
                              {step.details.keyEvidence?.map((e: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
