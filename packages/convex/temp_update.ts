import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const updateClaimImage = mutation({
  args: {
    claimId: v.id('claims'),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.claimId, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    })
    return args.claimId
  },
})
