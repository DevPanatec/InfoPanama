/**
 * Robots.txt Dinámico - Next.js App Router
 * Define reglas para crawlers de búsqueda (Google, Bing, etc.)
 * Next.js automáticamente sirve esto en /robots.txt
 */

import { MetadataRoute } from 'next'

// URL base del sitio (cambiar en producción)
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verificapty.com'

export default function robots(): MetadataRoute.Robots {
  // En desarrollo, podemos bloquear crawlers
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction) {
    // DESARROLLO: Bloquear todos los crawlers
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // PRODUCCIÓN: Permitir crawlers con reglas específicas
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',           // Bloquear panel de administración
          '/api/',             // Bloquear endpoints de API
          '/admin/*',          // Bloquear todas las rutas de admin
          '/_next/',           // Bloquear archivos internos de Next.js
          '/test-db/',         // Bloquear páginas de testing
        ],
      },
      {
        // Reglas específicas para Google
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
        ],
      },
      {
        // Reglas específicas para Bing
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
