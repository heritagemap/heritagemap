'use client';

import { memo } from 'react';

import MonumentInterface from '@/app/lib/interfaces/Monument';
import Point from '@/app/components/icons/Point';

interface MarkerButtonProps {
  item: MonumentInterface;
  isActive: boolean;
  onClick: (id: string) => void;
}

function MarkerButton({ item, isActive, onClick }: MarkerButtonProps) {
  const handleMarkerClick = () => {
    onClick(item.id);
  };

  return (
    <button
      type="button"
      data-testid="marker"
      aria-label={`Памятник: ${item.name}`}
      className="bg-transparent border-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 p-0 cursor-pointer"
      onClick={handleMarkerClick}
    >
      <Point isActive={isActive} />
    </button>
  );
}

export default memo(MarkerButton);