import getSortedMonumentsByCoords from './getSortedMonumentsByCoords';
import MonumentInterface from '@/app/lib/interfaces/Monument';

describe('getSortedMonumentsByCoords', () => {
  test('groups monuments by same coordinates', () => {
    const monuments: MonumentInterface[] = [
      { id: '1', name: 'A', lon: 37, lat: 55 },
      { id: '2', name: 'B', lon: 37, lat: 55 },
      { id: '3', name: 'C', lon: 38, lat: 56 },
    ];

    const result = getSortedMonumentsByCoords(monuments);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(1);
  });

  test('returns empty array for empty input', () => {
    expect(getSortedMonumentsByCoords([])).toEqual([]);
  });
});
