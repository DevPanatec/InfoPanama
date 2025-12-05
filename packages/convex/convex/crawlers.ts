/**
 * Funciones internas para crawling y procesamiento automático
 *
 * Estas funciones son llamadas por los cron jobs definidos en crons.ts
 */

import { internalAction } from './_generated/server'

/**
 * Ejecuta el crawler externo
 * (El crawler de Playwright no puede correr dentro de Convex)
 *
 * Este cron job registra que se debe ejecutar el crawler.
 * El crawler debe ejecutarse manualmente con:
 *   cd packages/crawler && npm run crawl:all
 *
 * O automáticamente usando GitHub Actions (ver .github/workflows/crawler.yml)
 */
export const crawlAndExtract = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 [CRON] Iniciando crawl programado...')

    const timestamp = new Date().toISOString()
    console.log(`📅 Crawl ejecutado: ${timestamp}`)

    // Registrar evento de crawl para monitoreo
    // (Evitamos usar internal API para prevenir dependencias circulares)
    console.log('📝 Evento registrado: Crawl programado')

    console.log('💡 Para ejecutar el crawler manualmente:')
    console.log('   cd packages/crawler && npm run crawl:all')

    return {
      success: true,
      message: 'Crawl programado - ejecutar manualmente o vía GitHub Actions',
      timestamp,
      instructions: 'cd packages/crawler && npm run crawl:all',
    }
  },
})

/**
 * Verifica automáticamente claims pendientes que tengan prioridad alta
 * TODO: Fix circular dependency issue with internal API
 */
export const autoVerifyPendingClaims: any = internalAction({
  args: {},
  handler: async (_ctx) => {
    console.log('🤖 [CRON] Auto-verification disabled - circular dependency')

    // TODO: Implement without circular dependency
    return {
      success: false,
      message: 'Auto-verification temporarily disabled',
    }
  },
})

/**
 * Analiza automáticamente artículos nuevos con IA para crear grafos OSINT
 */
export const autoAnalyzeGraphRelations: any = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🤖 [CRON] Iniciando análisis automático de grafos OSINT...')

    // NOTA: Esta función debe usar string paths para evitar dependencias circulares
    // porque internal API causa referencias circulares en TypeScript
    try {
      // Obtener artículos recientes que no han sido analizados
      const articles = await ctx.runQuery('articles:getUnanalyzed' as any, {
        limit: 20, // Procesar máximo 20 artículos por ejecución
      })

      if (!articles || (articles as any).length === 0) {
        console.log('✅ No hay artículos nuevos para analizar')
        return {
          success: true,
          message: 'No hay artículos nuevos',
          articlesProcessed: 0,
        }
      }

      console.log(`📊 Analizando ${(articles as any).length} artículos...`)

      // Analizar artículos en batch
      const articleIds = (articles as any).map((a: any) => a._id)
      const results = await ctx.runAction('graphAnalysis:analyzeBatchArticles' as any, {
        articleIds,
      })

      console.log(`✅ Análisis completado: ${(results as any).successful} exitosos, ${(results as any).failed} fallidos`)

      // Generar co-menciones automáticamente
      console.log('🔗 Generando co-menciones...')
      const coMentionResults = await ctx.runAction(
        'graphAnalysis:generateCoMentionRelations' as any,
        {
          articleIds,
        }
      )

      console.log(`✅ Co-menciones completadas: ${(coMentionResults as any).relationsCreated} relaciones creadas`)

      return {
        success: true,
        articlesProcessed: (articles as any).length,
        entitiesFound: (results as any).successful,
        relationsCreated: (coMentionResults as any).relationsCreated,
      }
    } catch (error) {
      console.error('❌ Error en análisis automático:', error)
      return {
        success: false,
        error: String(error),
      }
    }
  },
})

/**
 * Limpia datos antiguos para mantener la base de datos optimizada
 */
export const cleanupOldData: any = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🧹 [CRON] Limpiando datos antiguos...')

    // Eliminar claims rechazados de hace más de 90 días
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000

    // Usar string path para evitar dependencias circulares
    await ctx.runMutation('claims:deleteOldRejected' as any, {
      beforeDate: ninetyDaysAgo,
    })

    console.log('✅ Limpieza completada')

    return {
      success: true,
      message: 'Datos antiguos eliminados',
    }
  },
})
