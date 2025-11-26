/**
 * Extractor Automático de Claims usando GPT-5 mini
 * Lee artículos y extrae afirmaciones verificables
 */

import OpenAI from 'openai'
import type { ScrapedArticle, ExtractedClaim } from '../types/index.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const EXTRACTION_PROMPT = `Eres un experto analista de medios especializado en fact-checking para Panamá.

Tu tarea es extraer afirmaciones verificables de artículos de noticias.

## CRITERIOS PARA EXTRAER CLAIMS:

✅ **SÍ extraer:**
- Afirmaciones de políticos, funcionarios públicos o figuras públicas
- Datos numéricos específicos (estadísticas, presupuestos, cantidades)
- Promesas o compromisos concretos
- Afirmaciones sobre hechos históricos recientes
- Claims sobre políticas públicas, leyes o regulaciones
- Información que contradiga conocimiento público
- Afirmaciones extraordinarias que requieren evidencia

❌ **NO extraer:**
- Opiniones personales sin afirmaciones fácticas
- Generalidades vagas sin datos específicos
- Información trivial o de bajo impacto
- Predicciones futuras sin base factual
- Declaraciones puramente emocionales

## CATEGORÍAS:
- **política**: Declaraciones de políticos, campañas, gobierno
- **economía**: PIB, presupuestos, empleos, inflación, inversión
- **salud**: CSS, hospitales, medicamentos, enfermedades
- **seguridad**: Criminalidad, policía, justicia
- **infraestructura**: Obras públicas, transporte, construcción
- **otros**: Educación, medio ambiente, cultura, etc.

## NIVELES DE RIESGO:
- **LOW**: Información técnica, datos publicados, bajo impacto social
- **MEDIUM**: Afirmaciones de funcionarios menores, datos sin verificar
- **HIGH**: Declaraciones de autoridades, datos controversiales
- **CRITICAL**: Información que podría causar pánico, desinformación peligrosa

## FORMATO DE RESPUESTA:

Responde SOLO con JSON válido en este formato:

{
  "claims": [
    {
      "text": "La afirmación exacta entre comillas",
      "speaker": "Nombre de quién lo dijo (si aplica)",
      "context": "Contexto relevante de 1-2 oraciones",
      "category": "política|economía|salud|seguridad|infraestructura|otros",
      "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
      "isVerifiable": true|false,
      "confidence": 0-100
    }
  ]
}

Si el artículo NO contiene claims verificables, responde: {"claims": []}

**IMPORTANTE:**
- Extrae MÁXIMO 3 claims por artículo (los más importantes)
- Solo claims con isVerifiable: true serán procesados
- Prioriza claims de alto impacto social
- Cita la afirmación EXACTA, no parafrasees`

export async function extractClaims(article: ScrapedArticle): Promise<ExtractedClaim[]> {
  console.log(`\n🔍 Extrayendo claims de: "${article.title.substring(0, 60)}..."`)

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: `Artículo de ${article.source}:

**Título:** ${article.title}

**Categoría:** ${article.category || 'General'}

**Contenido:**
${article.content.substring(0, 3000)}

${article.content.length > 3000 ? '...(contenido truncado)' : ''}

Extrae los claims verificables más importantes de este artículo.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 1, // GPT-5 mini solo soporta temperatura por defecto
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.log('⚠️  No se recibió respuesta de OpenAI')
      return []
    }

    const result = JSON.parse(content)
    const claims: ExtractedClaim[] = result.claims || []

    // Filtrar solo claims verificables con confianza > 60
    const verifiableClaims = claims.filter(
      (claim) => claim.isVerifiable && claim.confidence >= 60
    )

    console.log(`✅ Extraídos ${verifiableClaims.length} claims verificables`)

    if (verifiableClaims.length > 0) {
      verifiableClaims.forEach((claim, i) => {
        console.log(`   ${i + 1}. [${claim.riskLevel}] "${claim.text.substring(0, 80)}..."`)
      })
    }

    return verifiableClaims
  } catch (error) {
    console.error('❌ Error extrayendo claims:', error)
    return []
  }
}

export async function extractClaimsFromArticles(
  articles: ScrapedArticle[]
): Promise<Array<{ article: ScrapedArticle; claims: ExtractedClaim[] }>> {
  console.log(`\n🎯 Procesando ${articles.length} artículos para extraer claims...`)

  const results: Array<{ article: ScrapedArticle; claims: ExtractedClaim[] }> = []

  for (const article of articles) {
    const claims = await extractClaims(article)
    results.push({ article, claims })

    // Rate limiting para no saturar OpenAI API
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const totalClaims = results.reduce((sum, r) => sum + r.claims.length, 0)
  console.log(`\n🎉 Extracción completada: ${totalClaims} claims en total`)

  return results
}

// Para testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const testArticle: ScrapedArticle = {
    title: 'Presidente anuncia inversión de $500 millones en salud',
    url: 'https://example.com/test',
    content: `El presidente de Panamá anunció hoy una inversión histórica de $500 millones para modernizar el sistema de salud.

    "Este es el mayor presupuesto en salud de la historia de Panamá", declaró el mandatario durante su discurso en la Asamblea Nacional.

    El dinero se destinará a construir 10 nuevos hospitales en las provincias más necesitadas y a contratar 2,000 médicos y enfermeras.

    El ministro de Salud agregó que la tasa de mortalidad infantil se redujo un 50% en el último año gracias a los programas de vacunación.`,
    publishedDate: new Date(),
    source: 'Test',
    category: 'Salud',
  }

  extractClaims(testArticle).then((claims) => {
    console.log('\n📊 Claims extraídos:')
    console.log(JSON.stringify(claims, null, 2))
  })
}
