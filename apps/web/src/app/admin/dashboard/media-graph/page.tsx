'use client'

import { AlertCircle } from 'lucide-react'

export default function MediaGraphPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Grafo de Entidades</h1>
        <p className="text-slate-600">
          Visualización de relaciones entre actores, medios y eventos
        </p>
      </div>

      {/* En desarrollo */}
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Funcionalidad en Desarrollo
          </h2>
          <p className="text-slate-600 mb-4">
            El grafo de entidades está en proceso de implementación. Esta función permitirá
            visualizar las relaciones entre actores políticos, medios de comunicación y eventos.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <p className="text-sm text-slate-700 font-medium mb-2">Características próximas:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Visualización de red interactiva</li>
              <li>• Filtros por tipo de entidad</li>
              <li>• Búsqueda de nodos específicos</li>
              <li>• Análisis de conexiones</li>
              <li>• Exportación de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
