/**
 * Loading UI para Verificaciones - Next.js App Router
 * Skeleton loader para la página de verificaciones/claims
 * Muestra grid de cards de verificación
 */

export default function VerificacionesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-12 bg-slate-200 rounded-lg animate-pulse w-96" />
          <div className="h-6 bg-slate-200 rounded animate-pulse w-2/3" />
        </div>

        {/* Filters and Search Bar Skeleton */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="h-12 bg-white border-2 border-slate-200 rounded-lg animate-pulse" />

          {/* Filter chips */}
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-9 w-24 bg-slate-200 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar Skeleton */}
        <div className="mb-8 bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-20 mx-auto" />
                <div className="h-4 bg-slate-200 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Grid de Verificaciones Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              {/* Imagen skeleton */}
              <div className="relative">
                <div className="w-full h-48 bg-slate-200" />

                {/* Badge de veredicto skeleton */}
                <div className="absolute top-4 right-4 h-8 w-24 bg-slate-300 rounded-full" />
              </div>

              {/* Contenido */}
              <div className="p-5 space-y-4">
                {/* Categoría skeleton */}
                <div className="h-5 bg-slate-200 rounded w-32" />

                {/* Título skeleton */}
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-full" />
                  <div className="h-5 bg-slate-200 rounded w-4/5" />
                </div>

                {/* Descripción skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>

                {/* Metadata footer skeleton */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-slate-200 rounded-full" />
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Loading Indicator Fixed */}
      <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg p-4 border-2 border-blue-500">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
