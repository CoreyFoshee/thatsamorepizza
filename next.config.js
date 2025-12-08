/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Handle static assets
  async rewrites() {
    return [
      {
        source: '/Logo/:path*',
        destination: '/Logo/:path*',
      },
      {
        source: '/images/:path*',
        destination: '/images/:path*',
      },
      {
        source: '/videos/:path*',
        destination: '/videos/:path*',
      },
    ];
  },
}

module.exports = nextConfig
