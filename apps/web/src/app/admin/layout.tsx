'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Newspaper,
  Network,
  Settings,
} from 'lucide-react'
import { Toaster } from 'sonner'

/**
 * Layout del panel administrativo
 *
 * Este layout protege todas las rutas /admin/*
 * y muestra el sidebar de navegación
 */

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/claims', label: 'Verificaciones', icon: FileCheck },
  { href: '/admin/dashboard/actores', label: 'Actores', icon: Users },
  { href: '/admin/dashboard/fuentes', label: 'Fuentes', icon: Newspaper },
  { href: '/admin/dashboard/media-graph', label: 'Red de Medios', icon: Network },
  { href: '/admin/dashboard/config', label: 'Configuración', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()

  // Mostrar loading mientras carga Clerk
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-soft-blue">
        <div className="h-8 w-8 border-4 border-verifica-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="flex h-screen bg-soft-blue">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200">
          <Link href="/admin/dashboard" className="block">
            <Image
              src="/images/logo.png"
              alt="VerificaPty"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <p className="text-xs text-blue-gray mt-2">Panel de Administración</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-verifica-blue text-white'
                        : 'text-blue-gray hover:bg-soft-blue'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-deep-blue truncate">
                {user?.fullName || 'Usuario'}
              </p>
              <p className="text-[10px] text-blue-gray truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="block w-full px-3 py-2 text-center text-xs font-medium text-blue-gray hover:bg-soft-blue rounded-lg transition-colors"
          >
            Volver al sitio
          </Link>
          {/* Tutorial deshabilitado por ahora */}
          {/* <button
            onClick={handleResetTutorial}
            className="w-full px-3 py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
            title="Reiniciar tutorial de bienvenida"
          >
            <GraduationCap className="h-4 w-4" />
            Reiniciar Tutorial
          </button> */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      </div>
    </>
  )
}
