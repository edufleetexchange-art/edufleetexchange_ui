import { apiClient } from '@/lib/apiClient';
import type { AuthBundle, ConsultantProfile } from '@/api/types';

export const consultantService = {
  async me(): Promise<AuthBundle> {
    return apiClient.get<AuthBundle>('/consultants/me');
  },
  async patchMe(updates: Partial<ConsultantProfile>): Promise<ConsultantProfile> {
    return apiClient.patch<ConsultantProfile>('/consultants/me', updates);
  },
  async getById(accountId: string): Promise<ConsultantProfile> {
    return apiClient.get<ConsultantProfile>(`/consultants/${accountId}`);
  },
  async recommendedJobs(limit = 20): Promise<{ items: Array<{ job: any; score: number; bestTeacherAccountId: string }>; total: number }> {
    return apiClient.get(`/recommendations/jobs-for-roster?limit=${limit}`);
  },
  async recommendedTeachersForJob(jobId: string, limit = 20): Promise<{ items: Array<{ teacher: any; score: number }>; total: number }> {
    return apiClient.get(`/recommendations/teachers-for-job/${jobId}?limit=${limit}`);
  },
};
