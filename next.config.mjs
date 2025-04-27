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
  // If you're not deploying to a /scan subdirectory, remove these basePath and assetPrefix settings
  // or set them to empty strings
  basePath: '',
  assetPrefix: '',
}

export default nextConfig
