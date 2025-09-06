/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para PWA y Service Worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },

  // Configuración para optimizaciones
  compress: true,
  generateEtags: true,
  
  // Configuración para evitar problemas de caché en desarrollo
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configuración de imágenes
  images: {
    domains: ['static.readdy.ai'],
    formats: ['image/webp', 'image/avif'],
  },

  // Configuración para entornos
  env: {
    APP_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Configuración de redireccionamientos si los necesitas
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configuración de rewrites si los necesitas
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

// Configuración específica para entornos de desarrollo
if (process.env.NODE_ENV !== 'production') {
  nextConfig.headers = async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  };
}

module.exports = nextConfig;