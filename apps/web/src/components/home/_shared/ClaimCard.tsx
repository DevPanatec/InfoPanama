'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Claim } from './types'
import { getVerdictInfo, timeAgo } from './verdictHelpers'

interface ClaimCardProps {
  claim: Claim
  variant?: 'featured' | 'compact'
  animationDelay?: number
}

/**
 * Componente reutilizable para mostrar cards de claims
 *
 * @param variant - 'featured' muestra card grande con imagen, 'compact' muestra card pequeño
 * @param animationDelay - Delay en ms para animación de entrada
 */
export function ClaimCard({ claim, variant = 'featured', animationDelay = 0 }: ClaimCardProps) {
  const verdictInfo = getVerdictInfo(claim.verdict)
  const Icon = verdictInfo.icon

  if (variant === 'compact') {
    return (
      <Link
        href={`/verificaciones/${claim._id}`}
        className="group flex gap-3 pb-4 border-b border-slate-200 hover:border-digital-blue transition-all duration-300 last:border-b-0 last:pb-0"
      >
        {/* Thumbnail pequeño */}
        {claim.imageUrl && (
          <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
            <img
              src={claim.imageUrl}
              alt={claim.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-deep-blue text-sm mb-1 group-hover:text-digital-blue transition-colors line-clamp-2 leading-snug">
            {claim.title}
          </h4>

          <p className="text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">
            {claim.description}
          </p>

          <div className="flex items-center gap-2">
            {claim.category && (
              <span className="text-xs font-medium text-slate-600 italic">
                {claim.category}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Variant: 'featured' (default)
  return (
    <Link
      href={`/verificaciones/${claim._id}`}
      className="group flex flex-col bg-white rounded-xl border border-slate-200 hover:border-digital-blue hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden h-full"
    >
      {/* Image or Verdict Badge */}
      <div className="relative overflow-hidden">
        {claim.imageUrl ? (
          <div className="w-full h-48 bg-slate-100 relative">
            <img
              src={claim.imageUrl}
              alt={claim.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Verdict badge overlay */}
            <div className={`absolute top-3 right-3 px-3 py-1 ${verdictInfo.bgColor} rounded-lg flex items-center gap-1.5 shadow-md`}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white">{verdictInfo.label}</span>
            </div>
          </div>
        ) : (
          <div className={`w-full h-48 ${verdictInfo.bgColor} flex flex-col items-center justify-center`}>
            <Icon className="h-16 w-16 text-white mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-bold text-white">{verdictInfo.label}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Category & Date */}
        <div className="flex items-center gap-2 mb-3">
          {claim.category && (
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-verifica-blue rounded capitalize">
              {claim.category}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {timeAgo(claim.publishedAt ?? claim.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-deep-blue mb-2 group-hover:text-digital-blue transition-colors duration-300 line-clamp-2 text-base">
          {claim.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-blue-gray line-clamp-3 mb-4 flex-1 leading-relaxed">
          {claim.description}
        </p>

        {/* Read more link */}
        <div className="flex items-center justify-end">
          <span className="text-sm font-semibold text-digital-blue flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
            Leer más
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>
    </Link>
  )
}
