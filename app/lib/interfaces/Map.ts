export interface ViewportInterface {
  latitude?: number | string;
  longitude?: number | string;
  zoom?: number | string;
  bearing?: number;
  pitch?: number;
  width?: number;
  height?: number;
}

export interface MapParamsInterface {
  latitude: number | string;
  longitude: number | string;
  zoom: number | string;
}

export interface CoordsInterface {
  coords: {
    latitude: number;
    longitude: number;
  };
}
