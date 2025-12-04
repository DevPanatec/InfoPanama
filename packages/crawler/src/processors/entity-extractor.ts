/**
 * Extractor de Entidades Panameñas con IA
 *
 * Extrae:
 * - Personas públicas y POI (Persons of Interest)
 * - Partidos políticos
 * - Instituciones gubernamentales
 * - Medios de comunicación
 * - Organizaciones
 */

import OpenAI from 'openai'
import type { ScrapedArticle } from '../types/index.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedEntity {
  name: string
  type: 'PERSON' | 'POI' | 'POLITICAL_PARTY' | 'INSTITUTION' | 'MEDIA' | 'ORGANIZATION'
  role?: string // Cargo o rol de la persona
  affiliation?: string // Partido político o institución
  context: string // Contexto en el que se menciona
  isPOI: boolean // Si es persona de interés especial
  relevanceScore: number // 0-100
  relationships?: {
    owns?: string[] // Empresas que posee
    worksFor?: string[] // Empresas donde trabaja
    memberOf?: string[] // Partidos/organizaciones de las que es miembro
    relatedTo?: string[] // Personas relacionadas (familia, socios, etc)
    contracts?: string[] // Contratos o negocios mencionados
  }
}

export interface EntityExtractionResult {
  article: ScrapedArticle
  entities: ExtractedEntity[]
}

const ENTITY_EXTRACTION_PROMPT = `Eres un experto en análisis político y social de PANAMÁ. Tu tarea es extraer SOLO entidades RELEVANTES PANAMEÑAS para análisis OSINT político.

🇵🇦 ENFOQUE CRÍTICO: SOLO PANAMÁ
Este sistema es para monitoreo político de PANAMÁ. NO extraigas figuras internacionales a menos que tengan relación DIRECTA con política panameña.

TIPOS DE ENTIDADES A EXTRAER:

1. PERSON - Personas públicas PANAMEÑAS (políticos, funcionarios, empresarios, activistas)
2. POI - Persons of Interest: figuras políticas panameñas de alto nivel (presidente, ministros, diputados, alcaldes)
3. POLITICAL_PARTY - Partidos políticos PANAMEÑOS
4. INSTITUTION - Instituciones gubernamentales PANAMEÑAS
5. MEDIA - Medios de comunicación PANAMEÑOS
6. ORGANIZATION - Empresas, ONGs, asociaciones PANAMEÑAS con relevancia política

❌ NO EXTRAER - LISTA DE EXCLUSIONES:

**Figuras Internacionales (a menos que tengan cargo en Panamá):**
❌ Presidentes/políticos de otros países (Nicolás Maduro, Biden, Trump, Bukele, etc.)
❌ Realeza internacional (Rey Carlos III, Reina Isabel, Princesa Ana, etc.)
❌ Líderes empresariales internacionales sin operaciones en Panamá

**Empresas de Transporte y Turismo:**
❌ Aerolíneas internacionales (Iberia, Plus Ultra, TAP, Air Europa, Turkish Airlines, Avianca, LATAM, United, American, etc.)
❌ Cruceros, buses internacionales, trenes
❌ EXCEPCIÓN: Copa Airlines (aerolínea panameña) SÍ es relevante

**Productos y Commodities:**
❌ Productos agrícolas (cebolla, tomate, arroz, maíz, papa, yuca)
❌ Alimentos procesados (pan, leche, queso, cerveza)
❌ Materias primas (petróleo, oro, cobre) sin contexto de corrupción/política

**Otros NO Relevantes:**
❌ Fechas y tiempos (2023, diciembre, lunes, "hace 3 años")
❌ Ubicaciones genéricas sin contexto político (La Chorrera, David, Colón = NO, a menos que sea "Alcaldía de David")
❌ Conceptos abstractos (democracia, justicia, libertad, paz)
❌ Eventos deportivos o culturales sin implicación política
❌ Términos técnicos legales sin entidad específica

INSTRUCCIONES ESTRICTAS:
✅ Extrae SOLO si la entidad cumple TODOS estos criterios:
   1. Es panameña O tiene impacto directo en política panameña
   2. Tiene relevancia política, social o económica
   3. NO es una empresa de transporte/turismo internacional
   4. NO es una figura internacional sin cargo en Panamá

✅ Para PERSONAS:
   - SOLO panameños O extranjeros con cargo/rol en Panamá
   - Identifica cargo/rol si está mencionado
   - Marca como POI si es alto funcionario (presidente, ministro, diputado, magistrado, alcalde, fiscal)
   - Si es extranjero, verifica que tenga relación DIRECTA con Panamá (ej: embajador en Panamá)

✅ Para ORGANIZACIONES:
   - SOLO empresas panameñas O con operaciones significativas en Panamá
   - Copa Airlines = SÍ (panameña)
   - Iberia, TAP, Avianca, LATAM = NO (aerolíneas internacionales)
   - Sicarelli, Grupo Rey, etc. = SÍ (empresas panameñas)

✅ Score de relevancia:
   - 90-100: Presidente, vicepresidente, ministros
   - 70-89: Diputados, alcaldes, magistrados, directores de instituciones
   - 50-69: Funcionarios medios, empresarios, activistas
   - 0-49: Menciones secundarias

❌ SI el artículo es sobre:
   - Productos/precios SIN contexto de corrupción → devuelve lista vacía
   - Aerolíneas/vuelos/turismo internacional → devuelve lista vacía
   - Eventos internacionales sin impacto en Panamá → devuelve lista vacía

PARTIDOS POLÍTICOS CONOCIDOS EN PANAMÁ:
- Realizando Metas (RM)
- Cambio Democrático (CD)
- Partido Revolucionario Democrático (PRD)
- Partido Panameñista
- Movimiento Liberal Republicano Nacionalista (MOLIRENA)
- Partido Popular (PP)

🔍 EXTRACCIÓN DE RELACIONES (CRÍTICO PARA OSINT):
Además de extraer entidades, DEBES identificar sus RELACIONES:

1. **Propiedad/Control**: ¿Quién es dueño/accionista/presidente de qué empresa?
2. **Contratos**: ¿Qué empresa tiene contratos con qué institución?
3. **Afiliación política**: ¿Quién pertenece a qué partido?
4. **Conexiones familiares**: ¿Hay hermanos, primos, familiares mencionados?
5. **Relaciones laborales**: ¿Quién trabaja para quién?

RESPONDE SOLO CON JSON VÁLIDO, sin markdown:
{
  "entities": [
    {
      "name": "Nombre completo",
      "type": "PERSON|POI|POLITICAL_PARTY|INSTITUTION|MEDIA|ORGANIZATION",
      "role": "Cargo o rol (opcional)",
      "affiliation": "Partido o institución (opcional)",
      "context": "Breve contexto de la mención",
      "isPOI": true/false,
      "relevanceScore": 85,
      "relationships": {
        "owns": ["Empresa X", "Empresa Y"],
        "worksFor": ["Institución Z"],
        "memberOf": ["Partido A"],
        "relatedTo": ["Persona B (hermano)", "Persona C (socio)"],
        "contracts": ["Contrato con Minsa por $X"]
      }
    }
  ]
}

EJEMPLO:
Si el artículo dice "Rubén Daniel Arguelles, presidente de Hombres de Blanco, cuyo hermano Rubén Darío fue candidato de RM", debes extraer:
- Rubén Daniel Arguelles (POI, role: "Presidente", relationships: { owns: ["Hombres de Blanco"], relatedTo: ["Rubén Darío Arguelles (hermano)"] })
- Hombres de Blanco (ORGANIZATION, relationships: { relatedTo: ["Rubén Daniel Arguelles (dueño)"] })
- Rubén Darío Arguelles (POI, relationships: { memberOf: ["Realizando Metas"], relatedTo: ["Rubén Daniel Arguelles (hermano)"] })`

/**
 * Extrae entidades de un artículo usando OpenAI
 */
async function extractEntitiesFromArticle(
  article: ScrapedArticle
): Promise<ExtractedEntity[]> {
  try {
    const articleText = `
TÍTULO: ${article.title}

CONTENIDO:
${article.content.substring(0, 4000)} ${article.content.length > 4000 ? '...' : ''}
`.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: ENTITY_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: articleText,
        },
      ],
      max_completion_tokens: 3000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.warn(`⚠️  No se pudo extraer entidades de: ${article.title}`)
      return []
    }

    const result = JSON.parse(content)
    return result.entities || []
  } catch (error: any) {
    console.error(
      `❌ Error extrayendo entidades de "${article.title}":`,
      error.message
    )
    return []
  }
}

/**
 * Extrae entidades de múltiples artículos
 */
export async function extractEntitiesFromArticles(
  articles: ScrapedArticle[]
): Promise<EntityExtractionResult[]> {
  console.log(
    `\n🤖 Extrayendo entidades de ${articles.length} artículos con IA...\n`
  )

  const results: EntityExtractionResult[] = []

  for (const article of articles) {
    console.log(`   📄 Procesando: "${article.title.substring(0, 60)}..."`)

    const entities = await extractEntitiesFromArticle(article)

    console.log(`   ✅ Extraídas ${entities.length} entidades`)

    // Log de POIs encontrados
    const pois = entities.filter((e) => e.isPOI)
    if (pois.length > 0) {
      console.log(`   🎯 POIs encontrados: ${pois.map((p) => p.name).join(', ')}`)
    }

    results.push({
      article,
      entities,
    })

    // Rate limiting para OpenAI
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const totalEntities = results.reduce((sum, r) => sum + r.entities.length, 0)
  const totalPOIs = results.reduce(
    (sum, r) => sum + r.entities.filter((e) => e.isPOI).length,
    0
  )

  console.log(`\n✅ Extracción completa:`)
  console.log(`   • ${totalEntities} entidades totales`)
  console.log(`   • ${totalPOIs} POIs identificados`)

  return results
}
