import type { Metadata } from 'next';
import type { Viewport } from 'next';
import './globals.css';
import AlertProvider from '@/app/components/AlertProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import YandexMetrika from '@/app/components/YandexMetrika';
import JsonLd from '@/app/components/JsonLd';
import { BASE_URL } from '@/app/lib/constants/map';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
  },
  robots: { index: true, follow: true },
  title: { default: 'HeritageMap', template: '%s | HeritageMap' },
  description: 'Интерактивная карта объектов культурного наследия России',
  applicationName: 'HeritageMap',
  category: 'Карта',
  creator: 'HeritageMap',
  publisher: 'HeritageMap',
  openGraph: {
    title: 'Карта культурного наследия России',
    description: 'Интерактивная карта объектов культурного наследия России',
    url: BASE_URL,
    siteName: 'HeritageMap',
    locale: 'ru_RU',
    type: 'website',
    images: [{ url: '/heritagemap.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: 'Карта культурного наследия России',
    description: 'Интерактивная карта объектов культурного наследия России',
    images: ['/heritagemap.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  other: {
    'yandex-verification': 'e276bc80f69b5ca8',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HeritageMap',
  url: BASE_URL,
  description: 'Интерактивная карта объектов культурного наследия России',
  inLanguage: 'ru-RU',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HeritageMap',
  url: BASE_URL,
  logo: `${BASE_URL}/heritagemap.png`,
  description: 'Интерактивная карта объектов культурного наследия России',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6c2c04',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[10002] focus:bg-white focus:px-4 focus:py-2 focus:rounded"
        >
          Пропустить навигацию
        </a>
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
        <AlertProvider>{children}</AlertProvider>
        <SpeedInsights />
        <Analytics />
        <YandexMetrika />
      </body>
    </html>
  );
}
