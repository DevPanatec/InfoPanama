import { mutation } from './_generated/server'
import panamaEntitiesData from '../seed-data/panama-entities.json'

export const seedPanamaEntities = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      organizations: 0,
      persons: 0,
      media: 0,
      errors: [] as string[],
    }

    // Seed Organizations
    for (const org of panamaEntitiesData.organizations) {
      try {
        // Check if entity already exists
        const existing = await ctx.db
          .query('entities')
          .filter((q) => q.eq(q.field('name'), org.name))
          .first()

        if (!existing) {
          const now = Date.now()
          const entityType = org.type === 'POLITICAL_PARTY' ? 'ORGANIZATION' : org.type as 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'DATE' | 'OTHER'

          await ctx.db.insert('entities', {
            name: org.name,
            type: entityType,
            normalizedName: org.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
            aliases: org.aliases || [],
            mentionedIn: [],
            mentionCount: 0,
            metadata: {
              description: org.description,
              affiliation: org.category,
            },
            createdAt: now,
            updatedAt: now,
          })
          results.organizations++
        }
      } catch (error) {
        results.errors.push(`Error creating organization ${org.name}: ${error}`)
      }
    }

    // Seed Persons
    for (const person of panamaEntitiesData.persons) {
      try {
        const existing = await ctx.db
          .query('entities')
          .filter((q) => q.eq(q.field('name'), person.name))
          .first()

        if (!existing) {
          const now = Date.now()
          const entityType = person.type === 'POI' ? 'PERSON' : person.type as 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'DATE' | 'OTHER'

          await ctx.db.insert('entities', {
            name: person.name,
            type: entityType,
            normalizedName: person.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
            aliases: person.aliases || [],
            mentionedIn: [],
            mentionCount: 0,
            metadata: {
              description: person.description,
              position: person.position,
              affiliation: person.category,
            },
            createdAt: now,
            updatedAt: now,
          })
          results.persons++
        }
      } catch (error) {
        results.errors.push(`Error creating person ${person.name}: ${error}`)
      }
    }

    // Seed Media Outlets (as sources)
    for (const media of panamaEntitiesData.mediaOutlets) {
      try {
        // Check if source already exists
        const existing = await ctx.db
          .query('sources')
          .filter((q) => q.eq(q.field('name'), media.name))
          .first()

        if (!existing) {
          const now = Date.now()
          await ctx.db.insert('sources', {
            name: media.name,
            slug: media.name.toLowerCase().replace(/\s+/g, '-'),
            type: 'media' as const,
            url: media.url || '',
            isTrusted: true,
            credibilityScore: 75,
            biasScore: {
              overall: 0,
              sentiment: 0,
              framing: 0,
            },
            scrapingEnabled: !!media.url,
            articleCount: 0,
            description: media.description,
            createdAt: now,
            updatedAt: now,
          })
          results.media++
        }
      } catch (error) {
        results.errors.push(`Error creating media outlet ${media.name}: ${error}`)
      }
    }

    return {
      success: true,
      message: `Seeded ${results.organizations} organizations, ${results.persons} persons, ${results.media} media outlets`,
      details: results,
    }
  },
})
