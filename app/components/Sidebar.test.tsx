import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from './Sidebar';
import { useParams, useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('Sidebar', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useParams as jest.Mock).mockReturnValue({
      lat: '55',
      lon: '37',
      zoom: '12',
      slug: ['abc123'],
    });
  });

  test('renders null when no id', () => {
    (useParams as jest.Mock).mockReturnValue({ lat: '55', lon: '37', zoom: '12' });
    const { container } = render(<Sidebar />);
    expect(container.firstChild).toBeNull();
  });

  test('fetches and renders monument info', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              id: 'abc123',
              name: 'Test Monument',
              knid: '123',
              type: 0,
              year: '1900',
              description: 'Test desc',
              author: 'Author',
              address: 'Moscow',
              image: 'test.jpg',
              wiki: 'Test',
            }),
          ),
      } as Response),
    );

    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('Test Monument')).toBeInTheDocument();
    });

    expect(screen.getByText('1900')).toBeInTheDocument();
    expect(screen.getByText('Test desc')).toBeInTheDocument();
    expect(screen.getByText('Moscow')).toBeInTheDocument();
    expect(screen.getByText('Статья в Википедии')).toBeInTheDocument();
  });

  test('close button replaces route without id', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ name: 'Test' })),
      } as Response),
    );

    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/lat/55/lon/37/zoom/12');
  });
});
