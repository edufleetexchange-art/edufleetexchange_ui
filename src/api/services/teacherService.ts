import { apiClient, APIError } from '@/lib/apiClient';
import { API_CONFIG } from '../config';
import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * Teacher Service
 * Handles all teacher-related API operations
 */

// Teacher types
export interface Teacher {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  qualifications: string[];
  subjects: string[];
  bio: string;
  resume?: string;
  avatar: string;
  isAvailable: boolean;
  instituteSearchability?: boolean;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  preferredJobType?: string[];
  createdAt?: string;
  status?: 'active' | 'inactive';
}

export interface Application {
  id: string;
  teacherId: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  coverLetter?: string;
}

export interface TeacherFilters {
  searchTerm?: string;
  subjects?: string[];
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

// Response shape returned by the new /api/teachers endpoint
interface TeacherSearchItem {
  profile: {
    experience?: number;
    qualifications?: string[];
    subjects?: string[];
    bio?: string;
    location?: string;
    isAvailable?: boolean;
  };
  account: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    createdAt?: string;
    status?: 'active' | 'inactive';
  };
}

interface TeacherSearchResponse {
  items: TeacherSearchItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Map a { profile, account } item from /api/teachers into the flat Teacher shape
 * expected by all existing callers.
 */
function mapTeacherItem(item: TeacherSearchItem): Teacher {
  return {
    id: item.account.id || item.account._id,
    _id: item.account._id || item.account.id,
    name: item.account.name || '',
    email: item.account.email || '',
    phone: item.account.phone || '',
    location: item.profile.location || '',
    experience: item.profile.experience ?? 0,
    qualifications: item.profile.qualifications || [],
    subjects: item.profile.subjects || [],
    bio: item.profile.bio || '',
    avatar: item.account.avatar || '',
    isAvailable: item.profile.isAvailable ?? true,
    createdAt: item.account.createdAt,
    status: item.account.status,
  };
}

/**
 * Get all teachers with optional filters
 */
export async function getTeachers(
  filters?: TeacherFilters
): Promise<ApiResponse<PaginatedResponse<Teacher>>> {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.subjects && filters.subjects.length > 0) {
        queryParams.append('subject', filters.subjects.join(','));
      }
      if (filters.experienceMin !== undefined) {
        queryParams.append('minExperience', String(filters.experienceMin));
      }
      if (filters.location) {
        queryParams.append('location', filters.location);
      }
      if (filters.page !== undefined) {
        queryParams.append('page', String(filters.page));
      }
      if (filters.pageSize !== undefined) {
        queryParams.append('pageSize', String(filters.pageSize));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = `/teachers${queryString ? `?${queryString}` : ''}`;

    const raw = await apiClient.get<TeacherSearchResponse>(endpoint);

    const mapped: PaginatedResponse<Teacher> = {
      items: (raw.items || []).map(mapTeacherItem),
      total: raw.total ?? 0,
      page: raw.page ?? 1,
      pageSize: raw.pageSize ?? 20,
      hasMore: raw.hasMore ?? false,
    };

    return {
      success: true,
      data: mapped,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch teachers');
  }
}

/**
 * Get single teacher by ID
 */
export async function getTeacherById(id: string): Promise<ApiResponse<Teacher | null>> {
  try {
    const teacher = await apiClient.get<Teacher>(`/users/${id}`, { requiresAuth: false });
    
    return {
      success: true,
      data: teacher,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch teacher');
  }
}

/**
 * Get applications for a specific teacher
 */
export async function getApplicationsForTeacher(
  teacherId: string
): Promise<ApiResponse<Application[]>> {
  try {
    const applications = await apiClient.get<Application[]>(API_CONFIG.ENDPOINTS.MY_JOB_APPLICATIONS);
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch applications');
  }
}

/**
 * Get interviews for a specific teacher
 */
export async function getInterviewsForTeacher(
  teacherId: string
): Promise<ApiResponse<any[]>> {
  try {
    // Interviews are not yet implemented in backend
    // Return applications with 'shortlisted' status as interviews
    const applications = await apiClient.get<Application[]>(
      `${API_CONFIG.ENDPOINTS.MY_JOB_APPLICATIONS}?status=shortlisted`
    );
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch interviews');
  }
}

/**
 * Get applications for a specific job
 */
export async function getApplicationsForJob(
  jobId: string
): Promise<ApiResponse<Application[]>> {
  try {
    const applications = await apiClient.get<Application[]>(API_CONFIG.ENDPOINTS.JOB_APPLICATIONS(jobId));
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch applications');
  }
}

/**
 * Get all applications (for institute view)
 */
export async function getAllApplications(): Promise<ApiResponse<Application[]>> {
  try {
    const applications = await apiClient.get<Application[]>('/jobs/applications/list');
    
    return {
      success: true,
      data: applications,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch applications');
  }
}
