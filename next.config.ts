import type { NextConfig } from 'next';
import shortLinks from './app/lib/constants/shortLinks';

const nextConfig: NextConfig = {
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
};

export default nextConfig;
