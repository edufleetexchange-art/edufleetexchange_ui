import type { Profile, InstituteProfile, TeacherProfile, VendorProfile, StaffProfile, ConsultantProfile, AccountRole } from '@/api/types';

export const isInstituteProfile = (p: Profile | null, role: AccountRole): p is InstituteProfile =>
  role === 'institute' && !!p && 'instituteName' in (p as any);

export const isTeacherProfile = (p: Profile | null, role: AccountRole): p is TeacherProfile =>
  role === 'teacher' && !!p && 'subjects' in (p as any);

export const isVendorProfile = (p: Profile | null, role: AccountRole): p is VendorProfile =>
  role === 'vendor' && !!p && 'businessName' in (p as any);

export const isStaffProfile = (p: Profile | null, role: AccountRole): p is StaffProfile =>
  ['admin', 'marketing', 'sales'].includes(role) && !!p;

export const isConsultantProfile = (p: Profile | null, role: AccountRole): p is ConsultantProfile =>
  role === 'consultant' && !!p && 'specializations' in (p as any);
