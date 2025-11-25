'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@infopanama/convex'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const subscribeNewsletter = useMutation(api.subscriptions.subscribeNewsletter)

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
      setEmail('')

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
    <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white">
      <h3 className="font-semibold mb-2">Suscríbete</h3>
      <p className="text-sm text-slate-300 mb-4">
        Recibe las últimas verificaciones en tu correo.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          disabled={status === 'loading' || status === 'success'}
          className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Suscribiendo...' : status === 'success' ? '✓ Suscrito' : 'Suscribirse'}
        </button>
      </form>

      {message && (
        <p
          className={`text-xs mt-2 ${
            status === 'error' ? 'text-red-300' : 'text-emerald-300'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
