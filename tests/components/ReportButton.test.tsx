import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ReportButton } from '@/components/ReportButton';

// Mock auth context — authenticated user
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    account: { id: 'acc-1', name: 'Test User', email: 'test@e.com', role: 'institute', isActive: true },
  }),
}));

// Mock reportService
vi.mock('@/api/services/reportService', () => ({
  reportService: {
    create: vi.fn(),
  },
}));

// Mock Radix UI Select to avoid jsdom scrollIntoView issues
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select-mock">
      {children}
      <button
        data-testid="select-option-spam"
        onClick={() => onValueChange('spam')}
      >
        Spam Option
      </button>
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div role="combobox">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

// sonner is already mocked in tests/setup.ts
import { reportService } from '@/api/services/reportService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReportButton', () => {
  it('renders flag button', () => {
    render(<ReportButton targetType="vehicle" targetId="veh-123" />);
    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument();
  });

  it('opens dialog on click', async () => {
    render(<ReportButton targetType="vehicle" targetId="veh-123" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /report/i }));
    });
    expect(screen.getByText(/report this vehicle/i)).toBeInTheDocument();
  });

  it('calls reportService.create with correct args on submit', async () => {
    (reportService.create as any).mockResolvedValue({ success: true });

    render(<ReportButton targetType="vehicle" targetId="veh-123" />);

    // Open dialog
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /report/i }));
    });

    // Trigger the select's onValueChange with 'spam' via our mock button
    await act(async () => {
      fireEvent.click(screen.getByTestId('select-option-spam'));
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    });

    await waitFor(() => {
      expect(reportService.create).toHaveBeenCalledWith({
        targetType: 'vehicle',
        targetId: 'veh-123',
        reason: 'spam',
        details: undefined,
      });
    });
  });
});
