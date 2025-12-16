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
    <div className="relative bg-gradient-to-br from-verifica-blue via-deep-blue to-verifica-blue py-16 md:py-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          onError={(e) => console.error('Video error:', e)}
        >
          <source src="/videos/PixVerse_V5_Image_Text_360P_crea_un_video_de_u.mp4" type="video/mp4" />
        </video>
        {/* Subtle dark overlay for readability */}
        <div className="absolute inset-0 bg-deep-blue/50" />
      </div>

      {/* Animated decorative elements */}
      {mounted && (
        <>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-48 h-48 bg-digital-blue rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-digital-blue rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1 h-1 bg-soft-blue rounded-full opacity-30 animate-float"
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
        <h1 className={`text-5xl md:text-6xl font-bold mb-4 text-white ${mounted ? 'animate-fade-in-up' : ''}`}>
          VerificaPty
          <span className="block text-3xl md:text-4xl mt-2 bg-gradient-to-r from-digital-blue via-soft-blue to-digital-blue bg-clip-text text-transparent font-extrabold">
            Fact-Checking para Panamá
          </span>
        </h1>
        <p className={`text-lg md:text-xl text-soft-blue mb-8 max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-fade-in' : ''}`} style={mounted ? { animationDelay: '0.1s' } : undefined}>
          Verificación de información basada en evidencia y transparencia.
          <span className="block mt-2 text-base text-blue-gray">Combatiendo la desinformación con datos confiables.</span>
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className={`max-w-2xl mx-auto mb-6 ${mounted ? 'animate-fade-in' : ''}`} style={mounted ? { animationDelay: '0.2s' } : undefined}>
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-digital-blue h-5 w-5 group-focus-within:text-verifica-blue transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar verificaciones, actores o temas..."
              className="w-full pl-14 pr-6 py-4 text-base rounded-2xl border-2 border-soft-blue/30 bg-white/95 backdrop-blur-md text-deep-blue placeholder:text-blue-gray focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-digital-blue transition-all hover:bg-white hover:shadow-xl shadow-lg"
            />
          </div>
        </form>

        {/* Quick Links */}
        <div className={`flex flex-wrap justify-center gap-4 ${mounted ? 'animate-fade-in' : ''}`} style={mounted ? { animationDelay: '0.3s' } : undefined}>
          <button
            onClick={() => router.push('/verificaciones')}
            className="group px-8 py-3.5 text-base bg-digital-blue text-white rounded-xl hover:bg-verifica-blue transition-all font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform duration-300 flex items-center gap-2 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
            <CheckCircle className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            Ver Todas las Verificaciones
          </button>
        </div>
      </div>
    </div>
  )
}
