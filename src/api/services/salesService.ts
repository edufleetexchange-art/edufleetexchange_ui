import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '../types';
import { Lead } from './marketingService';

export interface SalesStats {
  totalRevenue: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalLeads: number;
  newLeads: number;
}

export interface SubscriptionRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    instituteName?: string;
    phone?: string;
  };
  currentPlanId: {
    _id: string;
    displayName: string;
    price: number;
  };
  requestedPlanId: {
    _id: string;
    displayName: string;
    price: number;
  };
  requestType: 'upgrade' | 'downgrade' | 'renewal';
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const salesService = {
  /**
   * Get sales dashboard stats
   */
  async getStats(): Promise<ApiResponse<SalesStats>> {
    try {
      const data = await apiClient.get<SalesStats>('/sales/stats', { requiresAuth: true });
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch sales stats',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get subscription requests
   */
  async getRequests(filters: { status?: string, page?: number, pageSize?: number } = {}): Promise<ApiResponse<PaginatedResponse<SubscriptionRequest>>> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

      const data = await apiClient.get<PaginatedResponse<SubscriptionRequest>>(`/sales/requests?${params.toString()}`, { requiresAuth: true });
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch subscription requests',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Update request status (Close Deal)
   */
  async updateRequestStatus(id: string, data: { status: 'approved' | 'rejected', adminNotes?: string }): Promise<ApiResponse<SubscriptionRequest>> {
    try {
      const result = await apiClient.put<SubscriptionRequest>(`/sales/requests/${id}`, data, { requiresAuth: true });
      return {
        success: true,
        data: result,
        message: 'Request updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update request status',
        timestamp: new Date().toISOString()
      };
    }
  },

  // New methods for Sales
  getLeads: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<{ items: Lead[]; total: number; hasMore: boolean }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }
      const endpoint = `/sales/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await apiClient.get<{ items: Lead[]; total: number; hasMore: boolean }>(endpoint, { requiresAuth: true });
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (error: any) {
      throw { success: false, error: error.message || 'Failed to fetch leads', timestamp: new Date().toISOString() };
    }
  },

  updateLeadStatus: async (id: string, data: { status: string; notes?: string }): Promise<ApiResponse<Lead>> => {
    try {
      const response = await apiClient.put<Lead>(`/sales/leads/${id}`, data, { requiresAuth: true });
      return { success: true, data: response, timestamp: new Date().toISOString() };
    } catch (error: any) {
      throw { success: false, error: error.message || 'Failed to update lead', timestamp: new Date().toISOString() };
    }
  },

  createUser: async (userData: any): Promise<ApiResponse<any>> => {
    try {
      const data = await apiClient.post<any>('/sales/users', userData, { requiresAuth: true });
      return { success: true, data, message: 'User created successfully', timestamp: new Date().toISOString() };
    } catch (error: any) {
      throw { success: false, error: error.message || 'Failed to create user', timestamp: new Date().toISOString() };
    }
  },

  createListing: async (listingData: any): Promise<ApiResponse<any>> => {
    try {
      const data = await apiClient.post<any>('/sales/listings', listingData, { requiresAuth: true });
      return { success: true, data, message: 'Listing created successfully', timestamp: new Date().toISOString() };
    } catch (error: any) {
      throw { success: false, error: error.message || 'Failed to create listing', timestamp: new Date().toISOString() };
    }
  },

  createVendor: async (vendorData: any): Promise<ApiResponse<any>> => {
    try {
      const data = await apiClient.post<any>('/sales/vendors', vendorData, { requiresAuth: true });
      return { success: true, data, message: 'Vendor created successfully', timestamp: new Date().toISOString() };
    } catch (error: any) {
      throw { success: false, error: error.message || 'Failed to create vendor', timestamp: new Date().toISOString() };
    }
  }
};
