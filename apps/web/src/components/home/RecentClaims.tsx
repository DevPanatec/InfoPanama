'use client'

import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

interface Claim {
  _id: Id<'claims'>
  title: string
  description: string
  status: string
  category?: string
  publishedAt?: number
  createdAt: number
  verdict: 'TRUE' | 'FALSE' | 'MIXED' | 'UNPROVEN' | 'NEEDS_CONTEXT' | null
  imageUrl?: string
}

export function RecentClaims() {
  const claims = useQuery(api.claims.publicClaims, { limit: 5 })

  if (!claims) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (claims.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center animate-fade-in">
        <p className="text-slate-500">No hay verificaciones publicadas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {claims.map((claim, index) => (
        <div
          key={claim._id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
        >
          <ClaimCard claim={claim} />
        </div>
      ))}
    </div>
  )
}

function ClaimCard({ claim }: { claim: Claim }) {
  const getVerdictInfo = (verdictType: string | null) => {
    switch (verdictType) {
      case 'TRUE':
        return {
          icon: CheckCircle2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-500',
          label: 'Verdadero'
        }
      case 'FALSE':
        return {
          icon: XCircle,
          color: 'text-slate-600',
          bgColor: 'bg-slate-500',
          label: 'Falso'
        }
      case 'MIXED':
        return {
          icon: HelpCircle,
          color: 'text-blue-500',
          bgColor: 'bg-blue-400',
          label: 'Mixto'
        }
      case 'UNPROVEN':
        return {
          icon: HelpCircle,
          color: 'text-slate-600',
          bgColor: 'bg-slate-600',
          label: 'Sin Pruebas'
        }
      case 'NEEDS_CONTEXT':
        return {
          icon: HelpCircle,
          color: 'text-sky-600',
          bgColor: 'bg-sky-500',
          label: 'Requiere Contexto'
        }
      default:
        return {
          icon: HelpCircle,
          color: 'text-blue-500',
          bgColor: 'bg-blue-400',
          label: 'En Verificación'
        }
    }
  }

  const verdictInfo = getVerdictInfo(claim.verdict)
  const Icon = verdictInfo.icon

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    const days = Math.floor(seconds / 86400)

    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `hace ${days} días`
    const weeks = Math.floor(days / 7)
    if (weeks === 1) return 'hace 1 semana'
    return `hace ${weeks} semanas`
  }

  return (
    <Link
      href={`/verificaciones/${claim._id}`}
      className="group flex gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Thumbnail / Image or Verdict Badge */}
      <div className="flex-shrink-0 relative overflow-hidden rounded-xl">
        {claim.imageUrl ? (
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 relative">
            <img
              src={claim.imageUrl}
              alt={claim.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Verdict badge overlay */}
            <div className={`absolute bottom-1 right-1 w-7 h-7 ${verdictInfo.bgColor} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
        ) : (
          <div className={`w-24 h-24 ${verdictInfo.bgColor} rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}>
            <Icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-2">
          {claim.category && (
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded capitalize">
              {claim.category}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {timeAgo(claim.publishedAt ?? claim.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 mb-1.5 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
          {claim.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-2 group-hover:text-slate-700 transition-colors duration-300">
          {claim.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 group-hover:text-slate-500 transition-colors duration-300">
            {timeAgo(claim.publishedAt || claim.createdAt)}
          </span>
          <span className={`text-xs font-bold ${verdictInfo.color} flex items-center gap-1 group-hover:gap-2 transition-all duration-300`}>
            {verdictInfo.label}
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>
    </Link>
  )
}
