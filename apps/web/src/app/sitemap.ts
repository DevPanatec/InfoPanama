/**
 * Sitemap XML Dinámico - Next.js App Router
 * Genera sitemap.xml automáticamente con todas las URLs del sitio
 * Incluye páginas estáticas y dinámicas (claims, actores, medios)
 */

import { MetadataRoute } from 'next'

// URL base del sitio (cambiar en producción)
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verificapty.com'

/**
 * Genera el sitemap completo del sitio
 * Next.js automáticamente sirve esto en /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fecha actual para lastModified
  const now = new Date()

  // ========================================
  // PÁGINAS ESTÁTICAS
  // ========================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/verificaciones`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/actores`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/medios`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/metodologia`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/sobre-nosotros`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // ========================================
  // PÁGINAS DINÁMICAS (de Convex)
  // ========================================
  let dynamicPages: MetadataRoute.Sitemap = []

  try {
    // Importar fetchQuery de Convex para hacer queries desde el servidor
    const { fetchQuery } = await import('convex/nextjs')
    const { api } = await import('@/convex/_generated/api')

    // CLAIMS PUBLICADOS
    try {
      const claims = await fetchQuery(api.claims.getPublished, { limit: 1000 })

      const claimPages: MetadataRoute.Sitemap = claims.map((claim: any) => ({
        url: `${BASE_URL}/verificaciones/${claim._id}`,
        lastModified: claim.updatedAt ? new Date(claim.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      dynamicPages = [...dynamicPages, ...claimPages]
    } catch (error) {
      console.warn('⚠️  No se pudieron cargar claims para sitemap:', error)
    }

    // ACTORES
    try {
      // Si tienes un query getAllActors, úsalo aquí
      // const actors = await fetchQuery(api.actors.getAll, { limit: 1000 })
      // const actorPages: MetadataRoute.Sitemap = actors.map((actor) => ({
      //   url: `${BASE_URL}/actores/${actor.slug}`,
      //   lastModified: actor.updatedAt ? new Date(actor.updatedAt) : now,
      //   changeFrequency: 'monthly' as const,
      //   priority: 0.6,
      // }))
      // dynamicPages = [...dynamicPages, ...actorPages]
    } catch (error) {
      console.warn('⚠️  No se pudieron cargar actores para sitemap:', error)
    }

    // MEDIOS
    try {
      // Si tienes un query getAllSources, úsalo aquí
      // const sources = await fetchQuery(api.sources.getAll, { limit: 1000 })
      // const sourcePages: MetadataRoute.Sitemap = sources.map((source) => ({
      //   url: `${BASE_URL}/medios/${source.slug}`,
      //   lastModified: source.updatedAt ? new Date(source.updatedAt) : now,
      //   changeFrequency: 'monthly' as const,
      //   priority: 0.6,
      // }))
      // dynamicPages = [...dynamicPages, ...sourcePages]
    } catch (error) {
      console.warn('⚠️  No se pudieron cargar medios para sitemap:', error)
    }
  } catch (error) {
    console.error('❌ Error al generar sitemap dinámico:', error)
  }

  // Combinar páginas estáticas y dinámicas
  const allPages = [...staticPages, ...dynamicPages]

  console.log(`✅ Sitemap generado con ${allPages.length} URLs`)

  return allPages
}
