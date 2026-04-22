'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Map as MapGL, Marker, NavigationControl, GeolocateControl, useControl } from 'react-map-gl/mapbox';
// @ts-expect-error — no type declarations available for @mapbox/mapbox-gl-geocoder
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import Supercluster from 'supercluster';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { ACCESS_TOKEN, PAGES_RESOURCE, MIN_ZOOM_LEVEL } from '@/app/lib/constants/map';
import getBbox from '@/app/lib/utils/getBbox';
import getRoute from '@/app/lib/utils/getRoute';
import MonumentInterface from '@/app/lib/interfaces/Monument';
import MarkerButton from './MarkerButton';
import { useAlert } from './AlertProvider';
import styles from './Map.module.css';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface ClusterFeature {
  type: 'Feature';
  properties: {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    id?: string;
    name?: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

function GeocoderControl({
  accessToken,
  onResult,
}: {
  accessToken: string;
  onResult: (result: unknown) => void;
}) {
  useControl(
    () => {
      const geocoder = new MapboxGeocoder({
        accessToken,
        placeholder: 'Поиск',
        countries: 'ru',
        language: 'ru',
        marker: false,
      });
      geocoder.on('result', (e: { result: unknown }) => onResult(e.result));
      return geocoder;
    },
    { position: 'top-left' },
  );
  return null;
}

export default function Map() {
  const params = useParams();
  const router = useRouter();
  const alert = useAlert();

  const lat = Number(params.lat) || 55.7522;
  const lon = Number(params.lon) || 37.6155;
  const zoom = Number(params.zoom) || MIN_ZOOM_LEVEL;
  const id = params.slug?.[0] as string | undefined;

  const [viewState, setViewState] = useState<ViewState>({
    longitude: lon,
    latitude: lat,
    zoom,
  });
  const [monuments, setMonuments] = useState<MonumentInterface[]>([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const numLat = Number(lat);
    const numLon = Number(lon);
    setViewState({ longitude: numLon, latitude: numLat, zoom });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewport', JSON.stringify(viewState));
    }
  }, [viewState]);

  const loadPoints = useCallback(
    async ({
      latitude,
      longitude,
      zoom,
    }: {
      latitude: number;
      longitude: number;
      zoom: number;
    }) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      setLoading(true);

      const width = document.body.offsetWidth;
      const height = document.body.offsetHeight;

      const bbox = getBbox({
        width,
        height,
        latitude,
        longitude,
        zoom,
      });

      try {
        const response = await fetch(
          PAGES_RESOURCE + bbox.map((item) => String(item).substr(0, 7)).join(''),
          { signal: abortControllerRef.current.signal },
        );

        const { monuments } = await response.json();
        const flatMonuments = (monuments || []).reduce(
          (acc: MonumentInterface[], group: MonumentInterface[]) => acc.concat(group),
          [],
        );
        setMonuments(flatMonuments);

        if (!monuments || monuments.length === 0) {
          alert.show('Достопримечательности не найдены');
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;

        alert.error('Что-то пошло не так');
        console.log(err);
      } finally {
        setLoading(false);
      }
    },
    [alert],
  );

  const loadPointsWithDebounce = useCallback(
    (params: { latitude: number; longitude: number; zoom: number }) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => loadPoints(params), 1000);
    },
    [loadPoints],
  );

  const handleMove = useCallback(
    (evt: { viewState: ViewState }) => {
      const { longitude, latitude, zoom } = evt.viewState;
      const maxZoom = Math.max(MIN_ZOOM_LEVEL, Number(zoom));

      setViewState({ longitude, latitude, zoom: maxZoom });
      loadPointsWithDebounce({ latitude, longitude, zoom: maxZoom });

      router.replace(getRoute({ lat: latitude, lon: longitude, zoom: maxZoom, id }));
    },
    [id, router, loadPointsWithDebounce],
  );

  const handleGeolocate = useCallback(
    (evt: { coords: { latitude: number; longitude: number } }) => {
      const { longitude, latitude } = evt.coords;
      const currentZoom = viewState.zoom || MIN_ZOOM_LEVEL;

      loadPointsWithDebounce({ latitude, longitude, zoom: currentZoom });
      router.replace(getRoute({ lat: latitude, lon: longitude, id, zoom: currentZoom }));
    },
    [viewState.zoom, id, router, loadPointsWithDebounce],
  );

  const handleMapLoad = useCallback(() => {
    loadPoints({ longitude: lon, latitude: lat, zoom: viewState.zoom || MIN_ZOOM_LEVEL });
  }, [lon, lat, viewState.zoom, loadPoints]);

  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 40,
      extent: 512,
      maxZoom: 20,
    });

    const points: ClusterFeature[] = monuments.map((m) => ({
      type: 'Feature',
      properties: { id: m.id, name: m.name },
      geometry: { type: 'Point', coordinates: [m.lon, m.lat] },
    }));

    sc.load(points);
    return sc;
  }, [monuments]);

  const clusters = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    const bbox = getBbox({
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
      width,
      height,
    });

    return supercluster.getClusters(bbox as [number, number, number, number], Math.floor(viewState.zoom)) as ClusterFeature[];
  }, [supercluster, viewState]);

  const handleClusterClick = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      const expansionZoom = supercluster.getClusterExpansionZoom(clusterId);
      setViewState({ longitude, latitude, zoom: expansionZoom });
      router.replace(getRoute({ lat: latitude, lon: longitude, zoom: expansionZoom, id }));
    },
    [supercluster, id, router],
  );

  const handleGeocoderResult = useCallback(
    (result: unknown) => {
      const [newLon, newLat] = (result as { center: [number, number] }).center;
      const maxZoom = Math.max(MIN_ZOOM_LEVEL, 12);
      setViewState({ longitude: newLon, latitude: newLat, zoom: maxZoom });
      router.replace(getRoute({ lat: newLat, lon: newLon, zoom: maxZoom, id }));
      loadPointsWithDebounce({ latitude: newLat, longitude: newLon, zoom: maxZoom });
    },
    [id, router, loadPointsWithDebounce],
  );

  const markers = useMemo(() => {
    return clusters.map((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;

      if (feature.properties.cluster) {
        return (
          <Marker
            key={`cluster-${feature.properties.cluster_id}`}
            longitude={longitude}
            latitude={latitude}
          >
            <button
              type="button"
              data-testid="cluster"
              className={styles.cluster}
              onClick={() =>
                handleClusterClick(
                  feature.properties.cluster_id!,
                  longitude,
                  latitude,
                )
              }
            >
              {feature.properties.point_count}
            </button>
          </Marker>
        );
      }

      const monument = monuments.find((m) => m.id === feature.properties.id);
      if (!monument) return null;

      return (
        <Marker
          key={feature.properties.id}
          longitude={longitude}
          latitude={latitude}
        >
          <MarkerButton item={monument} />
        </Marker>
      );
    });
  }, [clusters, monuments, handleClusterClick]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <MapGL
      ref={mapRef}
      {...viewState}
      dragRotate={false}
      pitch={0}
      pitchWithRotate={false}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      onMove={handleMove}
      onLoad={handleMapLoad}
      mapboxAccessToken={ACCESS_TOKEN}
    >
      <GeocoderControl accessToken={ACCESS_TOKEN} onResult={handleGeocoderResult} />

      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        onGeolocate={handleGeolocate}
      />

      <NavigationControl position="top-right" showZoom />

      {markers}

      {loading && (
        <div className="absolute top-1 left-1 z-[10000] text-[13px] bg-white rounded px-1.5 py-0.5">
          Поиск объектов...
        </div>
      )}
    </MapGL>
  );
}
