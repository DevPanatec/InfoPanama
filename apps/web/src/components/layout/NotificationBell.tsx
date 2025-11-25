'use client'

import { Bell, Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api, type Id } from '@infopanama/convex'
import Link from 'next/link'

// Demo user ID - en producción vendría de la sesión
const DEMO_USER_ID = 'demo-user-123' as Id<'users'>

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Queries
  const unreadCount = useQuery(api.notifications.getUnreadCount, {
    userId: DEMO_USER_ID
  })
  const notifications = useQuery(api.notifications.getUnread, {
    userId: DEMO_USER_ID,
    limit: 5
  })

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAsRead = async (notificationId: Id<'notifications'>) => {
    try {
      await markAsRead({ notificationId })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId: DEMO_USER_ID })
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_claim':
        return '📋'
      case 'verdict_published':
        return '✅'
      case 'comment_reply':
        return '💬'
      case 'comment_mention':
        return '👤'
      case 'event_reminder':
        return '📅'
      case 'subscription_update':
        return '🔔'
      case 'claim_request_status':
        return '📝'
      case 'system_announcement':
        return '📢'
      default:
        return '🔔'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Ahora'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Notificaciones</h3>
            {unreadCount !== undefined && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {notifications === undefined ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No tienes notificaciones nuevas
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="p-4 hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 text-sm mb-1">
                              {notification.title}
                            </p>
                            <p className="text-slate-600 text-sm line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-slate-200 rounded"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              Ver detalles →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications !== undefined && notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
              <Link
                href="/notificaciones"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium text-center block"
                onClick={() => setIsOpen(false)}
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
