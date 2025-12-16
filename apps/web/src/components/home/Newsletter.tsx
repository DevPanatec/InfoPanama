'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@infopanama/convex'
import { useUser } from '@clerk/nextjs'

export function Newsletter() {
  const { user, isLoaded } = useUser()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const subscribeNewsletter = useMutation(api.subscriptions.subscribeNewsletter)

  // Auto-llenar email si el usuario está autenticado
  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress)
    }
  }, [isLoaded, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Por favor ingresa tu email')
      return
    }

    setStatus('loading')

    try {
      await subscribeNewsletter({ email })
      setStatus('success')
      setMessage('¡Suscrito exitosamente!')

      // Reset después de 3 segundos
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Error al suscribirse')

      // Reset después de 3 segundos
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  return (
    <div className="bg-gradient-to-br from-verifica-blue to-deep-blue rounded-2xl p-6 text-white shadow-lg">
      <h3 className="font-bold mb-2 text-lg">Suscríbete al Boletín</h3>
      <p className="text-sm text-soft-blue mb-4">
        Recibe las últimas verificaciones y análisis directamente en tu correo.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          readOnly={!!user}
          disabled={status === 'loading' || status === 'success'}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-gray focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-digital-blue mb-3 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-white/5 transition-all"
        />

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-3 bg-digital-blue hover:bg-white hover:text-verifica-blue rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform duration-300"
        >
          {status === 'loading' ? 'Suscribiendo...' : status === 'success' ? '✓ Suscrito' : 'Suscribirse'}
        </button>
      </form>

      {message && (
        <p
          className={`text-xs mt-3 font-medium ${
            status === 'error' ? 'text-red-300' : 'text-emerald-300'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
