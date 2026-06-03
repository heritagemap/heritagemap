import { render, screen, fireEvent } from '@testing-library/react';
import MarkerButton from './MarkerButton';
import { useParams, useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('MarkerButton', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  test('renders point icon', () => {
    (useParams as jest.Mock).mockReturnValue({ lat: '55', lon: '37', zoom: '12' });

    render(<MarkerButton item={{ id: '1', name: 'Test', lon: 37, lat: 55 }} />);

    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  test('replaces route on click', () => {
    (useParams as jest.Mock).mockReturnValue({ lat: '55', lon: '37', zoom: '12' });

    render(<MarkerButton item={{ id: '1', name: 'Test', lon: 37, lat: 55 }} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/lat/55/lon/37/zoom/12/1');
  });

  test('active state when id matches', () => {
    (useParams as jest.Mock).mockReturnValue({ lat: '55', lon: '37', zoom: '12', slug: ['1'] });

    render(<MarkerButton item={{ id: '1', name: 'Test', lon: 37, lat: 55 }} />);

    const circle = document.querySelector('circle');
    expect(circle).toHaveAttribute('fill', '#e33201');
  });
});
