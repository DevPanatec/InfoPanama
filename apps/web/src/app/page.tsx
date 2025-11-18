import { Hero } from '@/components/home/Hero'
import { RecentClaims } from '@/components/home/RecentClaims'
import { StatsCards } from '@/components/home/StatsCards'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Stats Cards */}
      <section className="container mx-auto px-4 py-12">
        <StatsCards />
      </section>

      {/* Recent Claims */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Verificaciones Recientes</h2>
        <RecentClaims />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
