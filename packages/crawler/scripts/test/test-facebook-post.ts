import 'dotenv/config'
import { crawlFacebookPost } from './src/crawlers/facebook-single-post.js'

const POST_URL = 'https://www.facebook.com/prensacom/photos/el-ministro-de-salud-fernando-boyd-galindo-ha-dirigido-una-carta-a-su-colega-jua/1315734907260021/'

async function testFacebookPost() {
  console.log('🧪 Probando extracción de post de Facebook\n')
  console.log('='.repeat(60))
  console.log(`URL: ${POST_URL}\n`)

  const article = await crawlFacebookPost(POST_URL)

  if (article) {
    console.log('\n✅ POST EXTRAÍDO CON ÉXITO')
    console.log('='.repeat(60))
    console.log(`\n📌 Título: ${article.title}`)
    console.log(`\n📝 Contenido (${article.content.length} caracteres):`)
    console.log(article.content)
    console.log(`\n👤 Autor: ${article.author}`)
    console.log(`📅 Fecha: ${article.publishedDate}`)
    console.log(`🔗 URL: ${article.url}`)
    if (article.imageUrl) {
      console.log(`🖼️  Imagen: ${article.imageUrl}`)
    }
  } else {
    console.log('\n❌ No se pudo extraer el post')
  }
}

testFacebookPost()
  .then(() => {
    console.log('\n🎉 Prueba completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
