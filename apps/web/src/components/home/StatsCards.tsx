'use client'

import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

export function StatsCards() {
  const stats = useQuery(api.claims.stats)
  const verdictStats = useQuery(api.verdicts.stats)

  if (!stats || !verdictStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-lg p-6 border border-border animate-pulse">
            <div className="h-12 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Verificadas',
      value: stats.published,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'En Investigación',
      value: stats.investigating,
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
    {
      title: 'En Revisión',
      value: stats.review,
      icon: Info,
      color: 'text-blue-500',
    },
    {
      title: 'Total Claims',
      value: stats.total,
      icon: XCircle,
      color: 'text-gray-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-8 w-8 ${card.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.title}</div>
          </div>
        )
      })}
    </div>
  )
}
