import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Middleware de Clerk para protección de rutas
 *
 * Rutas protegidas:
 * - /admin/** - Panel administrativo (requiere autenticación)
 * - /notificaciones - Notificaciones de usuario
 * - /suscripciones - Gestión de suscripciones
 */

// Definir rutas protegidas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/notificaciones(.*)',
  '/suscripciones(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Proteger rutas que requieren autenticación
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
