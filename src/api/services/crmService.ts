import { apiClient } from '@/lib/apiClient';

export interface CRMActivity {
  _id: string;
  leadId: string;
  userId: any;
  type: 'call' | 'email' | 'meeting' | 'note' | 'other';
  subject: string;
  description: string;
  duration?: number;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMTask {
  _id: string;
  leadId?: any;
  assignedTo: any;
  createdBy: any;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const crmService = {
  getLeadActivities: async (leadId: string) => {
    const data = await apiClient.get<any>(`/crm/leads/${leadId}/activities`);
    return { data: data?.data || data || [] };
  },
  
  createActivity: async (activityData: Partial<CRMActivity>) => {
    const data = await apiClient.post<any>('/crm/activities', activityData);
    return { data: data?.data || data };
  },
  
  getMyTasks: async (params?: { status?: string }) => {
    const queryStr = params?.status ? `?status=${params.status}` : '';
    const data = await apiClient.get<any>(`/crm/tasks${queryStr}`);
    return { data: data?.data || data || [] };
  },
  
  createTask: async (taskData: Partial<CRMTask>) => {
    const data = await apiClient.post<any>('/crm/tasks', taskData);
    return { data: data?.data || data };
  },
  
  updateTaskStatus: async (taskId: string, status: string) => {
    const data = await apiClient.put<any>(`/crm/tasks/${taskId}`, { status });
    return { data: data?.data || data };
  }
};
