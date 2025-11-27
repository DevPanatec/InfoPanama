'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Plus, Bell as BellIcon } from 'lucide-react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import { NotificationBell } from './NotificationBell'

const navLinks = [
  { href: '/verificaciones', label: 'Verificaciones' },
  { href: '/medios', label: 'Medios' },
  { href: '/metodologia', label: 'Metodología' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <nav className="border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 backdrop-blur sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-bold hover:scale-105 transition-transform duration-200 cursor-pointer group"
          >
            <span className="text-white group-hover:text-blue-100 transition-colors">Verifica</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition-all">Pty</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition ${
                  pathname === link.href
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Notifications - Disabled temporarily due to Clerk/Next.js 15 compatibility */}
            {/* <SignedIn>
              <NotificationBell />
            </SignedIn> */}

            {/* User Button / Sign In - Disabled temporarily due to Clerk/Next.js 15 compatibility */}
            {/* <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9',
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-700 transition">
                  Iniciar sesión
                </button>
              </SignInButton>
            </SignedOut> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-20 bg-black/20 backdrop-blur-sm md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-20 left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-700 shadow-xl md:hidden z-50 transform transition-all duration-300 ease-in-out ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg text-base font-medium transition ${
                  pathname === link.href
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-blue-400'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions in Mobile */}
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
            <Link
              href="/solicitar-verificacion"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-4 w-4" />
              Solicitar Verificación
            </Link>
            <Link
              href="/notificaciones"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <BellIcon className="h-4 w-4" />
              Notificaciones
            </Link>
          </div>

          {/* Admin Link in Mobile */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <Link
              href="/admin/dashboard"
              className="block px-4 py-3 rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition"
              onClick={() => setIsOpen(false)}
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
