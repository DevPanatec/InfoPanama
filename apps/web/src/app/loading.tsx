/**
 * Loading UI Global - Next.js App Router
 * Muestra un skeleton loader profesional mientras se cargan las páginas
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Skeleton del Hero Section */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Título principal skeleton */}
        <div className="mb-12 space-y-4">
          <div className="h-12 bg-slate-200 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-6 bg-slate-200 rounded-lg animate-pulse w-1/2 mx-auto" />
        </div>

        {/* Grid de cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card principal grande */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse"
              >
                {/* Imagen skeleton */}
                <div className="w-full h-64 bg-slate-200 rounded-lg" />

                {/* Título skeleton */}
                <div className="h-6 bg-slate-200 rounded w-3/4" />

                {/* Descripción skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                </div>

                {/* Metadata skeleton */}
                <div className="flex gap-4">
                  <div className="h-8 bg-slate-200 rounded-full w-24" />
                  <div className="h-8 bg-slate-200 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="w-full h-32 bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator fixed */}
      <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg p-4 border-2 border-blue-500">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
