import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { api, internal } from './_generated/api'

/**
 * HTTP endpoints para InfoPanama
 *
 * Este archivo maneja:
 * - Webhooks de Clerk para sincronizar usuarios
 * - Webhooks del crawler para recibir artículos scrapeados
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

/**
 * Health check endpoint
 * GET /health
 */
http.route({
  path: '/health',
  method: 'GET',
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }),
})

/**
 * Webhook para recibir artículos scrapeados del crawler
 * POST /webhook/articles
 *
 * Body esperado:
 * {
 *   "articles": [{
 *     "title": string,
 *     "url": string,
 *     "content": string,
 *     "source": string,
 *     "category": string,
 *     "publishedDate": string (ISO 8601)
 *   }]
 * }
 */
http.route({
  path: '/webhook/articles',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json()
      const { articles } = body

      if (!articles || !Array.isArray(articles)) {
        return new Response(
          JSON.stringify({
            error: 'Invalid request: articles array required',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      console.log(`📥 Webhook recibió ${articles.length} artículos`)

      // Guardar artículos en la base de datos
      const results = []
      for (const article of articles) {
        // Skip articles - webhook requires sourceId lookup implementation
        // TODO: Implement source lookup/creation before enabling this
        console.log(`⚠️  Skipping article "${article.title}" - source lookup not implemented`)
        results.push({ article: article.title, success: false, error: 'Source lookup not implemented' })
      }

      const successful = results.filter((r) => r.success).length
      const failed = results.filter((r) => !r.success).length

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${articles.length} articles`,
          successful,
          failed,
          results,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (error) {
      console.error('❌ Error en webhook:', error)
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: String(error),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }),
})

export default http
