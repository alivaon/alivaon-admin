import type { NextConfig } from 'next';

/**
 * Site public www.alivaon.com — parité SEO stricte avec le site Symfony
 * (voir docs/seo-parity.md) :
 * - htmlLimitedBots /.*\/ : les métadonnées sont toujours rendues dans le
 *   <head> initial, jamais diffusées après coup ;
 * - skipTrailingSlashRedirect : Next répond 308 sur /page/ alors que Symfony
 *   répond 301 ; la redirection est reproduite à l'identique dans proxy.ts ;
 * - globalNotFound : une URL inconnue reçoit la 404 française de Symfony
 *   (deux mises en page racines, fr et en).
 *
 * Les fichiers du thème (/build, /vandor), les images (/uploads), l'API
 * publique, sitemap.xml, robots.txt et llms.txt sont servis par Symfony via
 * Traefik. En local, SYMFONY_PROXY_URL relaie ces chemins vers Symfony.
 */
const symfonyProxy = process.env.SYMFONY_PROXY_URL;
const SYMFONY_PATHS = ['/build/:path*', '/vandor/:path*', '/uploads/:path*', '/api/public/:path*', '/sitemap.xml', '/robots.txt', '/llms.txt', '/ping'];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Développement local sur 127.0.0.1 (rechargement à chaud).
  allowedDevOrigins: ['127.0.0.1'],
  htmlLimitedBots: /.*/,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  experimental: {
    globalNotFound: true,
  },
  ...(symfonyProxy && {
    async rewrites() {
      return { beforeFiles: SYMFONY_PATHS.map((source) => ({ source, destination: `${symfonyProxy}${source}` })), afterFiles: [], fallback: [] };
    },
  }),
};

export default nextConfig;
