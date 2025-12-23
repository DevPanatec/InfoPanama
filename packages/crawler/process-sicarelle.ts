/**
 * Procesar artículos de Sicarelle Holdings
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

// Artículos scrapeados
const ARTICLES = [
  {
    title: 'Nuevos señalamientos contra Sicarelle Holdings por posibles riesgos a la salud',
    url: 'https://www.prensa.com/impresa/panorama/nuevos-senalamientos-contra-sicarelle-holdings-por-posibles-riesgos-a-la-salud/',
    sourceName: 'La Prensa',
    content: `Por segunda ocasión durante la pandemia, la empresa Sicarelle Holdings, Inc., contratada por el Estado para limpiar y desinfectar hospitales públicos, enfrenta denuncias. En esta ocasión, se cuestiona el servicio en el Hospital Cecilio Castillero de Chitré, Herrera.

Una extrabajadora grabó un video divulgado en redes sociales donde advertía: "se está irrespetando el área de la enfermedad. No nos quieren dar mascarillas, guantes ni batas." Señaló que reutilizaban la misma mascarilla durante tres días y pasaban de áreas de exposición a Covid-19 a zonas de recién nacidos.

La empleada también denunció que "no nos pagan el salario mínimo y solo cinco trabajadores deben cubrir todas las salas del hospital." Otros trabajadores confirmaron estas acusaciones a La Prensa bajo anonimato.

Sicarelle tiene un contrato desde 2017 para limpiar ocho hospitales por $26 millones totales. El director del hospital negó irregularidades, afirmando que cuenta con 38 colaboradores y que se mantiene limpio.

La empresa respondió que las denuncias son "falsas" y que la excolaboradora fue "llamada la atención por incumplimiento." Sostiene que sus empleados reciben todo el equipo de protección necesario.

En incidentes previos, pacientes Covid-19 en hoteles-hospitales denunciaron no recibir cambios de ropa durante 20 días, servicio también responsabilidad de Sicarelle.`,
    author: 'Vielka Corro Ríos',
    publishedDate: '2020-09-22',
    category: 'Panorama'
  },
  {
    title: 'Cómo Sicarelle Holdings drenó millones del Estado bajo el disfraz de la limpieza hospitalaria',
    url: 'https://www.destinopanama.com.pa/2025/07/como-sicarelle-holdings-dreno-millones-del-estado-bajo-el-disfraz-de-la-limpieza-hospitalaria-2/',
    sourceName: 'Destino Panamá',
    content: `Durante más de 14 años, la empresa Sicarelle Holdings S.A. (ahora Smart Health) operó dentro del sistema de salud panameño como proveedor de servicios de limpieza y lavandería. Desde 2011, recibió contratos del Ministerio de Salud mediante procedimientos que evitaban licitaciones públicas, consolidando un monopolio sobre servicios en hospitales nacionales.

Durante la pandemia, Sicarelle fue contratada para limpiar y desinfectar más de mil habitaciones en hoteles-hospitales, cobrando entre 45 y 50 dólares diarios por habitación. "El contrato otorgaba acceso libre al uso de agua, energía eléctrica, instalaciones públicas y recursos sin generar cargos adicionales." Los pagos mensuales superaban un millón de dólares.

Investigaciones revelaron deficiencias graves en operaciones. "Sicarelle instaló lavanderías improvisadas dentro de hospitales, utilizando lavadoras domésticas conectadas a redes públicas." Reportes indicaban ropa contaminada lavada sin protocolos de bioseguridad, mezclada sin sistemas de filtrado. Pacientes permanecieron hasta 14 días sin cambio de sábanas.

Expertos estimaron sobrecostos de al menos 20% anual, representando más de $300,000 en exceso pagados con fondos públicos. Esta cantidad podría haber financiado ventiladores, pruebas PCR o camas hospitalarias durante la emergencia sanitaria.

La estructura empresarial incluía a Juan Carlos López López como principal accionista, su esposa Mónica Rodríguez como gerente operativa, y conexiones políticas documentadas. En 2025, el nuevo ministro de Salud retiró una solicitud de $761,000 correspondiente a servicios de 2022, declarando "dudas en las cuentas." Sicarelle posteriormente cambió su razón social a Smart Health.`,
    author: 'Redacción Destino Panamá',
    publishedDate: '2025-07-02',
    category: 'Investigación'
  },
  {
    title: 'Sicarelli Holding Inc Los millones en tiempos de Pandemia',
    url: 'https://panamahoy.com.pa/2025/01/27/sicarelli-holding-inc-los-millones-en-tiempos-de-pandemia/',
    sourceName: 'Panamá Hoy',
    content: `Durante la pandemia COVID-19, la empresa Sicarelli Holding Inc obtuvo numerosos contratos con el Estado panameño para servicios de limpieza y mantenimiento de hospitales. Según denuncias presentadas por los abogados Zulay Rodríguez y Alejandro Pérez, la ex asistente del expresidente Laurentino Cortizo, Nadia del Río, habría facilitado estas adjudicaciones utilizando su posición en el Palacio de Las Garzas. Del Río tendría vínculos con la empresa a través de su pareja, Juan Carlos Soto, quien es primo del director y tesorero Juan Carlos López. Este último es esposo de la Magistrada Presidenta de la Corte Suprema de Justicia, María Eugenia López Arias. Los abogados presentaron una denuncia formal ante la Asamblea Nacional alegando tráfico de influencias, blanqueo de capitales y enriquecimiento injustificado. Según registros de Panamá Compra, Sicarelli Holding Inc recibió contratos desde 2011, incluyendo uno con la Corte Suprema. En 2017, bajo la administración de Miguel Mayo, la empresa fue contratada por 14.9 millones de dólares, con cinco adendas sumando 26 millones adicionales.`,
    author: 'redaccionph',
    publishedDate: '2025-01-27',
    category: 'Investigación'
  },
  {
    title: 'Sicarelle defiende su trabajo de limpieza en los hospitales del Minsa y de la CSS',
    url: 'https://www.laestrella.com.pa/economia/sicarelle-defiende-limpieza-hospitales-FOLE436003',
    sourceName: 'La Estrella',
    content: `La empresa Sicarelle Holdings, Inc. defendió su desempeño en servicios de limpieza hospitalaria durante la pandemia de COVID-19. Según su presidente Juan Carlos López, "la limpieza de un hospital es uno de los elementos más importantes para evitar la propagación de los virus".

La compañía, que opera desde 2011 en hospitales del Ministerio de Salud y la Caja de Seguro Social, también ha trabajado en limpieza del Metro de Panamá, aeropuerto de Albrook y municipio capitalino.

Durante la emergencia sanitaria, el personal de aseo en áreas COVID-19 enfrentó desafíos significativos. López indicó que inicialmente "existía el temor entre los colaboradores, pero lo importante es tener las medidas de seguridad".

La empresa capacita a sus trabajadores cada 45 días y cuenta con especialistas en microbiología, epidemiología y salud ocupacional. Se encargó de limpiar 12 hoteles hospital, implementando rutas de movimiento para evitar contaminación cruzada.

López enfatizó que el aislamiento en hoteles hospitales fue una medida efectiva para prevenir propagación en familias numerosas, y argumentó que "si la gente fuera responsable, el virus se acaba rápido".`,
    author: 'Ismael Gordón Guerrel',
    publishedDate: '2020-10-26',
    category: 'Economía'
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
  'Destino Panamá': {
    slug: 'destino-panama',
    name: 'Destino Panamá',
    url: 'https://www.destinopanama.com.pa',
    type: 'media',
  },
  'Panamá Hoy': {
    slug: 'panama-hoy',
    name: 'Panamá Hoy',
    url: 'https://panamahoy.com.pa',
    type: 'media',
  },
  'La Estrella': {
    slug: 'la-estrella',
    name: 'La Estrella de Panamá',
    url: 'https://www.laestrella.com.pa',
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
      isTrusted: true,
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
          content: `Eres un experto en fact-checking. Extrae declaraciones verificables del artículo sobre Sicarelle Holdings.

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
- Montos de contratos y sobrecostos
- Irregularidades en servicios
- Vínculos políticos
- Denuncias de trabajadores
- Conexiones con funcionarios`
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
  console.log('🔍 PROCESANDO NOTICIAS SOBRE SICARELLE HOLDINGS')
  console.log('='.repeat(60))
  console.log(`📰 Total artículos: ${ARTICLES.length}\n`)

  let totalClaims = 0

  for (const article of ARTICLES) {
    try {
      console.log(`\n📄 ${article.title.substring(0, 70)}...`)

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
        topics: ['Sicarelle Holdings', 'Licitaciones', 'Salud', 'Corrupción']
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
          category: claim.category || 'Corrupción',
          tags: ['Sicarelle Holdings', 'Smart Health', claim.category, article.sourceName],
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
