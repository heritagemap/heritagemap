import { ImageResponse } from 'next/og';
import { cache } from 'react';
import { RESOURCE } from '@/app/lib/constants/map';

export const runtime = 'edge';

const getMonumentData = cache(async (id: string) => {
  const response = await fetch(`${RESOURCE}?id=${id}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;
  const text = await response.text();
  return JSON.parse(text);
});

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const info = await getMonumentData(id);

  if (!info?.name) {
    return new Response('Not Found', { status: 404 });
  }

  const address = info.address ? `📍 ${info.address}` : '';
  const year = info.year ? `📅 ${info.year}` : '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#6c2c04',
          color: 'white',
          padding: 60,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          {info.name}
        </div>
        {address && (
          <div
            style={{
              fontSize: 28,
              opacity: 0.8,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {address}
          </div>
        )}
        {year && (
          <div
            style={{
              fontSize: 24,
              opacity: 0.6,
              textAlign: 'center',
            }}
          >
            {year}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 24,
            opacity: 0.4,
          }}
        >
          heritagemap.ru
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export const alt = 'Объект культурного наследия на HeritageMap';