'use client'

/**
 * Error Boundary Global - Next.js App Router
 * Captura errores en runtime y muestra UI profesional de recuperación
 * Incluye logging automático de errores para debugging
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log del error para debugging
    console.error('❌ Error capturado por Error Boundary:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    // En producción, aquí enviarías el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar con servicio de error tracking
      // Sentry.captureException(error)
    }
  }, [error])

  // Determinar el tipo de error para mostrar mensaje personalizado
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')
  const isConvexError = error.message.includes('Convex') || error.message.includes('query')
  const isAuthError = error.message.includes('auth') || error.message.includes('Unauthorized')

  let errorTitle = 'Algo salió mal'
  let errorDescription = 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'

  if (isNetworkError) {
    errorTitle = 'Error de conexión'
    errorDescription = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
  } else if (isConvexError) {
    errorTitle = 'Error de base de datos'
    errorDescription = 'Hubo un problema al cargar los datos. Intenta recargar la página.'
  } else if (isAuthError) {
    errorTitle = 'Error de autenticación'
    errorDescription = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Card principal de error */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 md:p-12">
          {/* Icono de error */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-red-100 rounded-full p-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
          </div>

          {/* Título y descripción */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {errorTitle}
            </h1>
            <p className="text-lg text-slate-600 mb-2">{errorDescription}</p>

            {/* Mostrar digest del error si existe (útil para soporte) */}
            {error.digest && (
              <p className="text-sm text-slate-400 font-mono mt-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Detalles técnicos del error (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-8 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <summary className="cursor-pointer font-semibold text-slate-700 flex items-center gap-2 hover:text-slate-900">
                <Bug className="h-4 w-4" />
                Detalles técnicos (solo en desarrollo)
              </summary>
              <div className="mt-4 space-y-2">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-xs font-semibold text-red-800 mb-1">Error:</p>
                  <p className="text-xs text-red-700 font-mono">{error.message}</p>
                </div>
                {error.stack && (
                  <div className="bg-slate-100 border border-slate-300 rounded p-3 max-h-64 overflow-auto">
                    <p className="text-xs font-semibold text-slate-800 mb-1">Stack Trace:</p>
                    <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Acciones de recuperación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Botón de reintentar */}
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
            >
              <RefreshCw className="h-5 w-5" />
              Reintentar
            </button>

            {/* Botón de volver al inicio */}
            <a
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 active:scale-95 transition-all"
            >
              <Home className="h-5 w-5" />
              Ir al inicio
            </a>
          </div>

          {/* Mensaje de ayuda adicional */}
          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Si el problema persiste, por favor contacta a soporte técnico
              {error.digest && (
                <>
                  {' '}
                  e incluye el ID de error:{' '}
                  <span className="font-mono font-semibold text-slate-700">
                    {error.digest}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Este error ha sido registrado automáticamente para su revisión
          </p>
        </div>
      </div>
    </div>
  )
}
