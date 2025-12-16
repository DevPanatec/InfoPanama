'use client'

import { Bell, Shield, Database, Zap, Globe } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ConfigPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Configuración guardada correctamente')
    }, 1000)
  }

  const handleCancel = () => {
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
          <p className="text-slate-600 mt-2">
            Ajustes generales y configuración de la plataforma
          </p>
        </div>

        <div className="space-y-6">
          {/* Site Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Configuración del Sitio</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  defaultValue="VerificaPty"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  defaultValue="Plataforma de verificación de información para Panamá"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" id="maintenance" className="w-4 h-4 text-blue-600" />
                <label htmlFor="maintenance" className="text-sm text-slate-700">
                  Modo de mantenimiento
                </label>
              </div>
            </div>
          </div>

          {/* Verification Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Verificación</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Umbral de confianza mínimo (%)
                </label>
                <input
                  type="number"
                  defaultValue="70"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fuentes mínimas requeridas
                </label>
                <input
                  type="number"
                  defaultValue="3"
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" defaultChecked id="auto-verify" className="w-4 h-4 text-blue-600" />
                <label htmlFor="auto-verify" className="text-sm text-slate-700">
                  Habilitar verificación automática con IA
                </label>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Configuración de IA</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Modelo de OpenAI
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white">
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temperatura (0-1)
                </label>
                <input
                  type="number"
                  defaultValue="0.3"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" defaultChecked id="use-embeddings" className="w-4 h-4 text-blue-600" />
                <label htmlFor="use-embeddings" className="text-sm text-slate-700">
                  Usar embeddings para búsqueda semántica
                </label>
              </div>
            </div>
          </div>

          {/* Scraping Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Database className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Scraping</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frecuencia de scraping (horas)
                </label>
                <input
                  type="number"
                  defaultValue="6"
                  min="1"
                  max="24"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Límite de artículos por fuente
                </label>
                <input
                  type="number"
                  defaultValue="50"
                  min="10"
                  max="200"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" defaultChecked id="use-proxies" className="w-4 h-4 text-blue-600" />
                <label htmlFor="use-proxies" className="text-sm text-slate-700">
                  Usar rotación de proxies
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" defaultChecked id="notify-high-risk" className="w-4 h-4 text-blue-600" />
                <label htmlFor="notify-high-risk" className="text-sm text-slate-700">
                  Alertar cuando se detecte actor de alto riesgo
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" defaultChecked id="notify-viral" className="w-4 h-4 text-blue-600" />
                <label htmlFor="notify-viral" className="text-sm text-slate-700">
                  Alertar cuando claim se vuelva viral
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" id="notify-comments" className="w-4 h-4 text-blue-600" />
                <label htmlFor="notify-comments" className="text-sm text-slate-700">
                  Notificar nuevos comentarios para moderación
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
