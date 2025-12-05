'use client'

import { Hero } from '@/components/home/Hero'
import { RecentClaims } from '@/components/home/RecentClaims'
import { Newsletter } from '@/components/home/Newsletter'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

// Colores para las categorías
const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
]

export default function HomePage() {
  // Obtener datos de Convex
  const trendingTopics: any[] | undefined = undefined // TODO: Implementar query
  const categories = useQuery(api.claims.getCategories, {})
  const recentActivity: any[] | undefined = undefined // TODO: Implementar query
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section - Más compacto estilo Snopes */}
      <Hero />

      {/* Main Content - Layout 2 columnas */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column - Verificaciones */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Últimas Verificaciones
              </h2>
              <Link
                href="/verificaciones"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
              >
                Ver todas
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Claims List */}
            <RecentClaims />

            {/* Load More Button */}
            <div className="mt-8 text-center">
              <Link
                href="/verificaciones"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition shadow-lg shadow-blue-600/30"
              >
                Ver Más Verificaciones
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics - TODO: Implementar */}
            {/* <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Más Buscados
              </h3>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-6 h-6 bg-slate-200 rounded-full" />
                    <div className="flex-1 h-6 bg-slate-200 rounded" />
                    <div className="w-8 h-6 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div> */}

            {/* Categories */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">
                Categorías
              </h3>
              {!categories ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse h-8 w-24 bg-slate-200 rounded-full" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No hay categorías disponibles
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: { name: string; count: number }, index: number) => (
                    <Link
                      key={cat.name}
                      href={`/verificaciones?category=${encodeURIComponent(cat.name)}`}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                      } hover:opacity-80 transition capitalize`}
                    >
                      {cat.name}
                      <span className="ml-1 opacity-60">({cat.count})</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity - TODO: Implementar */}
            {/* <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Newsletter */}
            <Newsletter />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </main>
  )
}
