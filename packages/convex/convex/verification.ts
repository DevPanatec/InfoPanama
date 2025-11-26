import { v } from 'convex/values'
import { action, internalMutation } from './_generated/server'
import { getOpenAIClient, getOpenAIModel } from './lib/openai'
import { generateVerificationPrompt } from './lib/prompts'
import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'

/**
 * VERIFICATION - Sistema de verificación automática con GPT-5 mini
 */

/**
 * Acción para verificar un claim usando OpenAI GPT-5 mini
 */
export const verifyClaim = action({
  args: {
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now()

    // 1. Obtener el claim de la base de datos
    const claim = await ctx.runQuery(api.claims.getById, {
      id: args.claimId,
    })

    if (!claim) {
      throw new Error(`Claim ${args.claimId} no encontrado`)
    }

    // 2. Preparar el prompt avanzado con metodología profesional
    const prompts = generateVerificationPrompt({
      title: claim.title,
      description: claim.description,
      claimText: claim.claimText,
      category: claim.category,
      sourceUrl: claim.sourceUrl,
      sourceType: claim.sourceType,
    })

    console.log('🤖 Verificando claim con GPT-5 mini (Advanced Prompting):', claim.title)

    // 3. Llamar a OpenAI con prompts avanzados
    const openai = getOpenAIClient()
    const model = getOpenAIModel()

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user },
        ],
        // GPT-5 mini solo soporta temperature: 1 (default)
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No se recibió respuesta de OpenAI')
      }

      const result = JSON.parse(content)
      const processingTime = Date.now() - startTime

      console.log('✅ Verificación completada (Advanced AI):', {
        verdict: result.verdict,
        confidence: result.confidenceScore,
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime: `${processingTime}ms`,
        hasEvidence: !!result.evidence,
        hasRedFlags: !!result.redFlags?.length,
      })

      // 4. Guardar el veredicto en la base de datos con datos avanzados
      const verdictId = await ctx.runMutation(
        api.verification.saveVerdict,
        {
          claimId: args.claimId,
          verdict: result.verdict,
          confidenceScore: result.confidenceScore,
          summary: result.summary,
          explanation: result.explanation,
          keyPoints: result.keyPoints || [],
          modelUsed: model,
          tokensUsed: response.usage?.total_tokens || 0,
          processingTime,
          // Campos opcionales del sistema avanzado
          evidence: result.evidence || undefined,
          context: result.context || undefined,
          redFlags: result.redFlags || undefined,
          relatedClaims: result.relatedClaims || undefined,
        }
      )

      return {
        success: true,
        verdictId,
        verdict: result.verdict,
        confidenceScore: result.confidenceScore,
        summary: result.summary,
        explanation: result.explanation,
        keyPoints: result.keyPoints || [],
        evidence: result.evidence || [],
        context: result.context || '',
        redFlags: result.redFlags || [],
        relatedClaims: result.relatedClaims || [],
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime,
      }
    } catch (error) {
      console.error('❌ Error al verificar claim:', error)
      throw new Error(
        `Error en verificación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  },
})

/**
 * Mutation interna para guardar el veredicto con datos avanzados
 */
export const saveVerdict = internalMutation({
  args: {
    claimId: v.id('claims'),
    verdict: v.union(
      v.literal('TRUE'),
      v.literal('FALSE'),
      v.literal('MIXED'),
      v.literal('UNPROVEN'),
      v.literal('NEEDS_CONTEXT')
    ),
    confidenceScore: v.number(),
    summary: v.string(),
    explanation: v.string(),
    keyPoints: v.array(v.string()),
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTime: v.number(),
    // Campos opcionales del sistema de prompts avanzados
    evidence: v.optional(v.array(v.any())),
    context: v.optional(v.string()),
    redFlags: v.optional(v.array(v.string())),
    relatedClaims: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe un veredicto para este claim
    const existingVerdict = await ctx.db
      .query('verdicts')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .order('desc')
      .first()

    const version = existingVerdict ? existingVerdict.version + 1 : 1

    // Preparar datos del veredicto
    const verdictData: any = {
      claimId: args.claimId,
      verdict: args.verdict,
      confidenceScore: args.confidenceScore,
      summary: args.summary,
      explanation: args.explanation,
      evidenceSources: [], // Por ahora vacío, se puede mejorar después
      modelUsed: args.modelUsed,
      tokensUsed: args.tokensUsed,
      processingTime: args.processingTime,
      version,
      previousVersionId: existingVerdict?._id,
      createdAt: now,
      updatedAt: now,
    }

    // Agregar campos avanzados si están presentes (como metadata)
    if (args.evidence || args.context || args.redFlags || args.relatedClaims) {
      verdictData.advancedData = {
        evidence: args.evidence || [],
        context: args.context || '',
        redFlags: args.redFlags || [],
        relatedClaims: args.relatedClaims || [],
      }
    }

    // Crear nuevo veredicto
    const verdictId = await ctx.db.insert('verdicts', verdictData)

    // Actualizar el claim para indicar que tiene un veredicto
    await ctx.db.patch(args.claimId, {
      status: 'review',
      updatedAt: now,
    })

    return verdictId
  },
})

/**
 * Acción para verificar múltiples claims en lote
 */
export const verifyClaimsBatch = action({
  args: {
    claimIds: v.array(v.id('claims')),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 Verificando ${args.claimIds.length} claims en lote...`)

    const results: Array<{
      claimId: string
      success: boolean
      result?: any
      error?: string
    }> = []

    for (const claimId of args.claimIds) {
      try {
        const result = await ctx.runAction(api.verification.verifyClaim, {
          claimId,
        })
        results.push({ claimId, success: true, result })
      } catch (error) {
        console.error(`Error verificando claim ${claimId}:`, error)
        results.push({
          claimId,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    console.log(
      `✅ Verificación en lote completada: ${successCount}/${args.claimIds.length} exitosos`
    )

    return {
      total: args.claimIds.length,
      successful: successCount,
      failed: args.claimIds.length - successCount,
      results,
    }
  },
})
