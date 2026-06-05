import { apiClient } from '@/lib/apiClient';
import type { ConsultantRosterEntry, PaginatedResponse } from '@/api/types';

export const rosterService = {
  async list(params: { entityType?: 'teacher' | 'institute'; status?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<ConsultantRosterEntry>> {
    const q = new URLSearchParams();
    if (params.entityType) q.set('entityType', params.entityType);
    if (params.status) q.set('status', params.status);
    q.set('page', String(params.page ?? 1));
    q.set('pageSize', String(params.pageSize ?? 20));
    return apiClient.get<PaginatedResponse<ConsultantRosterEntry>>(`/roster?${q.toString()}`);
  },
  async create(input: { entityType: 'teacher' | 'institute'; entityAccountId: string; internalNotes?: string; tags?: string[] }): Promise<ConsultantRosterEntry> {
    return apiClient.post<ConsultantRosterEntry>('/roster', input);
  },
  async update(id: string, updates: Partial<ConsultantRosterEntry>): Promise<ConsultantRosterEntry> {
    return apiClient.patch<ConsultantRosterEntry>(`/roster/${id}`, updates);
  },
  async archive(id: string): Promise<ConsultantRosterEntry> {
    return apiClient.delete<ConsultantRosterEntry>(`/roster/${id}`);
  },
};
