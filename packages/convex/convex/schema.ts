import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Schema de la base de datos Convex para InfoPanama
 *
 * Tablas principales:
 * - claims: Afirmaciones a verificar
 * - verdicts: Resultados de verificación
 * - articles: Artículos de medios scrapeados
 * - sources: Fuentes de información (medios, oficiales)
 * - entities: Entidades extraídas (personas, organizaciones)
 * - actors: Actores informativos y su debida diligencia
 * - snapshots: Snapshots de páginas web
 * - topics: Tópicos/categorías
 * - events: Eventos gubernamentales
 * - comments: Comentarios de usuarios
 * - auditLogs: Logs de auditoría inmutables
 */

export default defineSchema({
  // ============================================
  // CLAIMS Y VERIFICACIÓN
  // ============================================
  claims: defineTable({
    // Metadata básica
    title: v.string(),
    description: v.string(),
    claimText: v.string(),
    imageUrl: v.optional(v.string()), // Imagen destacada para la card

    // Estado del workflow
    status: v.union(
      v.literal('new'),
      v.literal('investigating'),
      v.literal('review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    ),

    // Clasificación
    category: v.optional(v.string()),
    tags: v.array(v.string()),

    // Nivel de riesgo
    riskLevel: v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    ),

    // Veredicto (opcional - puede venir de verdicts table)
    verdict: v.optional(v.union(
      v.literal('TRUE'),
      v.literal('FALSE'),
      v.literal('MIXED'),
      v.literal('UNPROVEN'),
      v.literal('NEEDS_CONTEXT')
    )),

    // Metadata de origen
    sourceType: v.union(
      v.literal('user_submitted'),
      v.literal('auto_extracted'),
      v.literal('media_article'),
      v.literal('social_media'),
      v.literal('official_source')
    ),
    sourceUrl: v.optional(v.string()),
    sourceId: v.optional(v.id('articles')),

    // Asignación
    assignedTo: v.optional(v.id('users')),
    investigatedBy: v.optional(v.id('users')),

    // Flags
    isPublic: v.boolean(),
    isFeatured: v.boolean(),
    autoPublished: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_risk', ['riskLevel'])
    .index('by_created', ['createdAt'])
    .index('by_category', ['category'])
    .searchIndex('search_claims', {
      searchField: 'claimText',
      filterFields: ['status', 'category', 'riskLevel'],
    }),

  // ============================================
  // VEREDICTOS
  // ============================================
  verdicts: defineTable({
    claimId: v.id('claims'),

    // Veredicto
    verdict: v.union(
      v.literal('TRUE'),
      v.literal('FALSE'),
      v.literal('MIXED'),
      v.literal('UNPROVEN'),
      v.literal('NEEDS_CONTEXT')
    ),

    // Scores
    confidenceScore: v.number(), // 0-100

    // Explicación
    explanation: v.string(),
    summary: v.string(),

    // Evidencia
    evidenceSources: v.array(v.object({
      sourceId: v.id('articles'),
      quote: v.string(),
      relevance: v.number(),
      url: v.string(),
    })),

    // Metadata IA
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTime: v.number(),

    // Validación
    validatedBy: v.optional(v.id('users')),
    criticReview: v.optional(v.object({
      passed: v.boolean(),
      issues: v.array(v.string()),
      confidence: v.number(),
    })),

    // Version control
    version: v.number(),
    previousVersionId: v.optional(v.id('verdicts')),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_claim', ['claimId'])
    .index('by_verdict', ['verdict'])
    .index('by_confidence', ['confidenceScore']),

  // ============================================
  // ARTÍCULOS Y CONTENIDO
  // ============================================
  articles: defineTable({
    // Metadata básica
    title: v.string(),
    url: v.string(),
    content: v.string(),
    htmlContent: v.optional(v.string()),

    // Fuente
    sourceId: v.id('sources'),
    author: v.optional(v.string()),
    publishedDate: v.number(),

    // Snapshot
    snapshotUrl: v.optional(v.string()), // DO Spaces URL
    snapshotHash: v.optional(v.string()),

    // Clasificación
    topics: v.array(v.string()),
    entities: v.array(v.id('entities')),

    // Análisis NLP
    sentiment: v.optional(v.object({
      score: v.number(), // -1 to 1
      label: v.union(v.literal('positive'), v.literal('neutral'), v.literal('negative')),
    })),

    // Embeddings
    hasEmbedding: v.boolean(),
    embeddingId: v.optional(v.string()), // Qdrant ID

    // Claims extraídos
    extractedClaims: v.array(v.id('claims')),

    // Hash para deduplicación
    contentHash: v.string(),

    // Metadata
    scrapedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_source', ['sourceId'])
    .index('by_date', ['publishedDate'])
    .index('by_hash', ['contentHash'])
    .searchIndex('search_articles', {
      searchField: 'content',
      filterFields: ['sourceId', 'topics'],
    }),

  // ============================================
  // FUENTES DE INFORMACIÓN
  // ============================================
  sources: defineTable({
    // Identificación
    name: v.string(),
    slug: v.string(),
    url: v.string(),
    type: v.union(
      v.literal('media'),
      v.literal('official'),
      v.literal('social_media')
    ),

    // Clasificación
    category: v.optional(v.string()),

    // Credibilidad
    isTrusted: v.boolean(),
    credibilityScore: v.number(), // 0-100

    // Ownership
    owner: v.optional(v.string()),
    ownership: v.optional(v.object({
      entity: v.string(),
      type: v.string(),
      notes: v.optional(v.string()),
    })),

    // Bias analysis
    biasScore: v.optional(v.object({
      overall: v.number(), // -100 to 100 (negative=left, positive=right)
      sentiment: v.number(),
      framing: v.number(),
    })),

    // Scraping config
    scrapingEnabled: v.boolean(),
    scrapingFrequency: v.optional(v.string()), // cron expression
    lastScraped: v.optional(v.number()),

    // Stats
    articleCount: v.number(),

    // Metadata
    logo: v.optional(v.string()),
    description: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_type', ['type'])
    .index('by_trusted', ['isTrusted'])
    .searchIndex('search_sources', {
      searchField: 'name',
    }),

  // ============================================
  // ENTIDADES (NER)
  // ============================================
  entities: defineTable({
    name: v.string(),
    type: v.union(
      v.literal('PERSON'),
      v.literal('ORGANIZATION'),
      v.literal('LOCATION'),
      v.literal('EVENT'),
      v.literal('DATE'),
      v.literal('OTHER')
    ),

    // Normalización
    normalizedName: v.string(),
    aliases: v.array(v.string()),

    // Relaciones
    mentionedIn: v.array(v.id('articles')),
    mentionCount: v.number(),

    // Metadata adicional
    metadata: v.optional(v.object({
      position: v.optional(v.string()),
      affiliation: v.optional(v.string()),
      description: v.optional(v.string()),
    })),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_name', ['normalizedName'])
    .searchIndex('search_entities', {
      searchField: 'name',
      filterFields: ['type'],
    }),

  // ============================================
  // ACTORES Y DEBIDA DILIGENCIA (DD)
  // ============================================
  actors: defineTable({
    // Identificación
    name: v.string(),
    type: v.union(
      v.literal('person'),
      v.literal('group'),
      v.literal('troll_network'),
      v.literal('botnet'),
      v.literal('HB'), // Hombres de Blanco
      v.literal('anonymous'),
      v.literal('verified_account'),
      v.literal('media_outlet'),
      v.literal('official')
    ),

    // Perfilamiento
    profile: v.object({
      description: v.optional(v.string()),
      history: v.optional(v.string()),
      relationships: v.array(v.object({
        actorId: v.id('actors'),
        relationshipType: v.string(),
        strength: v.number(), // 0-1
      })),
      publicationPatterns: v.optional(v.object({
        frequency: v.string(),
        topics: v.array(v.string()),
        tone: v.string(),
      })),
    }),

    // Índice de Riesgo Informativo (IRI)
    riskLevel: v.union(
      v.literal('LOW'),
      v.literal('MEDIUM'),
      v.literal('HIGH'),
      v.literal('CRITICAL')
    ),
    riskScore: v.number(), // 0-100

    // KYA (Know Your Actor)
    kyaStatus: v.union(
      v.literal('verified'),
      v.literal('suspicious'),
      v.literal('flagged'),
      v.literal('blocked')
    ),

    // Debida Diligencia
    dueDiligence: v.object({
      completedAt: v.optional(v.number()),
      completedBy: v.optional(v.id('users')),
      findings: v.optional(v.string()),
      complianceStatus: v.union(
        v.literal('compliant'),
        v.literal('review_needed'),
        v.literal('non_compliant')
      ),
      legalFramework: v.optional(v.array(v.string())), // Referencias a leyes panameñas
    }),

    // Actividad
    incidents: v.array(v.id('claims')),
    articlesAuthored: v.array(v.id('articles')),
    lastActivity: v.optional(v.number()),

    // Flags
    isMonitored: v.boolean(),
    isBlocked: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_risk', ['riskLevel'])
    .index('by_kya', ['kyaStatus'])
    .searchIndex('search_actors', {
      searchField: 'name',
      filterFields: ['type', 'riskLevel', 'kyaStatus'],
    }),

  // ============================================
  // ANÁLISIS DE RESPONSABLES
  // ============================================
  probableResponsibles: defineTable({
    // Referencia al incidente
    claimId: v.id('claims'),

    // Actor responsable
    actorId: v.id('actors'),

    // Probabilidad
    probability: v.number(), // 0-100
    confidence: v.number(), // 0-100

    // Justificación
    reasoning: v.string(),
    evidence: v.array(v.object({
      type: v.string(),
      description: v.string(),
      sourceId: v.optional(v.union(v.id('articles'), v.id('sources'))),
      weight: v.number(), // 0-1
    })),

    // Patrones detectados
    patterns: v.array(v.string()),

    // Validación
    validatedBy: v.optional(v.id('users')),
    validationStatus: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('rejected')
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_claim', ['claimId'])
    .index('by_actor', ['actorId'])
    .index('by_probability', ['probability']),

  // ============================================
  // SNAPSHOTS
  // ============================================
  snapshots: defineTable({
    url: v.string(),
    articleId: v.optional(v.id('articles')),

    // Storage
    htmlPath: v.string(), // DO Spaces path
    pdfPath: v.optional(v.string()),
    screenshotPath: v.optional(v.string()),

    // Metadata
    contentHash: v.string(),
    fileSize: v.number(),

    createdAt: v.number(),
  })
    .index('by_article', ['articleId'])
    .index('by_hash', ['contentHash']),

  // ============================================
  // TOPICS/CATEGORÍAS
  // ============================================
  topics: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),

    // Jerarquía
    parentId: v.optional(v.id('topics')),

    // Stats
    articleCount: v.number(),
    claimCount: v.number(),

    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_parent', ['parentId']),

  // ============================================
  // EVENTOS GUBERNAMENTALES
  // ============================================
  events: defineTable({
    title: v.string(),
    description: v.string(),

    // Fecha
    eventDate: v.number(),

    // Tipo
    eventType: v.union(
      v.literal('legislative'),
      v.literal('executive'),
      v.literal('judicial'),
      v.literal('election'),
      v.literal('public_hearing'),
      v.literal('other')
    ),

    // Fuente oficial
    sourceId: v.optional(v.id('sources')),
    sourceUrl: v.optional(v.string()),

    // Relaciones
    relatedClaims: v.array(v.id('claims')),
    relatedArticles: v.array(v.id('articles')),

    // Alertas
    alertDays: v.array(v.number()), // [7, 3, 1] días antes
    lastAlertSent: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_date', ['eventDate'])
    .index('by_type', ['eventType'])
    .searchIndex('search_events', {
      searchField: 'title',
      filterFields: ['eventType'],
    }),

  // ============================================
  // COMENTARIOS DE USUARIOS
  // ============================================
  comments: defineTable({
    claimId: v.id('claims'),
    userId: v.id('users'),

    content: v.string(),

    // Moderación
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('flagged')
    ),
    moderatedBy: v.optional(v.id('users')),
    moderatedAt: v.optional(v.number()),

    // Engagement
    upvotes: v.number(),
    downvotes: v.number(),
    isHighlighted: v.boolean(),

    // Reportes
    reportCount: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_claim', ['claimId'])
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  // ============================================
  // USUARIOS
  // ============================================
  users: defineTable({
    // Auth (Clerk)
    clerkId: v.string(),
    email: v.string(),

    // Profile
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),

    // Roles
    role: v.union(
      v.literal('reader'),
      v.literal('moderator'),
      v.literal('editor'),
      v.literal('approver'),
      v.literal('admin')
    ),

    // 2FA
    twoFactorEnabled: v.boolean(),

    // Stats
    claimsInvestigated: v.number(),
    commentsPosted: v.number(),

    // Status
    isActive: v.boolean(),
    isBanned: v.boolean(),

    createdAt: v.number(),
    lastLogin: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role']),

  // ============================================
  // AUDIT LOGS (Inmutables)
  // ============================================
  auditLogs: defineTable({
    // Actor
    userId: v.id('users'),
    userEmail: v.string(),

    // Acción
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),

    // Detalles
    changes: v.optional(v.object({
      before: v.any(),
      after: v.any(),
    })),

    // Context
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),

    // Timestamp (inmutable)
    timestamp: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_entity', ['entityType', 'entityId']),

  // ============================================
  // NOTIFICACIONES
  // ============================================
  notifications: defineTable({
    userId: v.id('users'),

    // Tipo de notificación
    type: v.union(
      v.literal('new_claim'),
      v.literal('verdict_published'),
      v.literal('comment_reply'),
      v.literal('comment_mention'),
      v.literal('event_reminder'),
      v.literal('subscription_update'),
      v.literal('claim_request_status'),
      v.literal('system_announcement')
    ),

    // Contenido
    title: v.string(),
    message: v.string(),

    // Entidad relacionada
    relatedEntityType: v.optional(
      v.union(
        v.literal('claim'),
        v.literal('verdict'),
        v.literal('comment'),
        v.literal('event'),
        v.literal('claimRequest')
      )
    ),
    relatedEntityId: v.optional(v.string()),

    // Estado
    isRead: v.boolean(),
    readAt: v.optional(v.number()),

    // Prioridad
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),

    // URL de acción
    actionUrl: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_read', ['userId', 'isRead'])
    .index('by_created', ['createdAt']),

  // ============================================
  // SUSCRIPCIONES
  // ============================================
  subscriptions: defineTable({
    userId: v.id('users'),

    // Tipo de suscripción
    type: v.union(
      v.literal('topic'),
      v.literal('actor'),
      v.literal('source'),
      v.literal('category'),
      v.literal('keyword'),
      v.literal('all_claims')
    ),

    // Target ID (dependiendo del tipo)
    targetId: v.optional(v.string()), // ID del topic/actor/source
    targetName: v.string(), // Nombre para display

    // Configuración
    frequency: v.union(
      v.literal('realtime'),
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly')
    ),

    // Filtros adicionales
    filters: v.optional(
      v.object({
        verdictTypes: v.optional(v.array(v.string())),
        riskLevels: v.optional(v.array(v.string())),
        minConfidence: v.optional(v.number()),
      })
    ),

    // Canal de notificación
    channels: v.array(
      v.union(v.literal('email'), v.literal('web'), v.literal('push'))
    ),

    // Estado
    isActive: v.boolean(),
    lastNotified: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_active', ['userId', 'isActive'])
    .index('by_type', ['type'])
    .index('by_target', ['type', 'targetId']),

  // ============================================
  // SOLICITUDES DE VERIFICACIÓN
  // ============================================
  claimRequests: defineTable({
    // Usuario que solicita
    userId: v.id('users'),

    // Contenido
    claimText: v.string(),
    description: v.string(),
    sourceUrl: v.optional(v.string()),
    category: v.optional(v.string()),

    // Estado del workflow
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('investigating'),
      v.literal('rejected'),
      v.literal('duplicate'),
      v.literal('completed')
    ),

    // Prioridad
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('urgent')
    ),

    // Si fue aprobado
    claimId: v.optional(v.id('claims')), // ID del claim creado

    // Revisión
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),

    // Engagement
    upvotes: v.number(), // Otros usuarios que también quieren esto verificado
    upvotedBy: v.array(v.id('users')),

    // Metadata
    duplicateOf: v.optional(v.id('claimRequests')), // Si es duplicado

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_priority', ['priority'])
    .index('by_created', ['createdAt'])
    .index('by_upvotes', ['upvotes']),

  // ============================================
  // GRAFO DE RELACIONES
  // ============================================
  entityRelations: defineTable({
    // Nodos del grafo
    sourceId: v.string(), // ID de la entidad source (puede ser actor, source, entity, event)
    sourceType: v.union(
      v.literal('actor'),
      v.literal('source'),
      v.literal('entity'),
      v.literal('event')
    ),

    targetId: v.string(), // ID de la entidad target
    targetType: v.union(
      v.literal('actor'),
      v.literal('source'),
      v.literal('entity'),
      v.literal('event')
    ),

    // Tipo de relación
    relationType: v.union(
      v.literal('owns'), // Dueño de medio
      v.literal('works_for'), // Trabaja para
      v.literal('affiliated_with'), // Afiliado con
      v.literal('mentioned_with'), // Mencionado junto a
      v.literal('quoted_by'), // Citado por
      v.literal('covers'), // Cubre (medio->evento/actor)
      v.literal('participates_in'), // Participa en evento
      v.literal('related_to'), // Relacionado genérico
      v.literal('opposes'), // Se opone a
      v.literal('supports') // Apoya a
    ),

    // Fuerza de la relación
    strength: v.number(), // 0-100, calculado por IA o frecuencia de co-ocurrencia
    confidence: v.number(), // 0-100, confianza en la relación

    // Contexto
    context: v.optional(v.string()), // Descripción de la relación

    // Evidencia
    evidenceArticles: v.array(v.id('articles')), // Artículos que evidencian esta relación
    evidenceCount: v.number(),

    // Metadata de análisis IA
    aiAnalysis: v.optional(v.object({
      summary: v.string(),
      sentiment: v.number(), // -100 to 100
      keywords: v.array(v.string()),
      analyzedAt: v.number(),
    })),

    // Lifecycle
    isActive: v.boolean(),
    verifiedBy: v.optional(v.id('users')), // Usuario que verificó manualmente
    verifiedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_source', ['sourceId', 'sourceType'])
    .index('by_target', ['targetId', 'targetType'])
    .index('by_relation_type', ['relationType'])
    .index('by_strength', ['strength'])
    .index('by_active', ['isActive']),

  // ============================================
  // CONFIGURACIÓN DEL SISTEMA
  // ============================================
  systemConfig: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),

    updatedBy: v.id('users'),
    updatedAt: v.number(),
  })
    .index('by_key', ['key']),
})
