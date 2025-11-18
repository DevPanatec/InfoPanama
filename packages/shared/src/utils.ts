/**
 * Utilidades compartidas para InfoPanama
 */

import { VerdictType, RiskLevel, ClaimStatus, ActorType } from './types'
import {
  VERDICT_LABELS,
  VERDICT_COLORS,
  RISK_LABELS,
  RISK_COLORS,
  STATUS_LABELS,
  ACTOR_TYPE_LABELS,
} from './constants'

// ============================================
// VERDICT UTILS
// ============================================

export function getVerdictLabel(verdict: VerdictType): string {
  return VERDICT_LABELS[verdict]
}

export function getVerdictColor(verdict: VerdictType): string {
  return VERDICT_COLORS[verdict]
}

// ============================================
// RISK UTILS
// ============================================

export function getRiskLabel(risk: RiskLevel): string {
  return RISK_LABELS[risk]
}

export function getRiskColor(risk: RiskLevel): string {
  return RISK_COLORS[risk]
}

export function calculateRiskScore(
  factors: {
    sourceCredibility: number
    sentiment: number
    viralityPotential: number
    targetedEntity: boolean
  }
): number {
  const { sourceCredibility, sentiment, viralityPotential, targetedEntity } = factors

  let score = 0

  // Credibilidad de fuente (0-25 puntos)
  score += (100 - sourceCredibility) * 0.25

  // Sentimiento negativo (0-25 puntos)
  score += Math.abs(Math.min(sentiment, 0)) * 25

  // Potencial de viralidad (0-25 puntos)
  score += viralityPotential * 25

  // Entidad específica (0-25 puntos)
  if (targetedEntity) {
    score += 25
  }

  return Math.min(Math.round(score), 100)
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

// ============================================
// STATUS UTILS
// ============================================

export function getStatusLabel(status: ClaimStatus): string {
  return STATUS_LABELS[status]
}

export function canTransitionStatus(from: ClaimStatus, to: ClaimStatus): boolean {
  const transitions: Record<ClaimStatus, ClaimStatus[]> = {
    new: ['investigating', 'rejected'],
    investigating: ['review', 'rejected'],
    review: ['approved', 'rejected', 'investigating'],
    approved: ['published', 'review'],
    rejected: ['new'],
    published: ['review'], // Solo para correcciones
  }

  return transitions[from]?.includes(to) || false
}

// ============================================
// ACTOR UTILS
// ============================================

export function getActorTypeLabel(type: ActorType): string {
  return ACTOR_TYPE_LABELS[type]
}

export function isHighRiskActor(actor: { riskLevel: RiskLevel; kyaStatus: string }): boolean {
  return (
    actor.riskLevel === 'HIGH' ||
    actor.riskLevel === 'CRITICAL' ||
    actor.kyaStatus === 'flagged' ||
    actor.kyaStatus === 'blocked'
  )
}

// ============================================
// DATE UTILS
// ============================================

export function formatDate(timestamp: number, includeTime = false): string {
  const date = new Date(timestamp)

  const dateStr = date.toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (includeTime) {
    const timeStr = date.toLocaleTimeString('es-PA', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr} a las ${timeStr}`
  }

  return dateStr
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) {
    return interval === 1 ? 'hace 1 año' : `hace ${interval} años`
  }

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return interval === 1 ? 'hace 1 mes' : `hace ${interval} meses`
  }

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return interval === 1 ? 'hace 1 día' : `hace ${interval} días`
  }

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval === 1 ? 'hace 1 hora' : `hace ${interval} horas`
  }

  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval === 1 ? 'hace 1 minuto' : `hace ${interval} minutos`
  }

  return 'hace unos segundos'
}

// ============================================
// STRING UTILS
// ============================================

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

// ============================================
// VALIDATION UTILS
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================
// PERCENTAGE UTILS
// ============================================

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}
