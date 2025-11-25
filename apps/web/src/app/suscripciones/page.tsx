'use client'

import { useState } from 'react'
import { Bell, Plus, Settings, Trash2, Check, X, Mail, Globe, Smartphone, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api, type Id } from '@infopanama/convex'

// Demo user ID - en producción vendría de la sesión
const DEMO_USER_ID = 'demo-user-123' as Id<'users'>

const SUBSCRIPTION_TYPES = [
  { value: 'topic', label: 'Temas', icon: '📚', description: 'Recibe notificaciones sobre temas específicos' },
  { value: 'actor', label: 'Actores', icon: '👤', description: 'Sigue a políticos y figuras públicas' },
  { value: 'source', label: 'Medios', icon: '📰', description: 'Alertas de fuentes de noticias específicas' },
  { value: 'category', label: 'Categorías', icon: '🏷️', description: 'Notificaciones por categoría' },
  { value: 'keyword', label: 'Palabras clave', icon: '🔍', description: 'Alertas sobre palabras específicas' },
  { value: 'all_claims', label: 'Todas las verificaciones', icon: '🔔', description: 'Recibe todas las nuevas verificaciones' },
]

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'Tiempo real', description: 'Inmediatamente cuando ocurra' },
  { value: 'daily', label: 'Diario', description: 'Resumen diario' },
  { value: 'weekly', label: 'Semanal', description: 'Resumen semanal' },
  { value: 'monthly', label: 'Mensual', description: 'Resumen mensual' },
]

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'web', label: 'Web', icon: Globe },
  { value: 'push', label: 'Push', icon: Smartphone },
]

export default function SuscripcionesPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showNewSubscription, setShowNewSubscription] = useState(false)

  // Queries
  const subscriptions = useQuery(api.subscriptions.getUserSubscriptions, {
    userId: DEMO_USER_ID,
  })
  const stats = useQuery(api.subscriptions.stats, { userId: DEMO_USER_ID })

  // Mutations
  const toggle = useMutation(api.subscriptions.toggle)
  const remove = useMutation(api.subscriptions.remove)
  const update = useMutation(api.subscriptions.update)

  const handleToggle = async (subscriptionId: Id<'subscriptions'>) => {
    try {
      await toggle({ subscriptionId })
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  const handleDelete = async (subscriptionId: Id<'subscriptions'>) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta suscripción?')) return
    try {
      await remove({ subscriptionId })
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const getTypeConfig = (type: string) => {
    return SUBSCRIPTION_TYPES.find((t) => t.value === type) || SUBSCRIPTION_TYPES[0]
  }

  const getFrequencyLabel = (frequency: string) => {
    return FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label || frequency
  }

  const filteredSubscriptions = subscriptions?.filter(
    (sub) => selectedType === 'all' || sub.type === selectedType
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Mis Suscripciones</h1>
          </div>
          <p className="text-lg text-slate-300 mb-8">
            Gestiona tus suscripciones y recibe notificaciones personalizadas
          </p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-slate-300">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-300">{stats.active}</div>
                <div className="text-sm text-slate-300">Activas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-300">{stats.byFrequency.realtime}</div>
                <div className="text-sm text-slate-300">Tiempo real</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-300">{stats.byType.topic}</div>
                <div className="text-sm text-slate-300">Temas</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-20">
              <h3 className="font-semibold text-slate-800 mb-4">Tipo de suscripción</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    selectedType === 'all'
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {SUBSCRIPTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
                      selectedType === type.value
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                    {stats && stats.byType[type.value as keyof typeof stats.byType] > 0 && (
                      <span className="ml-auto text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {stats.byType[type.value as keyof typeof stats.byType]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* New Subscription Button */}
              <button
                onClick={() => setShowNewSubscription(!showNewSubscription)}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Nueva Suscripción
              </button>
            </div>
          </div>

          {/* Main Content - Subscriptions List */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {filteredSubscriptions?.length || 0}{' '}
                {filteredSubscriptions?.length === 1 ? 'Suscripción' : 'Suscripciones'}
              </h2>
            </div>

            {/* Subscriptions List */}
            {subscriptions === undefined ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Loader2 className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-500">Cargando suscripciones...</p>
              </div>
            ) : filteredSubscriptions && filteredSubscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No tienes suscripciones
                </h3>
                <p className="text-slate-500 mb-6">
                  Crea tu primera suscripción para recibir notificaciones personalizadas
                </p>
                <button
                  onClick={() => setShowNewSubscription(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Suscripción
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubscriptions?.map((subscription) => {
                  const typeConfig = getTypeConfig(subscription.type)

                  return (
                    <div
                      key={subscription._id}
                      className={`bg-white rounded-2xl p-6 border transition-all ${
                        subscription.isActive
                          ? 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                          : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 text-3xl">
                          {typeConfig.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-slate-800">
                                  {subscription.targetName}
                                </h3>
                                {subscription.isActive ? (
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                    Activa
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                    Pausada
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">{typeConfig.label}</p>
                            </div>
                          </div>

                          {/* Settings */}
                          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Bell className="h-4 w-4" />
                              <span>{getFrequencyLabel(subscription.frequency)}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-2">
                              {subscription.channels?.map((channel) => {
                                const ChannelIcon = CHANNEL_OPTIONS.find((c) => c.value === channel)?.icon
                                return ChannelIcon ? (
                                  <ChannelIcon key={channel} className="h-4 w-4 text-slate-500" />
                                ) : null
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggle(subscription._id)}
                              className={`text-sm font-medium transition ${
                                subscription.isActive
                                  ? 'text-amber-600 hover:text-amber-700'
                                  : 'text-emerald-600 hover:text-emerald-700'
                              }`}
                            >
                              {subscription.isActive ? 'Pausar' : 'Activar'}
                            </button>
                            <span className="text-slate-300">•</span>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
                              Configurar
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              onClick={() => handleDelete(subscription._id)}
                              className="text-sm font-medium text-red-600 hover:text-red-700 transition"
                            >
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

        {/* New Subscription Modal - Placeholder */}
        {showNewSubscription && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Nueva Suscripción</h2>
                <button
                  onClick={() => setShowNewSubscription(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600">
                  Próximamente: Formulario para crear nuevas suscripciones personalizadas
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SUBSCRIPTION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition text-left"
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-slate-800 mb-1">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
