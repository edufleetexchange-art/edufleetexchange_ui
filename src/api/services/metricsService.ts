import { apiClient } from '@/lib/apiClient';

export interface MetricsSummary {
  accounts: {
    total: number;
    byRole: {
      institute: number;
      teacher: number;
      vendor: number;
      admin: number;
      marketing: number;
      sales: number;
    };
  };
  subscriptions: {
    active: number;
    expired: number;
    paymentPending: number;
  };
  listings: {
    vehicles: { total: number; pending: number; approved: number };
    jobs: { total: number; active: number; closed: number };
    suppliers: { total: number; pending: number; approved: number };
  };
  applications: {
    total: number;
    pending: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
  };
}

export interface SignupRow {
  date: string;
  institute: number;
  teacher: number;
  vendor: number;
  admin: number;
  marketing: number;
  sales: number;
}

export interface FunnelRow {
  date: string;
  vehicleSubmitted: number;
  vehicleApproved: number;
  vehicleRejected: number;
  supplierSubmitted: number;
  supplierApproved: number;
  supplierRejected: number;
}

export interface DauRow {
  date: string;
  activeUsers: number;
}

export const metricsService = {
  async summary(): Promise<MetricsSummary> {
    return apiClient.get<MetricsSummary>('/admin/metrics/summary', { requiresAuth: true });
  },
  async signups(days = 30): Promise<{ items: SignupRow[] }> {
    return apiClient.get<{ items: SignupRow[] }>(`/admin/metrics/signups?days=${days}`, { requiresAuth: true });
  },
  async approvalFunnel(days = 30): Promise<{ items: FunnelRow[] }> {
    return apiClient.get<{ items: FunnelRow[] }>(`/admin/metrics/approval-funnel?days=${days}`, { requiresAuth: true });
  },
  async activeUsers(days = 7): Promise<{ items: DauRow[] }> {
    return apiClient.get<{ items: DauRow[] }>(`/admin/metrics/active-users?days=${days}`, { requiresAuth: true });
  },
};
