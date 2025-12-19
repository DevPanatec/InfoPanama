'use client'

import type { Claim } from './_shared/types'
import { ClaimCard } from './_shared/ClaimCard'

interface FeaturedClaimsProps {
  claims: Claim[]
}

export function FeaturedClaims({ claims }: FeaturedClaimsProps) {
  if (!claims || claims.length === 0) {
    return (
      <div className="col-span-2 bg-white rounded-xl p-8 border border-slate-200 text-center">
        <p className="text-slate-500">No hay verificaciones destacadas aún.</p>
      </div>
    )
  }

  return (
    <>
      {claims.map((claim, index) => (
        <div
          key={claim._id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
        >
          <ClaimCard claim={claim} variant="featured" animationDelay={index * 100} />
        </div>
      ))}
    </>
  )
}
