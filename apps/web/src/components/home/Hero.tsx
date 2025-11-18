import { Search } from 'lucide-react'

export function Hero() {
  return (
    <div className="bg-gradient-to-b from-primary/10 to-background py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Verificación de Información para Panamá
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma automatizada con IA que verifica afirmaciones y mapea la cobertura
          mediática nacional
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar verificaciones..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/verificaciones"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Ver Verificaciones
          </a>
          <a
            href="/metodologia"
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition"
          >
            Cómo Verificamos
          </a>
          <a
            href="/enviar"
            className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition"
          >
            Enviar Rumor
          </a>
        </div>
      </div>
    </div>
  )
}
