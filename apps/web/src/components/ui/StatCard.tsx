import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  className?: string
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
  },
  red: {
    bg: 'from-red-500 to-red-600',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
  },
  yellow: {
    bg: 'from-yellow-500 to-yellow-600',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-10 rounded-full -mr-16 -mt-16`} />

      <div className="relative">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.icon} rounded-xl mb-4`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>

        {/* Value */}
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span
              className={`text-sm font-semibold mb-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
