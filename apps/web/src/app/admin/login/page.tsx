'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Lock, User, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulación de login (en producción usarías Clerk o NextAuth)
    // Credenciales de demo: admin@infopanama.com / admin123
    if (email === 'admin@infopanama.com' && password === 'admin123') {
      // Guardar sesión en localStorage
      localStorage.setItem('admin_session', 'true')
      localStorage.setItem('admin_email', email)

      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 500)
    } else {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">InfoPanama</h1>
          </div>
          <p className="text-blue-200 text-lg">Panel de Administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  placeholder="admin@infopanama.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-blue-200 text-center mb-2">Credenciales de demostración:</p>
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-xs text-blue-100 font-mono">Email: admin@infopanama.com</p>
              <p className="text-xs text-blue-100 font-mono">Password: admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-blue-200 hover:text-white transition">
            ← Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  )
}
