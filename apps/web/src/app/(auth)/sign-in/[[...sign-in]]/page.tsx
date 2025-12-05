import { SignIn } from '@clerk/nextjs'
import { CheckCircle2 } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                <span className="text-2xl font-bold text-white">IP</span>
              </div>
            </div>
            <h1 className="text-center text-3xl font-bold text-gray-900">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Inicia sesión en tu cuenta de InfoPanama
            </p>
          </div>

          {/* Clerk Sign In Component */}
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 p-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200',
                formButtonPrimary:
                  'bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md',
                formFieldInput:
                  'rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
                identityPreviewText: 'text-gray-700',
                formFieldLabel: 'text-gray-700 font-medium',
                dividerLine: 'bg-gray-300',
                dividerText: 'text-gray-500',
                formFieldInputShowPasswordButton: 'text-gray-600 hover:text-gray-900',
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/"
            afterSignInUrl="/"
          />

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <a
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Regístrate aquí
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Brand/Info */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12">
        <div className="max-w-lg">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Fact-checking para Panamá
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Verificamos la información que circula en medios y redes sociales sobre política y actualidad panameña.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-semibold text-white">Verificación con IA</h3>
                <p className="text-blue-100">
                  Análisis automatizado usando GPT-5 mini entrenado con datos de Panamá
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-semibold text-white">Grafo de Relaciones</h3>
                <p className="text-blue-100">
                  Visualiza conexiones entre políticos, medios y organizaciones
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-semibold text-white">Fuentes Confiables</h3>
                <p className="text-blue-100">
                  Basado en fuentes oficiales y medios verificados de Panamá
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-blue-200">Claims Verificadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-blue-200">Fuentes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-sm text-blue-200">Precisión</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
