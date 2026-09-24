import type { NextConfig } from 'next';

/**
 * Site public www.alivaon.com — parité SEO stricte avec le site Symfony
 * (voir docs/seo-parity.md) :
 * - htmlLimitedBots /.*\/ : les métadonnées (title, canonical, hreflang…) sont
 *   toujours rendues dans le <head> initial, jamais diffusées après coup ;
 * - skipTrailingSlashRedirect : Next répond 308 sur /page/ alors que Symfony
 *   répond 301 ; la redirection est reproduite à l'identique dans proxy.ts.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  htmlLimitedBots: /.*/,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
