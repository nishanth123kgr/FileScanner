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
  
  // Add webpack configuration to handle Node.js modules in browser
  webpack: (config, { isServer }) => {
    // If client-side (browser), provide empty module fallbacks for node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        buffer: false, // Changed from require.resolve('buffer/')
      };
      
      // Explicitly ignore the 'fs' module import in pe_analyzer.js
      config.module.rules.push({
        test: /pe_analyzer\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: 'fs=require\\("fs"\\)',
          replace: 'fs={}',
          flags: 'g'
        }
      });

      // Also handle path module which often comes with fs
      config.module.rules.push({
        test: /pe_analyzer\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: 'nodePath=require\\("path"\\)',
          replace: 'nodePath={}',
          flags: 'g'
        }
      });
    }

    // Add WASM file handling
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    return config;
  },
}

export default nextConfig
