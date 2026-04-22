import Map from '@/app/components/Map';
import Sidebar from '@/app/components/Sidebar';

interface MapPageProps {
  params: Promise<{ lat: string; lon: string; zoom: string; slug?: string[] }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { slug } = await params;

  return (
    <>
      <Map />
      {slug?.[0] && <Sidebar />}
    </>
  );
}
