import { render, screen, fireEvent } from '@testing-library/react';
import MarkerButton from './MarkerButton';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('MarkerButton', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  test('renders point icon', () => {
    render(<MarkerButton item={{ id: '1', name: 'Test', lon: 37, lat: 55 }} isActive={false} currentZoom={12} />);

    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  test('replaces route on click', () => {
    render(<MarkerButton item={{ id: '1', name: 'Test', lon: 37, lat: 55 }} isActive={false} currentZoom={12} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/lat/55/lon/37/zoom/12/1');
  });

  test('active state when isActive prop is true', () => {
    render(<MarkerButton item={{ id: '1', name: 'Test', lon: 37, lat: 55 }} isActive currentZoom={12} />);

    const circle = document.querySelector('circle');
    expect(circle).toHaveAttribute('fill', '#e33201');
  });
});
