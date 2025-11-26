/**
 * Script para crear claims de prueba extraídos de noticias reales
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from './convex/_generated/api.js'

const CONVEX_URL = 'https://accomplished-rhinoceros-93.convex.cloud'
const client = new ConvexHttpClient(CONVEX_URL)

async function seedClaims() {
  console.log('🌱 Creando claims de prueba de noticias panameñas...\n')

  const claims = [
    {
      title: 'Presidente: "El Canal generó $5 mil millones en 2024"',
      description: 'El presidente anunció que el Canal de Panamá generó ingresos récord durante el año fiscal 2024.',
      claimText: 'El Canal de Panamá generó $5 mil millones en ingresos durante el año fiscal 2024',
      category: 'Economía',
      tags: ['Canal de Panamá', 'Economía', 'Gobierno'],
      sourceType: 'auto_extracted' as const,
      sourceUrl: 'https://www.prensa.com/politica/canal-panama-ingresos-2024',
      riskLevel: 'HIGH' as const,
    },
    {
      title: 'Ministro de Salud: "Mortalidad infantil bajó 50%"',
      description: 'El Ministro de Salud declaró que la tasa de mortalidad infantil se redujo a la mitad en el último año.',
      claimText: 'La tasa de mortalidad infantil en Panamá se redujo un 50% en el último año',
      category: 'Salud',
      tags: ['CSS', 'Salud', 'Estadísticas'],
      sourceType: 'auto_extracted' as const,
      sourceUrl: 'https://www.prensa.com/salud/mortalidad-infantil-panama',
      riskLevel: 'HIGH' as const,
    },
    {
      title: 'Contraloría: "Presupuesto 2025 será de $30 mil millones"',
      description: 'La Contraloría General publicó que el presupuesto nacional para 2025 alcanzará los $30 mil millones.',
      claimText: 'El presupuesto nacional de Panamá para 2025 será de $30 mil millones',
      category: 'Economía',
      tags: ['Presupuesto', 'Contraloría', 'Gobierno'],
      sourceType: 'official_source' as const,
      sourceUrl: 'https://www.contraloria.gob.pa/presupuesto-2025',
      riskLevel: 'MEDIUM' as const,
    },
    {
      title: 'Ministro: "Se construirán 10 nuevos hospitales"',
      description: 'El gobierno anunció un plan para construir 10 nuevos hospitales en provincias del interior.',
      claimText: 'El gobierno construirá 10 nuevos hospitales en las provincias más necesitadas',
      category: 'Infraestructura',
      tags: ['Hospitales', 'Salud', 'Infraestructura'],
      sourceType: 'auto_extracted' as const,
      sourceUrl: 'https://www.prensa.com/nacionales/nuevos-hospitales-panama',
      riskLevel: 'MEDIUM' as const,
    },
    {
      title: 'Policía: "Criminalidad bajó 30% en la capital"',
      description: 'El director de la Policía Nacional reportó una reducción del 30% en crímenes violentos en Ciudad de Panamá.',
      claimText: 'La criminalidad en Ciudad de Panamá se redujo un 30% en el último semestre',
      category: 'Seguridad',
      tags: ['Criminalidad', 'Policía', 'Seguridad'],
      sourceType: 'auto_extracted' as const,
      sourceUrl: 'https://www.prensa.com/seguridad/criminalidad-panama',
      riskLevel: 'HIGH' as const,
    },
    {
      title: 'MEF: "Desempleo bajó al 8% en 2024"',
      description: 'El Ministerio de Economía y Finanzas reportó que la tasa de desempleo nacional descendió al 8%.',
      claimText: 'La tasa de desempleo en Panamá bajó al 8% durante 2024',
      category: 'Economía',
      tags: ['Desempleo', 'MEF', 'Economía'],
      sourceType: 'official_source' as const,
      sourceUrl: 'https://www.mef.gob.pa/desempleo-2024',
      riskLevel: 'MEDIUM' as const,
    },
  ]

  let createdCount = 0

  for (const claim of claims) {
    try {
      const claimId = await client.mutation(api.claims.create, claim)
      console.log(`✅ Claim creado: ${claim.title}`)
      createdCount++

      // Ahora actualizamos el claim para publicarlo y agregarle imagen
      await client.mutation(api.claims.updateStatus, {
        id: claimId,
        status: 'published',
      })

      // Agregar imagen
      const images = [
        'https://images.unsplash.com/photo-1578339850459-76b0ac239aa2?w=800',
        'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      ]

      await client.mutation(api.claims.updateImage, {
        id: claimId,
        imageUrl: images[createdCount - 1],
      })

      console.log(`   📸 Imagen agregada y claim publicado`)
    } catch (error) {
      console.error(`❌ Error creando claim:`, error)
    }
  }

  console.log(`\n🎉 ${createdCount}/${claims.length} claims creados exitosamente!`)
  console.log('\n💡 Refresca http://localhost:3000 para verlos!')
}

seedClaims().catch(console.error)
