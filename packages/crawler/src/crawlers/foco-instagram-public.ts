/**
 * Crawler para Instagram de Foco usando API pública (sin login)
 * Usa el endpoint público de Instagram que no requiere autenticación
 */

import type { ScrapedArticle } from '../types'

const INSTAGRAM_USERNAME = 'focopanama'

export async function crawlFocoInstagramPublic(): Promise<ScrapedArticle[]> {
  console.log('📸 Iniciando crawler de Instagram (@focopanama) - Método público...')

  try {
    // Instagram tiene un endpoint público que devuelve JSON
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${INSTAGRAM_USERNAME}`

    console.log('🔍 Obteniendo datos del perfil...')

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459', // ID público de la app web de Instagram
        'X-Requested-With': 'XMLHttpRequest',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) {
      console.log(`❌ Error: Instagram respondió con status ${response.status}`)
      console.log('   Puede que el endpoint público haya cambiado o esté bloqueado')
      return []
    }

    const data = await response.json()

    const user = data.data?.user
    if (!user) {
      console.log('❌ No se encontró información del usuario')
      return []
    }

    const edges = user.edge_owner_to_timeline_media?.edges || []
    console.log(`📊 Encontrados ${edges.length} posts recientes`)

    const articles: ScrapedArticle[] = []

    for (const edge of edges.slice(0, 10)) {
      // Máximo 10 posts
      const node = edge.node

      const shortcode = node.shortcode
      const postUrl = `https://www.instagram.com/p/${shortcode}/`

      // Extraer caption/texto
      const caption =
        node.edge_media_to_caption?.edges[0]?.node?.text || 'Sin descripción'

      // Limpiar caption
      const cleanCaption = caption
        .replace(/\s+/g, ' ')
        .replace(/#\w+/g, '') // Remover hashtags
        .replace(/@\w+/g, '') // Remover menciones
        .trim()

      if (cleanCaption.length < 20) {
        continue // Skip posts sin contenido sustancial
      }

      const title = cleanCaption.substring(0, 100) + (cleanCaption.length > 100 ? '...' : '')

      // Obtener imagen
      const imageUrl = node.display_url || node.thumbnail_src

      // Fecha de publicación
      const publishedDate = new Date(node.taken_at_timestamp * 1000).toISOString()

      articles.push({
        title: `Instagram (@focopanama): ${title}`,
        url: postUrl,
        sourceUrl: postUrl,
        sourceName: 'Foco',
        sourceType: 'social_media',
        content: cleanCaption,
        author: 'Foco Panama',
        publishedDate,
        scrapedAt: new Date().toISOString(),
        category: 'redes sociales',
        imageUrl,
      })

      console.log(`✅ Post extraído: ${title}`)
    }

    console.log(`\n🎉 Crawler completado: ${articles.length} posts extraídos`)
    return articles
  } catch (error) {
    console.error('❌ Error en crawler:', error)
    return []
  }
}
