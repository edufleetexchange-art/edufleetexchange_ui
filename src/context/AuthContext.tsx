import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/api/services/authService';
import type {
  Account,
  Profile,
  Subscription,
  InstituteSignupRequest,
  TeacherSignupRequest,
  VendorSignupRequest,
} from '@/api/types';
import { toast } from 'sonner';

// Back-compat shim type so legacy `TeacherSignupData` consumers keep working.
export interface TeacherSignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  qualifications: string[];
  experience: number;
  subjects: string[];
  bio?: string;
  location: string;
  instituteSearchability?: boolean;
  planId?: string;
}

interface AuthContextType {
  account: Account | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Methods (new names)
  login: (email: string, password: string) => Promise<Account>;
  signupInstitute: (input: InstituteSignupRequest) => Promise<void>;
  signupTeacher: (input: TeacherSignupRequest | TeacherSignupData) => Promise<void>;
  signupVendor: (input: VendorSignupRequest) => Promise<void>;
  updateAccount: (updates: Partial<Pick<Account, 'name' | 'phone' | 'avatar'>>) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  // Back-compat methods (Task 21 cleans up consumer call-sites)
  signup: (
    name: string,
    email: string,
    password: string,
    instituteName: string,
    contactPerson: string,
    _instituteCode: string,
    phone: string,
    _planId?: string,
  ) => Promise<void>;
  signupSupplier: (data: VendorSignupRequest & { planId?: string }) => Promise<void>;
  updateProfile: (data: Partial<Account>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  getToken: () => string | null;
  refreshToken: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  ensureSubscription: (force?: boolean) => Promise<void> | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyBundle = useCallback(
    (b: { account: Account; profile: Profile | null; subscription: Subscription | null } | null) => {
      setAccount(b?.account ?? null);
      setProfile(b?.profile ?? null);
      setSubscription(b?.subscription ?? null);
    },
    [],
  );

  const refresh = useCallback(async () => {
    const bundle = await authService.me();
    applyBundle(bundle);
  }, [applyBundle]);

  useEffect(() => {
    (async () => {
      try {
        const token = authService.getStoredToken();
        if (token) {
          const bundle = await authService.me();
          applyBundle(bundle);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [applyBundle]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const bundle = await authService.login({ email, password });
        applyBundle(bundle);
        toast.success('Login successful');
        return bundle.account;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Login failed';
        toast.error(message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [applyBundle],
  );

  const signupInstitute = useCallback(
    async (input: InstituteSignupRequest) => {
      setIsLoading(true);
      try {
        const bundle = await authService.signupInstitute(input);
        applyBundle(bundle);
        toast.success('Institute signup successful');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Signup failed');
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [applyBundle],
  );

  const signupTeacher = useCallback(
    async (input: TeacherSignupRequest | TeacherSignupData) => {
      setIsLoading(true);
      try {
        // Normalize: TeacherSignupData (legacy) has `instituteSearchability` and required `location`;
        // TeacherSignupRequest has optional `location` and no `instituteSearchability`. The server
        // accepts the request shape; we just drop unknown fields.
        const req: TeacherSignupRequest = {
          name: input.name,
          email: input.email,
          password: input.password,
          phone: (input as any).phone,
          experience: input.experience,
          qualifications: input.qualifications,
          subjects: input.subjects,
          bio: input.bio,
          location: (input as any).location,
          preferredLocation: (input as any).preferredLocation,
          isAvailable: (input as any).isAvailable,
        };
        const bundle = await authService.signupTeacher(req);
        applyBundle(bundle);
        toast.success('Teacher signup successful');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Signup failed');
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [applyBundle],
  );

  const signupVendor = useCallback(
    async (input: VendorSignupRequest) => {
      setIsLoading(true);
      try {
        const bundle = await authService.signupVendor(input);
        applyBundle(bundle);
        toast.success('Vendor signup successful');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Signup failed');
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [applyBundle],
  );

  // Back-compat: old signup signature used by `Signup.tsx`
  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      instituteName: string,
      contactPerson: string,
      _instituteCode: string,
      phone: string,
      _planId?: string,
    ) => {
      await signupInstitute({
        name,
        email,
        password,
        phone,
        instituteName,
        contactPerson,
        address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      });
    },
    [signupInstitute],
  );

  const signupSupplier = useCallback(
    async (data: VendorSignupRequest & { planId?: string }) => {
      // planId silently dropped — server picks the free vendor plan by default.
      const { planId: _planId, ...rest } = data;
      await signupVendor(rest);
    },
    [signupVendor],
  );

  const updateAccount = useCallback(
    async (updates: Partial<Pick<Account, 'name' | 'phone' | 'avatar'>>) => {
      const updated = await authService.updateAccount(updates);
      setAccount(updated);
      toast.success('Account updated');
    },
    [],
  );

  // Back-compat: old updateProfile signature accepted arbitrary partial-User data
  const updateProfile = useCallback(
    async (data: Partial<Account>) => {
      await updateAccount({
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
      });
    },
    [updateAccount],
  );

  const refreshProfile = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAccount(null);
      setProfile(null);
      setSubscription(null);
      toast.success('Logged out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = useCallback(() => authService.getStoredToken(), []);

  const refreshToken = useCallback(async () => {
    const valid = await authService.validateToken();
    if (!valid) await logout();
  }, [logout]);

  const refreshSubscription = useCallback(async () => {
    const bundle = await authService.me();
    setSubscription(bundle?.subscription ?? null);
  }, []);

  const ensureSubscription = useCallback(
    (force?: boolean) => {
      if (!account?.id) return undefined;
      if (!force && subscription) return undefined;
      return refreshSubscription();
    },
    [account?.id, subscription, refreshSubscription],
  );

  return (
    <AuthContext.Provider
      value={{
        account,
        profile,
        subscription,
        isAuthenticated: !!account,
        isLoading,
        login,
        signupInstitute,
        signupTeacher,
        signupVendor,
        signup,
        signupSupplier,
        updateAccount,
        updateProfile,
        refreshProfile,
        logout,
        refresh,
        getToken,
        refreshToken,
        refreshSubscription,
        ensureSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
