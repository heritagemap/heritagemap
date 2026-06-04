import type { NextConfig } from 'next';
import shortLinks from './app/lib/constants/shortLinks';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.toolforge.org',
      },
    ],
  },
  async redirects() {
    const linkRedirects = shortLinks.map((link) => ({
      source: link.path,
      destination: link.to,
      permanent: false,
    }));

    return [
      ...linkRedirects,
      {
        source: '/lat/:lat/lon/:lon',
        destination: '/lat/:lat/lon/:lon/zoom/12',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/_api/heritage',
        destination: 'https://heritage.toolforge.org/api/api.php',
      },
      {
        source: '/_api/heritage_info',
        destination: 'https://ru-monuments.toolforge.org/wikivoyage1.php',
      },
      {
        source: '/_api/ru_monument_image',
        destination: 'https://magnus-toolserver.toolforge.org/commonsapi.php',
      },
    ];
  },
async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ...(isProd
            ? [
                {
                  key: 'Content-Security-Policy',
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-eval' https://*.mapbox.com https://mc.yandex.ru https://www.googletagmanager.com https://www.vercel-insights.com",
                    "script-src-elem 'self' 'unsafe-eval' https://*.mapbox.com https://mc.yandex.ru https://www.googletagmanager.com https://www.vercel-insights.com",
                    "style-src 'self' 'unsafe-inline' https://*.mapbox.com",
                    "style-src-elem 'self' 'unsafe-inline' https://*.mapbox.com",
                    "img-src 'self' data: blob: https://*.mapbox.com https://upload.wikimedia.org https://mc.yandex.ru",
                    "connect-src 'self' https://*.mapbox.com https://api.mapbox.com https://events.mapbox.com https://*.toolforge.org https://mc.yandex.ru https://www.google-analytics.com",
                    "worker-src blob:",
                    "frame-src 'self' https://api.mapbox.com",
                  ].join('; '),
                },
              ]
            : []),
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=self, payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
