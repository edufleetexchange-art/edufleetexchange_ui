import { apiClient } from '@/lib/apiClient';

export type DocumentType = 'gst_certificate' | 'pan_card' | 'registration_certificate' | 'other';

export const verificationService = {
  async submit(input: { documentType: DocumentType; documentUrl: string; notes?: string }) {
    return apiClient.post<any>('/verifications', input);
  },
  async getMine() {
    return apiClient.get<any>('/verifications/me');
  },
  async listAdmin(params: { status?: string; targetType?: string; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) q.set(k, String(v)); });
    return apiClient.get<{ items: any[]; total: number; page: number; pageSize: number; hasMore: boolean }>(`/verifications/admin?${q.toString()}`);
  },
  async reviewAdmin(id: string, body: { status: 'verified' | 'rejected'; reviewNotes?: string }) {
    return apiClient.patch<any>(`/verifications/admin/${id}`, body);
  },
};
