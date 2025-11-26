import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { ToastProvider } from '@/components/ui/Toast'
import { LoadingBar } from '@/components/LoadingBar'
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider'
// import { ClerkProvider } from '@clerk/nextjs' // Desactivado por ahora

// Optimización de fuente con display swap para mejor rendimiento
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e3a8a',
}

export const metadata: Metadata = {
  title: {
    default: 'InfoPanama - Verificación de Información',
    template: '%s | InfoPanama',
  },
  description:
    'Plataforma de verificación de información y análisis mediático para Panamá',
  keywords: [
    'verificación',
    'fact-checking',
    'Panamá',
    'noticias',
    'medios',
    'debida diligencia',
  ],
  authors: [{ name: 'InfoPanama' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_PA',
    siteName: 'InfoPanama',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ConvexClientProvider>
          <ToastProvider>
            <LoadingBar />
            <Navbar />
            {children}
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
