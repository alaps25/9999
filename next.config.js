/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for Firebase vendor chunk issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    // Optimize Firebase bundling to prevent vendor chunk errors
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          // Don't create separate vendor chunks for Firebase
          firebase: {
            test: /[\\/]node_modules[\\/]@firebase[\\/]/,
            name: 'firebase',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    }
    
    return config
  },
}

module.exports = nextConfig

