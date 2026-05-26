// Subscription enforcement with real backend API implementation
import { apiClient, APIError } from '@/lib/apiClient';
import {
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  ApiResponse,
  JobPostCheckResult,
} from '../types';

// 401 from a quota endpoint means the caller has no session — guests have no
// subscription-level quota and should be allowed to browse public content.
// (Server-side route protection enforces auth where it actually matters.)
const isUnauthorized = (err: unknown): boolean =>
  err instanceof APIError && err.statusCode === 401;

// ==========================================
// BROWSE LIMIT ENFORCEMENT
// ==========================================

export const checkBrowseLimit = async (): Promise<ApiResponse<BrowseCheckResult>> => {
  try {
    const response = await apiClient.get<BrowseCheckResult>('/subscriptions/check/browse-limit');
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // Unauthenticated → no quota applies (guest browsing the public site).
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { allowed: true, remaining: -1, limitReached: false, subscription: null },
        timestamp: new Date().toISOString(),
      };
    }
    // Otherwise fail closed: when the backend is unreachable we must not silently allow browsing.
    return {
      success: false,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription: null,
        message: 'Unable to verify browse limit — please try again.',
      },
      message: 'check_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementBrowseCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>('/subscriptions/increment/browse-count');
    return {
      success: true,
      data: { success: response.success },
      message: response.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // 401 means no active session — guests have no quota state to update.
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { success: true },
        message: 'skipped: no session',
        timestamp: new Date().toISOString(),
      };
    }
    // Real server/network error — surface it. The server is source of truth;
    // we must NOT silently mock a successful increment.
    console.error('[subscriptionEnforcement] mutation failed:', error);
    return {
      success: false,
      data: { success: false },
      message: error instanceof Error ? error.message : 'mutation_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// LISTING LIMIT ENFORCEMENT
// ==========================================

export const checkListingLimit = async (): Promise<ApiResponse<ListingCheckResult>> => {
  try {
    const response = await apiClient.get<ListingCheckResult>('/subscriptions/check/listing-limit');
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { allowed: true, remaining: -1, limitReached: false, subscription: null },
        timestamp: new Date().toISOString(),
      };
    }
    // Fail closed: when the backend is unreachable we must not silently allow listings.
    return {
      success: false,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription: null,
        message: 'Unable to verify listing limit — please try again.',
      },
      message: 'check_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementListingCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>('/subscriptions/increment/listing-count');
    return {
      success: true,
      data: { success: response.success },
      message: response.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // 401 means no active session — guests have no quota state to update.
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { success: true },
        message: 'skipped: no session',
        timestamp: new Date().toISOString(),
      };
    }
    // Real server/network error — surface it. The server is source of truth;
    // we must NOT silently mock a successful increment.
    console.error('[subscriptionEnforcement] mutation failed:', error);
    return {
      success: false,
      data: { success: false },
      message: error instanceof Error ? error.message : 'mutation_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

export const decrementListingCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>('/subscriptions/decrement/listing-count');
    return {
      success: true,
      data: { success: response.success },
      message: response.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // 401 means no active session — guests have no quota state to update.
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { success: true },
        message: 'skipped: no session',
        timestamp: new Date().toISOString(),
      };
    }
    // Real server/network error — surface it. The server is source of truth;
    // we must NOT silently mock a successful decrement.
    console.error('[subscriptionEnforcement] mutation failed:', error);
    return {
      success: false,
      data: { success: false },
      message: error instanceof Error ? error.message : 'mutation_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// JOB POSTING LIMIT ENFORCEMENT
// ==========================================

export const checkJobPostLimit = async (): Promise<ApiResponse<JobPostCheckResult>> => {
  try {
    const response = await apiClient.get<JobPostCheckResult>('/subscriptions/check/job-post-limit');
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { allowed: true, remaining: -1, limitReached: false, subscription: null },
        timestamp: new Date().toISOString(),
      };
    }
    // Fail closed: when the backend is unreachable we must not silently allow job posts.
    return {
      success: false,
      data: {
        allowed: false,
        remaining: 0,
        limitReached: true,
        subscription: null,
        message: 'Unable to verify job post limit — please try again.',
      },
      message: 'check_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

export const incrementJobPostCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>('/subscriptions/increment/job-post-count');
    return {
      success: true,
      data: { success: response.success },
      message: response.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // 401 means no active session — guests have no quota state to update.
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { success: true },
        message: 'skipped: no session',
        timestamp: new Date().toISOString(),
      };
    }
    // Real server/network error — surface it. The server is source of truth;
    // we must NOT silently mock a successful increment.
    console.error('[subscriptionEnforcement] mutation failed:', error);
    return {
      success: false,
      data: { success: false },
      message: error instanceof Error ? error.message : 'mutation_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

export const decrementJobPostCount = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>('/subscriptions/decrement/job-post-count');
    return {
      success: true,
      data: { success: response.success },
      message: response.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // 401 means no active session — guests have no quota state to update.
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: { success: true },
        message: 'skipped: no session',
        timestamp: new Date().toISOString(),
      };
    }
    // Real server/network error — surface it. The server is source of truth;
    // we must NOT silently mock a successful decrement.
    console.error('[subscriptionEnforcement] mutation failed:', error);
    return {
      success: false,
      data: { success: false },
      message: error instanceof Error ? error.message : 'mutation_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// LISTING VISIBILITY ENFORCEMENT
// ==========================================

export const checkListingVisibility = async (
  listingId: string
): Promise<ApiResponse<VisibilityCheckResult>> => {
  try {
    const response = await apiClient.get<VisibilityCheckResult>(`/subscriptions/check/listing-visibility/${listingId}`);
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    if (isUnauthorized(error)) {
      // Guests viewing a public listing — no visibility delay applies.
      return {
        success: true,
        data: {
          visible: true,
          delayHours: 0,
          availableAt: new Date().toISOString(),
          subscription: null,
        },
        timestamp: new Date().toISOString(),
      };
    }
    // Fail closed: when the backend is unreachable treat listing as not yet visible.
    return {
      success: false,
      data: {
        visible: false,
        delayHours: 0,
        availableAt: new Date().toISOString(),
        subscription: null,
      },
      message: 'check_failed',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// SUBSCRIPTION STATUS CHECK
// ==========================================

export const getSubscriptionStatus = async (): Promise<
  ApiResponse<{
    plan: string;
    features: Record<string, any>;
    expiresAt: string | null;
  }>
> => {
  try {
    const response = await apiClient.get<{ plan: string; features: Record<string, any>; expiresAt: string | null }>('/subscriptions/status');
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Mock fallback - basic plan
    return {
      success: true,
      data: {
        plan: 'free',
        features: {
          browseLimit: 50,
          listingLimit: 5,
          jobPostLimit: 10,
        },
        expiresAt: null,
      },
      message: 'Mock subscription status',
      timestamp: new Date().toISOString(),
    };
  }
};

// ==========================================
// USAGE STATS
// ==========================================

export const getUsageStats = async (): Promise<
  ApiResponse<{
    browse: { used: number; limit: number };
    listings: { used: number; limit: number };
    jobPosts: { used: number; limit: number };
  }>
> => {
  try {
    const response = await apiClient.get<{ browse: { used: number; limit: number }; listings: { used: number; limit: number }; jobPosts: { used: number; limit: number } }>('/subscriptions/usage-stats');
    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    if (isUnauthorized(error)) {
      return {
        success: true,
        data: {
          browse: { used: 0, limit: -1 },
          listings: { used: 0, limit: -1 },
          jobPosts: { used: 0, limit: -1 },
        },
        message: 'skipped: no session',
        timestamp: new Date().toISOString(),
      };
    }
    console.error('[subscriptionEnforcement] getUsageStats failed:', error);
    return {
      success: false,
      data: {
        browse: { used: 0, limit: 0 },
        listings: { used: 0, limit: 0 },
        jobPosts: { used: 0, limit: 0 },
      },
      message: error instanceof Error ? error.message : 'fetch_failed',
      timestamp: new Date().toISOString(),
    };
  }
};
