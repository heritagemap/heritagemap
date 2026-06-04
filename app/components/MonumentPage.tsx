import Image from 'next/image';
import type { InfoInterface } from '@/app/lib/interfaces/FullInfo';
import getStatus from '@/app/lib/utils/getStatus';
import getSource from '@/app/lib/utils/getSource';
import getProtection from '@/app/lib/utils/getProtegtion';
import MiniMap from './MiniMap';
import JsonLd from './JsonLd';

const COMMONS_API = '/_api/ru_monument_image';

async function getImageInfo(image: string) {
  try {
    const response = await fetch(`${COMMONS_API}?image=${image}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) return { imageUrl: null, author: null, date: null, license: null };

    const text = await response.text();
    const fileUrlMatch = text.match(/<file[^>]*>([^<]+)<\/file>/);
    const authorMatch = text.match(/<author[^>]*>([^<]+)<\/author>/);
    const dateMatch = text.match(/<date[^>]*>([^<]+)<\/date>/);
    const licenseMatch = text.match(/<license[^>]*>\s*<name>([^<]+)<\/name>/);

    return {
      imageUrl: fileUrlMatch?.[1] || null,
      author: authorMatch?.[1] || null,
      date: dateMatch?.[1] || null,
      license: licenseMatch?.[1] || null,
    };
  } catch {
    return { imageUrl: null, author: null, date: null, license: null };
  }
}

function buildJsonLd(info: InfoInterface) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LandmarksOrHistoricalBuildings',
    name: info.name,
    description: info.description?.replace(/<(.*?)>/g, '') || undefined,
    address: info.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: info.address,
        }
      : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: info.lat,
      longitude: info.long,
    },
    ...(info.image ? { photo: `https://upload.wikimedia.org/wikipedia/commons/3/3a/${info.image}` } : {}),
    ...(info.wiki
      ? { sameAs: `https://ru.wikipedia.org/wiki/${info.wiki}` }
      : {}),
  };
}

interface MonumentPageProps {
  info: InfoInterface;
}

export default async function MonumentPage({ info }: MonumentPageProps) {
  const status = getStatus(info.type, info.knid);
  const protection = info.protection ? getProtection(info.protection) : '';
  const source = getSource({
    region: info.region,
    municipality: info.municipality,
    district: info.district,
  });

  let imageData = null;
  if (info.image) {
    imageData = await getImageInfo(info.image);
  }

  return (
    <>
      <JsonLd data={buildJsonLd(info)} />
      <main id="main-content" className="min-h-screen">
        <MiniMap lat={info.lat} long={info.long} name={info.name} />

        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-xl font-bold mb-3">{info.name}</h1>

          {info.year && <p className="text-sm text-gray-600 mb-2">{info.year}</p>}

          {info.style && (
            <p className="text-sm text-gray-600 mb-2">
              Стиль: {info.style}
            </p>
          )}

          {info.author && <p className="text-sm text-gray-600 mb-2">{info.author}</p>}

          {(info.description || info.status === 'destroyed') && (
            <p className="text-sm mb-4">
              {info.status === 'destroyed' && (
                <span className="text-red-600 font-bold">
                  Утрачен
                  {info.description ? '. ' : ''}
                </span>
              )}
              {info.description && (
                <span>{info.description.replace(/<(.*?)>/g, '')}</span>
              )}
            </p>
          )}

          {status && (
            <div className="flex items-start text-sm mb-2 gap-2">
              <div className="text-gray-500 shrink-0 min-w-0">
                {status}
                {protection ? `${protection} ` : ' '}
                {info.knid_new && (
                  <span className="bg-gray-200 text-[11px] rounded px-1 inline-block whitespace-nowrap">
                    {info.knid_new}
                  </span>
                )}
              </div>
            </div>
          )}

          {info.address && (
            <p className="text-sm text-gray-500 mb-2">Адрес: {info.address}</p>
          )}

          {imageData?.imageUrl && (
            <div className="my-4">
              <Image
                src={imageData.imageUrl}
                alt={info.name || 'Фотография объекта культурного наследия'}
                width={640}
                height={480}
                className="rounded"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              <div className="text-xs text-gray-400 mt-1 space-x-1">
                {imageData.license && (
                  <span dangerouslySetInnerHTML={{ __html: imageData.license }} />
                )}
                {imageData.author && (
                  <span dangerouslySetInnerHTML={{ __html: `${imageData.author},` }} />
                )}
                {imageData.date && (
                  <span dangerouslySetInnerHTML={{ __html: imageData.date }} />
                )}
              </div>
            </div>
          )}

          {info.wiki && (
            <div className="text-sm mb-2">
              <a
                href={`https://ru.wikipedia.org/wiki/${info.wiki}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Статья в Википедии
              </a>
            </div>
          )}

          {info.sobory && (
            <div className="text-sm mb-2">
              <a
                href={`https://sobory.ru/article/?object=${info.sobory}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Объект на сайте sobory.ru
              </a>
            </div>
          )}

          {info.temples && (
            <div className="text-sm mb-2">
              <a
                href={`http://temples.ru/card.php?ID=${info.temples}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Объект в проекте «Храмы России»
              </a>
            </div>
          )}

          {info.link && (
            <div className="text-sm mb-2">
              <a
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Дополнительная информация
              </a>
            </div>
          )}

          {info.linkextra && (
            <div className="text-sm mb-2">
              <a
                href={info.linkextra}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                И ещё информация
              </a>
            </div>
          )}

          <div className="mt-8 text-xs text-gray-400">
            Информация об объектах взята из{' '}
            <a href={source} target="_blank" rel="noopener noreferrer" className="text-gray-400 underline">
              Викигида
            </a>
            <br />
            Эти данные доступны по лицензии{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/deed.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 underline"
            >
              CC-By-SA 3.0
            </a>
          </div>
        </div>
      </main>
    </>
  );
}