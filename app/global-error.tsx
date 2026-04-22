'use client';

import { useEffect } from 'react';
import { getLogger } from '@/app/lib/logger';

const logger = getLogger('GlobalErrorBoundary');

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, 'Критическая ошибка');
  }, [error]);

  return (
    <html lang="ru">
      <body className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Критическая ошибка</h2>
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-[#6c2c04] text-white rounded"
        >
          Перезагрузить страницу
        </button>
      </body>
    </html>
  );
}
