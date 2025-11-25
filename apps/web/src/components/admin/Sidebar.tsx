'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Newspaper,
  Calendar,
  Network,
  LogOut,
} from 'lucide-react'

const navigation = [
  {
    name: 'Inicio',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Ver resumen y estadísticas'
  },
  {
    name: 'Verificaciones',
    href: '/admin/dashboard/claims',
    icon: FileCheck,
    description: 'Crear y gestionar verificaciones'
  },
  {
    name: 'Perfiles',
    href: '/admin/dashboard/actores',
    icon: Users,
    description: 'Perfiles monitoreados'
  },
  {
    name: 'Fuentes',
    href: '/admin/dashboard/fuentes',
    icon: Newspaper,
    description: 'Medios y portales de noticias'
  },
  {
    name: 'Eventos',
    href: '/admin/dashboard/eventos',
    icon: Calendar,
    description: 'Declaraciones gubernamentales'
  },
  {
    name: 'Análisis',
    href: '/admin/dashboard/media-graph',
    icon: Network,
    description: 'Cobertura y sesgo mediático'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Limpiar sesión
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_email')
    // Redirigir al login
    router.push('/admin/login')
  }

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link href="/admin/dashboard" className="text-xl font-bold text-white">
          InfoPanama
        </Link>
        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
