import { apiClient } from '@/lib/apiClient';

export type ReportTargetType = 'vehicle' | 'job' | 'supplier' | 'account';
export type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'inaccurate' | 'duplicate' | 'other';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export const reportService = {
  async create(input: CreateReportInput) {
    return apiClient.post('/reports', input);
  },
  async list(params: { status?: string; targetType?: string; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) q.set(k, String(v));
    });
    return apiClient.get(`/reports?${q.toString()}`);
  },
  async update(id: string, body: { status?: string; resolution?: string }) {
    return apiClient.patch(`/reports/${id}`, body);
  },
};
