'use client'

import Link from 'next/link'
import { Sparkles, Shield, Heart, ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold">InfoPanama</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              Verificación de información con IA para Panamá.
            </p>
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-semibold">Verificación Oficial</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-2 text-sm">Navegación</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => (window.location.href = '/verificaciones')}
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Verificaciones
                </button>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = '/medios')}
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Medios
                </button>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = '/actores')}
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Actores
                </button>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold mb-2 text-sm">Información</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="/metodologia" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Metodología
                </a>
              </li>
              <li>
                <a href="/sobre-nosotros" className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-white/10 mb-3"></div>

        {/* Copyright */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} InfoPanama</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Hecho con</span>
              <Heart className="h-3 w-3 text-red-400" fill="currentColor" />
              <span>para Panamá</span>
            </div>
            <span>•</span>
            <Link
              href="/admin/dashboard"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
    </footer>
  )
}
