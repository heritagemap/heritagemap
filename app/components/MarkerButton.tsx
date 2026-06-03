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
      className="bg-transparent border-none outline-none p-0 cursor-pointer"
      onClick={handleMarkerClick}
    >
      <Point isActive={isActive} />
    </button>
  );
}

export default memo(MarkerButton);