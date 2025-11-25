import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect=/admin/dashboard')
  }

  // TODO: Verificar rol en Convex
  // Por ahora, cualquier usuario autenticado puede acceder
  // En producción, deberías verificar roles aquí

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
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition"
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
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.fullName || 'Usuario'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 block w-full px-3 py-2 text-center text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
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
