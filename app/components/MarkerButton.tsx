'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';

import MonumentInterface from '@/app/lib/interfaces/Monument';
import getRoute from '@/app/lib/utils/getRoute';
import Point from '@/app/components/icons/Point';

interface MarkerButtonProps {
  item: MonumentInterface;
  isActive: boolean;
  currentZoom: number;
}

function MarkerButton({ item, isActive, currentZoom }: MarkerButtonProps) {
  const router = useRouter();

  const handleMarkerClick = () => {
    router.replace(getRoute({ lat: item.lat, lon: item.lon, zoom: currentZoom, id: item.id }));
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

export default memo(MarkerButton);
