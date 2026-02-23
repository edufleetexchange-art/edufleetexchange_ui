import { apiClient } from '@/lib/apiClient';
import { ApiResponse } from '../types';

export interface MarketingStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  closedLeads: number;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  instituteName?: string;
  type: 'institute' | 'teacher' | 'vendor' | 'individual';
  status: 'new' | 'contacted' | 'negotiating' | 'closed' | 'lost';
  notes: string;
  generatedBy: string;
  isMarketingOnly?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const marketingService = {
  /**
   * Get marketing dashboard stats
   */
  getStats: async (): Promise<ApiResponse<MarketingStats>> => {
    try {
      const data = await apiClient.get<MarketingStats>('/marketing/stats', { requiresAuth: true });
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch marketing stats',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get leads
   */
  getLeads: async (params?: { status?: string, page?: number, pageSize?: number }): Promise<ApiResponse<{ items: Lead[]; total: number; hasMore: boolean }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.append(key, String(value));
        });
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/marketing/leads${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<{ items: Lead[]; total: number; hasMore: boolean }>(endpoint, { requiresAuth: true });
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch leads',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Create a lead
   */
  createLead: async (leadData: Partial<Lead>): Promise<ApiResponse<Lead>> => {
    try {
      const data = await apiClient.post<Lead>('/marketing/leads', leadData, { requiresAuth: true });
      return {
        success: true,
        data,
        message: 'Lead created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to create lead',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get audit logs for the marketing specialist
   */
  getAuditLogs: async (): Promise<ApiResponse<any[]>> => {
    try {
      const data = await apiClient.get<any[]>('/marketing/audit-logs', { requiresAuth: true });
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch audit logs',
        timestamp: new Date().toISOString()
      };
    }
  }
};
