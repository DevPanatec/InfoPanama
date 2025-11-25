import { currentUser } from '@clerk/nextjs/server'
import { api } from '@infopanama/convex'
import { ConvexHttpClient } from 'convex/browser'

/**
 * Helpers de autenticación y autorización
 */

// Cliente de Convex para server-side
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

/**
 * Roles disponibles en la plataforma
 */
export type UserRole = 'reader' | 'moderator' | 'editor' | 'approver' | 'admin'

/**
 * Jerarquía de permisos
 */
const roleHierarchy: Record<UserRole, number> = {
  reader: 0,
  moderator: 1,
  editor: 2,
  approver: 3,
  admin: 4,
}

/**
 * Obtener el usuario actual con su rol de Convex
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Obtener usuario de Convex
  const convexUser = await convex.query(api.users.getByClerkId, {
    clerkId: clerkUser.id,
  })

  return {
    clerk: clerkUser,
    convex: convexUser,
  }
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user?.convex) {
    return false
  }

  const userRoleLevel = roleHierarchy[user.convex.role]
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}

/**
 * Verificar si el usuario es admin
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin')
}

/**
 * Verificar si el usuario es moderador o superior
 */
export async function isModerator(): Promise<boolean> {
  return await hasRole('moderator')
}

/**
 * Verificar si el usuario es editor o superior
 */
export async function isEditor(): Promise<boolean> {
  return await hasRole('editor')
}

/**
 * Verificar si el usuario es approver o superior
 */
export async function isApprover(): Promise<boolean> {
  return await hasRole('approver')
}

/**
 * Verificar si el usuario tiene acceso al admin panel
 */
export async function canAccessAdmin(): Promise<boolean> {
  return await hasRole('moderator') // Moderator o superior
}
