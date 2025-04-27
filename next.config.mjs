/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  // For GitHub Pages compatibility
  basePath: process.env.NODE_ENV === 'production' ? '/scan' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/scan/' : '',
}

export default nextConfig
