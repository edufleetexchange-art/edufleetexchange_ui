import { apiClient } from '@/lib/apiClient';

export interface JobRecommendation {
  job: any;
  score: number;
}

export interface TeacherRecommendation {
  teacher: any;
  score: number;
}

export const recommendationService = {
  async jobsForMe(limit = 10): Promise<{ items: JobRecommendation[] }> {
    return apiClient.get<{ items: JobRecommendation[] }>(`/recommendations/jobs?limit=${limit}`);
  },
  async teachersForJob(jobId: string, limit = 10): Promise<{ items: TeacherRecommendation[] }> {
    return apiClient.get<{ items: TeacherRecommendation[] }>(`/recommendations/teachers?jobId=${jobId}&limit=${limit}`);
  },
};
