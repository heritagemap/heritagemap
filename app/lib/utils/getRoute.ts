interface RouteParamsInterface {
  lat?: string | number;
  lon?: string | number;
  id?: string | number;
  zoom?: string | number;
}

const getRoute = (params: RouteParamsInterface) => (
  ['lat', 'lon', 'zoom', 'id'].reduce(
    (acc: string, item: string) => {
      if (!params[item as keyof RouteParamsInterface]) return acc;

      if (item === 'id') return `${acc}/${params[item as keyof RouteParamsInterface]}`;
      return `${acc}/${item}/${params[item as keyof RouteParamsInterface]}`;
    },
    '',
  )
);

export default getRoute;
