import { apiClient } from '@/lib/apiClient';
import type { Interview, InterviewMode, InterviewOutcome } from '@/api/types';

export const interviewService = {
  async list(params: { status?: string; from?: string; to?: string } = {}): Promise<{ items: Interview[]; total: number }> {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    return apiClient.get(`/interviews?${q.toString()}`);
  },
  async get(id: string): Promise<Interview> {
    return apiClient.get<Interview>(`/interviews/${id}`);
  },
  async schedule(input: {
    applicationId: string;
    scheduledAt: string;
    durationMinutes: number;
    mode: InterviewMode;
    location?: string;
    meetingLink?: string;
    participants?: string[];
    notesBefore?: string;
    round?: number;
  }): Promise<Interview> {
    return apiClient.post<Interview>('/interviews', input);
  },
  async reschedule(id: string, scheduledAt: string, rescheduleReason?: string): Promise<Interview> {
    return apiClient.patch<Interview>(`/interviews/${id}`, { scheduledAt, rescheduleReason });
  },
  async complete(id: string, outcome: InterviewOutcome, notesAfter?: string): Promise<Interview> {
    return apiClient.patch<Interview>(`/interviews/${id}`, { outcome, notesAfter });
  },
  async cancel(id: string, reason?: string): Promise<Interview> {
    return apiClient.patch<Interview>(`/interviews/${id}`, { cancel: true, rescheduleReason: reason });
  },
};
