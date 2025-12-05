import { SignUp } from '@clerk/nextjs'
import { Shield, Users, TrendingUp } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Brand/Info */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 p-12">
        <div className="max-w-lg">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Únete a InfoPanama
          </h2>
          <p className="mb-8 text-xl text-purple-100">
            Sé parte de la comunidad que lucha contra la desinformación en Panamá.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-6 w-6 flex-shrink-0 text-purple-200" />
              <div>
                <h3 className="font-semibold text-white">Información Verificada</h3>
                <p className="text-purple-100">
                  Accede a verificaciones de claims y noticias sobre Panamá
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 h-6 w-6 flex-shrink-0 text-purple-200" />
              <div>
                <h3 className="font-semibold text-white">Comunidad Activa</h3>
                <p className="text-purple-100">
                  Participa en discusiones y reporta información dudosa
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="mt-1 h-6 w-6 flex-shrink-0 text-purple-200" />
              <div>
                <h3 className="font-semibold text-white">Análisis en Tiempo Real</h3>
                <p className="text-purple-100">
                  Mantente al día con las últimas verificaciones y tendencias
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 rounded-2xl bg-white/10 backdrop-blur-sm p-6">
            <div className="text-center">
              <p className="text-sm text-purple-200 mb-4">Con la confianza de</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">1,000+</div>
                  <div className="text-xs text-purple-200">Usuarios</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-purple-200">Verificaciones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-purple-200">Monitoreo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
                <span className="text-2xl font-bold text-white">IP</span>
              </div>
            </div>
            <h1 className="text-center text-3xl font-bold text-gray-900">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Comienza a verificar información ahora
            </p>
          </div>

          {/* Clerk Sign Up Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 p-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200',
                formButtonPrimary:
                  'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md',
                formFieldInput:
                  'rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200',
                footerActionLink: 'text-indigo-600 hover:text-indigo-700 font-medium',
                identityPreviewText: 'text-gray-700',
                formFieldLabel: 'text-gray-700 font-medium',
                dividerLine: 'bg-gray-300',
                dividerText: 'text-gray-500',
                formFieldInputShowPasswordButton: 'text-gray-600 hover:text-gray-900',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/"
            afterSignUpUrl="/"
          />

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a
              href="/sign-in"
              className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Inicia sesión
            </a>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <a href="/terminos" className="text-indigo-600 hover:underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacidad" className="text-indigo-600 hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
