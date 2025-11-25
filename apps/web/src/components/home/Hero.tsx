'use client'

import { Search, CheckCircle } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Esperar a que el componente se monte en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoizar partículas para evitar re-cálculo en cada render
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${(i * 16.66) % 100}%`,
      top: `${(i * 25) % 100}%`,
      delay: `${(i * 0.8) % 5}s`,
      duration: `${8 + (i % 3) * 2}s`,
    })), []
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/verificaciones?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-12 md:py-16 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => console.error('Video error:', e)}
        >
          <source src="/videos/PixVerse_V5_Image_Text_360P_crea_un_video_de_u.mp4" type="video/mp4" />
        </video>
        {/* Subtle dark overlay solo para legibilidad */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Animated decorative elements - solo en cliente */}
      {mounted && (
        <>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-48 h-48 bg-blue-500 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-xl animate-pulse [animation-delay:1s]"></div>
          </div>

          {/* Floating particles - optimizado */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className={`text-4xl md:text-5xl font-bold mb-3 text-white ${mounted ? 'animate-fade-in-up' : ''}`}>
          InfoPanama
          <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-slate-300 bg-clip-text text-transparent">
            Fact-Checking
          </span>
        </h1>
        <p className={`text-base md:text-lg text-slate-300 mb-6 max-w-2xl mx-auto ${mounted ? 'animate-fade-in' : ''}`} style={mounted ? { animationDelay: '0.1s' } : undefined}>
          Verificación de información para Panamá
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className={`max-w-xl mx-auto mb-5 ${mounted ? 'animate-fade-in' : ''}`} style={mounted ? { animationDelay: '0.2s' } : undefined}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar verificaciones..."
              className="w-full pl-12 pr-4 py-3 text-base rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all hover:bg-white/15 hover:scale-[1.02]"
            />
          </div>
        </form>

        {/* Quick Links */}
        <div className={`flex flex-wrap justify-center gap-4 ${mounted ? 'animate-fade-in' : ''}`} style={mounted ? { animationDelay: '0.3s' } : undefined}>
          <button
            onClick={() => router.push('/verificaciones')}
            className="group px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all font-semibold shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transform duration-300 flex items-center gap-2 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
            <CheckCircle className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Ver Todas las Verificaciones
          </button>
        </div>
      </div>
    </div>
  )
}
