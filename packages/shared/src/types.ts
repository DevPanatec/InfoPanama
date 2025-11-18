/**
 * Tipos compartidos para InfoPanama
 */

// ============================================
// CLAIMS
// ============================================

export type ClaimStatus = 'new' | 'investigating' | 'review' | 'approved' | 'rejected' | 'published'

export type SourceType =
  | 'user_submitted'
  | 'auto_extracted'
  | 'media_article'
  | 'social_media'
  | 'official_source'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Claim {
  _id: string
  title: string
  description: string
  claimText: string
  status: ClaimStatus
  category?: string
  tags: string[]
  riskLevel: RiskLevel
  sourceType: SourceType
  sourceUrl?: string
  sourceId?: string
  assignedTo?: string
  investigatedBy?: string
  isPublic: boolean
  isFeatured: boolean
  autoPublished: boolean
  createdAt: number
  updatedAt: number
  publishedAt?: number
}

// ============================================
// VERDICTS
// ============================================

export type VerdictType = 'TRUE' | 'FALSE' | 'MIXED' | 'UNPROVEN' | 'NEEDS_CONTEXT'

export interface EvidenceSource {
  sourceId: string
  quote: string
  relevance: number
  url: string
}

export interface CriticReview {
  passed: boolean
  issues: string[]
  confidence: number
}

export interface Verdict {
  _id: string
  claimId: string
  verdict: VerdictType
  confidenceScore: number
  explanation: string
  summary: string
  evidenceSources: EvidenceSource[]
  modelUsed: string
  tokensUsed: number
  processingTime: number
  validatedBy?: string
  criticReview?: CriticReview
  version: number
  previousVersionId?: string
  createdAt: number
  updatedAt: number
}

// ============================================
// ACTORS & DUE DILIGENCE
// ============================================

export type ActorType =
  | 'person'
  | 'group'
  | 'troll_network'
  | 'botnet'
  | 'HB'
  | 'anonymous'
  | 'verified_account'
  | 'media_outlet'
  | 'official'

export type KYAStatus = 'verified' | 'suspicious' | 'flagged' | 'blocked'

export type ComplianceStatus = 'compliant' | 'review_needed' | 'non_compliant'

export interface ActorRelationship {
  actorId: string
  relationshipType: string
  strength: number
}

export interface PublicationPattern {
  frequency: string
  topics: string[]
  tone: string
}

export interface ActorProfile {
  description?: string
  history?: string
  relationships: ActorRelationship[]
  publicationPatterns?: PublicationPattern
}

export interface DueDiligence {
  completedAt?: number
  completedBy?: string
  findings?: string
  complianceStatus: ComplianceStatus
  legalFramework?: string[]
}

export interface Actor {
  _id: string
  name: string
  type: ActorType
  profile: ActorProfile
  riskLevel: RiskLevel
  riskScore: number
  kyaStatus: KYAStatus
  dueDiligence: DueDiligence
  incidents: string[]
  articlesAuthored: string[]
  lastActivity?: number
  isMonitored: boolean
  isBlocked: boolean
  createdAt: number
  updatedAt: number
}

// ============================================
// PROBABLE RESPONSIBLES
// ============================================

export interface Evidence {
  type: string
  description: string
  sourceId?: string
  weight: number
}

export type ValidationStatus = 'pending' | 'confirmed' | 'rejected'

export interface ProbableResponsible {
  _id: string
  claimId: string
  actorId: string
  probability: number
  confidence: number
  reasoning: string
  evidence: Evidence[]
  patterns: string[]
  validatedBy?: string
  validationStatus: ValidationStatus
  createdAt: number
  updatedAt: number
}

// ============================================
// ARTICLES & SOURCES
// ============================================

export type SourceCategory = 'media' | 'official' | 'social_media'

export interface Sentiment {
  score: number
  label: 'positive' | 'neutral' | 'negative'
}

export interface BiasScore {
  overall: number
  sentiment: number
  framing: number
}

export interface Ownership {
  entity: string
  type: string
  notes?: string
}

export interface Source {
  _id: string
  name: string
  slug: string
  url: string
  type: SourceCategory
  category?: string
  isTrusted: boolean
  credibilityScore: number
  owner?: string
  ownership?: Ownership
  biasScore?: BiasScore
  scrapingEnabled: boolean
  scrapingFrequency?: string
  lastScraped?: number
  articleCount: number
  logo?: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface Article {
  _id: string
  title: string
  url: string
  content: string
  htmlContent?: string
  sourceId: string
  author?: string
  publishedDate: number
  snapshotUrl?: string
  snapshotHash?: string
  topics: string[]
  entities: string[]
  sentiment?: Sentiment
  hasEmbedding: boolean
  embeddingId?: string
  extractedClaims: string[]
  contentHash: string
  scrapedAt: number
  createdAt: number
  updatedAt: number
}

// ============================================
// USER & ROLES
// ============================================

export type UserRole = 'reader' | 'moderator' | 'editor' | 'approver' | 'admin'

export interface User {
  _id: string
  clerkId: string
  email: string
  name?: string
  avatar?: string
  role: UserRole
  twoFactorEnabled: boolean
  claimsInvestigated: number
  commentsPosted: number
  isActive: boolean
  isBanned: boolean
  createdAt: number
  lastLogin: number
}

// ============================================
// AUDIT LOGS
// ============================================

export interface AuditLog {
  _id: string
  userId: string
  userEmail: string
  action: string
  entityType: string
  entityId: string
  changes?: {
    before: any
    after: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: number
}

// ============================================
// EVENTS
// ============================================

export type EventType =
  | 'legislative'
  | 'executive'
  | 'judicial'
  | 'election'
  | 'public_hearing'
  | 'other'

export interface GovernmentEvent {
  _id: string
  title: string
  description: string
  eventDate: number
  eventType: EventType
  sourceId?: string
  sourceUrl?: string
  relatedClaims: string[]
  relatedArticles: string[]
  alertDays: number[]
  lastAlertSent?: number
  createdAt: number
  updatedAt: number
}

// ============================================
// STATISTICS
// ============================================

export interface ClaimStats {
  total: number
  published: number
  investigating: number
  review: number
  bySeverity: Record<RiskLevel, number>
}

export interface VerdictStats {
  total: number
  byVerdict: Record<VerdictType, number>
  avgConfidence: number
  totalTokens: number
  avgProcessingTime: number
}

export interface ActorStats {
  total: number
  monitored: number
  blocked: number
  byType: Record<ActorType, number>
  byRisk: Record<RiskLevel, number>
  byKYA: Record<KYAStatus, number>
}
