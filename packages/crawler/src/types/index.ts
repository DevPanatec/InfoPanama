/**
 * Tipos para el sistema de crawling OSINT
 */

export interface ScrapedArticle {
  title: string
  url: string
  content: string
  author?: string
  publishedDate: Date
  imageUrl?: string
  source: string
  category?: string
}

export interface ExtractedClaim {
  text: string
  speaker?: string
  context: string
  category: 'política' | 'economía' | 'salud' | 'seguridad' | 'infraestructura' | 'otros'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isVerifiable: boolean
  confidence: number
}

export interface CrawlerConfig {
  name: string
  baseUrl: string
  selectors: {
    articleList?: string
    articleLink?: string
    title: string
    content: string
    author?: string
    date?: string
    image?: string
  }
  rateLimit?: number // ms entre requests
  maxPages?: number
}
