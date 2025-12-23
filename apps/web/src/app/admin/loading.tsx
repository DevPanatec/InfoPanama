/**
 * Loading UI para Admin Dashboard - Next.js App Router
 * Skeleton loader específico para el panel de administración
 * Incluye sidebar y estructura de tabla/dashboard
 */

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header Skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-screen p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-200 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>

          {/* Section separator */}
          <div className="my-6 h-px bg-slate-200" />

          <div className="space-y-3">
            {[8, 9].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-200 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8 space-y-3">
            <div className="h-10 bg-slate-200 rounded-lg animate-pulse w-64" />
            <div className="h-5 bg-slate-200 rounded animate-pulse w-96" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                  <div className="h-8 w-8 bg-slate-200 rounded-lg" />
                </div>
                <div className="h-8 bg-slate-200 rounded w-24" />
                <div className="h-3 bg-slate-200 rounded w-32" />
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="h-10 bg-slate-200 rounded w-64 animate-pulse" />
              <div className="h-10 bg-slate-200 rounded w-40 animate-pulse" />
              <div className="h-10 bg-slate-200 rounded w-32 animate-pulse" />
              <div className="flex-1" />
              <div className="h-10 bg-slate-200 rounded w-28 animate-pulse" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <div className="flex gap-4">
                <div className="w-12 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="flex-1 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="w-24 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="w-20 h-5 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Table Rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="border-b border-slate-100 p-4 animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                  <div className="w-32 h-6 bg-slate-200 rounded-full" />
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="w-20 h-8 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-6 flex items-center justify-between">
            <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </main>
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
