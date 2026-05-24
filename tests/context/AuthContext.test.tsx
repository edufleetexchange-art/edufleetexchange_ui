import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

vi.mock('@/api/services/authService', () => ({
  authService: {
    me: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
    signupInstitute: vi.fn(),
    signupTeacher: vi.fn(),
    signupVendor: vi.fn(),
    logout: vi.fn(),
    updateAccount: vi.fn(),
    validateToken: vi.fn(),
    getStoredToken: vi.fn().mockReturnValue(null),
    getStoredUser: vi.fn().mockReturnValue(null),
  },
}));

function Display() {
  const { account, profile, subscription, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="name">{account?.name ?? 'none'}</span>
      <span data-testid="role">{account?.role ?? 'none'}</span>
      <span data-testid="profile">{profile ? 'yes' : 'no'}</span>
      <span data-testid="sub">{subscription ? subscription.status : 'no'}</span>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('AuthContext', () => {
  it('starts unauthenticated when no stored token', async () => {
    await act(async () => {
      render(<AuthProvider><Display /></AuthProvider>);
    });
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('name').textContent).toBe('none');
  });

  it('populates account/profile/subscription after login', async () => {
    const { authService } = await import('@/api/services/authService');
    (authService.login as any).mockResolvedValue({
      account: { id: '1', name: 'X', email: 'x@e.com', role: 'teacher', isActive: true, isVerified: true, createdAt: '', updatedAt: '' },
      profile: { id: 'p', accountId: '1', experience: 5, qualifications: [], subjects: ['Math'], isAvailable: true },
      subscription: { id: 's', accountId: '1', status: 'active', paymentStatus: 'completed', startDate: '', endDate: '', listingsUsed: 0, listingsLimit: 0, jobPostsUsed: 0, jobPostsLimit: 0, browseCount: 0, browseCountLimit: 0 },
    });

    let api: any;
    function Capture() { api = useAuth(); return null; }

    await act(async () => {
      render(<AuthProvider><Capture /><Display /></AuthProvider>);
    });

    await act(async () => {
      await api.login('x@e.com', 'pwpwpw');
    });

    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('role').textContent).toBe('teacher');
    expect(screen.getByTestId('profile').textContent).toBe('yes');
    expect(screen.getByTestId('sub').textContent).toBe('active');
  });

  it('clears state on logout', async () => {
    const { authService } = await import('@/api/services/authService');
    (authService.login as any).mockResolvedValue({
      account: { id: '1', name: 'X', email: 'x@e.com', role: 'institute', isActive: true, isVerified: true, createdAt: '', updatedAt: '' },
      profile: null,
      subscription: null,
    });
    (authService.logout as any).mockResolvedValue(undefined);

    let api: any;
    function Capture() { api = useAuth(); return null; }

    await act(async () => {
      render(<AuthProvider><Capture /><Display /></AuthProvider>);
    });
    await act(async () => { await api.login('x@e.com', 'pwpwpw'); });
    expect(screen.getByTestId('auth').textContent).toBe('true');

    await act(async () => { await api.logout(); });
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('name').textContent).toBe('none');
  });
});
