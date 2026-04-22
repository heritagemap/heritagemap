'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { InfoInterface } from '@/app/lib/interfaces/FullInfo';
import getStatus from '@/app/lib/utils/getStatus';
import getSource, { SOURCE } from '@/app/lib/utils/getSource';
import getRoute from '@/app/lib/utils/getRoute';
import getProtection from '@/app/lib/utils/getProtegtion';
import { RESOURCE } from '@/app/lib/constants/map';
import { getLogger } from '@/app/lib/logger';

import FullInfo from './FullInfo';
import {
  Destroyed,
  Close,
  Status,
  Address,
  Wiki,
  Sobory,
  LinkIcon,
  ExtraLink,
  Templates,
} from '@/app/components/icons';

const logger = getLogger('Sidebar');

export default function Sidebar() {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<InfoInterface | undefined>(undefined);
  const [source, setSource] = useState<string>(SOURCE);

  const params = useParams();
  const router = useRouter();

  const id = params.slug?.[0];
  const lat = params.lat as string;
  const lon = params.lon as string;
  const zoom = params.zoom as string;

  const handleClose = () => {
    router.replace(getRoute({ lat, lon, zoom }));
  };

  useEffect(() => {
    if (!id) return;

    const abortController = new AbortController();

    const fetchInfo = async () => {
      setLoading(true);
      setInfo(undefined);

      try {
        logger.debug({ id }, 'Загрузка info');

        const response = await fetch(`${RESOURCE}?id=${id}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        const infoJSON: InfoInterface = JSON.parse(text);

        logger.info({ id, name: infoJSON.name }, 'Info загружено');

        setInfo(infoJSON);
        setSource(
          getSource({
            region: infoJSON?.region,
            municipality: infoJSON?.municipality,
            district: infoJSON?.district,
          }),
        );
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ id, err: error }, 'Ошибка загрузки info');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();

    return () => {
      abortController.abort();
    };
  }, [id]);

  if (!id) return null;

  const status = info ? getStatus(info.type, info.knid) : '';
  const protection = info?.protection ? getProtection(info.protection) : '';

  return (
    <section className="fixed top-0 bottom-0 left-0 z-10 w-full max-w-[360px] p-4 bg-white shadow-md box-border overflow-auto text-sm leading-[18px]">
      {loading && 'Загрузка... '}

      <div className="flex justify-between items-start mb-4 pr-10">
        <h1 className="m-0 text-base leading-5">{info?.name}</h1>

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 w-12 h-12 bg-transparent border-0 cursor-pointer opacity-80 hover:opacity-100"
        >
          <Close />
        </button>
      </div>

      {info?.year && <p className="block my-0 mb-2.5">{info.year}</p>}

      {info?.style && (
        <p className="block my-0 mb-2.5">
          Стиль:
          {info?.style}
        </p>
      )}

      {info?.author && <p className="block my-0 mb-2.5">{info?.author}</p>}

      {(info?.description || info?.status === 'destroyed') && (
        <p className="block my-0 mb-4">
          {info?.status === 'destroyed' && (
            <span className="text-red-600 font-bold mb-4">
              <Destroyed />

              <span className="ml-0.5">
                Утрачен
                {info?.description ? '. ' : ''}
              </span>
            </span>
          )}

          {info?.description && <span>{info?.description.replace(/<(.*?)>/g, '')}</span>}
        </p>
      )}

      {status && (
        <div className="flex items-start text-sm leading-[18px]">
          <Status />

          <div className="ml-3.5 opacity-60">
            {status}
            {protection ? `${protection} ` : ' '}
            {info?.knid_new && (
              <span
                className="bg-[#ddd] text-[11px] leading-4 rounded px-[3px] inline-block whitespace-nowrap cursor-help tracking-wide"
                title="Номер в Едином государственном реестре объектов культурного наследия"
              >
                {info.knid_new}
              </span>
            )}
          </div>
        </div>
      )}

      {info?.address && (
        <div className="flex items-start text-sm leading-[18px] mt-2.5">
          <Address />

          <div className="ml-3.5 opacity-60">{info.address}</div>
        </div>
      )}

      {info?.image && <FullInfo image={info.image} />}

      {info?.wiki && (
        <div className="flex items-start text-sm leading-[18px] mt-2.5">
          <Wiki />

          <a
            href={`https://ru.wikipedia.org/wiki/${info.wiki}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3.5 opacity-60"
          >
            <span>Статья в Википедии</span>
          </a>
        </div>
      )}

      {info?.sobory && (
        <div className="flex items-start text-sm leading-[18px] mt-2.5">
          <Sobory />

          <a
            href={`https://sobory.ru/article/?object=${info.sobory}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3.5 opacity-60"
          >
            <span>Объект на сайте sobory.ru</span>
          </a>
        </div>
      )}

      {info?.temples && (
        <div className="flex items-start text-sm leading-[18px] mt-2.5">
          <Templates />

          <a
            href={`http://temples.ru/card.php?ID=${info.temples}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3.5 opacity-60"
          >
            <span>Объект в проекте «Храмы России»</span>
          </a>
        </div>
      )}

      {info?.link && (
        <div className="flex items-start text-sm leading-[18px] mt-2.5">
          <LinkIcon />

          <a
            href={info.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3.5 opacity-60"
          >
            <span>Дополнительная информация</span>
          </a>
        </div>
      )}

      {info?.linkextra && (
        <div className="flex items-start text-sm leading-[18px] mt-2.5">
          <ExtraLink />

          <a
            href={info.linkextra}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3.5 opacity-60"
          >
            <span>И ещё информация</span>
          </a>
        </div>
      )}

      <div className="mt-10 text-[#aaa] text-xs">
        Информация об объектах взята из{' '}
        <a href={source} target="_blank" rel="noopener noreferrer" className="text-[#aaa]">
          Викигида
        </a>
        <br />
        Эти данные доступны по лицензии{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/deed.ru"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#aaa]"
        >
          CC-By-SA 3.0
        </a>
      </div>
    </section>
  );
}
