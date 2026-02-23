import { apiClient } from '@/lib/apiClient';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: string;
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
    const response = await apiClient.get('/public/categories', {
      params: { type },
    });
    console.log('***************************************')
    console.log('Fetched categories11111:', response[0]);
    return response;
  },

  /**
   * Get public system settings
   */
  getSettings: async (): Promise<SystemSetting[]> => {
    const response = await apiClient.get('/public/settings');
    console.log('Fetched settings:', response);
    return response;
  },
};
