/**
 * Auto-extractor de Actores desde Claims
 * Crea automáticamente actores cuando detecta speakers en claims
 * Usa fuzzy matching para evitar duplicados
 */

import { ConvexHttpClient } from 'convex/browser'
import type { ExtractedClaim } from '../types/index.js'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('CONVEX_URL no está configurado')
}

const client = new ConvexHttpClient(CONVEX_URL)

/**
 * Normalizar nombres para comparación fuzzy
 * Elimina acentos, mayúsculas, títulos comunes
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\b(dr|dra|ing|lic|prof|sr|sra|presidente|ministro|ministra|diputado|diputada)\b\.?/gi, '') // Eliminar títulos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras y números
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
}

/**
 * Calcular similitud entre dos strings usando Levenshtein distance
 */
function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Levenshtein distance - mide cuántos cambios se necesitan entre dos strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Detectar el tipo de actor basado en el nombre y contexto
 */
function detectActorType(speaker: string, context: string): {
  type: 'person' | 'group' | 'media_outlet' | 'official'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
} {
  const lowerSpeaker = speaker.toLowerCase()
  const lowerContext = context.toLowerCase()

  // Media outlets
  if (
    lowerSpeaker.includes('prensa') ||
    lowerSpeaker.includes('periódico') ||
    lowerSpeaker.includes('diario') ||
    lowerSpeaker.includes('radio') ||
    lowerSpeaker.includes('televisión') ||
    lowerSpeaker.includes('tvn') ||
    lowerSpeaker.includes('telemetro')
  ) {
    return { type: 'media_outlet', riskLevel: 'LOW' }
  }

  // Instituciones oficiales
  if (
    lowerSpeaker.includes('ministerio') ||
    lowerSpeaker.includes('gobierno') ||
    lowerSpeaker.includes('presidencia') ||
    lowerSpeaker.includes('asamblea') ||
    lowerSpeaker.includes('tribunal') ||
    lowerSpeaker.includes('corte')
  ) {
    return { type: 'official', riskLevel: 'LOW' }
  }

  // Grupos políticos
  if (
    lowerSpeaker.includes('partido') ||
    lowerSpeaker.includes('coalición') ||
    lowerSpeaker.includes('movimiento') ||
    lowerSpeaker.includes('frente')
  ) {
    return { type: 'group', riskLevel: 'MEDIUM' }
  }

  // Figuras políticas de alto riesgo
  if (
    lowerContext.includes('presidente') ||
    lowerContext.includes('vicepresidente') ||
    lowerContext.includes('ministro') ||
    lowerContext.includes('ministra') ||
    lowerSpeaker.match(/\b(presidente|ministro|ministra|diputado|diputada)\b/)
  ) {
    return { type: 'person', riskLevel: 'HIGH' }
  }

  // Por defecto: persona con riesgo medio
  return { type: 'person', riskLevel: 'MEDIUM' }
}

/**
 * Generar un slug único para el actor
 */
function generateSlug(name: string): string {
  return normalizeName(name).replace(/\s+/g, '-')
}

/**
 * Buscar actor existente por nombre (con fuzzy matching)
 */
async function findExistingActor(
  speakerName: string,
  allActors: any[]
): Promise<any | null> {
  const normalizedSpeaker = normalizeName(speakerName)

  for (const actor of allActors) {
    const normalizedActorName = normalizeName(actor.name)
    const sim = similarity(normalizedSpeaker, normalizedActorName)

    // Si la similitud es >= 85%, consideramos que es el mismo actor
    if (sim >= 0.85) {
      console.log(
        `   🔗 Actor existente encontrado: "${actor.name}" (similitud: ${(sim * 100).toFixed(1)}%)`
      )
      return actor
    }
  }

  return null
}

/**
 * Crear un nuevo actor en Convex
 */
async function createActor(data: {
  name: string
  type: 'person' | 'group' | 'media_outlet' | 'official'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description?: string
}) {
  return await client.mutation('actors:create' as any, {
    name: data.name,
    type: data.type,
    riskLevel: data.riskLevel,
    description: data.description,
  })
}

/**
 * Obtener todos los actores para fuzzy matching
 */
async function getAllActors() {
  return await client.query('actors:list' as any, { limit: 1000 })
}

/**
 * Procesar claim y auto-crear actor si es necesario
 * Retorna el actorId (existente o recién creado)
 */
export async function extractAndCreateActor(
  claim: ExtractedClaim,
  articleTitle: string
): Promise<string | null> {
  // Si no hay speaker, no podemos crear actor
  if (!claim.speaker || claim.speaker.trim() === '') {
    return null
  }

  const speakerName = claim.speaker.trim()

  // Filtrar speakers genéricos que no son actores reales
  const genericSpeakers = [
    'anónimo',
    'fuentes',
    'testigos',
    'vecinos',
    'ciudadanos',
    'residentes',
    'expertos',
    'analistas',
    'usuarios',
    'seguidores',
  ]

  if (
    genericSpeakers.some((generic) =>
      normalizeName(speakerName).includes(generic)
    )
  ) {
    console.log(
      `   ⏭️  Omitiendo speaker genérico: "${speakerName}"`
    )
    return null
  }

  try {
    // Obtener todos los actores existentes
    const allActors = await getAllActors()

    // Buscar si ya existe un actor similar
    const existingActor = await findExistingActor(speakerName, allActors)

    if (existingActor) {
      return existingActor._id
    }

    // No existe, crear nuevo actor
    console.log(`   ✨ Creando nuevo actor: "${speakerName}"`)

    const { type, riskLevel } = detectActorType(
      speakerName,
      claim.context || ''
    )

    const description = `Actor detectado automáticamente desde: "${articleTitle.substring(0, 100)}..."`

    const actorId = await createActor({
      name: speakerName,
      type,
      riskLevel,
      description,
    })

    console.log(
      `   ✅ Actor creado: ${actorId} (tipo: ${type}, riesgo: ${riskLevel})`
    )

    return actorId
  } catch (error: any) {
    console.error(
      `   ❌ Error creando actor "${speakerName}":`,
      error.message
    )
    return null
  }
}

/**
 * Procesar múltiples claims y auto-crear actores
 */
export async function extractActorsFromClaims(
  claims: ExtractedClaim[],
  articleTitle: string
): Promise<Map<number, string | null>> {
  const actorMap = new Map<number, string | null>()

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i]
    const actorId = await extractAndCreateActor(claim, articleTitle)
    actorMap.set(i, actorId)
  }

  return actorMap
}
