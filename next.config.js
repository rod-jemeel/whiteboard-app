/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to avoid 404 errors
  productionBrowserSourceMaps: false,
  
  // Configure webpack to handle browser-specific code
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure redux-persist only runs on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Fix for Konva canvas module in Next.js
    if (isServer) {
      config.externals = [...config.externals, 'canvas', 'jsdom'];
    }
    
    return config;
  },
  
  // Environment variables that can be accessed on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig