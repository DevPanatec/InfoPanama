'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Shield,
  Newspaper,
  Calendar,
  MessageSquare,
  Network,
  History,
  Settings,
} from 'lucide-react'

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
  { href: '/admin/dashboard/dd', label: 'Debida Diligencia', icon: Shield },
  { href: '/admin/dashboard/fuentes', label: 'Fuentes', icon: Newspaper },
  { href: '/admin/dashboard/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/dashboard/comentarios', label: 'Comentarios', icon: MessageSquare },
  { href: '/admin/dashboard/media-graph', label: 'Media Graph', icon: Network },
  { href: '/admin/dashboard/audit', label: 'Auditoría', icon: History },
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link href="/admin/dashboard" className="block">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
              InfoPanama Admin
            </h2>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10',
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.fullName || 'Usuario'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="block w-full px-3 py-2 text-center text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
