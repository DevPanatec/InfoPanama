'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole } from '@/lib/auth'

/**
 * Componente para proteger páginas enteras por rol
 *
 * Usage en page.tsx:
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute allowedRoles={['admin', 'moderator']}>
 *       <AdminContent />
 *     </ProtectedRoute>
 *   )
 * }
 */

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  )

  useEffect(() => {
    if (isLoaded && !clerkUser) {
      router.push(redirectTo)
    }
  }, [isLoaded, clerkUser, redirectTo, router])

  // Loading state
  if (!isLoaded || (clerkUser && convexUser === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!clerkUser || !convexUser) {
    return null // Will redirect via useEffect
  }

  // Check role
  const hasPermission = allowedRoles.includes(convexUser.role)

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-slate-600 mb-6">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
