import { mutation } from './_generated/server'
import panamaEntitiesData from '../seed-data/panama-entities.json'

export const seedPanamaEntities = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      organizationsCreated: 0,
      organizationsUpdated: 0,
      personsCreated: 0,
      personsUpdated: 0,
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

        const now = Date.now()
        const entityType = org.type === 'POLITICAL_PARTY' ? 'ORGANIZATION' : org.type as 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'DATE' | 'OTHER'

        const entityData = {
          name: org.name,
          type: entityType,
          normalizedName: org.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          aliases: org.aliases || [],
          mentionedIn: existing?.mentionedIn || [],
          mentionCount: existing?.mentionCount || 0,
          metadata: {
            description: org.description,
            affiliation: org.category,
            owners: (org as any).owners || undefined,
            connections: (org as any).connections || undefined,
          },
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        }

        if (!existing) {
          await ctx.db.insert('entities', entityData)
          results.organizationsCreated++
        } else {
          // Update existing entity with new data
          await ctx.db.patch(existing._id, entityData)
          results.organizationsUpdated++
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

        const now = Date.now()
        const entityType = person.type === 'POI' ? 'PERSON' : person.type as 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'EVENT' | 'DATE' | 'OTHER'

        const personData = {
          name: person.name,
          type: entityType,
          normalizedName: person.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          aliases: person.aliases || [],
          mentionedIn: existing?.mentionedIn || [],
          mentionCount: existing?.mentionCount || 0,
          metadata: {
            description: person.description,
            position: person.position,
            affiliation: person.category,
            connections: (person as any).connections || undefined,
          },
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        }

        if (!existing) {
          await ctx.db.insert('entities', personData)
          results.personsCreated++
        } else {
          // Update existing person with new data
          await ctx.db.patch(existing._id, personData)
          results.personsUpdated++
        }
      } catch (error) {
        results.errors.push(`Error creating person ${person.name}: ${error}`)
      }
    }

    // Seed Media Outlets (as both sources AND entities in graph)
    for (const media of panamaEntitiesData.mediaOutlets) {
      try {
        // 1. Insert as source (for scraping)
        const existingSource = await ctx.db
          .query('sources')
          .filter((q) => q.eq(q.field('name'), media.name))
          .first()

        if (!existingSource && media.url) {
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
        }

        // 2. Insert as entity (for graph)
        const existingEntity = await ctx.db
          .query('entities')
          .filter((q) => q.eq(q.field('name'), media.name))
          .first()

        const now = Date.now()
        const entityData = {
          name: media.name,
          type: 'ORGANIZATION' as const,
          normalizedName: media.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          aliases: (media as any).aliases || [],
          mentionedIn: existingEntity?.mentionedIn || [],
          mentionCount: existingEntity?.mentionCount || 0,
          metadata: {
            description: media.description,
            affiliation: media.category,
            owners: (media as any).owners || undefined,
            connections: (media as any).connections || undefined,
          },
          createdAt: existingEntity?.createdAt || now,
          updatedAt: now,
        }

        if (!existingEntity) {
          await ctx.db.insert('entities', entityData)
          results.media++
        } else {
          await ctx.db.patch(existingEntity._id, entityData)
          results.media++
        }
      } catch (error) {
        results.errors.push(`Error creating media outlet ${media.name}: ${error}`)
      }
    }

    return {
      success: true,
      message: `Created ${results.organizationsCreated} orgs, updated ${results.organizationsUpdated} orgs, created ${results.personsCreated} persons, updated ${results.personsUpdated} persons, ${results.media} media outlets`,
      details: results,
    }
  },
})
