import { describe, it, expect, vi } from 'vitest';

// Mock @sentry/react so the jsdom environment doesn't attempt real SDK init
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
}));

describe('Sentry init', () => {
  it('does not throw when VITE_SENTRY_DSN is unset', async () => {
    // Vitest stubs import.meta.env via jsdom; just ensure import + call doesn't throw
    const { initSentry } = await import('@/lib/sentry');
    expect(() => initSentry()).not.toThrow();
  });
});
