'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

// Demo user ID - en producción vendría de la sesión
const DEMO_USER_ID = 'demo-user-123' as Id<'users'>

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'Todas' },
  { value: 'new_claim', label: 'Nuevas verificaciones' },
  { value: 'verdict_published', label: 'Veredictos publicados' },
  { value: 'comment_reply', label: 'Respuestas' },
  { value: 'comment_mention', label: 'Menciones' },
  { value: 'event_reminder', label: 'Recordatorios' },
  { value: 'subscription_update', label: 'Suscripciones' },
  { value: 'claim_request_status', label: 'Estado de solicitudes' },
  { value: 'system_announcement', label: 'Anuncios del sistema' },
]

export default function NotificacionesPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Queries
  const notifications = useQuery(api.notifications.getUserNotifications, {
    userId: DEMO_USER_ID,
    limit: 50,
    includeRead: filter === 'all',
  })
  const stats = useQuery(api.notifications.stats, { userId: DEMO_USER_ID })

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const markAsUnread = useMutation(api.notifications.markAsUnread)
  const remove = useMutation(api.notifications.remove)
  const deleteAllRead = useMutation(api.notifications.deleteAllRead)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_claim':
        return { icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'verdict_published':
        return { icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' }
      case 'comment_reply':
        return { icon: '💬', color: 'text-purple-600', bg: 'bg-purple-50' }
      case 'comment_mention':
        return { icon: '👤', color: 'text-amber-600', bg: 'bg-amber-50' }
      case 'event_reminder':
        return { icon: '📅', color: 'text-indigo-600', bg: 'bg-indigo-50' }
      case 'subscription_update':
        return { icon: '🔔', color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'claim_request_status':
        return { icon: '📝', color: 'text-teal-600', bg: 'bg-teal-50' }
      case 'system_announcement':
        return { icon: '📢', color: 'text-red-600', bg: 'bg-red-50' }
      default:
        return { icon: '🔔', color: 'text-slate-600', bg: 'bg-slate-50' }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgente', color: 'bg-red-100 text-red-700' }
      case 'high':
        return { label: 'Alta', color: 'bg-orange-100 text-orange-700' }
      case 'normal':
        return { label: 'Normal', color: 'bg-blue-100 text-blue-700' }
      case 'low':
        return { label: 'Baja', color: 'bg-slate-100 text-slate-700' }
      default:
        return { label: 'Normal', color: 'bg-slate-100 text-slate-700' }
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Ahora mismo'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
    const weeks = Math.floor(days / 7)
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  }

  const handleMarkAsRead = async (notificationId: Id<'notifications'>) => {
    try {
      await markAsRead({ notificationId })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAsUnread = async (notificationId: Id<'notifications'>) => {
    try {
      await markAsUnread({ notificationId })
    } catch (error) {
      console.error('Error marking notification as unread:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId: DEMO_USER_ID })
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (notificationId: Id<'notifications'>) => {
    try {
      await remove({ notificationId })
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleDeleteAllRead = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todas las notificaciones leídas?')) return
    try {
      await deleteAllRead({ userId: DEMO_USER_ID })
    } catch (error) {
      console.error('Error deleting read notifications:', error)
    }
  }

  // Filtrar por tipo
  const filteredNotifications = notifications?.filter((n) =>
    typeFilter === 'all' || n.type === typeFilter
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Notificaciones</h1>
          </div>
          <p className="text-lg text-slate-300">
            Mantente al día con las últimas actualizaciones
          </p>

          {/* Stats */}
          {stats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-slate-300">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-300">{stats.unread}</div>
                <div className="text-sm text-slate-300">No leídas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-red-300">{stats.byPriority.urgent}</div>
                <div className="text-sm text-slate-300">Urgentes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-300">{stats.byPriority.high}</div>
                <div className="text-sm text-slate-300">Alta prioridad</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Actions Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                No leídas {stats && stats.unread > 0 && `(${stats.unread})`}
              </button>

              {/* Type Filter Dropdown */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {stats && stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={handleDeleteAllRead}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar leídas
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications === undefined ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
            <Loader2 className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
            <p className="text-slate-500">Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications && filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
            <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-slate-500">
              {filter === 'unread'
                ? 'No tienes notificaciones sin leer'
                : 'Aún no tienes ninguna notificación'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications?.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type)
              const priorityBadge = getPriorityBadge(notification.priority)

              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-2xl p-5 border transition-all group hover:shadow-md ${
                    notification.isRead
                      ? 'border-slate-200'
                      : 'border-blue-200 bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconConfig.bg} flex items-center justify-center text-2xl`}
                    >
                      {iconConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm">
                            {notification.message}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead ? (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Marcar como leída
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsUnread(notification._id)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                          >
                            <Bell className="h-3 w-3" />
                            Marcar como no leída
                          </button>
                        )}
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
