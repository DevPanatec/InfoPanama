import { mutation, query } from './_generated/server'

/**
 * Lista entidades irrelevantes que deben ser eliminadas
 */
export const listIrrelevantEntities = query({
  args: {},
  handler: async (ctx) => {
    const entities = await ctx.db.query('entities').collect()

    // Lista de entidades irrelevantes
    const irrelevantPersons = [
      'Nicolás Maduro',
      'Rey Carlos III',
      'Rey Charles III',
      'Su Alteza Real, la Princesa Ana',
      'Princesa Ana',
      'Donald Trump',
      'Joe Biden',
      'Nayib Bukele',
    ]

    const irrelevantOrganizations = [
      // Aerolíneas internacionales
      'Iberia',
      'Plus Ultra',
      'TAP',
      'Air Europa',
      'Turkish Airlines',
      'Avianca',
      'LATAM',
      'United Airlines',
      'American Airlines',
      'Delta',
      'Spirit',
      'JetBlue',
      // Productos
      'Cebolla',
      'Tomate',
      'Arroz',
      'Papa',
      'Yuca',
      'Pan',
      'Leche',
    ]

    const toDelete = entities.filter((entity) => {
      const name = entity.name.toLowerCase()

      // Buscar coincidencias exactas o parciales
      const isIrrelevantPerson = irrelevantPersons.some(
        (p) => p.toLowerCase() === name || name.includes(p.toLowerCase())
      )
      const isIrrelevantOrg = irrelevantOrganizations.some(
        (o) => o.toLowerCase() === name || name.includes(o.toLowerCase())
      )

      // Eliminar fechas
      const isDate = entity.type === 'DATE'

      // Proteger instituciones panameñas importantes
      const isPanamenianInstitution =
        name.includes('panamá') ||
        name.includes('panama') ||
        name.includes('autoridad del canal') ||
        name.includes('superintendencia') ||
        name.includes('universidad de panamá') ||
        name.includes('cámara de comercio')

      // Eliminar ubicaciones genéricas (excepto instituciones)
      const isGenericLocation =
        entity.type === 'LOCATION' &&
        !name.includes('alcaldía') &&
        !name.includes('municipio') &&
        !name.includes('provincia') &&
        !isPanamenianInstitution

      return (isIrrelevantPerson || isIrrelevantOrg || isDate || isGenericLocation) && !isPanamenianInstitution
    })

    return {
      total: entities.length,
      toDelete: toDelete.length,
      entities: toDelete.map((e) => ({
        id: e._id,
        name: e.name,
        type: e.type,
        mentionCount: e.mentionCount,
      })),
    }
  },
})

/**
 * Elimina entidades irrelevantes del sistema
 */
export const deleteIrrelevantEntities = mutation({
  args: {},
  handler: async (ctx) => {
    const entities = await ctx.db.query('entities').collect()

    // Lista de entidades irrelevantes (misma que en listIrrelevantEntities)
    const irrelevantPersons = [
      'Nicolás Maduro',
      'Rey Carlos III',
      'Rey Charles III',
      'Su Alteza Real, la Princesa Ana',
      'Princesa Ana',
      'Donald Trump',
      'Joe Biden',
      'Nayib Bukele',
    ]

    const irrelevantOrganizations = [
      // Aerolíneas internacionales
      'Iberia',
      'Plus Ultra',
      'TAP',
      'Air Europa',
      'Turkish Airlines',
      'Avianca',
      'LATAM',
      'Latam',
      'United Airlines',
      'American Airlines',
      'Delta',
      'Spirit',
      'JetBlue',
      // Productos
      'Cebolla',
      'Tomate',
      'Arroz',
      'Papa',
      'Yuca',
      'Pan',
      'Leche',
    ]

    const deleted = {
      persons: 0,
      organizations: 0,
      dates: 0,
      locations: 0,
      other: 0,
    }

    for (const entity of entities) {
      const name = entity.name.toLowerCase()
      let shouldDelete = false

      // Buscar coincidencias
      const isIrrelevantPerson = irrelevantPersons.some(
        (p) => p.toLowerCase() === name || name.includes(p.toLowerCase())
      )
      const isIrrelevantOrg = irrelevantOrganizations.some(
        (o) => o.toLowerCase() === name || name.includes(o.toLowerCase())
      )

      // Proteger instituciones panameñas importantes
      const isPanamenianInstitution =
        name.includes('panamá') ||
        name.includes('panama') ||
        name.includes('autoridad del canal') ||
        name.includes('superintendencia') ||
        name.includes('universidad de panamá') ||
        name.includes('cámara de comercio') ||
        name.includes('caja de seguro social') ||
        name.includes('css')

      if (isIrrelevantPerson && !isPanamenianInstitution) {
        shouldDelete = true
        deleted.persons++
      } else if (isIrrelevantOrg && !isPanamenianInstitution) {
        shouldDelete = true
        deleted.organizations++
      } else if (entity.type === 'DATE') {
        shouldDelete = true
        deleted.dates++
      } else if (
        entity.type === 'LOCATION' &&
        !name.includes('alcaldía') &&
        !name.includes('municipio') &&
        !name.includes('provincia') &&
        !isPanamenianInstitution
      ) {
        shouldDelete = true
        deleted.locations++
      } else if (entity.type === 'OTHER' && !isPanamenianInstitution) {
        shouldDelete = true
        deleted.other++
      }

      if (shouldDelete) {
        await ctx.db.delete(entity._id)
      }
    }

    return {
      success: true,
      message: `Eliminadas ${deleted.persons + deleted.organizations + deleted.dates + deleted.locations + deleted.other} entidades irrelevantes`,
      details: deleted,
    }
  },
})
