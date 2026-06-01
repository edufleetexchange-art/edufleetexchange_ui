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
import { recommendationService, type TeacherRecommendation } from '@/api/services/recommendationService';

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
      refetchListings();
      refetchJobs();
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
      // TODO: updateAccount only supports name/phone/avatar; institute-specific fields (instituteName, contactPerson, location) require a separate profile endpoint
      await updateAccount({ name: profileData.name, phone: profileData.phone });
      setIsEditingProfile(false);
      toast.success('Profile updated');
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

  const handleDeleteListing = async (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await deleteVehicle(vehicleId);
        toast.success('Listing deleted successfully');
        refetchListings();
      } catch (error) {
        console.error('Failed to delete listing:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/dashboard/edit-job/${jobId}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        await api.jobs.deleteJob(jobId);
        toast.success('Job deleted successfully');
        refetchJobs();
      } catch (error) {
        console.error('Failed to delete job:', error);
        toast.error('Failed to delete job');
      }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // loadingRecentApps is intentionally excluded here so the full dashboard renders while
  // recent applications load in the background (see the listings tab section below).
  if (listingsLoading || jobsLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="w-64 h-10 mb-4" />
          <Skeleton className="w-32 h-6 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Ad Placement */}
        <div className="mb-8">
          <AdSlot placement="DASH_TOP" variant="banner" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">{instituteProfile?.instituteName}</p>
          {/* Verification status */}
          {isInstitute && (() => {
            const vStatus = (instituteProfile as any)?.verification?.status;
            if (vStatus === 'verified') {
              return <div className="mt-2"><VerifiedBadge size="md" label={true} /></div>;
            }
            if (vStatus === 'pending') {
              return (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-medium border border-amber-500/20">
                  Verification under review
                </div>
              );
            }
            return (
              <Button size="sm" variant="outline" className="mt-2 gap-1.5 text-xs" onClick={() => setShowVerifyDialog(true)}>
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
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Listings</p>
                <div className="text-2xl md:text-3xl font-bold text-primary">{stats.totalListings}</div>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Active Listings</p>
                <div className="text-2xl md:text-3xl font-bold text-secondary">{stats.activeListings}</div>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Pending Approval</p>
                <div className="text-2xl md:text-3xl font-bold text-accent">{stats.pendingApprovals}</div>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Views</p>
                <div className="text-2xl md:text-3xl font-bold">{stats.totalViews}</div>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Job Openings</p>
                <div className="text-2xl md:text-3xl font-bold text-primary">{stats.totalJobs}</div>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Active Jobs</p>
                <div className="text-2xl md:text-3xl font-bold text-secondary">{stats.activeJobs}</div>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm text-muted-foreground mb-2">Applicants</p>
                <div className="text-2xl md:text-3xl font-bold text-accent">{stats.totalApplicants}</div>
              </Card>
            </>
          )}
          
          {isVendor && (
            <>
              <Card className="p-4 md:p-6 col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Profile Views</p>
                {/* TODO: real view/contact counts from analytics endpoint */}
                <div className="text-2xl md:text-3xl font-bold text-primary">—</div>
              </Card>
              <Card className="p-4 md:p-6 col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Contact Requests</p>
                <div className="text-2xl md:text-3xl font-bold text-secondary">—</div>
              </Card>
              <Card className="p-4 md:p-6 col-span-3">
                <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
                <div className="text-xl font-bold text-accent">{activePlan?.displayName || 'Basic'}</div>
              </Card>
            </>
          )}

          {user?.role === 'teacher' && (
            <>
              <Card className="p-4 md:p-6 col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Applied Jobs</p>
                <div className="text-2xl md:text-3xl font-bold text-primary">{subscriptionStats?.jobPostsCount?.used || 0}</div>
              </Card>
              <Card className="p-4 md:p-6 col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Remaining Applications</p>
                <div className="text-2xl md:text-3xl font-bold text-secondary">{subscriptionStats?.jobPostsCount?.remaining || 0}</div>
              </Card>
              <Card className="p-4 md:p-6 col-span-3">
                <p className="text-sm text-muted-foreground mb-2">Profile Status</p>
                <div className="text-xl font-bold text-accent capitalize">{planFeatures.profileVisibility || 'Basic'}</div>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border flex gap-4 overflow-x-auto">
          {!isVendor && (
            <>
              <button
                onClick={() => {
                  setActiveTab('listings');
                  setStatusFilter('all');
                }}
                className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
                  activeTab === 'listings'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => {
                  setEditingListing(null);
                  setActiveTab('create');
                }}
                className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
                  activeTab === 'create'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {editingListing ? 'Edit Listing' : 'Create Listing'}
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
                  activeTab === 'jobs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('create-job')}
                className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
                  activeTab === 'create-job'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Job
              </button>
              {isInstitute && (
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
                    activeTab === 'applications'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Applications
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => navigate('/suppliers')}
            className="px-4 py-2 font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground smooth-transition whitespace-nowrap"
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
              <h2 className="text-2xl font-bold">Subscription Management</h2>
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
              <h2 className="text-2xl font-bold">My Job Openings</h2>
              <Button onClick={() => setActiveTab('create-job')} className="gap-2">
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
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Job Management</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userJobs.map((job) => (
                          <TableRow key={job.id || (job as any)._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{job.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {typeof job.location === 'string' ? job.location : job.location?.city || 'Location not specified'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{job.department}</TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  (job.status as string) === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : (job.status as string) === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
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
                                  onClick={() => navigate(`/job/${job.id || (job as any)._id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/institute/job/${job.id || (job as any)._id}/applications`)}
                                  title="View Applications"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Edit"
                                  onClick={() => handleEditJob(job.id || (job as any)._id)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
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
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No job openings yet</p>
                <Button onClick={() => setActiveTab('create-job')}>Create First Job</Button>
              </Card>
            )}
          </div>
        ) : activeTab === 'create-job' ? (
          <div>
            {jobLimitReached ? (
              <Card className="p-12 text-center bg-amber-50 border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">Job Post Limit Reached</h3>
                  <p className="text-amber-800 mb-6">
                    You have reached the maximum number of job posts ({maxJobs}) allowed on your current plan.
                    Please upgrade to a Professional or higher plan to post more jobs.
                  </p>
                  <Button onClick={() => setActiveTab('subscription')} className="bg-amber-600 hover:bg-amber-700">
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
              <Card className="border-primary/10 shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Recent Job Applications
                      </CardTitle>
                      <CardDescription>Latest candidates interested in your job postings</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setActiveTab('applications')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {recentApplications.map((app) => (
                      <div key={app._id || app.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(app.teacherName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{app.teacherName || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">Applied for: {app.jobTitle || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] uppercase tracking-wider ${
                              app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {app.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">
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
                <div className="h-5 w-64 bg-muted animate-pulse rounded mb-3" />
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="min-w-[200px] h-28 bg-muted animate-pulse rounded-lg flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}
            {isInstitute && !teacherRecsLoading && teacherRecs.length > 0 && (
              <Card className="border-primary/10 shadow-sm mb-6">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Recommended teachers for your most recent posting</CardTitle>
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
                          className="min-w-[200px] flex-shrink-0 border border-border rounded-lg p-4 bg-background"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm line-clamp-1 flex-1 mr-2">
                              {teacher.location || 'Teacher'}
                            </p>
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {score}% match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {(teacher.subjects ?? []).slice(0, 3).join(', ') || 'No subjects listed'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
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
              <h2 className="text-2xl font-bold">My Listings</h2>
              <Button onClick={() => {
                setEditingListing(null);
                setActiveTab('create');
              }} className="gap-2">
                <Plus className="w-4 h-4" />
                New Listing
              </Button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('all')} 
                size="sm"
                className="rounded-full"
              >
                All ({userListings.length})
              </Button>
              <Button 
                variant={statusFilter === 'approved' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('approved')} 
                size="sm"
                className="rounded-full"
              >
                Active ({userListings.filter(v => v.status === 'approved').length})
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('pending')} 
                size="sm"
                className="rounded-full"
              >
                Pending ({userListings.filter(v => v.status === 'pending').length})
              </Button>
              <Button 
                variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('rejected')} 
                size="sm"
                className="rounded-full"
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
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Listings Management</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userListings
                          .filter(v => statusFilter === 'all' || v.status === statusFilter)
                          .map((vehicle) => (
                          <TableRow key={vehicle.id || (vehicle as any)._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{vehicle.title}</p>
                                <p className="text-xs text-muted-foreground">{vehicle.manufacturer} {vehicle.vehicleModel}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">₹{vehicle.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  vehicle.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : vehicle.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
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
                                  onClick={() => navigate(`/vehicle/${vehicle.id || (vehicle as any)._id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Edit"
                                  onClick={() => handleEditListing(vehicle)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700" 
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
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'all' 
                    ? "No listings yet" 
                    : `No ${statusFilter} listings found`}
                </p>
                <Button onClick={() => {
                  setEditingListing(null);
                  setActiveTab('create');
                }}>Create First Listing</Button>
              </Card>
            )}
          </div>
        ) : activeTab === 'create' ? (
          <div>
            {!canAdvertise ? (
              <Card className="p-12 text-center bg-blue-50 border-blue-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Upgrade Required</h3>
                  <p className="text-blue-800 mb-6">
                    Your current plan does not allow advertising vehicles. 
                    Please upgrade to a Professional or higher plan to start listing your vehicles.
                  </p>
                  <Button onClick={() => setActiveTab('subscription')} className="bg-blue-600 hover:bg-blue-700">
                    View Upgrade Options
                  </Button>
                </div>
              </Card>
            ) : listingLimitReached && !editingListing ? (
              <Card className="p-12 text-center bg-amber-50 border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">Listing Limit Reached</h3>
                  <p className="text-amber-800 mb-6">
                    You have reached the maximum number of vehicle listings ({maxListings}) allowed on your current plan.
                    Please upgrade to a Business or higher plan to list more vehicles.
                  </p>
                  <Button onClick={() => setActiveTab('subscription')} className="bg-amber-600 hover:bg-amber-700">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Institute Profile</CardTitle>
                  <CardDescription>Manage your institute's details and contact information</CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="gap-2">
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
                      <AvatarFallback className="text-2xl bg-primary text-white">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{user.name}</p>
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Right: Form */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Full Name</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-institute">Institute Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-institute"
                            value={profileData.instituteName}
                            onChange={(e) => setProfileData({ ...profileData, instituteName: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-email"
                            value={user.email}
                            disabled
                            className="pl-10 bg-muted"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-contact">Contact Person</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-contact"
                            value={profileData.contactPerson}
                            onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 border-red-100 bg-red-50/10">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
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
      </div>
    </div>
  );
}
