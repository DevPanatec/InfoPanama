/**
 * Export Convex API for use in the frontend
 */
export { api } from './convex/_generated/api'
export type { Doc, Id } from './convex/_generated/dataModel'

// Re-export types directly for easier imports
export type * from './convex/_generated/dataModel'
