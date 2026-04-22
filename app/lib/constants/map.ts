export const DEFAULT_LAT = 55.7522;
export const DEFAULT_LON = 37.6155;
export const DEFAULT_ZOOM = 12;
export const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
export const PAGES_RESOURCE = '/_api/heritage/?action=search&format=json&limit=5000&srcountry=ru&&props=id|name|address|municipality|lat|lon|image|source&bbox=';
export const MIN_ZOOM_LEVEL = 0;
export const RESOURCE = '/_api/heritage_info';
