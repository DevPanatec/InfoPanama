/**
 * Crawler especializado para encontrar conexiones de entidades huérfanas
 *
 * Este script:
 * 1. Obtiene la lista de entidades sin conexiones
 * 2. Busca información específica sobre cada una en Google
 * 3. Extrae conexiones y relaciones
 * 4. Crea las relaciones en la base de datos
 */

import { ConvexHttpClient } from 'convex/browser'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'

// Configuración
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!CONVEX_URL) {
  console.error('❌ Error: CONVEX_URL no está configurado')
  process.exit(1)
}

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY no está configurado')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Interfaces
interface OrphanEntity {
  _id: string
  name: string
  type: string
  metadata?: any
}

interface EntityConnection {
  sourceEntityName: string
  targetEntityName: string
  relationType: 'owns' | 'works_for' | 'political_connection' | 'family' | 'business' | 'related_to'
  context: string
  confidence: number
}

// Funciones auxiliares
async function findOrphanEntities(): Promise<OrphanEntity[]> {
  const result = await client.query('auditEntities:findOrphanEntities' as any)
  return result.orphanSample || []
}

async function findEntityByName(name: string) {
  return await client.query('entities:findByName' as any, { name })
}

async function upsertEntityRelation(data: any) {
  return await client.mutation('entityRelations:upsertRelation' as any, data)
}

/**
 * Busca información sobre una entidad usando IA
 */
async function findEntityConnections(entity: OrphanEntity): Promise<EntityConnection[]> {
  const context = entity.metadata?.description || ''
  const affiliation = entity.metadata?.affiliation || ''
  const position = entity.metadata?.position || ''

  const prompt = `Eres un experto en política y negocios de Panamá. Analiza esta entidad y proporciona información sobre sus conexiones:

ENTIDAD: ${entity.name}
TIPO: ${entity.type}
${context ? `CONTEXTO: ${context}` : ''}
${affiliation ? `AFILIACIÓN: ${affiliation}` : ''}
${position ? `POSICIÓN: ${position}` : ''}

Por favor, identifica:
1. Si es una PERSONA: ¿Para qué organización trabaja? ¿A qué partido pertenece? ¿Con quién está relacionado?
2. Si es una ORGANIZACIÓN: ¿Quién es su dueño/líder? ¿Qué otras organizaciones están relacionadas?

Proporciona SOLO información verificable y conocida públicamente sobre Panamá.

Responde en formato JSON:
{
  "connections": [
    {
      "targetEntity": "Nombre de la entidad relacionada",
      "relationType": "works_for | owns | political_connection | family | business | related_to",
      "context": "Descripción breve de la relación",
      "confidence": 0.0-1.0
    }
  ]
}

Si NO tienes información verificable, responde: { "connections": [] }`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en la política y estructura gubernamental de Panamá. Solo proporcionas información verificable y conocida públicamente.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{"connections":[]}')

    const connections: EntityConnection[] = result.connections.map((conn: any) => ({
      sourceEntityName: entity.name,
      targetEntityName: conn.targetEntity,
      relationType: conn.relationType,
      context: conn.context,
      confidence: conn.confidence,
    }))

    return connections
  } catch (error) {
    console.error(`   ❌ Error con IA para ${entity.name}:`, error)
    return []
  }
}

/**
 * Procesa una entidad huérfana y crea sus conexiones
 */
async function processOrphanEntity(entity: OrphanEntity, index: number, total: number) {
  console.log(`\n[${index + 1}/${total}] 🔍 Procesando: ${entity.name} (${entity.type})`)

  // Si ya tiene metadata con información, úsala
  if (entity.metadata?.affiliation || entity.metadata?.position) {
    console.log(`   ℹ️  Metadata: ${entity.metadata.affiliation || ''} ${entity.metadata.position || ''}`)
  }

  // Buscar conexiones con IA
  const connections = await findEntityConnections(entity)

  if (connections.length === 0) {
    console.log(`   ⚠️  No se encontraron conexiones`)
    return 0
  }

  console.log(`   ✅ Encontradas ${connections.length} conexiones potenciales`)

  let created = 0

  // Crear cada conexión
  for (const connection of connections) {
    try {
      // Buscar la entidad fuente
      const sourceEntity = await findEntityByName(connection.sourceEntityName)
      if (!sourceEntity) {
        console.log(`   ⚠️  Entidad fuente no encontrada: ${connection.sourceEntityName}`)
        continue
      }

      // Buscar o crear la entidad destino
      let targetEntity = await findEntityByName(connection.targetEntityName)

      if (!targetEntity) {
        console.log(`   ℹ️  Creando entidad destino: ${connection.targetEntityName}`)

        // Intentar determinar el tipo de la entidad destino
        const targetType = inferEntityType(connection.targetEntityName, connection.relationType)

        targetEntity = await client.mutation('entities:create' as any, {
          name: connection.targetEntityName,
          type: targetType,
          metadata: {
            description: `Relacionado con ${connection.sourceEntityName}`,
            autoCreated: true,
          },
        })
      }

      // Crear la relación
      await upsertEntityRelation({
        sourceId: sourceEntity._id,
        sourceType: 'entity',
        targetId: targetEntity._id,
        targetType: 'entity',
        relationType: connection.relationType,
        strength: connection.confidence,
        confidence: connection.confidence,
        context: connection.context,
      })

      console.log(`   ✅ ${connection.sourceEntityName} → ${connection.relationType} → ${connection.targetEntityName}`)
      created++

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

    } catch (error: any) {
      console.error(`   ❌ Error creando conexión:`, error.message)
    }
  }

  return created
}

/**
 * Infiere el tipo de entidad basado en el nombre y contexto
 */
function inferEntityType(name: string, relationType: string): 'PERSON' | 'ORGANIZATION' | 'OTHER' {
  // Palabras clave para organizaciones
  const orgKeywords = [
    'ministerio', 'asamblea', 'partido', 'gobierno', 'tribunal',
    'comisión', 'instituto', 'autoridad', 'corporación', 'empresa',
    'alcaldía', 'municipio', 'banco', 'sociedad', 'fundación',
    'asociación', 'coalición', 'sistema', 'caja'
  ]

  const nameLower = name.toLowerCase()

  // Si contiene palabras clave de organización
  if (orgKeywords.some(keyword => nameLower.includes(keyword))) {
    return 'ORGANIZATION'
  }

  // Si el tipo de relación sugiere que es organización
  if (relationType === 'works_for' || relationType === 'political_connection') {
    return 'ORGANIZATION'
  }

  // Si tiene formato de nombre de persona (dos o más palabras con mayúsculas)
  const words = name.split(' ')
  if (words.length >= 2 && words.every(w => w[0] === w[0].toUpperCase())) {
    return 'PERSON'
  }

  return 'OTHER'
}

/**
 * Main
 */
async function main() {
  const startTime = Date.now()

  console.log('🔍 CRAWLER DE ENTIDADES HUÉRFANAS - InfoPanama')
  console.log('='.repeat(60))

  // Fase 1: Obtener entidades huérfanas
  console.log('\n📋 FASE 1: OBTENIENDO ENTIDADES HUÉRFANAS')
  console.log('='.repeat(60))

  const orphans = await findOrphanEntities()
  console.log(`✅ Encontradas ${orphans.length} entidades sin conexiones`)

  if (orphans.length === 0) {
    console.log('\n✅ No hay entidades huérfanas para procesar')
    process.exit(0)
  }

  // Mostrar lista
  console.log('\n📝 Entidades a procesar:')
  orphans.forEach((orphan, i) => {
    console.log(`   ${i + 1}. ${orphan.name} (${orphan.type})`)
  })

  // Fase 2: Buscar conexiones para cada huérfana
  console.log('\n\n🤖 FASE 2: BUSCANDO CONEXIONES CON IA')
  console.log('='.repeat(60))

  let totalConnectionsCreated = 0

  for (let i = 0; i < orphans.length; i++) {
    const created = await processOrphanEntity(orphans[i], i, orphans.length)
    totalConnectionsCreated += created

    // Rate limiting entre entidades
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Resumen final
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('\n\n🎉 CRAWLER COMPLETADO')
  console.log('='.repeat(60))
  console.log(`🔍 Entidades procesadas: ${orphans.length}`)
  console.log(`🔗 Conexiones creadas: ${totalConnectionsCreated}`)
  console.log(`⏱️  Tiempo: ${duration}s`)
  console.log('='.repeat(60))

  console.log('\n💡 Próximos pasos:')
  console.log('1. Ejecutar auditoría: npx convex run auditEntities:findOrphanEntities')
  console.log('2. Revisar el grafo actualizado en el dashboard')

  process.exit(0)
}

// Error handlers
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error)
  process.exit(1)
})

main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
