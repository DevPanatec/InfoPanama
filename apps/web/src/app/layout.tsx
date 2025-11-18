import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InfoPanama - Verificación de Información',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
