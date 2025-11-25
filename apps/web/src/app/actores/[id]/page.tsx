'use client'

import { Shield, AlertTriangle, Calendar } from 'lucide-react'
import Link from 'next/link'

// Demo data - en producción viene de Convex
const DEMO_ACTOR = {
  id: 'ACT-001',
  name: 'Actor Político Ejemplo',
  type: 'person',
  riskLevel: 'MEDIUM',
  kyaStatus: 'verified',
  credibilityScore: 65,
  description: 'Figura política activa en redes sociales y medios de comunicación nacional. Historial mixto en cuanto a precisión de declaraciones públicas.',
  createdAt: '2024-01-01',
  lastActivity: '2024-01-15',
  totalClaims: 12,
  verifiedClaims: 8,
  statistics: {
    trueStatements: 4,
    falseStatements: 2,
    mixedStatements: 6,
    totalReach: 150000,
  },
  dueDiligence: {
    status: 'completed',
    completeness: 85,
    lastUpdate: '2024-01-10',
    findings: [
      'Sin vínculos con redes de desinformación conocidas',
      'Historial de declaraciones imprecisas sobre economía',
      'Fuente confiable en temas de política local',
    ],
  },
  recentClaims: [
    {
      id: '1',
      title: 'Reducción de impuestos para pequeñas empresas',
      verdict: 'TRUE',
      date: '2024-01-15',
    },
    {
      id: '2',
      title: 'Aumento del 50% en presupuesto educativo',
      verdict: 'MIXED',
      date: '2024-01-10',
    },
    {
      id: '3',
      title: 'Cifras de empleo histórico',
      verdict: 'FALSE',
      date: '2024-01-05',
    },
  ],
  activityTimeline: [
    { date: '2024-01-15', event: 'Declaración verificada como verdadera', type: 'positive' },
    { date: '2024-01-10', event: 'Declaración parcialmente verificada', type: 'mixed' },
    { date: '2024-01-05', event: 'Declaración marcada como falsa', type: 'negative' },
  ],
}

export default function ActorDetailPage() {
  // En producción: const params = useParams() y const actorId = params.id para fetch de Convex

  const getRiskBadge = (level: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      LOW: { color: 'bg-green-500', label: 'Bajo' },
      MEDIUM: { color: 'bg-yellow-500', label: 'Medio' },
      HIGH: { color: 'bg-orange-500', label: 'Alto' },
      CRITICAL: { color: 'bg-red-500', label: 'Crítico' },
    }
    const config = configs[level]
    return (
      <span className={`${config.color} text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-semibold`}>
        <Shield className="h-4 w-4" />
        Riesgo: {config.label}
      </span>
    )
  }

  const getVerdictBadge = (verdict: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      TRUE: { color: 'bg-green-500/10 text-green-500', label: 'Verdadero' },
      FALSE: { color: 'bg-red-500/10 text-red-500', label: 'Falso' },
      MIXED: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Mixto' },
    }
    const config = configs[verdict]
    return <span className={`text-xs ${config.color} px-2 py-1 rounded`}>{config.label}</span>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Link href="/verificaciones" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2">
          ← Volver a Verificaciones
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-3">{DEMO_ACTOR.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm bg-muted px-3 py-1 rounded capitalize">
                  {DEMO_ACTOR.type}
                </span>
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded">
                  KYA: Verificado
                </span>
              </div>
            </div>
            {getRiskBadge(DEMO_ACTOR.riskLevel)}
          </div>
          <p className="text-lg text-muted-foreground">{DEMO_ACTOR.description}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-500">
              {DEMO_ACTOR.statistics.trueStatements}
            </div>
            <div className="text-sm text-muted-foreground">Declaraciones Verdaderas</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-500">
              {DEMO_ACTOR.statistics.mixedStatements}
            </div>
            <div className="text-sm text-muted-foreground">Parcialmente Verdaderas</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-red-500">
              {DEMO_ACTOR.statistics.falseStatements}
            </div>
            <div className="text-sm text-muted-foreground">Declaraciones Falsas</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold">{DEMO_ACTOR.credibilityScore}%</div>
            <div className="text-sm text-muted-foreground">Score de Credibilidad</div>
          </div>
        </div>

        {/* Credibility Score */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Credibilidad General</h2>
            <span className="text-2xl font-bold">{DEMO_ACTOR.credibilityScore}%</span>
          </div>
          <div className="bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${
                DEMO_ACTOR.credibilityScore >= 70
                  ? 'bg-green-500'
                  : DEMO_ACTOR.credibilityScore >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${DEMO_ACTOR.credibilityScore}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Basado en {DEMO_ACTOR.totalClaims} declaraciones verificadas
          </p>
        </div>

        {/* Due Diligence */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Debida Diligencia (DD)</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <span className="text-sm bg-green-500/10 text-green-500 px-3 py-1 rounded">
                Completado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completitud:</span>
              <span className="text-sm font-semibold">{DEMO_ACTOR.dueDiligence.completeness}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última Actualización:</span>
              <span className="text-sm">{DEMO_ACTOR.dueDiligence.lastUpdate}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="font-semibold mb-2">Hallazgos Clave:</h3>
            <ul className="space-y-2">
              {DEMO_ACTOR.dueDiligence.findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Declaraciones Recientes</h2>
          <div className="space-y-3">
            {DEMO_ACTOR.recentClaims.map((claim) => (
              <Link
                key={claim.id}
                href={`/verificaciones/${claim.id}`}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition"
              >
                <div className="flex-1">
                  <p className="font-medium mb-1">{claim.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {claim.date}
                  </div>
                </div>
                {getVerdictBadge(claim.verdict)}
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Línea de Tiempo de Actividad</h2>
          <div className="space-y-4">
            {DEMO_ACTOR.activityTimeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      item.type === 'positive'
                        ? 'bg-green-500'
                        : item.type === 'negative'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  {index < DEMO_ACTOR.activityTimeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                  <p className="font-medium">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Note */}
        <div className="mt-8 bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Transparencia y Metodología
          </h3>
          <p className="text-sm text-muted-foreground">
            Los perfiles de actores se actualizan continuamente basándose en verificaciones públicas.
            El score de credibilidad es calculado mediante IA analizando precisión histórica, consistencia
            y confiabilidad de fuentes. <Link href="/metodologia" className="text-primary hover:underline">Conoce más sobre nuestra metodología</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
