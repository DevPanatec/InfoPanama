'use client'

import type { Claim } from './_shared/types'
import { ClaimCard } from './_shared/ClaimCard'

interface LatestClaimsProps {
  claims: Claim[]
}

export function LatestClaims({ claims }: LatestClaimsProps) {
  if (!claims || claims.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
        <p className="text-slate-500 text-sm">No hay verificaciones publicadas aún.</p>
      </div>
    )
  }

  return (
    <>
      {claims.map((claim) => (
        <ClaimCard key={claim._id} claim={claim} variant="compact" />
      ))}
    </>
  )
}
