import '@testing-library/jest-dom';

jest.mock('mapbox-gl', () => ({
  GeolocateControl: jest.fn(),
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
  })),
  NavigationControl: jest.fn(),
}));

jest.mock('@mapbox/mapbox-gl-geocoder', () =>
  jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
  })),
);

jest.mock('@/app/components/AlertProvider', () => ({
  useAlert: () => ({ show: jest.fn(), error: jest.fn(), info: jest.fn() }),
}));

jest.mock('@/app/lib/logger', () => ({
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));
