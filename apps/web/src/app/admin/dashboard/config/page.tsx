'use client'

import { Bell, Shield, Database, Zap, Globe } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfigPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false)
      alert('Configuración guardada correctamente')
    }, 1000)
  }

  const handleCancel = () => {
    if (confirm('¿Descartar los cambios?')) {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        <p className="text-muted-foreground">
          Ajustes generales y configuración de la plataforma
        </p>
      </div>

      {/* General Settings */}
      <div className="space-y-6">
        {/* Site Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Configuración del Sitio</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre del Sitio
              </label>
              <input
                type="text"
                defaultValue="InfoPanama"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                defaultValue="Plataforma de verificación de información para Panamá"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="maintenance" />
              <label htmlFor="maintenance" className="text-sm">
                Modo de mantenimiento
              </label>
            </div>
          </div>
        </div>

        {/* Verification Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Verificación</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Umbral de confianza mínimo (%)
              </label>
              <input
                type="number"
                defaultValue="70"
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Fuentes mínimas requeridas
              </label>
              <input
                type="number"
                defaultValue="3"
                min="1"
                max="10"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="auto-verify" />
              <label htmlFor="auto-verify" className="text-sm">
                Habilitar verificación automática con IA
              </label>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Configuración de IA</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Modelo de OpenAI
              </label>
              <select className="w-full px-4 py-2 rounded-lg border border-input bg-background">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Temperatura (0-1)
              </label>
              <input
                type="number"
                defaultValue="0.3"
                min="0"
                max="1"
                step="0.1"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="use-embeddings" />
              <label htmlFor="use-embeddings" className="text-sm">
                Usar embeddings para búsqueda semántica
              </label>
            </div>
          </div>
        </div>

        {/* Scraping Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Scraping</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Frecuencia de scraping (horas)
              </label>
              <input
                type="number"
                defaultValue="6"
                min="1"
                max="24"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Límite de artículos por fuente
              </label>
              <input
                type="number"
                defaultValue="50"
                min="10"
                max="200"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="use-proxies" />
              <label htmlFor="use-proxies" className="text-sm">
                Usar rotación de proxies
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="notify-high-risk" />
              <label htmlFor="notify-high-risk" className="text-sm">
                Alertar cuando se detecte actor de alto riesgo
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="notify-viral" />
              <label htmlFor="notify-viral" className="text-sm">
                Alertar cuando claim se vuelva viral
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="notify-comments" />
              <label htmlFor="notify-comments" className="text-sm">
                Notificar nuevos comentarios para moderación
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg border border-input hover:bg-muted transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
