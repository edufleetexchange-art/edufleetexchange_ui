import { apiClient } from '@/lib/apiClient';
import type { Placement, PlacementStage, PaginatedResponse } from '@/api/types';

export const placementService = {
  async list(params: { stage?: PlacementStage; page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<Placement>> {
    const q = new URLSearchParams();
    if (params.stage) q.set('stage', params.stage);
    q.set('page', String(params.page ?? 1));
    q.set('pageSize', String(params.pageSize ?? 20));
    return apiClient.get<PaginatedResponse<Placement>>(`/placements?${q.toString()}`);
  },
  async create(input: {
    teacherAccountId: string;
    jobId: string;
    applicationId?: string;
    initialStage?: PlacementStage;
    internalNotes?: string;
    agreedFee?: number;
  }): Promise<Placement> {
    return apiClient.post<Placement>('/placements', input);
  },
  async transition(id: string, stage: PlacementStage, reason?: string): Promise<Placement> {
    return apiClient.patch<Placement>(`/placements/${id}`, { stage, reason });
  },
  async patch(id: string, updates: Partial<Pick<Placement, 'internalNotes' | 'agreedFee' | 'agreedFeeNotes'>>): Promise<Placement> {
    return apiClient.patch<Placement>(`/placements/${id}`, updates);
  },
  async timeline(id: string): Promise<{ placement: Placement; stageHistory: Placement['stageHistory'] }> {
    return apiClient.get(`/placements/${id}/timeline`);
  },
};
