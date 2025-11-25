'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import type { UserRole } from '@/lib/auth'

/**
 * Componente para proteger contenido por roles
 *
 * Usage:
 * <RoleGate allowedRoles={['admin', 'editor']}>
 *   <AdminContent />
 * </RoleGate>
 */

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user: clerkUser, isLoaded } = useUser()

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  )

  // Loading state
  if (!isLoaded || (clerkUser && convexUser === undefined)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Not authenticated
  if (!clerkUser || !convexUser) {
    return (
      fallback || (
        <div className="p-8 text-center">
          <p className="text-slate-600">Debes iniciar sesión para ver este contenido.</p>
        </div>
      )
    )
  }

  // Check role
  const hasPermission = allowedRoles.includes(convexUser.role)

  if (!hasPermission) {
    return (
      fallback || (
        <div className="p-8 text-center">
          <p className="text-slate-600">No tienes permisos para ver este contenido.</p>
        </div>
      )
    )
  }

  return <>{children}</>
}
