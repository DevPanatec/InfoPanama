'use client'

import { FeaturedClaims } from '@/components/home/FeaturedClaims'
import { LatestClaims } from '@/components/home/LatestClaims'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ArrowRight } from 'lucide-react'
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
  // OPTIMIZADO: Una sola query trae featured + latest
  const homePageData = useQuery(api.claims.getHomePageClaims, {
    featuredLimit: 4,
    latestLimit: 5,
  })
  const categories = useQuery(api.claims.getCategories, {})
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Layout de 2 columnas: Featured + Latest */}
          <div className="grid lg:grid-cols-[1.5fr,1fr] gap-8 mb-12">
            {/* FEATURED SECTION */}
            <div>
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-8 py-3 font-bold text-xl skew-x-[-5deg] shadow-lg">
                  <span className="inline-block skew-x-[5deg]">Destacado</span>
                </div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-t-transparent border-l-[20px] border-l-amber-500 transform translate-x-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {homePageData ? (
                  <FeaturedClaims claims={homePageData.featured} />
                ) : (
                  // Loading skeleton
                  <>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="w-full h-48 bg-slate-200" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-1/3" />
                          <div className="h-6 bg-slate-200 rounded w-3/4" />
                          <div className="h-4 bg-slate-200 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* LATEST SECTION */}
            <div>
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-8 py-3 font-bold text-xl skew-x-[-5deg] shadow-lg">
                  <span className="inline-block skew-x-[5deg]">Últimas</span>
                </div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-t-transparent border-l-[20px] border-l-amber-500 transform translate-x-full"></div>
              </div>

              <div className="space-y-4">
                {homePageData ? (
                  <LatestClaims claims={homePageData.latest} />
                ) : (
                  // Loading skeleton
                  <>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-3 pb-4 border-b border-slate-200">
                        <div className="w-24 h-20 bg-slate-200 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ver todas las verificaciones */}
          <div className="text-center mb-12">
            <Link
              href="/verificaciones"
              className="inline-flex items-center gap-2 px-8 py-4 bg-digital-blue text-white rounded-xl font-semibold hover:bg-verifica-blue transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-300"
            >
              Ver Todas las Verificaciones
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Categorías horizontales */}
          {categories && categories.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-deep-blue mb-4 text-lg">
                Explorar por Categoría
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: { name: string; count: number }, index: number) => (
                  <Link
                    key={cat.name}
                    href={`/verificaciones?category=${encodeURIComponent(cat.name)}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                    } hover:opacity-90 hover:scale-105 transition-all capitalize`}
                  >
                    {cat.name}
                    <span className="ml-1 opacity-70">({cat.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  )
}
