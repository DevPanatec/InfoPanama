'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <nav className="bg-[#0F2A44] sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          >
            <Image
              src="/images/logo.png"
              alt="VerificaPty"
              width={240}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                  pathname === link.href
                    ? 'text-amber-400'
                    : 'text-white hover:text-amber-300'
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
                <button className="px-4 py-2 text-sm font-medium text-white hover:text-amber-300 transition">
                  Iniciar sesión
                </button>
              </SignInButton>
            </SignedOut> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/10 transition rounded"
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
          className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-16 left-0 right-0 bg-[#163A5F] shadow-xl md:hidden z-50 transform transition-all duration-300 ease-in-out ${
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
                className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                  pathname === link.href
                    ? 'bg-white/10 text-amber-400 border-l-4 border-amber-400'
                    : 'text-white hover:bg-white/5 hover:text-amber-300'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions in Mobile */}
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <Link
              href="/solicitar-verificacion"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-4 w-4" />
              Solicitar Verificación
            </Link>
            <Link
              href="/notificaciones"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-white/20 text-white font-medium hover:bg-white/5 transition"
              onClick={() => setIsOpen(false)}
            >
              <BellIcon className="h-4 w-4" />
              Notificaciones
            </Link>
          </div>

          {/* Admin Link in Mobile */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link
              href="/admin/dashboard"
              className="block px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
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
