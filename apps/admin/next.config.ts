import type { NextConfig } from 'next';

/**
 * Back-office admin.alivaon.com. Jamais indexé : en-tête X-Robots-Tag posé
 * ici en plus de Traefik et du robots.txt de l'application.
 *
 * En production, Traefik route /api/admin, /api/auth et /uploads vers
 * Symfony avant Next.js. En développement (next dev), ces chemins sont
 * relayés vers le Symfony local (SYMFONY_DEV_URL, défaut http://127.0.0.1:8000).
 */
const symfonyDevUrl = process.env.SYMFONY_DEV_URL ?? 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Développement : tests de bout en bout sur http://127.0.0.1:3001.
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    return [
      { source: '/api/admin/:path*', destination: `${symfonyDevUrl}/api/admin/:path*` },
      { source: '/api/auth/:path*', destination: `${symfonyDevUrl}/api/auth/:path*` },
      { source: '/uploads/:path*', destination: `${symfonyDevUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
