/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image Optimization ──
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // cache images 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ── Compression ──
  compress: true,

  // ── Production optimizations ──
  poweredByHeader: false,
  reactStrictMode: true,

  // ── Caching headers ──
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/(.*)\\.(ico|jpg|jpeg|png|gif|webp|avif|svg|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache article pages for 1 hour
        source: '/article/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Cache category pages for 30 minutes
        source: '/category/:category',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=1800, stale-while-revalidate=3600' },
        ],
      },
      {
        // Cache homepage for 10 minutes
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' },
        ],
      },
    ]
  },

  // ── Redirects ──
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.pulse-africa.vercel.app' }],
        destination: 'https://pulse-africa.vercel.app/:path*',
        permanent: true,
      },
    ]
  },

  // ── Webpack optimizations ──
  webpack: (config, { dev, isServer }) => {
    // Only run in production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
// already in file — just verify trailingSlash is false
