import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { TeacherProfile } from '@/api/types';
import { api } from '@/api';
import { useMyApplications } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  BookOpen, 
  Clock,
  Video,
  MapPinned,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  Search,
  SearchCheck,
  SearchX
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { Switch } from '@/components/ui/switch';
import { SubscriptionStatus } from '@/components/SubscriptionStatus'; // Assuming this component exists
import { SubscriptionAlert } from '@/components/SubscriptionAlert';
import { SubscriptionUsageCard } from '@/components/SubscriptionUsageCard';
import { recommendationService, type JobRecommendation, type CollaborativeRecsResponse } from '@/api/services/recommendationService';
import { TeacherConsentToggle } from '@/components/TeacherConsentToggle';

export function TeacherDashboard() {
  const { account: user, profile, updateAccount, refresh: refreshProfile, subscription, ensureSubscription } = useAuth();
  const teacherProfile = profile as TeacherProfile | null;
  const { applications, loading: appsLoading, refetch: refetchApps } = useMyApplications();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: teacherProfile?.location || '',
    bio: teacherProfile?.bio || '',
    experience: teacherProfile?.experience || 0,
    qualifications: teacherProfile?.qualifications || [],
    subjects: teacherProfile?.subjects || [],
    isAvailable: teacherProfile?.isAvailable ?? true,
  });
  const [newQual, setNewQual] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [recs, setRecs] = useState<JobRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [collab, setCollab] = useState<CollaborativeRecsResponse | null>(null);

  // Refresh profile and data when user is available
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
      ensureSubscription(true);
      refetchApps();
    }
  }, [user?.id, refreshProfile, ensureSubscription, refetchApps]);

  // Fetch job recommendations for this teacher
  useEffect(() => {
    if (user?.role !== 'teacher' || !user?.id) return;
    setRecsLoading(true);
    recommendationService.jobsForMe(6)
      .then(r => setRecs(r?.items ?? []))
      .catch(() => setRecs([]))
      .finally(() => setRecsLoading(false));
  }, [user?.id]);

  // Fetch collaborative recommendations for this teacher
  useEffect(() => {
    if (user?.role !== 'teacher' || !user?.id) return;
    recommendationService.collaborativeJobsForMe(6)
      .then(data => setCollab(data))
      .catch(() => setCollab(null));
  }, [user?.id]);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        location: teacherProfile?.location || '',
        bio: teacherProfile?.bio || '',
        experience: teacherProfile?.experience || 0,
        qualifications: teacherProfile?.qualifications || [],
        subjects: teacherProfile?.subjects || [],
        isAvailable: teacherProfile?.isAvailable ?? true,
      });
    }
  }, [user, profile]);

  // Separate interviews from applications that have interviews scheduled
  const interviews = applications.filter(app => app.interviewScheduled);

  const handleSaveProfile = async () => {
    if (user) {
      try {
        // TODO: server-side teacher-profile update endpoint, then re-enable location/bio/experience/qualifications/subjects/isAvailable fields
        await updateAccount({ name: editData.name, phone: editData.phone });
        setIsEditing(false);
        toast.success('Name and phone updated successfully!');
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error('Failed to save profile changes');
      }
    }
  };

  const addQualification = () => {
    if (newQual.trim() && !editData.qualifications.includes(newQual.trim())) {
      setEditData({
        ...editData,
        qualifications: [...editData.qualifications, newQual.trim()]
      });
      setNewQual('');
    }
  };

  const removeQualification = (qual: string) => {
    setEditData({
      ...editData,
      qualifications: editData.qualifications.filter(q => q !== qual)
    });
  };

  const addSubject = () => {
    if (newSubject.trim() && !editData.subjects.includes(newSubject.trim())) {
      setEditData({
        ...editData,
        subjects: [...editData.subjects, newSubject.trim()]
      });
      setNewSubject('');
    }
  };

  const removeSubject = (subj: string) => {
    setEditData({
      ...editData,
      subjects: editData.subjects.filter(s => s !== subj)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'reviewed': return 'bg-blue-500';
      case 'shortlisted': return 'bg-purple-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'shortlisted': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getInterviewModeIcon = (mode: string) => {
    switch (mode) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPinned className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // subscription is now a plain Subscription | null from AuthContext
  const subscriptionData = subscription;
  const availablePlans: any[] = [];
  const subscriptionLoading = false;

  // Build a SubscriptionUsageStats-compatible object for child components
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
        jobPostsCount: {
          used: subscription.jobPostsUsed ?? 0,
          allowed: subscription.jobPostsLimit ?? 0,
          remaining: (subscription.jobPostsLimit ?? 0) > 0 ? Math.max(0, (subscription.jobPostsLimit ?? 0) - (subscription.jobPostsUsed ?? 0)) : 999,
          percentage: (subscription.jobPostsLimit ?? 0) > 0 ? ((subscription.jobPostsUsed ?? 0) / (subscription.jobPostsLimit ?? 0)) * 100 : 0,
          limitReached: (subscription.jobPostsLimit ?? 0) > 0 && (subscription.jobPostsUsed ?? 0) >= (subscription.jobPostsLimit ?? 0),
        },
      }
    : null;

  // Loading state while checking auth or loading data
  if (!user || appsLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== 'teacher') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="DASH_TOP" variant="banner" />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile, applications, and interviews</p>
        </div>

        {/* Subscription Alerts & Usage Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SubscriptionAlert
              subscription={subscription as any}
              stats={subscriptionStats}
            />
          </div>
          <div className="lg:col-span-1">
            <SubscriptionUsageCard 
              stats={subscriptionStats} 
              loading={subscriptionLoading} 
            />
          </div>
        </div>

        {/* Recommended Jobs Section */}
        {recsLoading && (
          <div className="mb-8">
            <div className="h-5 w-48 bg-muted animate-pulse rounded mb-4" />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="min-w-[220px] h-32 bg-muted animate-pulse rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>
        )}
        {!recsLoading && recs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Recommended for you
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recs.map(({ job, score }) => {
                const jobId = job.id || job._id;
                const city = typeof job.location === 'string' ? job.location : job.location?.city ?? '';
                return (
                  <Link
                    key={jobId}
                    to={`/job/${jobId}`}
                    className="min-w-[220px] flex-shrink-0 border border-border rounded-lg p-4 hover:border-primary/60 hover:shadow-sm transition-all bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm line-clamp-2 flex-1 mr-2">{job.title}</p>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs whitespace-nowrap">
                        {score}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{job.instituteName}</p>
                    {city && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {city}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Collaborative Recommendations Section */}
        {(() => {
          const collabItems = [...(collab?.peers ?? []), ...(collab?.similar ?? [])].slice(0, 6);
          if (collabItems.length === 0) return null;
          return (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Because you applied to similar jobs
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {collabItems.map(({ job, score, reason }) => {
                  const jobId = job.id || job._id;
                  const city = typeof job.location === 'string' ? job.location : job.location?.city ?? '';
                  const label = reason === 'peers'
                    ? `${score} similar teacher${score !== 1 ? 's' : ''} applied`
                    : 'Similar subjects';
                  return (
                    <Link
                      key={jobId}
                      to={`/job/${jobId}`}
                      className="min-w-[220px] flex-shrink-0 border border-border rounded-lg p-4 hover:border-primary/60 hover:shadow-sm transition-all bg-card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-sm line-clamp-2 flex-1 mr-2">{job.title}</p>
                        <Badge className="bg-secondary/60 text-secondary-foreground border-0 text-xs whitespace-nowrap">
                          {label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{job.instituteName}</p>
                      {city && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {city}
                        </div>
                      )}
                      {(job.subjects ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(job.subjects as string[]).slice(0, 2).map((s: string) => (
                            <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="w-max">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="interviews">
                Interviews ({interviews.length})
              </TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>
          </div>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Subscription Management</h2>
              </div>
              <SubscriptionStatus 
                subscriptionData={subscriptionData} 
                availablePlans={availablePlans} 
                subscriptionStats={subscriptionStats} 
                isLoading={subscriptionLoading} 
              />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="text-2xl font-bold h-auto py-1"
                          />
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-2xl">{user.name}</CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    variant={isEditing ? 'default' : 'outline'}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Searchability Toggle — read-only; contact support to change */}
                {/* TODO: server-side teacher-profile update endpoint, then re-enable this field */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${teacherProfile?.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {teacherProfile?.isAvailable ? <SearchCheck className="h-5 w-5" /> : <SearchX className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">Institute Searchability</p>
                      <p className="text-sm text-muted-foreground">
                        {teacherProfile?.isAvailable
                          ? 'Your profile is visible to institutes looking for teachers'
                          : 'Your profile is hidden from institute searches'}
                      </p>
                      {isEditing && (
                        <p className="text-xs text-amber-600 mt-1">Contact support to change searchability</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isAvailable" className="sr-only">Toggle Searchability</Label>
                    <Switch
                      id="isAvailable"
                      checked={teacherProfile?.isAvailable ?? true}
                      disabled
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    {isEditing ? (
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone || 'Not provided'}</span>
                      </div>
                    )}
                    {/* Location — read-only; contact support to edit */}
                    {/* TODO: server-side teacher-profile update endpoint, then re-enable these fields */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{teacherProfile?.location || 'Not provided'}</span>
                      {isEditing && <span className="text-xs text-muted-foreground">(contact support to edit)</span>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{teacherProfile?.experience || 0} years experience</span>
                      {isEditing && <span className="text-xs text-muted-foreground">(contact support to edit)</span>}
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Qualifications
                  </h3>
                  {/* Qualifications — read-only; contact support to edit */}
                  {/* TODO: server-side teacher-profile update endpoint, then re-enable these fields */}
                  <div className="flex flex-wrap gap-2">
                    {teacherProfile?.qualifications?.map((qual) => (
                      <Badge key={qual} variant="secondary">
                        {qual}
                      </Badge>
                    ))}
                    {(teacherProfile?.qualifications?.length ?? 0) === 0 && <p className="text-muted-foreground">No qualifications added yet</p>}
                  </div>
                  {isEditing && <p className="text-xs text-muted-foreground">Contact support to update qualifications</p>}
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects
                  </h3>
                  {/* Subjects — read-only; contact support to edit */}
                  {/* TODO: server-side teacher-profile update endpoint, then re-enable these fields */}
                  <div className="flex flex-wrap gap-2">
                    {teacherProfile?.subjects?.map((subj) => (
                      <Badge key={subj} variant="outline">
                        {subj}
                      </Badge>
                    ))}
                    {(teacherProfile?.subjects?.length ?? 0) === 0 && <p className="text-muted-foreground">No subjects added yet</p>}
                  </div>
                  {isEditing && <p className="text-xs text-muted-foreground">Contact support to update subjects</p>}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Bio</h3>
                  {/* Bio — read-only; contact support to edit */}
                  {/* TODO: server-side teacher-profile update endpoint, then re-enable these fields */}
                  <p className="text-muted-foreground">{teacherProfile?.bio || 'No bio added yet'}</p>
                  {isEditing && <p className="text-xs text-muted-foreground">Contact support to update bio</p>}
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-4">
              <TeacherConsentToggle />
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="space-y-4">
              {applications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <Link to="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                applications.map((app) => {
                  const job = app.jobId; // Populated job data
                  return (
                  <Card key={app._id || app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{job?.title || 'Job'}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3" />
                            {app.instituteName}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(app.status)} text-white flex items-center gap-1`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Applied on {(() => { const dateStr = app.appliedAt || app.appliedDate; return dateStr ? new Date(dateStr).toLocaleDateString() : '—'; })()}
                        </div>

                        {app.interviewScheduled && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Interview Scheduled
                            </p>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {new Date(app.interviewScheduled.scheduledDate).toLocaleDateString()} at {app.interviewScheduled.scheduledTime}
                              </div>
                              <div className="flex items-center gap-2">
                                {getInterviewModeIcon(app.interviewScheduled.mode)}
                                {app.interviewScheduled.mode}
                                {app.interviewScheduled.location && ` - ${app.interviewScheduled.location}`}
                                {app.interviewScheduled.meetingLink && (
                                  <a 
                                    href={app.interviewScheduled.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Join Meeting
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link to={`/job/${job?._id || job?.id || (typeof app.jobId === 'string' ? app.jobId : app.jobId?._id || app.jobId?.id)}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Job
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No interviews scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                interviews.map((app) => {
                  const interview = app.interviewScheduled;
                  return (
                  <Card key={app._id || app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            Interview - {app.instituteName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Job: {app.jobId?.title || 'N/A'}
                          </CardDescription>
                        </div>
                        <Badge variant="default">
                          Scheduled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {interview.scheduledTime} ({interview.duration} mins)
                        </div>
                      </div>

                      {interview.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPinned className="h-4 w-4 text-muted-foreground" />
                          {interview.location}
                        </div>
                      )}

                      {interview.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={interview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {interview.meetingLink}
                          </a>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="p-3 bg-muted rounded text-sm">
                          <p className="font-semibold mb-1">Notes:</p>
                          <p>{interview.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
