import OpenAI from 'openai'

/**
 * Configuración de OpenAI para InfoPanama
 * Utilizando GPT-5 mini para verificación de claims
 */

let openaiClient: OpenAI | null = null

/**
 * Obtiene una instancia del cliente de OpenAI
 * La instancia se crea una sola vez (singleton)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Por favor configúrala con: npx convex env set OPENAI_API_KEY <tu-key>'
      )
    }

    openaiClient = new OpenAI({
      apiKey,
    })
  }

  return openaiClient
}

/**
 * Obtiene el modelo de OpenAI configurado
 * Por defecto usa gpt-5-mini
 */
export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-5-mini'
}

/**
 * Configuración de modelos disponibles
 */
export const OPENAI_MODELS = {
  GPT_5_MINI: 'gpt-5-mini',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O: 'gpt-4o',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4: 'gpt-4',
} as const

/**
 * Límites de tokens por modelo
 */
export const MODEL_TOKEN_LIMITS = {
  'gpt-5-mini': 400000, // 400k context window, 128k max output
  'gpt-4o-mini': 128000,
  'gpt-4o': 128000,
  'gpt-4-turbo-preview': 128000,
  'gpt-4': 8192,
} as const

/**
 * Obtiene el límite de tokens para el modelo actual
 */
export function getModelTokenLimit(): number {
  const model = getOpenAIModel()
  return MODEL_TOKEN_LIMITS[model as keyof typeof MODEL_TOKEN_LIMITS] || 400000
}
