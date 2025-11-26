/**
 * Funciones internas para crawling y procesamiento automático
 *
 * Estas funciones son llamadas por los cron jobs definidos en crons.ts
 */

import { internalAction, internalMutation } from './_generated/server'
import { internal } from './_generated/api'

/**
 * Ejecuta el crawler externo vía webhook o API
 * (El crawler de Playwright no puede correr dentro de Convex)
 *
 * En producción, esto llamaría a un servicio externo (Railway, Render, etc.)
 * que ejecute el crawler y envíe los resultados de vuelta a Convex
 */
export const crawlAndExtract = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 [CRON] Iniciando crawl programado...')

    // TODO: Implementar webhook a servicio externo de crawler
    // Por ahora, solo registramos el evento

    const timestamp = new Date().toISOString()
    console.log(`📅 Crawl ejecutado: ${timestamp}`)

    // En producción:
    // 1. Llamar a API externa que ejecute el crawler
    // 2. El crawler envía los claims extraídos de vuelta a Convex
    // 3. Convex guarda los claims y dispara verificaciones

    return {
      success: true,
      message: 'Crawl programado registrado (implementar webhook externo)',
      timestamp,
    }
  },
})

/**
 * Verifica automáticamente claims pendientes que tengan prioridad alta
 */
export const autoVerifyPendingClaims = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🤖 [CRON] Verificando claims pendientes...')

    // Obtener claims con status 'new' y riskLevel HIGH o CRITICAL
    const claims = await ctx.runQuery(internal.claims.getPendingForVerification, {
      limit: 10, // Verificar máximo 10 claims por ejecución
    })

    console.log(`📋 Encontrados ${claims.length} claims pendientes`)

    let verifiedCount = 0

    for (const claim of claims) {
      try {
        // Ejecutar verificación automática
        await ctx.runAction(internal.verification.verifyClaim, {
          claimId: claim._id,
        })

        verifiedCount++
        console.log(`✅ Claim verificado: ${claim._id}`)
      } catch (error) {
        console.error(`❌ Error verificando claim ${claim._id}:`, error)
      }
    }

    console.log(`🎉 Verificación completada: ${verifiedCount}/${claims.length} exitosos`)

    return {
      success: true,
      totalClaims: claims.length,
      verifiedCount,
    }
  },
})

/**
 * Limpia datos antiguos para mantener la base de datos optimizada
 */
export const cleanupOldData = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🧹 [CRON] Limpiando datos antiguos...')

    // Eliminar claims rechazados de hace más de 90 días
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000

    await ctx.runMutation(internal.claims.deleteOldRejected, {
      beforeDate: ninetyDaysAgo,
    })

    console.log('✅ Limpieza completada')

    return {
      success: true,
      message: 'Datos antiguos eliminados',
    }
  },
})
