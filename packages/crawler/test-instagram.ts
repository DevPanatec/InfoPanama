import 'dotenv/config'
import { crawlFocoInstagram } from './src/crawlers/foco-instagram.js'

async function test() {
  console.log('🧪 Testing Instagram crawler with Browserbase...\n')
  console.log('📋 Configuration:')
  console.log(`   API Key: ${process.env.BROWSERBASE_API_KEY ? '✅ Configured' : '❌ Missing'}`)
  console.log(`   Project ID: ${process.env.BROWSERBASE_PROJECT_ID ? '✅ Configured' : '❌ Missing'}`)
  console.log('\n')

  try {
    const articles = await crawlFocoInstagram()

    console.log('\n✅ Crawling completed!')
    console.log(`📊 Total posts scraped: ${articles.length}`)

    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`)
      console.log(`   Content: ${article.content.substring(0, 100)}...`)
    })
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

test()
