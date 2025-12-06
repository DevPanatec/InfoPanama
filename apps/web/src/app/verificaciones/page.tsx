'use client'

import { Loader2 } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import Link from 'next/link'

export default function VerificacionesPage() {
  // Mostrar claims pendientes (status: 'new') para verificar
  const claims = useQuery(api.claims.list, { limit: 50 })

  if (!claims) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Verificaciones</h1>
      <p className="text-gray-600 mb-6">
        Claims extraídos automáticamente de noticias, pendientes de verificación
      </p>

      {claims.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay claims para verificar</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          {claims.map((claim) => (
            <Link key={claim._id} href={`/verificaciones/${claim._id}`}>
              <div className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer bg-white">
                {/* Nivel de riesgo */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      claim.riskLevel === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : claim.riskLevel === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {claim.riskLevel === 'HIGH'
                      ? 'Alta Prioridad'
                      : claim.riskLevel === 'MEDIUM'
                      ? 'Media Prioridad'
                      : 'Baja Prioridad'}
                  </span>
                  <span className="text-xs text-gray-500">{claim.category}</span>
                </div>

                {/* Claim text */}
                <p className="text-lg font-medium mb-3 text-gray-900">
                  "{claim.claimText}"
                </p>

                {/* Description */}
                {claim.description && (
                  <p className="text-sm text-gray-600 mb-3">{claim.description}</p>
                )}

                {/* Tags */}
                {claim.tags && claim.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {claim.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
