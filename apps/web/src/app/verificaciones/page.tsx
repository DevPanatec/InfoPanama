'use client'

import { Loader2 } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@infopanama/convex'
import Link from 'next/link'

export default function VerificacionesPage() {
  const claims = useQuery(api.claims.getPublished, { limit: 50 })

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
      
      {claims.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay verificaciones publicadas aún</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {claims.map((claim) => (
            <Link key={claim._id} href={`/verificaciones/${claim._id}`}>
              <div className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-semibold mb-2">{claim.title}</h2>
                <p className="text-sm text-gray-500">{claim.category || 'Sin categoría'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
