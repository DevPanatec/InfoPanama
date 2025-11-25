'use client'

import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Demo data - en producción viene de Convex
const DEMO_MEDIO = {
  slug: 'la-prensa',
  name: 'La Prensa',
  type: 'media',
  url: 'https://www.prensa.com',
  description: 'Medio de comunicación panameño con amplia trayectoria en periodismo de investigación y noticias nacionales.',
  credibilityScore: 90,
  isTrusted: true,
  foundedYear: 1980,
  lastScraped: '2024-01-15 10:30',
  statistics: {
    totalArticles: 2456,
    verifiedClaims: 45,
    accuracy: 87,
    bias: 'center',
  },
  coverage: {
    politics: 35,
    economy: 25,
    social: 20,
    international: 15,
    other: 5,
  },
  recentArticles: [
    {
      id: '1',
      title: 'Presidente anuncia inversión en infraestructura',
      url: 'https://prensa.com/...',
      publishedAt: '2024-01-15',
      relatedClaim: 'CLM-001',
      verified: true,
    },
    {
      id: '2',
      title: 'Cifras económicas del cuarto trimestre',
      url: 'https://prensa.com/...',
      publishedAt: '2024-01-14',
      relatedClaim: 'CLM-002',
      verified: true,
    },
    {
      id: '3',
      title: 'Análisis: Presupuesto 2024 y sus implicaciones',
      url: 'https://prensa.com/...',
      publishedAt: '2024-01-12',
      relatedClaim: null,
      verified: false,
    },
  ],
  metrics: {
    responseTime: '2-4 horas',
    updateFrequency: 'Cada 6 horas',
    sourcesUsed: 12,
    factCheckRate: 85,
  },
  biasAnalysis: {
    overall: 'Centro',
    description: 'Cobertura balanceada con ligera tendencia a citar fuentes oficiales. Mantiene estándares periodísticos profesionales.',
  },
}

export default function MedioDetailPage() {
  // En producción: const params = useParams() y const medioSlug = params.slug para fetch de Convex

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Link href="/medios" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2">
          ← Volver a Medios
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-3">{DEMO_MEDIO.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm bg-muted px-3 py-1 rounded capitalize">
                  {DEMO_MEDIO.type}
                </span>
                {DEMO_MEDIO.isTrusted && (
                  <span className="text-sm bg-green-500/10 text-green-500 px-3 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Fuente Confiable
                  </span>
                )}
              </div>
              <a
                href={DEMO_MEDIO.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {DEMO_MEDIO.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{DEMO_MEDIO.credibilityScore}%</div>
              <div className="text-sm text-muted-foreground">Credibilidad</div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">{DEMO_MEDIO.description}</p>
        </div>

        {/* Credibility Score */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Score de Credibilidad</h2>
            <span className="text-2xl font-bold text-green-500">{DEMO_MEDIO.credibilityScore}%</span>
          </div>
          <div className="bg-muted rounded-full h-4 overflow-hidden mb-2">
            <div
              className="h-full bg-green-500"
              style={{ width: `${DEMO_MEDIO.credibilityScore}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Basado en {DEMO_MEDIO.statistics.verifiedClaims} verificaciones y análisis de {DEMO_MEDIO.statistics.totalArticles} artículos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold">{DEMO_MEDIO.statistics.totalArticles}</div>
            <div className="text-sm text-muted-foreground">Artículos Scraped</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold">{DEMO_MEDIO.statistics.verifiedClaims}</div>
            <div className="text-sm text-muted-foreground">Claims Verificadas</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-500">{DEMO_MEDIO.statistics.accuracy}%</div>
            <div className="text-sm text-muted-foreground">Precisión</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold">{DEMO_MEDIO.metrics.factCheckRate}%</div>
            <div className="text-sm text-muted-foreground">Fact-Check Rate</div>
          </div>
        </div>

        {/* Coverage Distribution */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Distribución de Cobertura</h2>
          <div className="space-y-3">
            {Object.entries(DEMO_MEDIO.coverage).map(([category, percentage]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm capitalize">{category}</span>
                  <span className="text-sm font-semibold">{percentage}%</span>
                </div>
                <div className="bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bias Analysis */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Análisis de Sesgo</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Orientación:</span>
            <span className="font-semibold bg-blue-500/10 text-blue-500 px-3 py-1 rounded">
              {DEMO_MEDIO.biasAnalysis.overall}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{DEMO_MEDIO.biasAnalysis.description}</p>
        </div>

        {/* Metrics */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Métricas de Scraping</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Tiempo de Respuesta</div>
              <div className="font-semibold">{DEMO_MEDIO.metrics.responseTime}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Frecuencia de Update</div>
              <div className="font-semibold">{DEMO_MEDIO.metrics.updateFrequency}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Fuentes Citadas</div>
              <div className="font-semibold">{DEMO_MEDIO.metrics.sourcesUsed}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Último Scrape</div>
              <div className="font-semibold">{DEMO_MEDIO.lastScraped}</div>
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Artículos Recientes</h2>
          <div className="space-y-3">
            {DEMO_MEDIO.recentArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 border border-border rounded-lg hover:bg-muted/20 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-primary flex items-center gap-2"
                    >
                      {article.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{article.publishedAt}</p>
                  </div>
                  {article.verified && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                  )}
                </div>
                {article.relatedClaim && (
                  <Link
                    href={`/verificaciones/${article.relatedClaim}`}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Ver verificación relacionada →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Note */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Sobre nuestro análisis
          </h3>
          <p className="text-sm text-muted-foreground">
            Los perfiles de medios se generan automáticamente mediante scraping y análisis de IA.
            El score de credibilidad se basa en precisión histórica, transparencia de fuentes,
            y consistencia editorial. Los datos se actualizan cada {DEMO_MEDIO.metrics.updateFrequency.toLowerCase()}.
            <Link href="/metodologia" className="text-primary hover:underline ml-1">Conoce más</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
