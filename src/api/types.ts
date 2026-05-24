// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  title: string;
  manufacturer: string;
  vehicleModel: string;
  year: number;
  type: 'bus' | 'school-bus' | 'minibus' | 'van' | 'truck';
  price: number;
  registrationNumber: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  features: string[];
  images: string[];
  description: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  isPriority: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  insurance?: {
    valid: boolean;
    expiryDate?: string;
    provider?: string;
  };
  fitness?: {
    valid: boolean;
    expiryDate?: string;
  };
  roadTax?: {
    valid: boolean;
    expiryDate?: string;
  };
  permit?: {
    valid: boolean;
    expiryDate?: string;
    permitType?: string;
  };
}

export interface VehicleFilters {
  searchTerm?: string;
  type?: string;
  manufacturer?: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  condition?: string;
  status?: 'pending' | 'approved' | 'rejected';
  isPriority?: boolean;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateVehicleDto {
  title: string;
  manufacturer: string;
  vehicleModel: string;
  year: number;
  type: 'bus' | 'school-bus' | 'minibus' | 'van' | 'truck';
  price: number;
  registrationNumber: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  features: string[];
  images: string[];
  description: string;
  insurance?: {
    valid: boolean;
    expiryDate?: string;
    provider?: string;
  };
  fitness?: {
    valid: boolean;
    expiryDate?: string;
  };
  roadTax?: {
    valid: boolean;
    expiryDate?: string;
  };
  permit?: {
    valid: boolean;
    expiryDate?: string;
    permitType?: string;
  };
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {
  id: string;
}

// Auth Types — Account + Profile + Subscription bundle
export type AccountRole = 'institute' | 'teacher' | 'vendor' | 'admin' | 'marketing' | 'sales';

export interface Account {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstituteProfile {
  id: string;
  accountId: string;
  instituteName: string;
  contactPerson?: string;
  instituteSearchability: boolean;
  address: { street: string; city: string; state: string; pincode: string; country: string };
}

export interface TeacherProfile {
  id: string;
  accountId: string;
  experience: number;
  qualifications: string[];
  subjects: string[];
  bio?: string;
  location?: string;
  preferredLocation?: string[];
  currentInstitute?: string;
  achievements?: string[];
  isAvailable: boolean;
}

export interface VendorProfile {
  id: string;
  accountId: string;
  businessName: string;
  contactPerson?: string;
  phone?: string;
  website?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
}

export interface StaffProfile {
  id: string;
  accountId: string;
  employeeId?: string;
  department?: string;
  permissions?: string[];
}

export type Profile = InstituteProfile | TeacherProfile | VendorProfile | StaffProfile;

export interface Subscription {
  id: string;
  accountId: string;
  planId?: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  startDate: string;
  endDate: string;
  listingsUsed: number;
  listingsLimit: number;
  jobPostsUsed: number;
  jobPostsLimit: number;
  browseCount: number;
  browseCountLimit: number;
  lastBrowseReset?: string;
  notes?: string;
}

export interface AuthBundle {
  account: Account;
  profile: Profile | null;
  subscription: Subscription | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface InstituteSignupRequest {
  name: string; email: string; password: string; phone?: string;
  instituteName: string; contactPerson?: string;
  address: { street: string; city: string; state: string; pincode: string; country?: string };
  instituteSearchability?: boolean;
}

export interface TeacherSignupRequest {
  name: string; email: string; password: string; phone?: string;
  experience: number; qualifications: string[]; subjects: string[];
  bio?: string; location?: string; preferredLocation?: string[];
  isAvailable?: boolean;
}

export interface VendorSignupRequest {
  name: string; email: string; password: string; phone?: string;
  businessName: string; contactPerson?: string; website?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
}

export interface AuthResponse {
  data: AuthBundle;
}

// Admin Types
export interface VehicleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  priorityListings: number;
}

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  pendingApprovals: number;
  totalViews: number;
}

export interface ApprovalRequest {
  vehicleId: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

export interface PriorityToggleRequest {
  vehicleId: string;
  isPriority: boolean;
}

// Upload Types
export interface UploadImageRequest {
  file: File;
  vehicleId?: string;
}

export interface UploadImageResponse {
  url: string;
  filename: string;
  size: number;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  category: 'edutech' | 'stationery' | 'furniture' | 'technology' | 'sports' | 'library' | 'lab-equipment' | 'other';
  description: string;
  services: string[];
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  logo?: string;
  certifications?: string[];
  yearsInBusiness?: number;
  clientCount?: number;
  isVerified: boolean;
  isPaid?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  category: 'edutech' | 'stationery' | 'furniture' | 'technology' | 'sports' | 'library' | 'lab-equipment' | 'other';
  description: string;
  services: string[];
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  logo?: string;
  certifications?: string[];
  yearsInBusiness?: number;
  clientCount?: number;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  id: string;
}

export interface SupplierFilters {
  searchTerm?: string;
  category?: string;
  isVerified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  pageSize?: number;
}

export interface SupplierStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  verified: number;
}

// Audit Log Types
export interface AuditLog {
  _id: string;
  userId: string;
  employeeId?: string;
  userName: string;
  userRole: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  role?: string;
  action?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

// Re-export subscription types
export type {
  SubscriptionPlan,
  UserSubscription,
  Notification,
  SubscriptionUsageStats,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AssignSubscriptionDto,
  ExtendSubscriptionDto,
  ResetBrowseCountDto,
  SuspendSubscriptionDto,
  CreateNotificationDto,
  MarkNotificationReadDto,
  BulkMarkReadDto,
  BrowseCheckResult,
  ListingCheckResult,
  JobPostCheckResult,
  VisibilityCheckResult,
  SubscriptionStats,
  SubscriptionPlanStats,
  SubscriptionFilters,
  NotificationFilters,
  SubscriptionRequest,
  CreateSubscriptionRequestDto,
  UpdateSubscriptionRequestDto,
} from '../types/subscriptionTypes';