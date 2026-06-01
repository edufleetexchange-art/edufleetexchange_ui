import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Rating } from '@/components/Rating';

describe('Rating', () => {
  it('renders aria-label reflecting the value', () => {
    render(<Rating value={3.5} />);
    expect(screen.getByTestId('rating')).toHaveAttribute(
      'aria-label',
      'Rating 3.5 out of 5'
    );
  });

  it('clamps value to 0..5', () => {
    render(<Rating value={7.2} />);
    expect(screen.getByTestId('rating')).toHaveAttribute(
      'aria-label',
      'Rating 5.0 out of 5'
    );
  });

  it('shows count when provided', () => {
    render(<Rating value={4} count={37} />);
    expect(screen.getByTestId('rating-count')).toHaveTextContent('(37)');
  });

  it('omits count display when not provided', () => {
    render(<Rating value={4} />);
    expect(screen.queryByTestId('rating-count')).toBeNull();
  });
});
