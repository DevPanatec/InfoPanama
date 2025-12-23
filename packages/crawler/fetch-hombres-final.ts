/**
 * Scrape Hombres de Blanco usando fetch directo
 */

import 'dotenv/config'
import { ConvexHttpClient } from 'convex/browser'
import OpenAI from 'openai'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const convex = new ConvexHttpClient(CONVEX_URL)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Artículos ya scrapeados manualmente
const ARTICLES = [
  {
    title: 'Hombres de Blanco, cerca de obtener $6.5 millones del Municipio de Panamá',
    url: 'https://www.prensa.com/unidad-investigativa/hombres-de-blanco-cerca-de-obtener-65-millones-del-municipio-de-panama/',
    sourceName: 'La Prensa',
    content: `Hombres de Blanco Corp. está próxima a obtener un contrato de limpieza municipal por $6.5 millones. La empresa ha prestado servicios desde administraciones anteriores mediante contratos prorrogados. El alcalde Mayer Mizrachi convocó a licitación pública para servicios de limpieza, desinfección y mantenimiento en 10 mercados municipales y dos complejos turísticos. Catorce empresas participaron en la homologación del 25 de septiembre, pero solo una propuesta fue presentada el 24 de octubre: Pro Service, un consorcio entre Servicio Técnico de Limpieza (STL) y Hombres de Blanco. Hombres de Blanco, liderada por Rubén Daniel Argüelles Sánchez, asumiría el 80% de responsabilidad técnica. En febrero, la Alcaldía prorrogó contratos previos, beneficiando a ambas empresas. El hermano de Argüelles, Rubén Darío, es cónsul en Río de Janeiro y tiene vínculos conocidos con el expresidente Ricardo Martinelli. Ambas sociedades comparten el mismo agente legal. Transparency International presentó denuncia por pagos de $5.4 millones a Hombres de Blanco sin contratos válidos.`,
    author: 'Ereida Prieto-Barreiro',
    publishedDate: '2024-11-11',
    category: 'Unidad Investigativa'
  }
]

// Helper functions
async function createClaim(data: any) {
  return await convex.mutation('claims:create' as any, data)
}

async function createArticle(data: any) {
  return await convex.mutation('articles:create' as any, data)
}

async function createSource(data: any) {
  return await convex.mutation('sources:create' as any, data)
}

async function getSourceBySlug(slug: string) {
  return await convex.query('sources:getBySlug' as any, { slug })
}

function generateContentHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

const SOURCE_CONFIG: Record<string, any> = {
  'La Prensa': {
    slug: 'la-prensa',
    name: 'La Prensa',
    url: 'https://www.prensa.com',
    type: 'media',
  },
  'Telemetro': {
    slug: 'telemetro',
    name: 'Telemetro',
    url: 'https://www.telemetro.com',
    type: 'media',
  },
  'Panamá América': {
    slug: 'panama-america',
    name: 'Panamá América',
    url: 'https://www.panamaamerica.com.pa',
    type: 'media',
  }
}

async function getOrCreateSource(sourceName: string) {
  const config = SOURCE_CONFIG[sourceName]
  if (!config) {
    throw new Error(`Source configuration not found for: ${sourceName}`)
  }

  let source = await getSourceBySlug(config.slug)

  if (!source) {
    console.log(`   📝 Creando nueva fuente: ${config.name}`)
    const sourceId = await createSource({
      slug: config.slug,
      name: config.name,
      url: config.url,
      type: config.type,
      verifiedSource: true,
    })
    source = { _id: sourceId, name: config.name }
  }

  return source
}

async function extractClaimsWithAI(articleText: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en fact-checking. Extrae declaraciones verificables del artículo sobre Hombres de Blanco Corp.

Devuelve un JSON con este formato:
{
  "claims": [
    {
      "text": "declaración exacta citada del artículo",
      "speaker": "nombre de quien dice la declaración (o null)",
      "context": "contexto de por qué es importante",
      "category": "Licitaciones|Contratos|Corrupción|Salud|Política",
      "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
      "isVerifiable": true/false,
      "confidence": 0-1
    }
  ]
}

ENFÓCATE EN:
- Montos de contratos
- Irregularidades en licitaciones
- Vínculos políticos
- Denuncias de transparencia
- Declaraciones de funcionarios`
        },
        {
          role: 'user',
          content: articleText
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const result = JSON.parse(response.choices[0].message.content || '{"claims":[]}')
    return result.claims || []
  } catch (error: any) {
    console.error(`   ❌ Error extrayendo claims: ${error.message}`)
    return []
  }
}

async function main() {
  console.log('🔍 PROCESANDO NOTICIAS SOBRE HOMBRES DE BLANCO')
  console.log('='.repeat(60))
  console.log(`📰 Total artículos: ${ARTICLES.length}\n`)

  let totalClaims = 0

  for (const article of ARTICLES) {
    try {
      console.log(`\n📄 ${article.title}`)

      const source = await getOrCreateSource(article.sourceName)
      const contentHash = generateContentHash(article.content)

      const articleId = await createArticle({
        title: article.title,
        url: article.url,
        content: article.content,
        htmlContent: article.content,
        contentHash: contentHash,
        sourceId: source._id,
        publishedDate: new Date(article.publishedDate).getTime(),
        author: article.author || undefined,
        topics: ['Hombres de Blanco', 'Licitaciones', 'Transparencia']
      })

      console.log(`   ✅ Artículo guardado (ID: ${articleId})`)

      // Extraer claims
      const claims = await extractClaimsWithAI(
        `${article.title}\n\n${article.content}`
      )

      console.log(`   🔍 Extrayendo claims con IA...`)
      console.log(`   ✅ Encontrados ${claims.length} claims`)

      for (const claim of claims) {
        await createClaim({
          title: `${claim.speaker ? claim.speaker + ': ' : ''}"${claim.text.substring(0, 80)}..."`,
          description: claim.context,
          claimText: claim.text,
          category: claim.category || 'Licitaciones',
          tags: ['Hombres de Blanco', claim.category, article.sourceName],
          riskLevel: claim.riskLevel || 'HIGH',
          sourceType: 'auto_extracted',
          sourceUrl: article.url,
          isPublic: true,
          isFeatured: claim.riskLevel === 'HIGH' || claim.riskLevel === 'CRITICAL',
          autoPublished: true,
          status: 'published',
        })

        totalClaims++
        console.log(`      • "${claim.text.substring(0, 70)}..."`)
      }

    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ COMPLETADO`)
  console.log(`   📰 Artículos procesados: ${ARTICLES.length}`)
  console.log(`   📢 Claims guardados: ${totalClaims}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
