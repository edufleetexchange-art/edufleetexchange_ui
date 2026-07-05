import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { InstituteProfile } from '@/api/types';
import { useMyListings, useMyJobs, useVehicleActions } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VehicleCard } from '@/components/VehicleCard';
import { JobCard } from '@/components/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { Plus, Edit2, Trash2, Eye, User, Mail, Phone, MapPin, Building2, UserCircle, Users } from 'lucide-react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { VerifyAccountDialog } from '@/components/VerifyAccountDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ListingForm } from '@/components/ListingForm';
import { JobListingForm } from '@/components/JobListingForm';
import { DashboardSuggestion } from '@/components/DashboardSuggestion';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { SubscriptionAlert } from '@/components/SubscriptionAlert';
import { SubscriptionUsageCard } from '@/components/SubscriptionUsageCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Vehicle } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api';

import { AdSlot } from '@/components/ads/AdSlot';
import { ApplicantsList } from '@/components/ApplicantsList';
import { ConfirmDestructive } from '@/components/ConfirmDestructive';
import { recommendationService, type TeacherRecommendation } from '@/api/services/recommendationService';
import {
  mxPaperCard,
  mxEmptyPanel,
  mxAmberPanel,
  mxTealPanel,
  mxLabel,
  mxBtnInk,
  mxBtnOutline,
  mxBtnAmber,
  mxLinkBtn,
  mxInput,
} from '@/lib/meridian';

interface DashboardProps {
  initialTab?: string;
}

export function Dashboard({ initialTab = 'listings' }: DashboardProps) {
  const { account: user, profile, updateAccount, refresh: refreshProfile, subscription, ensureSubscription } = useAuth();
  const instituteProfile = profile as InstituteProfile | null;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryTab = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState(queryTab || initialTab || 'listings');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingListing, setEditingListing] = useState<Vehicle | null>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingRecentApps, setLoadingRecentApps] = useState(false);
  const [teacherRecs, setTeacherRecs] = useState<TeacherRecommendation[]>([]);
  const [teacherRecsLoading, setTeacherRecsLoading] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  const isVendor = user?.role === 'vendor';
  const isInstitute = user?.role === 'institute';

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    instituteName: instituteProfile?.instituteName || '',
    contactPerson: instituteProfile?.contactPerson || '',
    phone: user?.phone || '',
    location: instituteProfile?.address?.city || '',
  });

  const { listings: userListings, loading: listingsLoading, refetch: refetchListings } = useMyListings(user?.id);
  const { jobs: userJobs, loading: jobsLoading, refetch: refetchJobs } = useMyJobs();
  const { deleteVehicle } = useVehicleActions();

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
      ensureSubscription();
      if (isInstitute) {
        refetchListings();
        refetchJobs();
      }
      if (isInstitute) {
        fetchRecentApplications();
      }
    }
  }, [user?.id, refreshProfile, ensureSubscription, refetchListings, refetchJobs, isInstitute]);

  // Fetch recommended teachers for most-recent active job
  useEffect(() => {
    if (!isInstitute || !userJobs.length) return;
    const activeJobs = userJobs.filter(j => (j.status as string) === 'active');
    if (!activeJobs.length) return;
    // Use the most recently created active job (first in array as they're sorted by createdAt desc)
    const latestJobId = activeJobs[0].id || (activeJobs[0] as any)._id;
    if (!latestJobId) return;
    setTeacherRecsLoading(true);
    recommendationService.teachersForJob(latestJobId, 6)
      .then(r => setTeacherRecs(r?.items ?? []))
      .catch(() => setTeacherRecs([]))
      .finally(() => setTeacherRecsLoading(false));
  }, [isInstitute, userJobs]);

  const fetchRecentApplications = async () => {
    try {
      setLoadingRecentApps(true);
      // TODO: server-side scoping for /jobs/applications/list — currently returns all applications
      // accessible to the authenticated institute via auth cookie; pass jobId filter when known.
      const response = await api.jobs.getApplications();
      if (response.success && response.data) {
        const apps = Array.isArray(response.data) ? response.data : (response.data as any).items || [];
        // Sort by date and take top 5
        setRecentApplications(apps.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch recent apps:', error);
      toast.error('Failed to load recent applications');
    } finally {
      setLoadingRecentApps(false);
    }
  };

  // Refresh subscription when switching to creation tabs to ensure limits are fresh
  useEffect(() => {
    if (user?.id && (activeTab === 'create' || activeTab === 'create-job' || activeTab === 'subscription')) {
      ensureSubscription(true);
    }
  }, [activeTab, ensureSubscription, user?.id]);

  useEffect(() => {
    // Clear editing state when switching away from create tab unless we just set it
    if (activeTab !== 'create') {
       // We don't clear here because switching TO create is how we edit
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        instituteName: instituteProfile?.instituteName || '',
        contactPerson: instituteProfile?.contactPerson || '',
        phone: user.phone || '',
        location: instituteProfile?.address?.city || '',
      });
    }
  }, [user, profile]);
  
  const handleSaveProfile = async () => {
    try {
      // updateAccount only supports name/phone/avatar today; institute-specific fields
      // (instituteName, contactPerson, location) require a backend profile endpoint that is not yet wired.
      await updateAccount({ name: profileData.name, phone: profileData.phone });
      setIsEditingProfile(false);
      toast.success('Contact details updated. To change institute name or address, email support@edufleet.com.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleListingCreateSuccess = async () => {
    setEditingListing(null);
    // Refetch listings silently and wait for it to complete
    await refetchListings({ silent: true });
    // Reset filter to 'all' so the newly created (pending) listing is visible
    setStatusFilter('all');
    // Then switch to listings tab to show the new listing
    setActiveTab('listings');
  };

  const handleJobCreateSuccess = async () => {
    setActiveTab('jobs');
    await refetchJobs();
  };
  
  const handleEditListing = (vehicle: Vehicle) => {
    setEditingListing(vehicle);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [pendingListingDelete, setPendingListingDelete] = useState<string | null>(null);
  const [pendingJobDelete, setPendingJobDelete] = useState<string | null>(null);

  const handleDeleteListing = (vehicleId: string) => {
    setPendingListingDelete(vehicleId);
  };
  const confirmDeleteListing = async () => {
    if (!pendingListingDelete) return;
    try {
      await deleteVehicle(pendingListingDelete);
      toast.success('Listing deleted successfully');
      refetchListings();
    } catch (error) {
      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setPendingListingDelete(null);
    }
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/dashboard/edit-job/${jobId}`);
  };

  const handleDeleteJob = (jobId: string) => {
    setPendingJobDelete(jobId);
  };
  const confirmDeleteJob = async () => {
    if (!pendingJobDelete) return;
    try {
      await api.jobs.deleteJob(pendingJobDelete);
      toast.success('Job deleted successfully');
      refetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    } finally {
      setPendingJobDelete(null);
    }
  };
  
  const stats = {
    totalListings: userListings.length,
    activeListings: userListings.filter(v => v.status === 'approved').length,
    pendingApprovals: userListings.filter(v => v.status === 'pending').length,
    totalViews: 0, // TODO: real view counts from analytics endpoint
    totalJobs: userJobs.length,
    activeJobs: userJobs.filter(j => (j.status as string) === 'approved').length,
    totalApplicants: userJobs.reduce((acc, j) => acc + (j.applicants || 0), 0),
  };

  // subscription is now a plain Subscription | null from AuthContext
  const subscriptionData = subscription;
  const availablePlans: any[] = [];
  const subscriptionLoading = false;

  const activePlanId = subscriptionData?.planId;
  const activePlan = availablePlans.find(p => p.id === activePlanId);
  const planFeatures = activePlan?.features || {};

  // Derive quota values from the real subscription object
  const listingsUsed = subscription?.listingsUsed ?? 0;
  const maxListings = subscription?.listingsLimit ?? 0;
  const jobPostsUsed = subscription?.jobPostsUsed ?? 0;
  const maxJobs = subscription?.jobPostsLimit ?? 0;
  const canAdvertise = subscription?.status === 'active';

  // When limit is 0, treat as unlimited (server semantics) — so NOT reached
  const listingLimitReached = maxListings > 0 && listingsUsed >= maxListings;
  const jobLimitReached = maxJobs > 0 && jobPostsUsed >= maxJobs;

  // Build a SubscriptionUsageStats-compatible object for child components, derived from subscription
  const subscriptionStats: any = subscription
    ? {
        isExpired: subscription.status === 'expired',
        isExpiringSoon: false,
        daysRemaining: 0,
        browseCount: {
          used: subscription.browseCount,
          allowed: subscription.browseCountLimit,
          remaining: Math.max(0, subscription.browseCountLimit - subscription.browseCount),
          percentage: subscription.browseCountLimit > 0 ? (subscription.browseCount / subscription.browseCountLimit) * 100 : 0,
          limitReached: subscription.browseCountLimit > 0 && subscription.browseCount >= subscription.browseCountLimit,
        },
        listingCount: {
          used: listingsUsed,
          allowed: maxListings,
          remaining: maxListings > 0 ? Math.max(0, maxListings - listingsUsed) : 999,
          percentage: maxListings > 0 ? (listingsUsed / maxListings) * 100 : 0,
          limitReached: listingLimitReached,
        },
        jobPostsCount: {
          used: jobPostsUsed,
          allowed: maxJobs,
          remaining: maxJobs > 0 ? Math.max(0, maxJobs - jobPostsUsed) : 999,
          percentage: maxJobs > 0 ? (jobPostsUsed / maxJobs) * 100 : 0,
          limitReached: jobLimitReached,
        },
      }
    : null;

  const getSuggestedAction = () => {
    if (isVendor) {
      return {
        title: "Complete Your Vendor Profile",
        description: "Ensure your contact details and services are up-to-date to attract more institutes.",
        action: "Update Profile",
        onClick: () => setActiveTab('profile'),
        variant: 'default' as const
      };
    }

    if (user?.role === 'teacher') {
      return {
        title: "Browse Latest Job Openings",
        description: "Check out new teaching and administrative positions posted by top institutes.",
        action: "Browse Jobs",
        onClick: () => navigate('/jobs'),
        variant: 'default' as const
      };
    }

    if (userListings.length === 0) {
      return {
        title: "Create Your First Listing",
        description: "Start selling your used transport vehicles by creating a listing on EduFleet Exchange.",
        action: "Create Listing",
        onClick: () => {
          setEditingListing(null);
          setActiveTab('create');
        },
        variant: 'default' as const
      };
    }
    if (stats.pendingApprovals > 0) {
      return {
        title: "Track Approval Status",
        description: `You have ${stats.pendingApprovals} listing(s) waiting for admin approval. Check their status here.`,
        action: "View Status",
        onClick: () => {
          setActiveTab('listings');
          setStatusFilter('pending');
        },
        variant: 'secondary' as const
      };
    }
    return {
      title: "Optimize Your Listings",
      description: "Review your active listings to ensure they have up-to-date information and photos.",
      action: "Manage Listings",
      onClick: () => setActiveTab('listings'),
      variant: 'outline' as const
    };
  };

  const suggestion = getSuggestedAction();

  // Loading state while checking auth (shouldn't normally show due to ProtectedRoute)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F5F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16857B]"></div>
      </div>
    );
  }

  // First-mount only: when nothing has loaded yet, show the shared shell.
  // We deliberately don't gate on every individual fetch — sections render their
  // own skeletons so a slow recommendations call no longer blocks the whole page.
  const isInitialLoad = listingsLoading && jobsLoading && subscriptionLoading;
  if (isInitialLoad) {
    return <DashboardSkeleton statTiles={4} label="Loading institute dashboard" />;
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#0B1626]">
      {/* Header — ink-navy ledger band (Meridian Exchange) */}
      <section className="relative overflow-hidden bg-[#081120] py-8 text-white sm:py-10">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 mx-grid-ink [mask-image:linear-gradient(to_right,transparent,black_45%)]"></div>
          <div className="absolute -right-28 -top-44 h-[380px] w-[380px] rounded-full bg-[#16857B]/20 blur-[110px]"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <h1 className="mx-serif text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">Welcome, {user.name}</h1>
          <div className="mt-2 mb-3 h-1 w-24 bg-gradient-to-r from-[#2FB8AA] via-[#2FB8AA]/60 to-transparent" aria-hidden="true"></div>
          <p className="text-sm text-white/65">{instituteProfile?.instituteName}</p>
          {/* Verification status */}
          {isInstitute && (() => {
            const vStatus = (instituteProfile as any)?.verification?.status;
            if (vStatus === 'verified') {
              return <div className="mt-2"><VerifiedBadge size="md" label={true} /></div>;
            }
            if (vStatus === 'pending') {
              return (
                <div className="mt-2 inline-flex items-center gap-1.5 mx-mono text-[10px] font-semibold uppercase tracking-[0.08em] rounded-none border px-2 py-0.5 border-[#F0A62B]/50 bg-[#F0A62B]/15 text-[#F0A62B]">
                  Verification under review
                </div>
              );
            }
            return (
              <Button size="sm" variant="outline" className="mt-2 gap-1.5 text-xs rounded-none border-white/40 bg-transparent text-white shadow-none transition-colors hover:bg-white hover:text-[#0B1626]" onClick={() => setShowVerifyDialog(true)}>
                Get verified
              </Button>
            );
          })()}
          {isInstitute && (
            <VerifyAccountDialog
              open={showVerifyDialog}
              onOpenChange={setShowVerifyDialog}
              onSubmitted={() => refreshProfile()}
            />
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Ad Placement */}
        <div className="mb-8">
          <AdSlot placement="DASH_TOP" variant="banner" />
        </div>

        {/* Subscription Alerts & Usage Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SubscriptionAlert
              subscription={subscription as any}
              stats={subscriptionStats}
            />
            <div className="mt-4">
              <DashboardSuggestion {...suggestion} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <SubscriptionUsageCard 
              stats={subscriptionStats} 
              loading={subscriptionLoading} 
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {isInstitute && (
            <>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Total Listings</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">{stats.totalListings}</div>
              </Card>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Active Listings</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">{stats.activeListings}</div>
              </Card>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Pending Approval</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#A66B00]">{stats.pendingApprovals}</div>
              </Card>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Total Views</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#0B1626]">{stats.totalViews}</div>
              </Card>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Job Openings</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">{stats.totalJobs}</div>
              </Card>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Active Jobs</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">{stats.activeJobs}</div>
              </Card>
              <Card className={`p-4 md:p-6 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Applicants</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#A66B00]">{stats.totalApplicants}</div>
              </Card>
            </>
          )}
          
          {isVendor && (
            <>
              <Card className={`p-4 md:p-6 col-span-2 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Profile Views</p>
                {/* TODO: real view/contact counts from analytics endpoint */}
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">—</div>
              </Card>
              <Card className={`p-4 md:p-6 col-span-2 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Contact Requests</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">—</div>
              </Card>
              <Card className={`p-4 md:p-6 col-span-3 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Current Plan</p>
                <div className="mx-serif text-xl font-semibold tracking-tight text-[#A66B00]">{activePlan?.displayName || 'Basic'}</div>
              </Card>
            </>
          )}

          {user?.role === 'teacher' && (
            <>
              <Card className={`p-4 md:p-6 col-span-2 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Applied Jobs</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">{subscriptionStats?.jobPostsCount?.used || 0}</div>
              </Card>
              <Card className={`p-4 md:p-6 col-span-2 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Remaining Applications</p>
                <div className="mx-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#16857B]">{subscriptionStats?.jobPostsCount?.remaining || 0}</div>
              </Card>
              <Card className={`p-4 md:p-6 col-span-3 ${mxPaperCard}`}>
                <p className={`${mxLabel} mb-2`}>Profile Status</p>
                <div className="mx-serif text-xl font-semibold tracking-tight text-[#A66B00] capitalize">{planFeatures.profileVisibility || 'Basic'}</div>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[#0B1626]/15 flex gap-4 overflow-x-auto">
          {!isVendor && (
            <>
              <button
                onClick={() => {
                  setActiveTab('listings');
                  setStatusFilter('all');
                }}
                className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'listings'
                    ? 'border-[#F0A62B] text-[#0B1626]'
                    : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => {
                  setEditingListing(null);
                  setActiveTab('create');
                }}
                className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'create'
                    ? 'border-[#F0A62B] text-[#0B1626]'
                    : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
                }`}
              >
                {editingListing ? 'Edit Listing' : 'Create Listing'}
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'jobs'
                    ? 'border-[#F0A62B] text-[#0B1626]'
                    : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('create-job')}
                className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'create-job'
                    ? 'border-[#F0A62B] text-[#0B1626]'
                    : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
                }`}
              >
                Create Job
              </button>
              {isInstitute && (
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'applications'
                      ? 'border-[#F0A62B] text-[#0B1626]'
                      : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
                  }`}
                >
                  Applications
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#F0A62B] text-[#0B1626]'
                : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-[#F0A62B] text-[#0B1626]'
                : 'border-transparent text-[#0B1626]/50 hover:text-[#0B1626]'
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => navigate('/suppliers')}
            className="mx-mono text-[12px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5 border-b-2 border-transparent text-[#0B1626]/50 hover:text-[#0B1626] transition-colors whitespace-nowrap"
          >
            Browse Vendors
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'applications' && isInstitute ? (
          <ApplicantsList />
        ) : activeTab === 'subscription' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="mx-serif text-2xl font-semibold tracking-tight">Subscription Management</h2>
            </div>
            <SubscriptionStatus 
              subscriptionData={subscriptionData} 
              availablePlans={availablePlans} 
              subscriptionStats={subscriptionStats} 
              loading={subscriptionLoading} 
            />
          </div>
        ) : activeTab === 'jobs' ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-6">
              <h2 className="mx-serif text-2xl font-semibold tracking-tight">My Job Openings</h2>
              <Button onClick={() => setActiveTab('create-job')} className={`gap-2 ${mxBtnInk}`}>
                <Plus className="w-4 h-4" />
                New Job
              </Button>
            </div>

            {userJobs.length > 0 ? (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {userJobs.map((job) => (
                    <JobCard key={job.id || (job as any)._id} job={job} isListing={true} />
                  ))}
                </div>

                {/* Table View */}
                <Card className={`p-6 ${mxPaperCard}`}>
                  <h3 className="mx-serif text-lg font-semibold tracking-tight mb-4">Job Management</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#0B1626]/10">
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Position</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Department</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Status</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Applicants</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userJobs.map((job) => (
                          <TableRow key={job.id || (job as any)._id} className="border-[#0B1626]/10">
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{job.title}</p>
                                <p className="text-xs text-[#0B1626]/60">
                                  {typeof job.location === 'string' ? job.location : job.location?.city || 'Location not specified'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{job.department}</TableCell>
                            <TableCell>
                              <span
                                className={`mx-mono text-[10px] font-semibold uppercase tracking-[0.08em] rounded-none border px-2 py-0.5 ${
                                  (job.status as string) === 'approved' || (job.status as string) === 'active'
                                    ? 'border-[#16857B]/30 bg-[#16857B]/10 text-[#16857B]'
                                    : (job.status as string) === 'pending'
                                    ? 'border-[#F0A62B]/40 bg-[#FDF4E1] text-[#A66B00]'
                                    : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                              >
                                {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{job.applicants || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-[#16857B]/10 hover:text-[#16857B]"
                                  onClick={() => navigate(`/job/${job.id || (job as any)._id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-[#16857B]/10 hover:text-[#16857B]"
                                  onClick={() => navigate(`/institute/job/${job.id || (job as any)._id}/applications`)}
                                  title="View Applications"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-[#16857B]/10 hover:text-[#16857B]"
                                  title="Edit"
                                  onClick={() => handleEditJob(job.id || (job as any)._id)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  title="Delete"
                                  onClick={() => handleDeleteJob(job.id || (job as any)._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className={`${mxEmptyPanel} p-12 text-center`}>
                <p className="text-[#0B1626]/60 mb-4">No job openings yet</p>
                <Button onClick={() => setActiveTab('create-job')} className={mxBtnInk}>Create First Job</Button>
              </Card>
            )}
          </div>
        ) : activeTab === 'create-job' ? (
          <div>
            {jobLimitReached ? (
              <Card className={`p-12 text-center ${mxAmberPanel}`}>
                <div className="max-w-md mx-auto">
                  <h3 className="mx-serif text-xl font-semibold tracking-tight text-[#0B1626] mb-2">Job Post Limit Reached</h3>
                  <p className="text-[#7A5200] mb-6">
                    You have reached the maximum number of job posts ({maxJobs}) allowed on your current plan.
                    Please upgrade to a Professional or higher plan to post more jobs.
                  </p>
                  <Button onClick={() => setActiveTab('subscription')} className={mxBtnAmber}>
                    Upgrade Plan
                  </Button>
                </div>
              </Card>
            ) : (
              <JobListingForm onSuccess={handleJobCreateSuccess} />
            )}
          </div>
        ) : activeTab === 'listings' ? (
          <div className="space-y-8">
            {isInstitute && loadingRecentApps && (
              <Skeleton className="w-full h-48 rounded-lg" />
            )}

            {isInstitute && !loadingRecentApps && recentApplications.length > 0 && (
              <Card className={`${mxPaperCard} overflow-hidden`}>
                <CardHeader className="bg-[#16857B]/[0.06] border-b border-[#0B1626]/10 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="mx-serif text-lg tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#16857B]" />
                        Recent Job Applications
                      </CardTitle>
                      <CardDescription>Latest candidates interested in your job postings</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-sm ${mxLinkBtn}`}
                      onClick={() => setActiveTab('applications')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#0B1626]/10">
                    {recentApplications.map((app) => (
                      <div key={app._id || app.id} className="p-4 flex items-center justify-between hover:bg-[#0B1626]/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#16857B]/10 flex items-center justify-center text-[#16857B] font-bold">
                            {(app.teacherName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{app.teacherName || 'Anonymous'}</p>
                            <p className="text-xs text-[#0B1626]/60 line-clamp-1">Applied for: {app.jobTitle || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="secondary"
                            className={`mx-mono text-[10px] font-semibold uppercase tracking-[0.08em] rounded-none border px-2 py-0.5 ${
                              app.status === 'pending' ? 'border-[#F0A62B]/40 bg-[#FDF4E1] text-[#A66B00]' :
                              app.status === 'accepted' ? 'border-[#16857B]/30 bg-[#16857B]/10 text-[#16857B]' :
                              app.status === 'rejected' ? 'border-red-200 bg-red-50 text-red-700' :
                              'border-[#0B1626]/15 bg-[#F3F5F7] text-[#0B1626]/70'
                            }`}
                          >
                            {app.status}
                          </Badge>
                          <span className="text-[10px] text-[#0B1626]/60 hidden sm:inline">
                            {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Teachers Section — for most recent active job */}
            {isInstitute && teacherRecsLoading && (
              <div className="mb-6">
                <div className="h-5 w-64 bg-[#0B1626]/10 animate-pulse rounded mb-3" />
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="min-w-[200px] h-28 bg-[#0B1626]/10 animate-pulse rounded-lg flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}
            {isInstitute && !teacherRecsLoading && teacherRecs.length > 0 && (
              <Card className={`${mxPaperCard} mb-6`}>
                <CardHeader className="bg-[#16857B]/[0.06] border-b border-[#0B1626]/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#16857B]" />
                    <div>
                      <CardTitle className="mx-serif text-lg tracking-tight">Recommended teachers for your most recent posting</CardTitle>
                      <CardDescription>Top matches by skill, experience and location</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {teacherRecs.map(({ teacher, score }) => {
                      const teacherId = teacher.id || teacher._id;
                      return (
                        <div
                          key={teacherId}
                          className="min-w-[200px] flex-shrink-0 border border-[#0B1626]/15 rounded-md p-4 bg-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm line-clamp-1 flex-1 mr-2">
                              {teacher.location || 'Teacher'}
                            </p>
                            <Badge variant="secondary" className="mx-mono text-[10px] font-semibold uppercase tracking-[0.08em] rounded-none border border-[#0B1626]/15 bg-[#F3F5F7] text-[#0B1626]/70 px-2 py-0.5 whitespace-nowrap">
                              {score}% match
                            </Badge>
                          </div>
                          <p className="text-xs text-[#0B1626]/60 line-clamp-1">
                            {(teacher.subjects ?? []).slice(0, 3).join(', ') || 'No subjects listed'}
                          </p>
                          <p className="text-xs text-[#0B1626]/60 mt-1">
                            {teacher.experience ?? 0} yrs exp
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-6">
              <h2 className="mx-serif text-2xl font-semibold tracking-tight">My Listings</h2>
              <Button onClick={() => {
                setEditingListing(null);
                setActiveTab('create');
              }} className={`gap-2 ${mxBtnInk}`}>
                <Plus className="w-4 h-4" />
                New Listing
              </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className={`rounded-none shadow-none ${statusFilter === 'all' ? 'border border-[#0B1626] bg-[#0B1626] text-white hover:bg-[#0B1626] hover:text-white' : 'border border-[#0B1626]/25 bg-white text-[#0B1626]/70 hover:border-[#0B1626] hover:bg-white hover:text-[#0B1626]'}`}
              >
                All ({userListings.length})
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
                size="sm"
                className={`rounded-none shadow-none ${statusFilter === 'approved' ? 'border border-[#0B1626] bg-[#0B1626] text-white hover:bg-[#0B1626] hover:text-white' : 'border border-[#0B1626]/25 bg-white text-[#0B1626]/70 hover:border-[#0B1626] hover:bg-white hover:text-[#0B1626]'}`}
              >
                Active ({userListings.filter(v => v.status === 'approved').length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
                className={`rounded-none shadow-none ${statusFilter === 'pending' ? 'border border-[#0B1626] bg-[#0B1626] text-white hover:bg-[#0B1626] hover:text-white' : 'border border-[#0B1626]/25 bg-white text-[#0B1626]/70 hover:border-[#0B1626] hover:bg-white hover:text-[#0B1626]'}`}
              >
                Pending ({userListings.filter(v => v.status === 'pending').length})
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
                size="sm"
                className={`rounded-none shadow-none ${statusFilter === 'rejected' ? 'border border-[#0B1626] bg-[#0B1626] text-white hover:bg-[#0B1626] hover:text-white' : 'border border-[#0B1626]/25 bg-white text-[#0B1626]/70 hover:border-[#0B1626] hover:bg-white hover:text-[#0B1626]'}`}
              >
                Rejected ({userListings.filter(v => v.status === 'rejected').length})
              </Button>
            </div>

            {userListings.filter(v => statusFilter === 'all' || v.status === statusFilter).length > 0 ? (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {userListings
                    .filter(v => statusFilter === 'all' || v.status === statusFilter)
                    .map((vehicle) => (
                    <VehicleCard key={vehicle.id || (vehicle as any)._id} vehicle={vehicle} isListing={true} />
                  ))}
                </div>

                {/* Table View */}
                <Card className={`p-6 ${mxPaperCard}`}>
                  <h3 className="mx-serif text-lg font-semibold tracking-tight mb-4">Listings Management</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#0B1626]/10">
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Vehicle</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Price</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Status</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60">Views</TableHead>
                          <TableHead className="mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userListings
                          .filter(v => statusFilter === 'all' || v.status === statusFilter)
                          .map((vehicle) => (
                          <TableRow key={vehicle.id || (vehicle as any)._id} className="border-[#0B1626]/10">
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{vehicle.title}</p>
                                <p className="text-xs text-[#0B1626]/60">{vehicle.manufacturer} {vehicle.vehicleModel}</p>
                              </div>
                            </TableCell>
                            <TableCell className="mx-mono">₹{vehicle.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <span
                                className={`mx-mono text-[10px] font-semibold uppercase tracking-[0.08em] rounded-none border px-2 py-0.5 ${
                                  vehicle.status === 'approved'
                                    ? 'border-[#16857B]/30 bg-[#16857B]/10 text-[#16857B]'
                                    : vehicle.status === 'pending'
                                    ? 'border-[#F0A62B]/40 bg-[#FDF4E1] text-[#A66B00]'
                                    : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                              >
                                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                              </span>
                            </TableCell>
                            {/* TODO: real per-listing view counts from analytics endpoint */}
                            <TableCell>{(vehicle as any).views ?? '—'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-[#16857B]/10 hover:text-[#16857B]"
                                  onClick={() => navigate(`/vehicle/${vehicle.id || (vehicle as any)._id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-[#16857B]/10 hover:text-[#16857B]"
                                  title="Edit"
                                  onClick={() => handleEditListing(vehicle)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  title="Delete"
                                  onClick={() => handleDeleteListing(vehicle.id || (vehicle as any)._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className={`${mxEmptyPanel} p-12 text-center`}>
                <p className="text-[#0B1626]/60 mb-4">
                  {statusFilter === 'all'
                    ? "No listings yet"
                    : `No ${statusFilter} listings found`}
                </p>
                <Button onClick={() => {
                  setEditingListing(null);
                  setActiveTab('create');
                }} className={mxBtnInk}>Create First Listing</Button>
              </Card>
            )}
          </div>
        ) : activeTab === 'create' ? (
          <div>
            {!canAdvertise ? (
              <Card className={`p-12 text-center ${mxTealPanel}`}>
                <div className="max-w-md mx-auto">
                  <h3 className="mx-serif text-xl font-semibold tracking-tight text-[#0B1626] mb-2">Upgrade Required</h3>
                  <p className="text-[#0B1626]/70 mb-6">
                    Your current plan does not allow advertising vehicles.
                    Please upgrade to a Professional or higher plan to start listing your vehicles.
                  </p>
                  <Button onClick={() => setActiveTab('subscription')} className={mxBtnInk}>
                    View Upgrade Options
                  </Button>
                </div>
              </Card>
            ) : listingLimitReached && !editingListing ? (
              <Card className={`p-12 text-center ${mxAmberPanel}`}>
                <div className="max-w-md mx-auto">
                  <h3 className="mx-serif text-xl font-semibold tracking-tight text-[#0B1626] mb-2">Listing Limit Reached</h3>
                  <p className="text-[#7A5200] mb-6">
                    You have reached the maximum number of vehicle listings ({maxListings}) allowed on your current plan.
                    Please upgrade to a Business or higher plan to list more vehicles.
                  </p>
                  <Button onClick={() => setActiveTab('subscription')} className={mxBtnAmber}>
                    Upgrade Plan
                  </Button>
                </div>
              </Card>
            ) : (
              <ListingForm 
                listing={editingListing} 
                onSuccess={handleListingCreateSuccess}
                onCancel={() => {
                  setEditingListing(null);
                  setActiveTab('listings');
                }}
              />
            )}
          </div>
        ) : activeTab === 'profile' ? (
          <div className="max-w-4xl mx-auto">
            <Card className={mxPaperCard}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="mx-serif tracking-tight">Institute Profile</CardTitle>
                  <CardDescription>Manage your institute's details and contact information</CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline" className={`gap-2 ${mxBtnOutline}`}>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Avatar & Role */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl bg-[#16857B] text-white">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{user.name}</p>
                      <span className="mx-mono text-[10px] font-semibold uppercase tracking-[0.08em] rounded-none border border-[#0B1626]/15 bg-[#F3F5F7] text-[#0B1626]/70 px-2 py-0.5">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Right: Form */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className={mxLabel}>Full Name</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1626]/60" />
                          <Input
                            id="profile-name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditingProfile}
                            className={`pl-10 ${mxInput}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-institute" className={mxLabel}>Institute Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1626]/60" />
                          <Input
                            id="profile-institute"
                            value={profileData.instituteName}
                            onChange={(e) => setProfileData({ ...profileData, instituteName: e.target.value })}
                            disabled={!isEditingProfile}
                            className={`pl-10 ${mxInput}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email" className={mxLabel}>Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1626]/60" />
                          <Input
                            id="profile-email"
                            value={user.email}
                            disabled
                            className={`pl-10 ${mxInput} bg-[#0B1626]/5`}
                          />
                        </div>
                        <p className="text-[10px] text-[#0B1626]/60">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-contact" className={mxLabel}>Contact Person</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1626]/60" />
                          <Input
                            id="profile-contact"
                            value={profileData.contactPerson}
                            onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                            disabled={!isEditingProfile}
                            className={`pl-10 ${mxInput}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone" className={mxLabel}>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1626]/60" />
                          <Input
                            id="profile-phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={!isEditingProfile}
                            className={`pl-10 ${mxInput}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-location" className={mxLabel}>Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1626]/60" />
                          <Input
                            id="profile-location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            disabled={!isEditingProfile}
                            className={`pl-10 ${mxInput}`}
                          />
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="pt-4 border-t border-[#0B1626]/15 space-y-3">
                        <p className="text-xs text-[#0B1626]/60">
                          Only your name and phone are saved here right now. Email{' '}
                          <a href="mailto:support@edufleet.com" className="underline">support@edufleet.com</a>{' '}
                          to update institute name or address.
                        </p>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" className={mxBtnOutline} onClick={() => setIsEditingProfile(false)}>
                            Cancel
                          </Button>
                          <Button className={mxBtnInk} onClick={handleSaveProfile}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 rounded-md border border-red-200 bg-red-50/40 shadow-none">
              <CardHeader>
                <CardTitle className="mx-serif tracking-tight text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="gap-2">
                  Deactivate Account
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ListingForm 
            listing={editingListing}
            onSuccess={handleListingCreateSuccess}
            onCancel={() => {
              setEditingListing(null);
              setActiveTab('listings');
            }}
          />
        )}
        <ConfirmDestructive
          open={!!pendingListingDelete}
          onOpenChange={(o) => !o && setPendingListingDelete(null)}
          title="Delete this listing?"
          description="This action cannot be undone. The listing will be removed for everyone."
          confirmLabel="Delete listing"
          onConfirm={confirmDeleteListing}
        />
        <ConfirmDestructive
          open={!!pendingJobDelete}
          onOpenChange={(o) => !o && setPendingJobDelete(null)}
          title="Delete this job posting?"
          description="This action cannot be undone. Active applicants will see the posting disappear."
          confirmLabel="Delete job"
          onConfirm={confirmDeleteJob}
        />
      </div>
    </div>
  );
}
