import { apiClient } from '@/lib/apiClient';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'vehicle' | 'job' | 'supplier';
  description?: string;
  isActive: boolean;
  order: number;
}

export interface SystemSetting {
  _id: string;
  key: string;
  value: any;
  description?: string;
  group: string;
  isPublic: boolean;
}

export const publicService = {
  /**
   * Get all active categories
   */
  getCategories: async (type?: string): Promise<Category[]> => {
    const endpoint = type ? `/public/categories?type=${type}` : '/public/categories';
    const data = await apiClient.get<Category[]>(endpoint, { requiresAuth: false });
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get public system settings
   */
  getSettings: async (): Promise<SystemSetting[]> => {
    const data = await apiClient.get<SystemSetting[]>('/public/settings', { requiresAuth: false });
    return Array.isArray(data) ? data : [];
  },
};
