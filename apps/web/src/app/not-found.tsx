/**
 * Página 404 Not Found - Next.js App Router
 * Página personalizada profesional para rutas no encontradas
 * Incluye sugerencias de navegación y búsqueda
 */

import Link from 'next/link'
import { Home, Search, FileQuestion, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o ha sido movida.',
}

export default function NotFound() {
  // Links de navegación sugeridos
  const suggestedLinks = [
    {
      title: 'Verificaciones',
      description: 'Explora las últimas verificaciones de información',
      href: '/verificaciones',
      icon: Search,
    },
    {
      title: 'Medios',
      description: 'Conoce los medios de comunicación de Panamá',
      href: '/medios',
      icon: FileQuestion,
    },
    {
      title: 'Actores',
      description: 'Descubre los actores políticos y públicos',
      href: '/actores',
      icon: FileQuestion,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Contenido principal */}
        <div className="text-center mb-12">
          {/* Número 404 grande y animado */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 animate-pulse" />
            </div>
            <h1 className="relative text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              404
            </h1>
          </div>

          {/* Título y descripción */}
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Página no encontrada
            </h2>
            <p className="text-lg text-slate-600 mb-2">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <p className="text-base text-slate-500">
              Verifica la URL o regresa a la página principal para continuar navegando.
            </p>
          </div>

          {/* Botones de acción principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
            >
              <Home className="h-5 w-5" />
              Volver al inicio
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 active:scale-95 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Página anterior
            </button>
          </div>
        </div>

        {/* Secciones sugeridas */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
            Explora estas secciones
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {suggestedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all active:scale-95"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <link.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-sm text-slate-600">{link.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mensaje de ayuda adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            ¿Crees que esto es un error?{' '}
            <a
              href="/sobre-nosotros"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
