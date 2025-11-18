'use client'

import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function RecentClaims() {
  const claims = useQuery(api.claims.publicClaims, { limit: 6 })

  if (!claims) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg p-6 border border-border animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay verificaciones disponibles aún.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {claims.map((claim) => (
        <ClaimCard key={claim._id} claim={claim} />
      ))}
    </div>
  )
}

function ClaimCard({ claim }: { claim: any }) {
  const verdict = useQuery(api.verdicts.getLatestByClaimId, { claimId: claim._id })

  const getVerdictInfo = (verdictType?: string) => {
    switch (verdictType) {
      case 'TRUE':
        return { icon: CheckCircle2, color: 'text-verdict-true', label: 'Verdadero' }
      case 'FALSE':
        return { icon: XCircle, color: 'text-verdict-false', label: 'Falso' }
      case 'MIXED':
        return { icon: AlertTriangle, color: 'text-verdict-mixed', label: 'Mixto' }
      case 'UNPROVEN':
        return { icon: HelpCircle, color: 'text-verdict-unproven', label: 'No Probado' }
      default:
        return { icon: HelpCircle, color: 'text-muted-foreground', label: 'Verificando...' }
    }
  }

  const verdictInfo = getVerdictInfo(verdict?.verdict)
  const Icon = verdictInfo.icon

  return (
    <a
      href={`/verificacion/${claim._id}`}
      className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition group"
    >
      {/* Verdict Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${verdictInfo.color}`} />
        <span className={`text-sm font-semibold ${verdictInfo.color}`}>
          {verdictInfo.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition">
        {claim.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {claim.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {formatDistanceToNow(new Date(claim.publishedAt || claim.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </span>
        <span className="capitalize">{claim.category || 'General'}</span>
      </div>
    </a>
  )
}
