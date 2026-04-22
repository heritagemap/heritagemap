import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { RESOURCE } from '@/app/lib/constants/map';
import { getLogger } from '@/app/lib/logger';

const logger = getLogger('MonumentPage');

interface MonumentInfo {
  lat?: number | string;
  long?: number | string;
  name?: string;
}

const getMonumentInfo = cache(async (id: string): Promise<MonumentInfo> => {
  logger.debug({ id }, 'Серверный запрос к API');

  const response = await fetch(`${RESOURCE}?id=${id}`);

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
    return {
      title: info.name || 'Объект культурного наследия',
    };
  } catch {
    logger.warn({ id }, 'Не удалось получить метаданные памятника');
    return {
      title: 'Объект не найден',
    };
  }
}

export default async function MonumentPage({ params }: MonumentPageProps) {
  const { id } = await params;

  let info: MonumentInfo;

  try {
    info = await getMonumentInfo(id);
    logger.info({ id, name: info.name, lat: info.lat, long: info.long }, 'Памятник загружен');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({ id, err: error }, 'Ошибка загрузки памятника');
    notFound();
  }

  if (!info?.lat || !info?.long) {
    logger.warn({ id, lat: info.lat, long: info.long }, 'Памятник без координат');
    redirect(`/lat/55.7522/lon/37.6155/zoom/12`);
  }

  logger.info({ id, lat: info.lat, long: info.long }, 'Редирект на карту');
  redirect(`/lat/${info.lat}/lon/${info.long}/zoom/12/${id}`);
}
