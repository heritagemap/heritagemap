'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LAT, DEFAULT_LON, DEFAULT_ZOOM } from '@/app/lib/constants/map';
import { getLogger } from '@/app/lib/logger';

const logger = getLogger('Home');

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const prevPosition = JSON.parse(localStorage.getItem('viewport') || '{}');

    if (prevPosition.latitude && prevPosition.longitude) {
      const { latitude, longitude, zoom } = prevPosition;
      logger.info({ source: 'localStorage', latitude, longitude, zoom }, 'Редирект из сохранённой позиции');
      router.push(`/lat/${latitude}/lon/${longitude}/zoom/${zoom}`);
      return;
    }

    navigator?.geolocation?.getCurrentPosition(
      (position) => {
        if (!position.coords?.latitude || !position.coords?.longitude) {
          logger.info({ source: 'default' }, 'Редирект по умолчанию (пустая геолокация)');
          router.push(`/lat/${DEFAULT_LAT}/lon/${DEFAULT_LON}/zoom/${DEFAULT_ZOOM}`);
        } else {
          logger.info({ source: 'geolocation', lat: position.coords.latitude, lon: position.coords.longitude }, 'Редирект из геолокации');
          router.push(`/lat/${position.coords.latitude}/lon/${position.coords.longitude}/zoom/${DEFAULT_ZOOM}`);
        }
      },
      () => {
        logger.info({ source: 'default' }, 'Редирект по умолчанию (отказ геолокации)');
        router.push(`/lat/${DEFAULT_LAT}/lon/${DEFAULT_LON}/zoom/${DEFAULT_ZOOM}`);
      },
    );
  }, [router]);

  return null;
}
