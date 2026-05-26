import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUsageStats,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AssignSubscriptionDto,
  ExtendSubscriptionDto,
  ResetBrowseCountDto,
  SuspendSubscriptionDto,
  SubscriptionStats,
  SubscriptionPlanStats,
  SubscriptionFilters,
  ApiResponse,
  PaginatedResponse,
  SubscriptionRequest,
  CreateSubscriptionRequestDto,
  UpdateSubscriptionRequestDto,
} from '../types';
import { apiClient } from '@/lib/apiClient';
import { authService } from './authService';

// Cache for plans to avoid redundant calls
let plansCache: ApiResponse<SubscriptionPlan[]> | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==========================================
//SUBSCRIPTION PLAN CRUD
// ==========================================

export const getAllSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  const data = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getActiveSubscriptionPlans = async (
  force = false, 
  planType?: 'teacher' | 'institute' | 'vendor'
): Promise<ApiResponse<SubscriptionPlan[]>> => {
  const now = Date.now();
  
  // Cache key includes planType to avoid returning wrong plans
  const cacheKey = `plans_${planType || 'all'}`;
  
  if (!force && plansCache && now - lastCacheTime < CACHE_DURATION && !planType) {
    console.log('[SubscriptionService] Returning cached active plans');
    return plansCache;
  }

  // Build query params
  const params = planType ? `?planType=${planType}` : '';
  
  const data = await apiClient.get<SubscriptionPlan[]>(
    `/subscriptions/plans/active${params}`, 
    { requiresAuth: false }
  );
  
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  
  // Only cache if no specific planType (general request)
  if (!planType) {
    plansCache = response;
    lastCacheTime = now;
  }
  
  return response;
};

export const getSubscriptionPlanById = async (planId: string): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.get<SubscriptionPlan>(`/subscriptions/plans/${planId}`);
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const createSubscriptionPlan = async (
  dto: CreateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.post<SubscriptionPlan>('/subscriptions/plans', dto);
  return {
    success: true,
    data,
    message: 'Subscription plan created successfully',
    timestamp: new Date().toISOString(),
  };
};

export const updateSubscriptionPlan = async (
  dto: UpdateSubscriptionPlanDto
): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${dto.id}`, dto);
  return {
    success: true,
    data,
    message: 'Subscription plan updated successfully',
    timestamp: new Date().toISOString(),
  };
};

export const toggleSubscriptionPlanStatus = async (
  planId: string
): Promise<ApiResponse<SubscriptionPlan>> => {
  const data = await apiClient.put<SubscriptionPlan>(`/subscriptions/plans/${planId}/toggle-status`, {});
  return {
    success: true,
    data,
    message: `Subscription plan ${data.isActive ? 'activated' : 'deactivated'}`,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// USER SUBSCRIPTION MANAGEMENT
// ==========================================

export const getUserSubscription = async (
  userId: string
): Promise<ApiResponse<UserSubscription | null>> => {
  // Guard against undefined/null userId
  if (!userId) {
    console.warn('[SubscriptionService] getUserSubscription called with no userId');
    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  // Read from the new AuthBundle — Task 18 migration.
  const bundle = await authService.me();
  return {
    success: true,
    data: (bundle?.subscription ?? null) as unknown as UserSubscription | null,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Fetch the subscription for an arbitrary account (admin use).
 * Calls GET /subscriptions/user/:accountId — the documented per-account
 * endpoint — instead of relying on the hidden $lookup the admin user-list
 * endpoint performs. Returns null on any error so callers can fall back
 * gracefully.
 */
export const getSubscriptionByAccountId = async (
  accountId: string
): Promise<import('../types').Subscription | null> => {
  if (!accountId) return null;
  try {
    const data = await apiClient.get<import('../types').Subscription>(`/subscriptions/user/${accountId}`);
    return data ?? null;
  } catch {
    return null;
  }
};

export const getAllUserSubscriptions = async (): Promise<ApiResponse<UserSubscription[]>> => {
  const data = await apiClient.get<UserSubscription[]>('/subscriptions/user');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const assignSubscriptionToUser = async (
  dto: AssignSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.post<UserSubscription>('/subscriptions/assign', dto);
  return {
    success: true,
    data,
    message: 'Subscription assigned successfully',
    timestamp: new Date().toISOString(),
  };
};

export const extendUserSubscription = async (
  dto: ExtendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${dto.userSubscriptionId}/extend`, dto);
  return {
    success: true,
    data,
    message: 'Subscription extended successfully',
    timestamp: new Date().toISOString(),
  };
};

export const continueSubscription = async (
  dto: Omit<ExtendSubscriptionDto, 'userSubscriptionId'> & { userSubscriptionId: string } // Fix type mismatch
): Promise<ApiResponse<UserSubscription>> => {
  return extendUserSubscription(dto);
};

export const resetBrowseCount = async (
  dto: ResetBrowseCountDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${dto.userSubscriptionId}/reset-browse`, dto);
  return {
    success: true,
    data,
    message: 'Browse count reset successfully',
    timestamp: new Date().toISOString(),
  };
};

export const suspendUserSubscription = async (
  dto: SuspendSubscriptionDto
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${dto.userSubscriptionId}/suspend`, dto);
  return {
    success: true,
    data,
    message: 'Subscription suspended',
    timestamp: new Date().toISOString(),
  };
};

export const reactivateUserSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${subscriptionId}/reactivate`, {});
  return {
    success: true,
    data,
    message: 'Subscription reactivated successfully',
    timestamp: new Date().toISOString(),
  };
};

export const cancelUserSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.delete<UserSubscription>(`/subscriptions/${subscriptionId}`);
  return {
    success: true,
    data,
    message: 'Subscription cancelled successfully',
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// SUBSCRIPTION USAGE & STATS
// ==========================================

const EMPTY_USAGE_STATS: SubscriptionUsageStats = {
  browseCount:   { used: 0, allowed: 0, remaining: 0, percentage: 0 },
  listingCount:  { used: 0, allowed: 0, remaining: 0, percentage: 0 },
  jobPostsCount: { used: 0, allowed: 0, remaining: 0, percentage: 0 },
  daysRemaining: 0,
  isExpiringSoon: false,
  isExpired: false,
};

export const getSubscriptionUsageStats = async (
  userId: string
): Promise<ApiResponse<SubscriptionUsageStats>> => {
  // Guard against undefined/null userId
  if (!userId) {
    console.warn('[SubscriptionService] getSubscriptionUsageStats called with no userId');
    return {
      success: true,
      data: EMPTY_USAGE_STATS,
      timestamp: new Date().toISOString(),
    };
  }

  // Derive stats from the new AuthBundle — Task 18 migration.
  const bundle = await authService.me();
  const sub = bundle?.subscription ?? null;
  if (!sub) {
    return { success: true, data: EMPTY_USAGE_STATS, timestamp: new Date().toISOString() };
  }

  const now = Date.now();
  const endMs = sub.endDate ? new Date(sub.endDate).getTime() : now;
  const daysRemaining = Math.max(0, Math.ceil((endMs - now) / 86_400_000));
  const isExpired = sub.status === 'expired' || endMs < now;

  const browseAllowed = sub.browseCountLimit || 0;
  const browseUsed    = sub.browseCount      || 0;
  const listingAllowed = sub.listingsLimit   || 0;
  const listingUsed    = sub.listingsUsed    || 0;
  const jobAllowed     = sub.jobPostsLimit   || 0;
  const jobUsed        = sub.jobPostsUsed    || 0;

  const stats: SubscriptionUsageStats = {
    browseCount: {
      used: browseUsed,
      allowed: browseAllowed,
      remaining: Math.max(0, browseAllowed - browseUsed),
      percentage: browseAllowed > 0 ? Math.round((browseUsed / browseAllowed) * 100) : 0,
    },
    listingCount: {
      used: listingUsed,
      allowed: listingAllowed,
      remaining: Math.max(0, listingAllowed - listingUsed),
      percentage: listingAllowed > 0 ? Math.round((listingUsed / listingAllowed) * 100) : 0,
    },
    jobPostsCount: {
      used: jobUsed,
      allowed: jobAllowed,
      remaining: Math.max(0, jobAllowed - jobUsed),
      percentage: jobAllowed > 0 ? Math.round((jobUsed / jobAllowed) * 100) : 0,
    },
    daysRemaining,
    isExpiringSoon: !isExpired && daysRemaining <= 7,
    isExpired,
  };

  return { success: true, data: stats, timestamp: new Date().toISOString() };
};

export const getGlobalSubscriptionStats = async (): Promise<ApiResponse<SubscriptionStats>> => {
  const data = await apiClient.get<SubscriptionStats>('/subscriptions/stats');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getSubscriptionPlanStats = async (): Promise<ApiResponse<SubscriptionPlanStats[]>> => {
  const data = await apiClient.get<SubscriptionPlanStats[]>('/subscriptions/plan-stats');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const getFilteredUserSubscriptions = async (
  filters: SubscriptionFilters
): Promise<ApiResponse<PaginatedResponse<UserSubscription>>> => {
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== 'all' as any) {
    params.append('status', filters.status);
  }
  if (filters.planId && filters.planId !== 'all') {
    params.append('planId', filters.planId);
  }
  if (filters.search || filters.searchTerm) {
    params.append('search', filters.search || filters.searchTerm || '');
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.pageSize) {
    params.append('pageSize', filters.pageSize.toString());
  }
  
  const data = await apiClient.get<PaginatedResponse<UserSubscription>>(`/subscriptions/filtered?${params.toString()}`);
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// SUBSCRIPTION REQUESTS
// ==========================================

export const createSubscriptionRequest = async (
  dto: CreateSubscriptionRequestDto
): Promise<ApiResponse<SubscriptionRequest>> => {
  const data = await apiClient.post<SubscriptionRequest>('/subscriptions/requests', dto);
  return {
    success: true,
    data,
    message: 'Subscription request submitted successfully',
    timestamp: new Date().toISOString(),
  };
};

export const getAllSubscriptionRequests = async (
  filters?: { status?: string; userId?: string }
): Promise<ApiResponse<SubscriptionRequest[]>> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.userId) params.append('userId', filters.userId);
  
  const data = await apiClient.get<any[]>(`/subscriptions/requests?${params.toString()}`);
  
  // Map backend response to frontend types
  const mappedData = data.map(item => ({
    ...item,
    id: item._id || item.id,
    user: item.userId,
    userId: item.userId?._id || item.userId?.id || item.userId,
    currentPlan: item.currentPlanId,
    currentPlanId: item.currentPlanId?._id || item.currentPlanId,
    requestedPlan: item.requestedPlanId,
    requestedPlanId: item.requestedPlanId?._id || item.requestedPlanId,
  }));

  return {
    success: true,
    data: mappedData,
    timestamp: new Date().toISOString(),
  };
};

export const getMySubscriptionRequests = async (): Promise<ApiResponse<SubscriptionRequest[]>> => {
  const data = await apiClient.get<any[]>('/subscriptions/requests/my');
  
  // Map backend response to frontend types
  const mappedData = data.map(item => ({
    ...item,
    id: item._id || item.id,
    user: item.userId,
    userId: item.userId?._id || item.userId?.id || item.userId,
    currentPlan: item.currentPlanId,
    currentPlanId: item.currentPlanId?._id || item.currentPlanId,
    requestedPlan: item.requestedPlanId,
    requestedPlanId: item.requestedPlanId?._id || item.requestedPlanId,
  }));

  return {
    success: true,
    data: mappedData,
    timestamp: new Date().toISOString(),
  };
};

export const updateSubscriptionRequest = async (
  requestId: string,
  dto: UpdateSubscriptionRequestDto
): Promise<ApiResponse<SubscriptionRequest>> => {
  const data = await apiClient.put<SubscriptionRequest>(`/subscriptions/requests/${requestId}`, dto);
  return {
    success: true,
    data,
    message: `Subscription request ${dto.status}`,
    timestamp: new Date().toISOString(),
  };
};

export const changeUserSubscriptionPlan = async (
  subscriptionId: string,
  newPlanId: string,
  notes?: string
): Promise<ApiResponse<UserSubscription>> => {
  const data = await apiClient.put<UserSubscription>(`/subscriptions/${subscriptionId}/change-plan`, {
    planId: newPlanId,
    notes
  });
  return {
    success: true,
    data,
    message: 'Subscription plan changed successfully',
    timestamp: new Date().toISOString(),
  };
};

// ==========================================
// PERSONA-BASED ACCESS CONTROL
// ==========================================

export const getPersonaAccessControl = async (): Promise<any> => {
  const data = await apiClient.get('/access/me');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const checkVehicleListingAccess = async (): Promise<any> => {
  const data = await apiClient.get('/access/vehicle-listing');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const checkJobPostAccess = async (): Promise<any> => {
  const data = await apiClient.get('/access/job-post');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const checkJobApplicationAccess = async (): Promise<any> => {
  const data = await apiClient.get('/access/job-application');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const checkProductListingAccess = async (): Promise<any> => {
  const data = await apiClient.get('/access/product-listing');
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};
export const subscriptionService = {
  getAllSubscriptionPlans,
  getActiveSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  toggleSubscriptionPlanStatus,

  getUserSubscription,
  getAllUserSubscriptions,
  assignSubscriptionToUser,
  extendUserSubscription,
  continueSubscription,
  resetBrowseCount,
  suspendUserSubscription,
  reactivateUserSubscription,
  cancelUserSubscription,

  getSubscriptionUsageStats,
};