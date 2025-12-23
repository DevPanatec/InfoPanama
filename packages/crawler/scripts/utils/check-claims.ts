import { config } from 'dotenv'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@infopanama/convex'

config()

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  console.error('❌ CONVEX_URL no está definida')
  process.exit(1)
}

const client = new ConvexHttpClient(convexUrl)

async function checkClaims() {
  console.log('🔍 Verificando claims en la base de datos...\n')

  const allClaims = await client.query(api.claims.list, { limit: 1000 })

  console.log(`📊 Total de claims: ${allClaims.length}\n`)

  if (allClaims.length === 0) {
    console.log('❌ No hay claims en la base de datos\n')
    return
  }

  // Contar claims con imágenes
  const claimsWithImages = allClaims.filter(c => c.imageUrl)
  const claimsWithoutImages = allClaims.filter(c => !c.imageUrl)

  console.log(`🖼️  Claims CON imagen: ${claimsWithImages.length}`)
  console.log(`📄 Claims SIN imagen: ${claimsWithoutImages.length}\n`)

  // Mostrar algunos ejemplos
  if (claimsWithImages.length > 0) {
    console.log('✅ Ejemplos de claims con imagen:\n')
    claimsWithImages.slice(0, 5).forEach((claim, i) => {
      console.log(`${i + 1}. ${claim.title}`)
      console.log(`   📸 ${claim.imageUrl}`)
      console.log(`   📅 ${new Date(claim.createdAt).toLocaleString('es-ES')}\n`)
    })
  }
}

checkClaims()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
