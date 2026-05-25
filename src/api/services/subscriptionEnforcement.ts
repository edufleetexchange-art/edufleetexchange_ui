// Subscription enforcement with real backend API implementation
import { apiClient } from '@/lib/apiClient';
import {
  BrowseCheckResult,
  ListingCheckResult,
  VisibilityCheckResult,
  ApiResponse,
  JobPostCheckResult,
} from '../types';

// Helper for mock data
const getMockBrowseCount = () => {
  try {
    const stored = localStorage.getItem('mock_browse_count');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

const setMockBrowseCount = (count: number) => {
  try {
    localStorage.setItem('mock_browse_count', count.toString());
  } catch (e) {
    console.error('Failed to save mock browse count', e);
  }
};

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
  } catch (error: any) {
    // Fail closed: when the backend is unreachable we must not silently allow browsing.
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
  } catch (error: any) {
    // Mock fallback
    const current = getMockBrowseCount();
    setMockBrowseCount(current + 1);

    return {
      success: true,
      data: { success: true },
      message: 'Mock increment successful',
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
  } catch (error: any) {
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
  } catch (error: any) {
    // Mock fallback
    const mockListingCount = localStorage.getItem('mock_listing_count');
    const current = mockListingCount ? parseInt(mockListingCount, 10) : 0;
    localStorage.setItem('mock_listing_count', (current + 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock increment successful',
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
  } catch (error: any) {
    // Mock fallback
    const mockListingCount = localStorage.getItem('mock_listing_count');
    const current = mockListingCount ? parseInt(mockListingCount, 10) : 0;
    localStorage.setItem('mock_listing_count', Math.max(0, current - 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock decrement successful',
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
  } catch (error: any) {
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
  } catch (error: any) {
    // Mock fallback
    const mockJobCount = localStorage.getItem('mock_job_count');
    const current = mockJobCount ? parseInt(mockJobCount, 10) : 0;
    localStorage.setItem('mock_job_count', (current + 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock job post increment successful',
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
  } catch (error: any) {
    // Mock fallback
    const mockJobCount = localStorage.getItem('mock_job_count');
    const current = mockJobCount ? parseInt(mockJobCount, 10) : 0;
    localStorage.setItem('mock_job_count', Math.max(0, current - 1).toString());

    return {
      success: true,
      data: { success: true },
      message: 'Mock job post decrement successful',
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
  } catch (error: any) {
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
  } catch (error: any) {
    // Mock fallback
    const browseCount = getMockBrowseCount();
    const listingCount = localStorage.getItem('mock_listing_count');
    const jobCount = localStorage.getItem('mock_job_count');

    return {
      success: true,
      data: {
        browse: { used: browseCount, limit: 50 },
        listings: { used: parseInt(listingCount || '0', 10), limit: 5 },
        jobPosts: { used: parseInt(jobCount || '0', 10), limit: 10 },
      },
      message: 'Mock usage stats',
      timestamp: new Date().toISOString(),
    };
  }
};
