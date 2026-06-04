import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RESOURCE, BASE_URL, DEFAULT_LAT, DEFAULT_LON } from '@/app/lib/constants/map';
import type { InfoInterface } from '@/app/lib/interfaces/FullInfo';
import MonumentPage from '@/app/components/MonumentPage';
import JsonLd from '@/app/components/JsonLd';
import { getLogger } from '@/app/lib/logger';

const logger = getLogger('MonumentPage');

const getMonumentInfo = cache(async (id: string): Promise<InfoInterface> => {
  const response = await fetch(`${RESOURCE}?id=${id}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  return JSON.parse(text);
});

interface MonumentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MonumentPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const info = await getMonumentInfo(id);
    const description = info.description
      ? info.description.replace(/<(.*?)>/g, '').slice(0, 160)
      : info.address
        ? `Адрес: ${info.address}`
        : 'Объект культурного наследия России';

    return {
      title: info.name || 'Объект культурного наследия',
      description,
      openGraph: {
        title: info.name || 'Объект культурного наследия',
        description,
        url: `${BASE_URL}/${id}`,
        images: info.image
          ? [{ url: `/_api/ru_monument_image?image=${info.image}` }]
          : [{ url: '/heritagemap.png', width: 512, height: 512 }],
      },
      twitter: {
        card: info.image ? 'summary_large_image' : 'summary',
        title: info.name || 'Объект культурного наследия',
        description,
        images: info.image
          ? [`/_api/ru_monument_image?image=${info.image}`]
          : ['/heritagemap.png'],
      },
    };
  } catch {
    logger.warn({ id }, 'Не удалось получить метаданные памятника');
    return {
      title: 'Объект не найден',
    };
  }
}

function buildBreadcrumbJsonLd(id: string, info: InfoInterface) {
  return {
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
        name: info.name || id,
        item: `${BASE_URL}/${id}`,
      },
    ],
  };
}

export default async function MonumentPageRoute({ params }: MonumentPageProps) {
  const { id } = await params;

  let info: InfoInterface;

  try {
    info = await getMonumentInfo(id);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({ id, err: error }, 'Ошибка загрузки памятника');
    notFound();
  }

  if (!info?.lat || !info?.long) {
    info = {
      ...info,
      lat: DEFAULT_LAT,
      long: DEFAULT_LON,
    };
  }

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(id, info)} />
      <MonumentPage info={info} />
    </>
  );
}