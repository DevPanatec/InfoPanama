import { CheckCircle2, XCircle, HelpCircle, type LucideIcon } from 'lucide-react'
import type { VerdictType } from './types'

export interface VerdictInfo {
  icon: LucideIcon
  color: string
  bgColor: string
  label: string
}

/**
 * Obtiene la información visual para cada tipo de veredicto
 * Usado en FeaturedClaims y LatestClaims
 */
export function getVerdictInfo(verdict?: VerdictType): VerdictInfo {
  switch (verdict) {
    case 'TRUE':
      return {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        label: 'Verdadero'
      }
    case 'FALSE':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        label: 'Falso'
      }
    case 'MIXED':
      return {
        icon: HelpCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500',
        label: 'Mixto'
      }
    case 'UNPROVEN':
      return {
        icon: HelpCircle,
        color: 'text-slate-600',
        bgColor: 'bg-slate-500',
        label: 'Sin Pruebas'
      }
    case 'NEEDS_CONTEXT':
      return {
        icon: HelpCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        label: 'Necesita Contexto'
      }
    default:
      return {
        icon: HelpCircle,
        color: 'text-slate-600',
        bgColor: 'bg-slate-400',
        label: 'En Verificación'
      }
  }
}

/**
 * Convierte un timestamp a formato "hace X tiempo"
 * Ej: "Hoy", "Ayer", "hace 3 días", "hace 2 semanas"
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  const days = Math.floor(seconds / 86400)

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `hace ${days} días`

  const weeks = Math.floor(days / 7)
  if (weeks === 1) return 'hace 1 semana'
  return `hace ${weeks} semanas`
}
