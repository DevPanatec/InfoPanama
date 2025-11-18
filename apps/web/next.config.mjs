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
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'echarts'],
  },
}

export default nextConfig
