import { render, waitFor, act } from '@testing-library/react';
import Map from './Map';
import { useParams, useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Collect callbacks passed to Map mock so tests can invoke them
let lastMapProps: Record<string, unknown> = {};

jest.mock('react-map-gl/mapbox', () => ({
  Map: jest.fn((props: Record<string, unknown>) => {
    lastMapProps = props;
    return null;
  }),
  Marker: jest.fn(() => null),
  NavigationControl: jest.fn(() => null),
  GeolocateControl: jest.fn(() => null),
  useControl: jest.fn(() => null),
}));

const mockGetClusterExpansionZoom = jest.fn(() => 15);

jest.mock('supercluster', () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn(),
    getClusters: jest.fn(() => []),
    getClusterExpansionZoom: mockGetClusterExpansionZoom,
  }));
});

describe('Map', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lastMapProps = {};
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useParams as jest.Mock).mockReturnValue({
      lat: '55.7522',
      lon: '37.6155',
      zoom: '12',
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ monuments: [] }),
      } as Response),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders without crashing', () => {
    const { container } = render(<Map />);
    expect(container).toBeTruthy();
  });

  test('loads points on map load', async () => {
    render(<Map />);

    act(() => {
      if (typeof lastMapProps.onLoad === 'function') {
        (lastMapProps.onLoad as () => void)();
      }
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(callUrl).toContain('/_api/heritage');
  });

  test('debounces loadPoints call on move', async () => {
    jest.useFakeTimers();

    render(<Map />);

    // Trigger initial load
    act(() => {
      if (typeof lastMapProps.onLoad === 'function') {
        (lastMapProps.onLoad as () => void)();
      }
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Simulate map move
    act(() => {
      if (typeof lastMapProps.onMove === 'function') {
        (lastMapProps.onMove as (evt: { viewState: { longitude: number; latitude: number; zoom: number } }) => void)({
          viewState: { longitude: 37.6, latitude: 55.7, zoom: 12 },
        });
      }
    });

    // Immediately after move, no new fetch (debounce active)
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Advance timers by 500ms — still debounced
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Advance timers past 1000ms — debounce fires
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('updates URL on move via router.replace', async () => {
    render(<Map />);

    act(() => {
      if (typeof lastMapProps.onMove === 'function') {
        (lastMapProps.onMove as (evt: { viewState: { longitude: number; latitude: number; zoom: number } }) => void)({
          viewState: { longitude: 37.6, latitude: 55.7, zoom: 12 },
        });
      }
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });

    expect(mockReplace).toHaveBeenCalledWith('/lat/55.7/lon/37.6/zoom/12');
  });

});
