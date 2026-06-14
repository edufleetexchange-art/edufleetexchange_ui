import { apiClient } from '@/lib/apiClient';
import type { Alert, AlertEntityType, AlertChannel, TeacherAlertCriteria } from '@/api/types';

export interface CreateAlertInput {
  entityType: AlertEntityType;
  label: string;
  criteria: TeacherAlertCriteria | Record<string, any>;
  channels?: AlertChannel[];
}

export const alertService = {
  async create(input: CreateAlertInput): Promise<Alert> {
    return apiClient.post<Alert>('/alerts', input);
  },
  async listMine(): Promise<{ items: Alert[]; total: number }> {
    return apiClient.get<{ items: Alert[]; total: number }>('/alerts/mine');
  },
  async patch(id: string, updates: Partial<Pick<Alert, 'status' | 'label' | 'criteria' | 'channels'>>): Promise<Alert> {
    return apiClient.patch<Alert>(`/alerts/${id}`, updates);
  },
  async remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/alerts/${id}`);
  },
};
