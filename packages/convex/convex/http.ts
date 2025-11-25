import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

/**
 * HTTP endpoints para Clerk webhooks
 *
 * Este archivo maneja los webhooks de Clerk para sincronizar usuarios
 * entre Clerk y Convex
 */

const http = httpRouter()

/**
 * Webhook de Clerk para sincronizar usuarios
 *
 * Eventos manejados:
 * - user.created: Crea un nuevo usuario en Convex
 * - user.updated: Actualiza datos del usuario
 * - user.deleted: Marca usuario como inactivo
 */
http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json()

    // Verificar el webhook secret (en producción)
    // const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    // Aquí implementarías la verificación de firma de Clerk

    const { type, data } = payload

    try {
      switch (type) {
        case 'user.created':
          await ctx.runMutation(internal.users.createFromClerk, {
            clerkId: data.id,
            email: data.email_addresses[0]?.email_address || '',
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
            avatar: data.image_url || undefined,
          })
          break

        case 'user.updated':
          await ctx.runMutation(internal.users.updateFromClerk, {
            clerkId: data.id,
            email: data.email_addresses[0]?.email_address || '',
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
            avatar: data.image_url || undefined,
          })
          break

        case 'user.deleted':
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkId: data.id,
          })
          break
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Clerk webhook error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }),
})

export default http
