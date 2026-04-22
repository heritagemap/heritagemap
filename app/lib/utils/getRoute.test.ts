import getRoute from './getRoute';

describe('getRoute', () => {
  test('builds route with all params', () => {
    expect(getRoute({ lat: 55, lon: 37, zoom: 12, id: 'abc' })).toBe('/lat/55/lon/37/zoom/12/abc');
  });

  test('builds route without id', () => {
    expect(getRoute({ lat: 55, lon: 37, zoom: 12 })).toBe('/lat/55/lon/37/zoom/12');
  });

  test('builds route with only lat and lon', () => {
    expect(getRoute({ lat: 55, lon: 37 })).toBe('/lat/55/lon/37');
  });

  test('returns empty string without params', () => {
    expect(getRoute({})).toBe('');
  });
});
