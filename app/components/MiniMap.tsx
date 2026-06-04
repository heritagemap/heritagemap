'use client';

import { Map as MapGL, Marker } from 'react-map-gl/mapbox';
import { ACCESS_TOKEN } from '@/app/lib/constants/map';

interface MiniMapProps {
  lat: number;
  long: number;
  name: string;
}

export default function MiniMap({ lat, long, name }: MiniMapProps) {
  return (
    <div className="w-full h-[300px] bg-gray-100">
      <MapGL
        latitude={lat}
        longitude={long}
        zoom={15}
        dragRotate={false}
        pitch={0}
        pitchWithRotate={false}
        interactive={false}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={ACCESS_TOKEN}
      >
        <Marker longitude={long} latitude={lat} anchor="bottom">
          <div
            className="w-6 h-6 rounded-full bg-orange-600 border-2 border-white shadow cursor-pointer"
            title={name}
            aria-label={name}
          />
        </Marker>
      </MapGL>
    </div>
  );
}