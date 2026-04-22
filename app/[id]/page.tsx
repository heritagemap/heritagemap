import { redirect } from 'next/navigation';
import { RESOURCE } from '@/app/lib/constants/map';

interface MonumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonumentPage({ params }: MonumentPageProps) {
  const { id } = await params;

  const response = await fetch(`${RESOURCE}?id=${id}`);
  const text = await response.text();
  const info = JSON.parse(text);

  if (!info?.lat || !info?.long) {
    redirect(`/lat/55.7522/lon/37.6155/zoom/12`);
  }

  redirect(`/lat/${info.lat}/lon/${info.long}/zoom/12/${id}`);
}
