import getStatus from './getStatus';
import { Type } from '@/app/lib/interfaces/FullInfo';

describe('getStatus', () => {
  test('returns architecture monument for official status', () => {
    expect(getStatus(Type.architecture, '123')).toBe('Памятник архитектуры');
  });

  test('returns unofficial status', () => {
    expect(getStatus(Type.architecture, '124')).toBe(
      'Обладает признаками памятника архитектуры, не охраняется государством',
    );
  });

  test('returns empty string without knid', () => {
    expect(getStatus(Type.history, '')).toBe('');
  });

  test('returns empty string when knid[2] is missing', () => {
    expect(getStatus(Type.monument, '12')).toBe('');
  });
});
