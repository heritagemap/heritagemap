import getBbox from './getBbox';

describe('getBbox', () => {
  test('returns bbox for Moscow center', () => {
    const bbox = getBbox({
      latitude: 55.7522,
      longitude: 37.6155,
      zoom: 12,
      width: 1024,
      height: 768,
    });

    expect(bbox).toHaveLength(4);
    expect(bbox[0]).toBeLessThan(37.6155); // west
    expect(bbox[1]).toBeLessThan(55.7522); // south
    expect(bbox[2]).toBeGreaterThan(37.6155); // east
    expect(bbox[3]).toBeGreaterThan(55.7522); // north
  });

  test('clamps to world bounds', () => {
    const bbox = getBbox({
      latitude: 0,
      longitude: 0,
      zoom: 1,
      width: 20000,
      height: 20000,
    });

    expect(bbox[0]).toBeGreaterThanOrEqual(-180);
    expect(bbox[1]).toBeGreaterThanOrEqual(-90);
    expect(bbox[2]).toBeLessThanOrEqual(180);
    expect(bbox[3]).toBeLessThanOrEqual(90);
  });
});
