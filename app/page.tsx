'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LAT, DEFAULT_LON, DEFAULT_ZOOM } from '@/app/lib/constants/map';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const prevPosition = JSON.parse(localStorage.getItem('viewport') || '{}');

    if (prevPosition.latitude && prevPosition.longitude) {
      const { latitude, longitude, zoom } = prevPosition;
      router.push(`/lat/${latitude}/lon/${longitude}/zoom/${zoom}`);
      return;
    }

    navigator?.geolocation?.getCurrentPosition(
      (position) => {
        if (!position.coords?.latitude || !position.coords?.longitude) {
          router.push(`/lat/${DEFAULT_LAT}/lon/${DEFAULT_LON}/zoom/${DEFAULT_ZOOM}`);
        } else {
          router.push(`/lat/${position.coords.latitude}/lon/${position.coords.longitude}/zoom/${DEFAULT_ZOOM}`);
        }
      },
      () => {
        router.push(`/lat/${DEFAULT_LAT}/lon/${DEFAULT_LON}/zoom/${DEFAULT_ZOOM}`);
      },
    );
  }, [router]);

  return null;
}
