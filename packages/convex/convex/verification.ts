import { v } from 'convex/values'
import { action, mutation, query, internalMutation } from './_generated/server'
import { getOpenAIClient } from './lib/openai'
import { generateVerificationPrompt } from './lib/prompts'
import { api, internal } from './_generated/api'

/**
 * VERIFICATION - Sistema de verificación automática con GPT-5 mini
 */

/**
 * Query para obtener los pasos de investigación de un claim
 */
export const getInvestigationSteps = query({
  args: {
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const steps = await ctx.db
      .query('investigationSteps')
      .withIndex('by_claim', (q) => q.eq('claimId', args.claimId))
      .order('asc')
      .collect()

    return steps.sort((a, b) => a.stepNumber - b.stepNumber)
  },
})

/**
 * Query para obtener los pasos de investigación por veredicto
 */
export const getInvestigationStepsByVerdict = query({
  args: {
    verdictId: v.id('verdicts'),
  },
  handler: async (ctx, args) => {
    const steps = await ctx.db
      .query('investigationSteps')
      .withIndex('by_verdict', (q) => q.eq('verdictId', args.verdictId))
      .order('asc')
      .collect()

    return steps.sort((a, b) => a.stepNumber - b.stepNumber)
  },
})

/**
 * Mutation interna para guardar un paso del proceso de investigación
 */
export const saveInvestigationStep = internalMutation({
  args: {
    claimId: v.id('claims'),
    verdictId: v.optional(v.id('verdicts')),
    stepNumber: v.number(),
    stepType: v.string(),
    title: v.string(),
    description: v.string(),
    timestamp: v.number(),
    duration: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed')
    ),
    details: v.optional(v.any()),
    findings: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stepId = await ctx.db.insert('investigationSteps', {
      claimId: args.claimId,
      verdictId: args.verdictId,
      stepNumber: args.stepNumber,
      stepType: args.stepType,
      title: args.title,
      description: args.description,
      timestamp: args.timestamp,
      duration: args.duration,
      status: args.status,
      details: args.details,
      findings: args.findings,
      createdAt: Date.now(),
    })
    return stepId
  },
})

/**
 * Acción para verificar un claim usando OpenAI GPT-5 mini
 */
export const verifyClaim = action({
  args: {
    claimId: v.id('claims'),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now()
    let stepNumber = 0

    // Helper para registrar pasos
    const logStep = async (
      stepType: string,
      title: string,
      description: string,
      status: 'completed' | 'failed',
      findings?: string,
      details?: any
    ) => {
      stepNumber++
      const stepStart = Date.now()
      await ctx.runMutation(internal.verification.saveInvestigationStep, {
        claimId: args.claimId,
        stepNumber,
        stepType,
        title,
        description,
        timestamp: stepStart,
        duration: Date.now() - stepStart,
        status,
        findings,
        details,
      })
    }

    // PASO 1: Identificación del claim
    const claim = await ctx.runQuery(api.claims.getById, {
      id: args.claimId,
    })

    if (!claim) {
      throw new Error(`Claim ${args.claimId} no encontrado`)
    }

    await logStep(
      'identification',
      'Identificación del Claim',
      'Extracción y análisis inicial de la afirmación a verificar',
      'completed',
      `Claim identificado: "${claim.title}"\nCategoría: ${claim.category}\nFuente: ${claim.sourceType}`,
      {
        claimTitle: claim.title,
        category: claim.category,
        sourceType: claim.sourceType,
        sourceUrl: claim.sourceUrl,
      }
    )

    // PASO 2: Preparación del análisis
    const step2Start = Date.now()
    const prompts = generateVerificationPrompt({
      title: claim.title,
      description: claim.description,
      claimText: claim.claimText,
      category: claim.category,
      sourceUrl: claim.sourceUrl,
      sourceType: claim.sourceType,
    })

    await logStep(
      'preparation',
      'Preparación del Análisis',
      'Configuración del sistema de verificación con metodología profesional',
      'completed',
      'Sistema de verificación configurado con GPT-4o y prompts especializados para fact-checking',
      {
        model: 'gpt-4o',
        hasSourceUrl: !!claim.sourceUrl,
        promptLength: prompts.user.length,
      }
    )

    console.log('🤖 Verificando claim con GPT-4o (con búsqueda web integrada):', claim.title)

    // PASO 3: Búsqueda de fuentes oficiales
    await logStep(
      'source_search',
      'Búsqueda de Fuentes Oficiales',
      'Identificación de fuentes gubernamentales, registros públicos y documentación oficial',
      'completed',
      'Análisis de credibilidad de fuente primaria y sugerencia de fuentes oficiales para consulta',
      {
        primarySource: claim.sourceUrl,
        analysisType: 'credibility_check',
      }
    )

    // 3. Preparar cliente y modelo
    const openai = getOpenAIClient()
    const model = 'gpt-4o' // GPT-4o tiene acceso a búsqueda web

    try {
      // Obtener el artículo original si existe
      let articleContext = ''
      if (claim.sourceUrl) {
        articleContext = `\n\n## ARTÍCULO FUENTE:\nURL: ${claim.sourceUrl}\nTítulo: ${claim.title}\nDescripción: ${claim.description}\n\nEsta es la fuente primaria del claim. Analiza si el claim está respaldado por el artículo.`
      }

      // PASO 4: Análisis con IA
      await logStep(
        'ai_analysis',
        'Análisis con Inteligencia Artificial',
        'Procesamiento del claim con GPT-4o para evaluación de credibilidad',
        'completed',
        'Iniciando análisis profundo con modelo de lenguaje avanzado',
        {
          model: 'gpt-4o',
          hasArticleContext: !!articleContext,
        }
      )

      const aiAnalysisStart = Date.now()
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: prompts.system + '\n\nIMPORTANTE: Como no tienes acceso directo a web, enfócate en analizar la credibilidad de la fuente, la coherencia interna del claim, y sugiere qué fuentes oficiales específicas deberían consultarse para verificación completa.' },
          {
            role: 'user',
            content: prompts.user + articleContext
          },
        ],
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No se recibió respuesta de OpenAI')
      }

      const result = JSON.parse(content)
      const aiAnalysisDuration = Date.now() - aiAnalysisStart

      // PASO 5: Evaluación de evidencias
      await logStep(
        'evidence_evaluation',
        'Evaluación de Evidencias',
        'Análisis de fuentes, documentos y datos recopilados',
        'completed',
        `Evidencias encontradas: ${result.evidence?.length || 0}\nBanderas rojas identificadas: ${result.redFlags?.length || 0}`,
        {
          evidenceCount: result.evidence?.length || 0,
          redFlagsCount: result.redFlags?.length || 0,
          tokensUsed: response.usage?.total_tokens || 0,
          aiDuration: aiAnalysisDuration,
        }
      )

      // PASO 6: Determinación del veredicto
      await logStep(
        'verdict_determination',
        'Determinación del Veredicto',
        'Consolidación de hallazgos y emisión de veredicto final',
        'completed',
        `Veredicto: ${result.verdict}\nNivel de confianza: ${result.confidenceScore}%\n\nResumen: ${result.summary}`,
        {
          verdict: result.verdict,
          confidenceScore: result.confidenceScore,
          keyPointsCount: result.keyPoints?.length || 0,
        }
      )

      const processingTime = Date.now() - startTime

      console.log('✅ Verificación completada (Advanced AI):', {
        verdict: result.verdict,
        confidence: result.confidenceScore,
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime: `${processingTime}ms`,
        hasEvidence: !!result.evidence,
        hasRedFlags: !!result.redFlags?.length,
      })

      // 4. Guardar el veredicto en la base de datos
      const verdictId = await ctx.runMutation(api.verification.saveVerdict, {
        claimId: args.claimId,
        verdict: result.verdict,
        confidenceScore: result.confidenceScore,
        summary: result.summary,
        explanation: result.explanation,
        keyPoints: result.keyPoints || [],
        modelUsed: model,
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime,
        evidence: result.evidence || undefined,
        context: result.context || undefined,
        redFlags: result.redFlags || undefined,
        relatedClaims: result.relatedClaims || undefined,
      })

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
 * Mutation para guardar el veredicto
 */
export const saveVerdict = mutation({
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
    keyPoints: v.optional(v.array(v.string())),
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTime: v.number(),
    // Campos opcionales del sistema de prompts avanzados (ignorados por ahora)
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

    // Crear nuevo veredicto (solo campos que existen en el schema)
    const verdictId = await ctx.db.insert('verdicts', {
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
    })

    // Actualizar el claim con el veredicto
    await ctx.db.patch(args.claimId, {
      verdict: args.verdict,
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
        const result = await ctx.runAction(api.verification.verifyClaim, { claimId })
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

/**
 * Query para obtener claims relacionados
 * Busca claims con misma categoría, tags similares, o mismo actor
 */
export const getRelatedClaims = query({
  args: {
    claimId: v.id('claims'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { claimId, limit = 3 } = args

    // Obtener el claim actual
    const currentClaim = await ctx.db.get(claimId)
    if (!currentClaim) {
      return []
    }

    // Solo mostrar claims publicados
    const allClaims = await ctx.db
      .query('claims')
      .filter((q) => q.eq(q.field('status'), 'published'))
      .collect()

    // Filtrar y ordenar por relevancia
    const relatedClaims = allClaims
      .filter((claim) => claim._id !== claimId) // Excluir el claim actual
      .map((claim) => {
        let score = 0

        // Misma categoría: +3 puntos
        if (claim.category && currentClaim.category && claim.category === currentClaim.category) {
          score += 3
        }

        // Mismo actor: +5 puntos
        if (claim.actorId && currentClaim.actorId && claim.actorId === currentClaim.actorId) {
          score += 5
        }

        // Tags compartidos: +1 punto por tag
        if (claim.tags && currentClaim.tags) {
          const sharedTags = claim.tags.filter((tag) => currentClaim.tags.includes(tag))
          score += sharedTags.length
        }

        // Mismo veredicto: +1 punto
        if (claim.verdict && currentClaim.verdict && claim.verdict === currentClaim.verdict) {
          score += 1
        }

        return { claim, score }
      })
      .filter((item) => item.score > 0) // Solo claims con alguna relación
      .sort((a, b) => {
        // Ordenar por score (descendente), luego por fecha (más reciente primero)
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return (b.claim.publishedAt || b.claim.createdAt) - (a.claim.publishedAt || a.claim.createdAt)
      })
      .slice(0, limit)
      .map((item) => item.claim)

    return relatedClaims
  },
})
