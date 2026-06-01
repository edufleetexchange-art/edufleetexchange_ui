import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifiedBadge } from '@/components/VerifiedBadge';

describe('VerifiedBadge', () => {
  it('renders with aria-label "Verified"', () => {
    render(<VerifiedBadge />);
    expect(screen.getByTestId('verified-badge')).toHaveAttribute('aria-label', 'Verified');
  });

  it('shows "Verified" text by default', () => {
    render(<VerifiedBadge />);
    expect(screen.getByText('Verified')).toBeDefined();
  });

  it('hides text when label={false}', () => {
    render(<VerifiedBadge label={false} />);
    expect(screen.queryByText('Verified')).toBeNull();
    // badge container still present
    expect(screen.getByTestId('verified-badge')).toBeDefined();
  });
});
