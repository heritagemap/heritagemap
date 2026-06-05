import { cache } from 'react';
import type { Metadata } from 'next';
import Map from '@/app/components/Map';
import { RESOURCE, BASE_URL } from '@/app/lib/constants/map';
import JsonLd from '@/app/components/JsonLd';
import { getLogger } from '@/app/lib/logger';

const logger = getLogger('MapPage');

const getMonumentInfo = cache(async (id: string) => {
  const response = await fetch(`${BASE_URL}${RESOURCE}?id=${id}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  return JSON.parse(text);
});

interface MapPageProps {
  params: Promise<{ lat: string; lon: string; zoom: string; slug?: string[] }>;
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { lat, lon, zoom, slug } = await params;
  const monumentId = slug?.[0];

  if (monumentId) {
    try {
      const info = await getMonumentInfo(monumentId);
      const title = info.name || 'Объект культурного наследия';
      const description = info.description
        ? info.description.replace(/<(.*?)>/g, '').slice(0, 160)
        : info.address
          ? `Адрес: ${info.address}`
          : 'Объект культурного наследия на карте России';

      return {
        title,
        description,
        alternates: {
          canonical: `${BASE_URL}/${monumentId}`,
        },
        openGraph: {
          title,
          description,
          url: `${BASE_URL}/lat/${lat}/lon/${lon}/zoom/${zoom}/${monumentId}`,
          images: info.image
            ? [{ url: `/_api/ru_monument_image?image=${info.image}` }]
            : [{ url: '/heritagemap.png', width: 512, height: 512 }],
        },
        twitter: {
          card: info.image ? 'summary_large_image' : 'summary',
          title,
          description,
          images: info.image
            ? [`/_api/ru_monument_image?image=${info.image}`]
            : ['/heritagemap.png'],
        },
      };
    } catch {
      logger.warn({ monumentId }, 'Не удалось получить метаданные памятника для карты');
    }
  }

  return {
    title: `Карта культурного наследия (${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)})`,
    description: `Объекты культурного наследия в районе координат ${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}. Зум: ${zoom}x.`,
    alternates: {
      canonical: `${BASE_URL}/lat/${lat}/lon/${lon}/zoom/${zoom}`,
    },
    openGraph: {
      title: 'Карта культурного наследия России',
      description: 'Интерактивная карта объектов культурного наследия России',
      url: `${BASE_URL}/lat/${lat}/lon/${lon}/zoom/${zoom}/${monumentId ?? ''}`,
      type: 'website',
      images: [{ url: '/heritagemap.png', width: 512, height: 512 }],
    },
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const { lat, lon, zoom, slug } = await params;
  const monumentId = slug?.[0];

  let breadcrumbListJsonLd: Record<string, unknown> | null = null;

  if (monumentId) {
    breadcrumbListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'HeritageMap',
          item: BASE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `Карта (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})`,
          item: `${BASE_URL}/lat/${lat}/lon/${lon}/zoom/${zoom}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: monumentId,
          item: `${BASE_URL}/${monumentId}`,
        },
      ],
    };
  }

  return (
    <>
      {breadcrumbListJsonLd && <JsonLd data={breadcrumbListJsonLd} />}
      <Map key="map-root" initialId={monumentId} />
    </>
  );
}