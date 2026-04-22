import { render, screen, waitFor } from '@testing-library/react';
import FullInfo from './FullInfo';

describe('FullInfo', () => {
  test('renders loading state initially', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ text: () => Promise.resolve('<response></response>') } as Response),
    );

    render(<FullInfo image="Test.jpg" />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  test('renders image and metadata after fetch', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () =>
          Promise.resolve(`
            <response>
              <file>
                <name>Test.jpg</name>
                <urls><file>http://example.com/test.jpg</file></urls>
                <author>Author</author>
                <date>2020</date>
              </file>
              <licenses><license><name>CC-BY</name></license></licenses>
            </response>
          `),
      } as Response),
    );

    render(<FullInfo image="Test.jpg" />);

    await waitFor(() => {
      expect(screen.getByAltText('Test.jpg')).toBeInTheDocument();
    });

    expect(screen.getByText('CC-BY')).toBeInTheDocument();
    expect(screen.getByText('Author,')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });
});
