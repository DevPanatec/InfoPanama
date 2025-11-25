import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | number | string): string {
  return new Intl.DateTimeFormat('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | number | string): string {
  const now = Date.now()
  const timestamp = new Date(date).getTime()
  const seconds = Math.floor((now - timestamp) / 1000)

  if (seconds < 60) return 'hace unos segundos'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`

  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} ${days === 1 ? 'día' : 'días'}`

  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`

  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`

  const years = Math.floor(days / 365)
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
