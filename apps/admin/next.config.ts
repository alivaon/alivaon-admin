import type { NextConfig } from 'next';

/**
 * Back-office admin.alivaon.com. Jamais indexé : en-tête X-Robots-Tag posé
 * ici en plus de Traefik et du robots.txt de l'application.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
