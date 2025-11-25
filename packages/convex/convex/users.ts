import { v } from 'convex/values'
import { mutation, query, internalMutation } from './_generated/server'

/**
 * USERS - Gestión de usuarios
 * Integración con Clerk para autenticación
 */

// ============================================
// QUERIES
// ============================================

/**
 * Listar usuarios
 */
export const list = query({
  args: {
    role: v.optional(
      v.union(
        v.literal('reader'),
        v.literal('moderator'),
        v.literal('editor'),
        v.literal('approver'),
        v.literal('admin')
      )
    ),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { role, isActive, limit = 50 } = args

    let usersQuery = ctx.db.query('users')

    if (role) {
      usersQuery = usersQuery.withIndex('by_role', (q) => q.eq('role', role))
    }

    const users = await usersQuery.take(limit)

    if (isActive !== undefined) {
      return users.filter((u) => u.isActive === isActive)
    }

    return users
  },
})

/**
 * Obtener usuario por ID
 */
export const getById = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Obtener usuario por Clerk ID
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()
  },
})

/**
 * Obtener usuario por email
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

/**
 * Obtener usuarios por rol
 */
export const getByRole = query({
  args: {
    role: v.union(
      v.literal('reader'),
      v.literal('moderator'),
      v.literal('editor'),
      v.literal('approver'),
      v.literal('admin')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { role, limit = 50 } = args

    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', role))
      .take(limit)
  },
})

/**
 * Obtener moderadores activos
 */
export const moderators = query({
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()

    return users.filter(
      (u) =>
        (u.role === 'moderator' ||
          u.role === 'editor' ||
          u.role === 'approver' ||
          u.role === 'admin') &&
        u.isActive &&
        !u.isBanned
    )
  },
})

/**
 * Usuarios más activos
 */
export const topInvestigators = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    const users = await ctx.db.query('users').collect()

    return users
      .filter((u) => u.isActive && !u.isBanned)
      .sort((a, b) => b.claimsInvestigated - a.claimsInvestigated)
      .slice(0, limit)
  },
})

/**
 * Usuarios baneados
 */
export const banned = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const users = await ctx.db.query('users').take(limit)

    return users.filter((u) => u.isBanned)
  },
})

/**
 * Estadísticas de usuarios
 */
export const stats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()

    const byRole = {
      reader: users.filter((u) => u.role === 'reader').length,
      moderator: users.filter((u) => u.role === 'moderator').length,
      editor: users.filter((u) => u.role === 'editor').length,
      approver: users.filter((u) => u.role === 'approver').length,
      admin: users.filter((u) => u.role === 'admin').length,
    }

    const active = users.filter((u) => u.isActive).length
    const banned = users.filter((u) => u.isBanned).length
    const with2FA = users.filter((u) => u.twoFactorEnabled).length

    const totalInvestigations = users.reduce(
      (sum, u) => sum + u.claimsInvestigated,
      0
    )
    const totalComments = users.reduce((sum, u) => sum + u.commentsPosted, 0)

    return {
      total: users.length,
      byRole,
      active,
      banned,
      with2FA,
      totalInvestigations,
      totalComments,
    }
  },
})

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear usuario (normalmente desde Clerk webhook)
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal('reader'),
        v.literal('moderator'),
        v.literal('editor'),
        v.literal('approver'),
        v.literal('admin')
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existing) {
      throw new Error('User already exists')
    }

    const userId = await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      role: args.role || 'reader',
      twoFactorEnabled: false,
      claimsInvestigated: 0,
      commentsPosted: 0,
      isActive: true,
      isBanned: false,
      createdAt: now,
      lastLogin: now,
    })

    return userId
  },
})

/**
 * Actualizar perfil de usuario
 */
export const updateProfile = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args

    await ctx.db.patch(userId, updates)

    return userId
  },
})

/**
 * Actualizar rol
 */
export const updateRole = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(
      v.literal('reader'),
      v.literal('moderator'),
      v.literal('editor'),
      v.literal('approver'),
      v.literal('admin')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
    })

    return args.userId
  },
})

/**
 * Activar/desactivar 2FA
 */
export const toggle2FA = mutation({
  args: {
    userId: v.id('users'),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      twoFactorEnabled: args.enabled,
    })

    return args.userId
  },
})

/**
 * Actualizar última fecha de login
 */
export const updateLastLogin = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLogin: Date.now(),
    })

    return args.userId
  },
})

/**
 * Incrementar contador de claims investigadas
 */
export const incrementClaimsInvestigated = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(args.userId, {
      claimsInvestigated: user.claimsInvestigated + 1,
    })

    return args.userId
  },
})

/**
 * Incrementar contador de comentarios
 */
export const incrementCommentsPosted = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(args.userId, {
      commentsPosted: user.commentsPosted + 1,
    })

    return args.userId
  },
})

/**
 * Banear usuario
 */
export const ban = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isBanned: true,
      isActive: false,
    })

    return args.userId
  },
})

/**
 * Desbanear usuario
 */
export const unban = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isBanned: false,
      isActive: true,
    })

    return args.userId
  },
})

/**
 * Desactivar usuario
 */
export const deactivate = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: false,
    })

    return args.userId
  },
})

/**
 * Reactivar usuario
 */
export const reactivate = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: true,
    })

    return args.userId
  },
})

/**
 * Eliminar usuario
 */
export const remove = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Verificar si hay comentarios o claims asociados
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .take(1)

    if (comments.length > 0) {
      throw new Error(
        'Cannot delete user with associated comments. Delete or reassign comments first.'
      )
    }

    await ctx.db.delete(args.userId)

    return args.userId
  },
})

// ============================================
// INTERNAL MUTATIONS (para webhooks de Clerk)
// ============================================

/**
 * Crear usuario desde Clerk webhook
 * Esta función solo puede ser llamada desde http.ts
 */
export const createFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Verificar si ya existe
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existing) {
      // Si ya existe, actualizar
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        lastLogin: now,
      })
      return existing._id
    }

    // Crear nuevo usuario
    const userId = await ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      role: 'reader', // Todos empiezan como reader
      twoFactorEnabled: false,
      claimsInvestigated: 0,
      commentsPosted: 0,
      isActive: true,
      isBanned: false,
      createdAt: now,
      lastLogin: now,
    })

    return userId
  },
})

/**
 * Actualizar usuario desde Clerk webhook
 */
export const updateFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      // Si no existe, crear
      return await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        role: 'reader',
        twoFactorEnabled: false,
        claimsInvestigated: 0,
        commentsPosted: 0,
        isActive: true,
        isBanned: false,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      })
    }

    // Actualizar datos
    await ctx.db.patch(user._id, {
      email: args.email,
      name: args.name,
      avatar: args.avatar,
    })

    return user._id
  },
})

/**
 * Marcar usuario como eliminado desde Clerk webhook
 */
export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      return null
    }

    // No eliminamos, solo desactivamos
    await ctx.db.patch(user._id, {
      isActive: false,
    })

    return user._id
  },
})
