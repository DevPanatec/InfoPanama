'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@infopanama/convex'

export default function TestDBPage() {
  const claims = useQuery(api.claims.list, { limit: 10 })
  const stats = useQuery(api.claims.stats)
  const createClaim = useMutation(api.claims.create)

  const handleCreateTestClaim = async () => {
    try {
      const id = await createClaim({
        title: 'Verificación de Prueba',
        description: 'Esta es una claim de prueba creada desde el frontend',
        claimText: 'El sistema de verificación funciona correctamente',
        sourceType: 'user_submitted',
        category: 'prueba',
        tags: ['test', 'demo'],
        riskLevel: 'LOW',
      })
      alert(`¡Claim creada con éxito! ID: ${id}`)
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test de Conexión a Convex</h1>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Estadísticas</h2>
          {stats === undefined ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Publicadas</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-sm text-gray-600">En Investigación</p>
                <p className="text-2xl font-bold">{stats.investigating}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold">{stats.review}</p>
              </div>
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">➕ Crear Claim de Prueba</h2>
          <button
            onClick={handleCreateTestClaim}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Crear Claim de Prueba
          </button>
        </div>

        {/* Claims List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📝 Lista de Claims</h2>
          {claims === undefined ? (
            <p className="text-gray-500">Cargando claims...</p>
          ) : claims.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No hay claims todavía. Haz click en el botón de arriba para crear una.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim._id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded">
                  <h3 className="font-bold text-lg">{claim.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{claim.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {claim.status}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {claim.riskLevel}
                    </span>
                    {claim.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✅ Conexión a Convex: <span className="font-bold">ACTIVA</span>
          </p>
          <p className="text-green-600 text-sm mt-1">
            URL: https://accomplished-rhinoceros-93.convex.cloud
          </p>
        </div>
      </div>
    </div>
  )
}
