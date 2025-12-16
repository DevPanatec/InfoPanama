'use client'

import Link from 'next/link'
import { Sparkles, Shield, Heart, ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-verifica-blue via-deep-blue to-verifica-blue text-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-digital-blue rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-digital-blue rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-digital-blue" />
              <h3 className="text-xl font-bold">VerificaPty</h3>
            </div>
            <p className="text-soft-blue text-sm mb-4 leading-relaxed">
              Plataforma de verificación de información basada en evidencia y transparencia para Panamá.
            </p>
            <div className="flex items-center gap-2 text-digital-blue">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-semibold">Fact-Checking Profesional</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-3 text-sm">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => (window.location.href = '/verificaciones')}
                  className="text-soft-blue hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Verificaciones
                </button>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = '/medios')}
                  className="text-soft-blue hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Medios
                </button>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = '/actores')}
                  className="text-soft-blue hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Actores
                </button>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold mb-3 text-sm">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/metodologia" className="text-soft-blue hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Metodología
                </a>
              </li>
              <li>
                <a href="/sobre-nosotros" className="text-soft-blue hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-soft-blue/20 mb-4"></div>

        {/* Copyright */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-soft-blue/80">
            <span>© {new Date().getFullYear()} VerificaPty</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Hecho con</span>
              <Heart className="h-3 w-3 text-digital-blue" fill="currentColor" />
              <span>para Panamá</span>
            </div>
            <span>•</span>
            <Link
              href="/admin/dashboard"
              className="text-blue-gray hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-digital-blue to-transparent"></div>
    </footer>
  )
}
