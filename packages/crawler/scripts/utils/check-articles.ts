import { config } from 'dotenv'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@infopanama/convex'

config()

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
const client = new ConvexHttpClient(convexUrl!)

async function checkArticles() {
  console.log('🔍 Verificando artículos en la base de datos...\n')

  const articles = await client.query(api.articles.list, { limit: 1000 })

  console.log(`📰 Total de artículos: ${articles.length}\n`)

  if (articles.length > 0) {
    const withImages = articles.filter(a => a.imageUrl)
    console.log(`🖼️  Artículos con imagen: ${withImages.length}`)
    console.log(`📄 Artículos sin imagen: ${articles.length - withImages.length}\n`)

    // Mostrar ejemplos
    console.log('📋 Últimos 5 artículos:\n')
    articles.slice(0, 5).forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`)
      console.log(`   🏢 Fuente: ${a.sourceName}`)
      console.log(`   🖼️  Imagen: ${a.imageUrl ? 'Sí' : 'No'}`)
      console.log()
    })
  }
}

checkArticles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
