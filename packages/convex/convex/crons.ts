/**
 * Scheduled Functions (Cron Jobs) para InfoPanama
 *
 * Automatizan el crawling y procesamiento de noticias
 */

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Crawl de noticias cada 6 horas
crons.interval(
  'crawl-news',
  { hours: 6 }, // Cada 6 horas
  internal.crawlers.crawlAndExtract
)

// Verificación automática de claims cada hora
// TODO: Re-enable after fixing circular dependency
// crons.interval(
//   'auto-verify-claims',
//   { hours: 1 }, // Cada hora
//   internal.crawlers.autoVerifyPendingClaims
// )

// Análisis automático de grafos OSINT cada 12 horas
// TODO: Re-enable after fixing TypeScript types
// crons.interval(
//   'analyze-graph-relations',
//   { hours: 12 }, // Cada 12 horas
//   internal.crawlers.autoAnalyzeGraphRelations
// )

// Limpieza de datos antiguos cada semana
// TODO: Re-enable after fixing TypeScript types
// crons.weekly(
//   'cleanup-old-data',
//   {
//     dayOfWeek: 'monday',
//     hourUTC: 3, // 3 AM UTC
//     minuteUTC: 0,
//   },
//   internal.crawlers.cleanupOldData
// )

export default crons
