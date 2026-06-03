import Map from '@/app/components/Map';

interface MapPageProps {
  params: Promise<{ lat: string; lon: string; zoom: string; slug?: string[] }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { slug } = await params;

  return <Map key="map-root" initialId={slug?.[0]} />;
}