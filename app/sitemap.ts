import type { MetadataRoute } from 'next';
import { PAGES_RESOURCE, BASE_URL } from '@/app/lib/constants/map';
import shortLinks from '@/app/lib/constants/shortLinks';
import getBbox from '@/app/lib/utils/getBbox';

const CITY_BBOX_SIZE = 40000;
const FETCH_TIMEOUT_MS = 10000;

interface MonumentApiResponse {
  monuments?: { id: string }[];
}

async function fetchMonuments(lat: number, lon: number, zoom: number): Promise<MonumentApiResponse> {
  const bbox = getBbox({
    latitude: lat,
    longitude: lon,
    zoom,
    width: CITY_BBOX_SIZE,
    height: CITY_BBOX_SIZE,
  });

  const bboxStr = bbox.map((c) => c.toFixed(7)).join(',');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${PAGES_RESOURCE}${bboxStr}`, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.warn(`Sitemap: failed HTTP ${response.status} for ${lat},${lon}`);
      return { monuments: [] };
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`Sitemap: timeout for ${lat},${lon}`);
    } else {
      console.warn(`Sitemap: error fetching monuments for ${lat},${lon}`);
    }
    return { monuments: [] };
  } finally {
    clearTimeout(timer);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const cityPromises = shortLinks.map(async (link) => {
    const match = link.to.match(/\/lat\/([^/]+)\/lon\/([^/]+)\/zoom\/([^/]+)/);
    if (!match) return null;

    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const zoom = parseFloat(match[3]);

    const data = await fetchMonuments(lat, lon, zoom);
    return { path: link.path, monuments: data.monuments || [] };
  });

  const allCityResults = await Promise.all(cityPromises);

  for (const result of allCityResults) {
    if (!result) continue;

    entries.push({
      url: `${BASE_URL}${result.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    for (const monument of result.monuments) {
      if (!monument.id) continue;
      entries.push({
        url: `${BASE_URL}/${monument.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}