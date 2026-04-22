'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileInterface } from '@/app/lib/interfaces/FullInfo';
import { getLogger } from '@/app/lib/logger';

const logger = getLogger('FullInfo');

const IMAGE_RESOURCE = '/_api/ru_monument_image?image=';

function parseImageXml(xmlText: string): { licenses?: string; file?: FileInterface } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const response = doc.querySelector('response');

  if (!response) return {};

  const licenseName = response.querySelector('licenses > license > name')?.textContent || undefined;

  const fileNode = response.querySelector('file');
  let file: FileInterface | undefined;

  if (fileNode) {
    const fileUrl = fileNode.querySelector('urls > file')?.textContent || '';
    file = {
      name: fileNode.querySelector('name')?.textContent || '',
      urls: { file: fileUrl },
      author: fileNode.querySelector('author')?.textContent || '',
      date: fileNode.querySelector('date')?.textContent || '',
    };
  }

  return {
    licenses: licenseName,
    file,
  };
}

interface FullInfoProps {
  image: string;
}

export default function FullInfo({ image }: FullInfoProps) {
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<string | undefined>('');
  const [file, setFile] = useState<FileInterface | undefined>(undefined);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchImage = async () => {
      setLoading(true);
      setLicenses('');
      setFile(undefined);

      try {
        logger.debug({ image }, 'Загрузка метаданных изображения');

        const response = await fetch(IMAGE_RESOURCE + image, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        const info = parseImageXml(text);

        logger.info({ image, hasFile: !!info.file }, 'Метаданные изображения загружены');

        setLicenses(info.licenses);
        setFile(info.file);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ image, err: error }, 'Ошибка загрузки метаданных изображения');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      abortController.abort();
    };
  }, [image]);

  return (
    <div className="my-6 text-sm">
      {loading && 'Загрузка...'}

      {file && file.urls && (
        <>
          <Image
            src={file.urls.file}
            alt={file.name || 'description'}
            width={320}
            height={240}
          />

          <div className="text-xs text-[#aaa] mt-2 space-x-1">
            {licenses && (
              <div
                dangerouslySetInnerHTML={{ __html: licenses }}
                className="inline-block"
              />
            )}

            {file.author && (
              <div
                dangerouslySetInnerHTML={{ __html: `${file.author},` }}
                className="inline-block"
              />
            )}

            {file.date && (
              <div dangerouslySetInnerHTML={{ __html: file.date }} className="inline-block" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
