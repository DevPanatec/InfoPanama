import { type Id } from '@infopanama/convex'

export interface Claim {
  _id: Id<'claims'>
  title: string
  description: string
  status: string
  category?: string
  publishedAt?: number
  createdAt: number
  imageUrl?: string
  riskLevel?: string
  verdict?: 'TRUE' | 'FALSE' | 'MIXED' | 'UNPROVEN' | 'NEEDS_CONTEXT' | null
}

export type VerdictType = 'TRUE' | 'FALSE' | 'MIXED' | 'UNPROVEN' | 'NEEDS_CONTEXT' | null
