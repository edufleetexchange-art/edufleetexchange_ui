import { apiClient } from '@/lib/apiClient';
import {
  ApiResponse,
  Vehicle,
  ApprovalRequest,
  PriorityToggleRequest,
  AuditLog,
  AuditLogFilters,
} from '../types';

interface VehicleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  priority: number;
}

interface AdminDashboardStats {
  vehicles: VehicleStats;
  users: number;
  jobs: number;
  suppliers: number;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<AdminDashboardStats>> {
    try {
      const data = await apiClient.get<AdminDashboardStats>('/admin/stats', { requiresAuth: true });

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all pending approvals
   */
  async getPendingApprovals(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>('/admin/pending', { requiresAuth: true });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch pending approvals',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Approve or reject a vehicle
   */
  async updateApprovalStatus(request: ApprovalRequest): Promise<ApiResponse<Vehicle>> {
    try {
      const { vehicleId, status, reason } = request;

      const vehicle = await apiClient.put<Vehicle>(
        `/admin/approve/${vehicleId}`,
        {
          status,
          reason,
        },
        { requiresAuth: true }
      );

      return {
        success: true,
        data: vehicle,
        message: `Vehicle ${status} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update approval status',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Toggle priority status
   */
  async togglePriority(request: PriorityToggleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      const { vehicleId, isPriority } = request;

      const vehicle = await apiClient.put<Vehicle>(
        `/admin/priority/${vehicleId}`,
        {
          isPriority,
        },
        { requiresAuth: true }
      );

      return {
        success: true,
        data: vehicle,
        message: `Priority ${isPriority ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to toggle priority',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all vehicles (admin view)
   */
  async getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const vehicles = await apiClient.get<Vehicle[]>('/vehicles?status=all', { requiresAuth: true });

      return {
        success: true,
        data: vehicles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch vehicles',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all users
   */
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    try {
      const users = await apiClient.get<any[]>('/admin/users', { requiresAuth: true });

      return {
        success: true,
        data: users,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch users',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update user status and subscription
   */
  async updateUserStatus(
    userId: string,
    data: { isActive?: boolean; planId?: string; notes?: string }
  ): Promise<ApiResponse<any>> {
    try {
      const user = await apiClient.put<any>(`/admin/users/${userId}/status`, data, { requiresAuth: true });

      return {
        success: true,
        data: user,
        message: `User updated successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update user',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Create a new user (admin)
   */
  async createUser(data: any): Promise<ApiResponse<any>> {
    try {
      const user = await apiClient.post<any>('/admin/users', data, { requiresAuth: true });

      return {
        success: true,
        data: user,
        message: 'User created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to create user',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete a user (admin)
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete<void>(`/admin/users/${userId}`, { requiresAuth: true });

      return {
        success: true,
        data: undefined,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to delete user',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get audit logs (admin)
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<ApiResponse<AuditLog[]>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const logs = await apiClient.get<AuditLog[]>(
        `/admin/audit-logs?${params.toString()}`,
        { requiresAuth: true }
      );

      return {
        success: true,
        data: logs,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch audit logs',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Approve/Reject supplier with optional plan update
   */
  async approveSupplierStatus(
    supplierId: string,
    data: { status: 'approved' | 'rejected'; planId?: string; notes?: string }
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(`/admin/suppliers/${supplierId}/approve`, data, {
        requiresAuth: true,
      });

      return {
        success: true,
        data: response,
        message: `Supplier ${data.status} successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update supplier status',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all categories
   */
  async getCategories(type?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = type ? `/admin/categories?type=${type}` : '/admin/categories';
      const categories = await apiClient.get<any[]>(url, { requiresAuth: true });

      return {
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch categories',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Create category
   */
  async createCategory(data: any): Promise<ApiResponse<any>> {
    try {
      const category = await apiClient.post<any>('/admin/categories', data, { requiresAuth: true });

      return {
        success: true,
        data: category,
        message: 'Category created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to create category',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update category
   */
  async updateCategory(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const category = await apiClient.put<any>(`/admin/categories/${id}`, data, { requiresAuth: true });

      return {
        success: true,
        data: category,
        message: 'Category updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update category',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete<void>(`/admin/categories/${id}`, { requiresAuth: true });

      return {
        success: true,
        data: undefined,
        message: 'Category deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to delete category',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get system settings
   */
  async getSettings(): Promise<ApiResponse<any[]>> {
    try {
      const settings = await apiClient.get<any[]>('/admin/settings', { requiresAuth: true });

      return {
        success: true,
        data: settings,
       timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to fetch settings',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update system setting
   */
  async updateSetting(key: string, data: any): Promise<ApiResponse<any>> {
    try {
      const setting = await apiClient.put<any>(`/admin/settings/${key}`, data, { requiresAuth: true });

      return {
        success: true,
        data: setting,
        message: 'Setting updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        success: false,
        error: error.message || 'Failed to update setting',
        timestamp: new Date().toISOString(),
      };
    }
  },
};