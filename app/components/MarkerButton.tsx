'use client';

import MonumentInterface from '@/app/lib/interfaces/Monument';
import getRoute from '@/app/lib/utils/getRoute';
import Point from '@/app/components/icons/Point';
import { useRouter, useParams } from 'next/navigation';

interface MarkerButtonProps {
  item: MonumentInterface;
}

export default function MarkerButton({ item }: MarkerButtonProps) {
  const params = useParams();
  const router = useRouter();

  const id = params.slug?.[0] || params.id;
  const isActive = id === item.id;
  const lat = params.lat as string;
  const lon = params.lon as string;
  const zoom = params.zoom as string;

  const handleMarkerClick = () => {
    router.replace(getRoute({ lat, lon, zoom, id: item.id }));
  };

  return (
    <button
      type="button"
      data-testid="marker"
      className="bg-transparent border-none outline-none p-0 cursor-pointer"
      onClick={handleMarkerClick}
    >
      <Point isActive={isActive} />
    </button>
  );
}
