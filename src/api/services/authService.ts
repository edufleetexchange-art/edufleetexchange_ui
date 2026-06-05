import { apiClient } from '@/lib/apiClient';
import type {
  AuthBundle,
  InstituteSignupRequest,
  TeacherSignupRequest,
  VendorSignupRequest,
  ConsultantSignupRequest,
  LoginRequest,
  Account,
} from '@/api/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user'; // legacy key name; stores the Account now

// The server may return { token, account, profile, subscription } or the token
// may already have been stored by the apiClient layer.  We accept either shape.
type BundleWithToken = AuthBundle & { token?: string };

function persist(bundle: BundleWithToken) {
  if (bundle.token) localStorage.setItem(TOKEN_KEY, bundle.token);
  localStorage.setItem(USER_KEY, JSON.stringify(bundle.account));
}

export const authService = {
  async signupInstitute(input: InstituteSignupRequest): Promise<AuthBundle> {
    const result = await apiClient.post<BundleWithToken>('/auth/institute/signup', input);
    persist(result);
    return result;
  },
  async signupTeacher(input: TeacherSignupRequest): Promise<AuthBundle> {
    const result = await apiClient.post<BundleWithToken>('/auth/teacher/signup', input);
    persist(result);
    return result;
  },
  async signupVendor(input: VendorSignupRequest): Promise<AuthBundle> {
    const result = await apiClient.post<BundleWithToken>('/auth/vendor/signup', input);
    persist(result);
    return result;
  },
  async signupConsultant(input: ConsultantSignupRequest): Promise<AuthBundle> {
    const result = await apiClient.post<BundleWithToken>('/auth/consultant/signup', input);
    persist(result);
    return result;
  },
  async login(input: LoginRequest): Promise<AuthBundle> {
    const result = await apiClient.post<BundleWithToken>('/auth/login', input);
    persist(result);
    return result;
  },
  async me(): Promise<AuthBundle | null> {
    try {
      return await apiClient.get<AuthBundle>('/auth/me');
    } catch {
      return null;
    }
  },
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  async validateToken(): Promise<boolean> {
    try {
      const result = await apiClient.get<{ valid?: boolean }>('/auth/validate');
      return Boolean(result?.valid);
    } catch {
      return false;
    }
  },
  async updateAccount(updates: Partial<Pick<Account, 'name' | 'phone' | 'avatar'>>): Promise<Account> {
    return apiClient.put<Account>('/accounts/me', updates);
  },
  /** @deprecated Use me() instead. */
  async getCurrentUser(): Promise<AuthBundle | null> {
    return this.me();
  },
  /** @deprecated Use updateAccount() instead. */
  async updateProfile(updates: Partial<Account>): Promise<Account> {
    return this.updateAccount(updates as Partial<Pick<Account, 'name' | 'phone' | 'avatar'>>);
  },
  /** @deprecated No dedicated profile endpoint in new API. */
  async getProfile(): Promise<AuthBundle | null> {
    return this.me();
  },
  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getStoredUser(): Account | null {
    const s = localStorage.getItem(USER_KEY);
    return s ? (JSON.parse(s) as Account) : null;
  },
  /** @deprecated Use signupTeacher/signupVendor/signupInstitute instead. */
  async signup(input: any): Promise<AuthBundle> {
    if (input?.role === 'vendor')  return this.signupVendor(input);
    if (input?.role === 'teacher') return this.signupTeacher(input);
    return this.signupInstitute(input);
  },
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },
};

