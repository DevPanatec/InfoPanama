'use client'

import { CheckCircle2, Clock, FileSearch, TrendingUp } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export function StatsCards() {
  const stats = useQuery(api.claims.getStats, {})

  const cards = [
    {
      title: 'Verificadas',
      value: stats?.published ?? 0,
      icon: CheckCircle2,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      glowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'En Investigación',
      value: stats?.investigating ?? 0,
      icon: FileSearch,
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      glowColor: 'shadow-amber-500/20',
    },
    {
      title: 'En Revisión',
      value: stats?.review ?? 0,
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      glowColor: 'shadow-blue-600/20',
    },
    {
      title: 'Total Verificaciones',
      value: stats?.total ?? 0,
      icon: TrendingUp,
      bgColor: 'bg-gradient-to-br from-slate-700 to-slate-800',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      glowColor: 'shadow-slate-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated gradient background on hover */}
            <div className={`absolute inset-0 ${card.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            {/* Colored accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.bgColor} group-hover:h-2 transition-all duration-300`}></div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`absolute w-2 h-2 ${card.iconBg} rounded-full animate-float`} style={{ left: '20%', top: '30%', animationDelay: '0s' }}></div>
              <div className={`absolute w-1.5 h-1.5 ${card.iconBg} rounded-full animate-float`} style={{ left: '70%', top: '50%', animationDelay: '0.5s' }}></div>
              <div className={`absolute w-1 h-1 ${card.iconBg} rounded-full animate-float`} style={{ left: '40%', top: '70%', animationDelay: '1s' }}></div>
            </div>

            {/* Icon */}
            <div className={`${card.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${card.glowColor} group-hover:shadow-xl relative z-10`}>
              <Icon className={`h-8 w-8 ${card.iconColor}`} />
            </div>

            {/* Value with counter animation */}
            <div className="text-5xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform relative z-10">
              {card.value}
            </div>

            {/* Title */}
            <div className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors relative z-10">
              {card.title}
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        )
      })}
    </div>
  )
}
