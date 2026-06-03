import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

    render(<Sidebar id="abc123" onClose={mockClose} />);

    await waitFor(() => {
      expect(screen.getByText('Test Monument')).toBeInTheDocument();
    });

    expect(screen.getByText('1900')).toBeInTheDocument();
    expect(screen.getByText('Test desc')).toBeInTheDocument();
    expect(screen.getByText('Moscow')).toBeInTheDocument();
    expect(screen.getByText('Статья в Википедии')).toBeInTheDocument();
  });

  test('calls onClose when close button clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ name: 'Test' })),
      } as Response),
    );

    render(<Sidebar id="abc123" onClose={mockClose} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));
    expect(mockClose).toHaveBeenCalled();
  });
});