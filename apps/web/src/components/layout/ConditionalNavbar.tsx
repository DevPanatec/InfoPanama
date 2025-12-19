'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

/**
 * Componente que renderiza el Navbar solo en páginas públicas
 * NO lo muestra en rutas /admin/* porque el admin tiene su propio sidebar
 */
export function ConditionalNavbar() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isAuthRoute = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')

  // No mostrar navbar en admin ni en páginas de autenticación
  if (isAdminRoute || isAuthRoute) {
    return null
  }

  return <Navbar />
}
