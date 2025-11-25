import { mutation } from './_generated/server'

/**
 * Script para poblar la base de datos con datos de ejemplo
 * Ejecutar con: npx convex run seed:seedDatabase
 */
export const seedDatabase = mutation({
  handler: async (ctx) => {
    console.log('🌱 Sembrando base de datos...')

    // 1. Crear un usuario de ejemplo (admin)
    const adminUserId = await ctx.db.insert('users', {
      clerkId: 'seed_admin_001',
      email: 'admin@infopanama.com',
      name: 'Admin InfoPanama',
      role: 'admin',
      twoFactorEnabled: false,
      claimsInvestigated: 0,
      commentsPosted: 0,
      isActive: true,
      isBanned: false,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    })

    // 2. Crear fuentes de medios
    const tvnId = await ctx.db.insert('sources', {
      name: 'TVN Noticias',
      slug: 'tvn',
      url: 'https://www.tvn-2.com',
      type: 'media',
      category: 'Televisión',
      isTrusted: true,
      credibilityScore: 85,
      scrapingEnabled: true,
      articleCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const laprensaId = await ctx.db.insert('sources', {
      name: 'La Prensa',
      slug: 'la-prensa',
      url: 'https://www.prensa.com',
      type: 'media',
      category: 'Periódico',
      isTrusted: true,
      credibilityScore: 90,
      scrapingEnabled: true,
      articleCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // 3. Crear un artículo de ejemplo
    const articleId = await ctx.db.insert('articles', {
      title: 'Panamá anuncia nuevas medidas económicas para 2025',
      url: 'https://www.prensa.com/economia/medidas-2025',
      content: 'El gobierno de Panamá anunció hoy un paquete de medidas económicas...',
      sourceId: laprensaId,
      author: 'Redacción La Prensa',
      publishedDate: Date.now(),
      topics: ['economía', 'gobierno'],
      entities: [],
      hasEmbedding: false,
      extractedClaims: [],
      contentHash: 'hash_example_001',
      scrapedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // 4. Crear claims de ejemplo con imágenes
    const claim1Id = await ctx.db.insert('claims', {
      title: 'Presidente anuncia construcción del cuarto puente sobre el Canal',
      description: 'El gobierno afirma que iniciará obras para un cuarto puente sobre el Canal de Panamá en 2025',
      claimText: 'Se construirá un cuarto puente sobre el Canal de Panamá con inversión de $1,500 millones',
      imageUrl: 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?w=400',
      status: 'published',
      category: 'infraestructura',
      tags: ['canal', 'puente', 'infraestructura', 'gobierno'],
      riskLevel: 'HIGH',
      sourceType: 'official_source',
      sourceUrl: 'https://www.presidencia.gob.pa',
      isPublic: true,
      isFeatured: true,
      autoPublished: false,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
      publishedAt: Date.now() - 3600000,
    })

    const claim2Id = await ctx.db.insert('claims', {
      title: 'CSS anuncia eliminación de listas de espera para cirugías',
      description: 'La Caja de Seguro Social afirma que eliminará las listas de espera en 6 meses',
      claimText: 'En 6 meses no habrá más listas de espera en la CSS',
      imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400',
      status: 'published',
      category: 'salud',
      tags: ['css', 'salud', 'hospitales'],
      riskLevel: 'MEDIUM',
      sourceType: 'official_source',
      isPublic: true,
      isFeatured: false,
      autoPublished: false,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 7200000,
      publishedAt: Date.now() - 7200000,
    })

    const claim3Id = await ctx.db.insert('claims', {
      title: 'Ministro afirma reducción del 50% en homicidios durante 2024',
      description: 'El Ministro de Seguridad asegura que los homicidios bajaron 50% este año',
      claimText: 'Los homicidios se redujeron en un 50% durante el año 2024',
      imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400',
      status: 'published',
      category: 'seguridad',
      tags: ['seguridad', 'criminalidad', 'estadísticas'],
      riskLevel: 'HIGH',
      sourceType: 'media_article',
      isPublic: true,
      isFeatured: true,
      autoPublished: false,
      createdAt: Date.now() - 10800000,
      updatedAt: Date.now() - 10800000,
      publishedAt: Date.now() - 10800000,
    })

    const claim4Id = await ctx.db.insert('claims', {
      title: 'Gobierno promete 50,000 empleos en sector turismo',
      description: 'Plan gubernamental afirma crear 50 mil empleos en turismo para 2025',
      claimText: 'Se crearán 50,000 nuevos empleos en el sector turístico el próximo año',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      status: 'published',
      category: 'economía',
      tags: ['empleo', 'turismo', 'economía'],
      riskLevel: 'MEDIUM',
      sourceType: 'official_source',
      isPublic: true,
      isFeatured: false,
      autoPublished: false,
      createdAt: Date.now() - 14400000,
      updatedAt: Date.now() - 14400000,
      publishedAt: Date.now() - 14400000,
    })

    const claim5Id = await ctx.db.insert('claims', {
      title: 'Ampliación del Metro llegará hasta Arraiján en 2026',
      description: 'ATP anuncia que la Línea 3 del Metro llegará a Arraiján para 2026',
      claimText: 'La Línea 3 del Metro de Panamá estará operativa hasta Arraiján en 2026',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400',
      status: 'published',
      category: 'transporte',
      tags: ['metro', 'transporte', 'infraestructura'],
      riskLevel: 'LOW',
      sourceType: 'official_source',
      isPublic: true,
      isFeatured: false,
      autoPublished: false,
      createdAt: Date.now() - 18000000,
      updatedAt: Date.now() - 18000000,
      publishedAt: Date.now() - 18000000,
    })

    // 5. Crear veredictos para los claims
    const verdict1Id = await ctx.db.insert('verdicts', {
      claimId: claim1Id,
      verdict: 'MIXED',
      confidenceScore: 65,
      explanation: 'Se ha anunciado el proyecto pero aún no hay fecha confirmada ni presupuesto aprobado oficialmente.',
      summary: 'Proyecto anunciado pero sin confirmación oficial',
      evidenceSources: [],
      modelUsed: 'gpt-4-turbo-preview',
      tokensUsed: 2100,
      processingTime: 2800,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const verdict2Id = await ctx.db.insert('verdicts', {
      claimId: claim2Id,
      verdict: 'FALSE',
      confidenceScore: 85,
      explanation: 'Las listas de espera continúan creciendo según datos de la CSS. No hay plan concreto para eliminarlas.',
      summary: 'Afirmación sin respaldo en datos actuales',
      evidenceSources: [],
      modelUsed: 'gpt-4-turbo-preview',
      tokensUsed: 1900,
      processingTime: 2400,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const verdict3Id = await ctx.db.insert('verdicts', {
      claimId: claim3Id,
      verdict: 'TRUE',
      confidenceScore: 90,
      explanation: 'Datos del Ministerio Público confirman reducción significativa de homicidios en 2024.',
      summary: 'Cifras oficiales respaldan la afirmación',
      evidenceSources: [],
      modelUsed: 'gpt-4-turbo-preview',
      tokensUsed: 2300,
      processingTime: 3000,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const verdict4Id = await ctx.db.insert('verdicts', {
      claimId: claim4Id,
      verdict: 'UNPROVEN',
      confidenceScore: 45,
      explanation: 'No hay datos suficientes para verificar esta proyección. Faltan detalles del plan.',
      summary: 'Faltan datos para verificación',
      evidenceSources: [],
      modelUsed: 'gpt-4-turbo-preview',
      tokensUsed: 1700,
      processingTime: 2200,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const verdict5Id = await ctx.db.insert('verdicts', {
      claimId: claim5Id,
      verdict: 'NEEDS_CONTEXT',
      confidenceScore: 70,
      explanation: 'El proyecto existe pero la fecha 2026 es tentativa. Depende de financiamiento y permisos.',
      summary: 'Fecha proyectada sujeta a cambios',
      evidenceSources: [],
      modelUsed: 'gpt-4-turbo-preview',
      tokensUsed: 2000,
      processingTime: 2600,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // 6. Crear un actor
    const actorId = await ctx.db.insert('actors', {
      name: 'Ministerio de Economía y Finanzas',
      type: 'official',
      profile: {
        description: 'Entidad gubernamental responsable de la política económica',
        relationships: [],
      },
      riskLevel: 'LOW',
      riskScore: 10,
      kyaStatus: 'verified',
      dueDiligence: {
        complianceStatus: 'compliant',
      },
      incidents: [claim1Id],
      articlesAuthored: [],
      isMonitored: true,
      isBlocked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // 7. Crear registro de auditoría
    await ctx.db.insert('auditLogs', {
      userId: adminUserId,
      userEmail: 'admin@infopanama.com',
      action: 'SEED_DATABASE',
      entityType: 'system',
      entityId: 'seed_operation',
      ipAddress: '127.0.0.1',
      timestamp: Date.now(),
    })

    console.log('✅ Base de datos sembrada exitosamente!')
    console.log(`- Usuario admin: ${adminUserId}`)
    console.log(`- Fuentes: ${tvnId}, ${laprensaId}`)
    console.log(`- Artículo: ${articleId}`)
    console.log(`- Claims: 5 claims con imágenes creados`)
    console.log(`- Veredictos: 5 veredictos creados`)
    console.log(`- Actor: ${actorId}`)

    return {
      success: true,
      data: {
        adminUserId,
        sources: [tvnId, laprensaId],
        articleId,
        claims: [claim1Id, claim2Id, claim3Id, claim4Id, claim5Id],
        verdicts: [verdict1Id, verdict2Id, verdict3Id, verdict4Id, verdict5Id],
        actorId,
      },
    }
  },
})
