import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { RESOURCE } from '@/app/lib/constants/map';

interface MonumentInfo {
  lat?: number | string;
  long?: number | string;
  name?: string;
}

const getMonumentInfo = cache(async (id: string): Promise<MonumentInfo> => {
  const response = await fetch(`${RESOURCE}?id=${id}`);
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
  } catch {
    notFound();
  }

  if (!info?.lat || !info?.long) {
    redirect(`/lat/55.7522/lon/37.6155/zoom/12`);
  }

  redirect(`/lat/${info.lat}/lon/${info.long}/zoom/12/${id}`);
}
