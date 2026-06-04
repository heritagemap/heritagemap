import { render, screen, fireEvent } from '@testing-library/react';
import MarkerButton from './MarkerButton';

describe('MarkerButton', () => {
  const mockClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders point icon', () => {
    render(
      <MarkerButton
        item={{ id: '1', name: 'Test', lon: 37, lat: 55 }}
        isActive={false}
        onClick={mockClick}
      />,
    );

    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  test('calls onClick when button clicked', () => {
    render(
      <MarkerButton
        item={{ id: '1', name: 'Test', lon: 37, lat: 55 }}
        isActive={false}
        onClick={mockClick}
      />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledWith('1');
  });

  test('active state when isActive prop is true', () => {
    render(
      <MarkerButton
        item={{ id: '1', name: 'Test', lon: 37, lat: 55 }}
        isActive
        onClick={mockClick}
      />,
    );

    const circle = document.querySelector('circle');
    expect(circle).toHaveAttribute('fill', '#e33201');
  });
});