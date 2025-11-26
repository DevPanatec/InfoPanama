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
crons.interval(
  'auto-verify-claims',
  { hours: 1 }, // Cada hora
  internal.crawlers.autoVerifyPendingClaims
)

// Limpieza de datos antiguos cada semana
crons.weekly(
  'cleanup-old-data',
  {
    dayOfWeek: 'monday',
    hourUTC: 3, // 3 AM UTC
    minuteUTC: 0,
  },
  internal.crawlers.cleanupOldData
)

export default crons
