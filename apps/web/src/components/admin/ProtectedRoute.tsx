'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay sesión activa
    const session = localStorage.getItem('admin_session')

    if (session === 'true') {
      setIsAuthorized(true)
    } else {
      // Redirigir al login si no hay sesión
      router.push('/admin/login')
    }

    setIsLoading(false)
  }, [router])

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Solo mostrar el contenido si está autorizado
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
