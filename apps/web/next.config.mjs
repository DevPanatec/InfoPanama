/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@infopanama/convex', '@infopanama/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
      },
    ],
    // Optimización de imágenes
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    // Optimizar imports de paquetes grandes
    optimizePackageImports: ['lucide-react'],
  },
  // Comprimir respuestas
  compress: true,
  // Generar source maps solo en desarrollo
  productionBrowserSourceMaps: false,
  // Headers de seguridad y caché
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
}

export default nextConfig
