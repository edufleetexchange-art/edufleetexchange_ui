import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { JobCard } from '@/components/JobCard';
import { useJobs } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Filter, Briefcase, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConfig } from '@/context/ConfigContext';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkBrowseLimit } from '@/api/services/subscriptionEnforcement';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function JobBrowse() {
  const { account: user, subscription } = useAuth();
  const { categories } = useConfig();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [debouncedLocationFilter, setDebouncedLocationFilter] = useState('');
  const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);
  const [browseLimitReached, setBrowseLimitReached] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // 300ms debounce on text inputs
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocationFilter(locationFilter), 300);
    return () => clearTimeout(t);
  }, [locationFilter]);

  // Enforce browse quota on mount — authenticated users only
  useEffect(() => {
    if (!user) return;
    checkBrowseLimit().then((result) => {
      if (result.data?.allowed === false) setBrowseLimitReached(true);
    });
  }, [user]);

  // Use server-side filtering
  const { jobs, loading } = useJobs({
    searchTerm: debouncedSearchTerm,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    location: debouncedLocationFilter || undefined,
    pageSize: 100 // Fetch more items since we don't have pagination UI yet
  });

  // Extract unique departments from loaded jobs
  useEffect(() => {
    if (jobs.length > 0) {
      const departments = Array.from(new Set(jobs.map(j => j.department)));
      setUniqueDepartments(departments);
    }
  }, [jobs]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setLocationFilter('');
    setDebouncedLocationFilter('');
  };

  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all' || departmentFilter !== 'all' || locationFilter !== '';
  
  // Subscription check — subscription is now a plain Subscription | null
  const activePlanId = subscription?.planId;
  const activePlan = activePlanId ? { price: 0 } : null;
  const isFreePlan = !user || activePlan?.price === 0;
  const hasDelay = isFreePlan;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="w-64 h-10 mb-8" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/4">
              <Skeleton className="h-64 mb-4" />
              <Skeleton className="h-64" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // "Marketplace empty" (nothing posted yet) is a different situation from
  // "filters too narrow" — the first needs a launch CTA, the second a reset.
  const marketplaceEmpty = jobs.length === 0 && !hasActiveFilters;

  // Consolidate the two possible plan banners into one slot so the primary task
  // (search + results) stays above the fold. Hard-limit overrides the soft-delay
  // banner since it's strictly more severe. Suppress the "hidden listings"
  // banner entirely when nothing is posted — implying hidden content on an
  // empty marketplace is misleading.
  const banner = marketplaceEmpty ? null : browseLimitReached
    ? { tone: 'destructive' as const, title: 'Monthly browse limit reached', body: "You've reached your monthly browse limit. Upgrade to see more listings.", cta: 'Upgrade Plan' }
    : !user
      ? {
          // Honest gate: browsing is free and unrestricted; the account is
          // needed to APPLY. (The old copy claimed newer jobs were hidden,
          // which wasn't true and scared guests off.)
          tone: 'warning' as const,
          title: 'Browsing as guest',
          body: 'Jobs are free to browse — create a free account to apply and message schools directly.',
          cta: 'Sign up free',
        }
      : null;

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header — tighter margins on small screens so results show above the fold sooner. */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Browse Job Openings</h1>
            <p className="text-sm text-muted-foreground">Discover career opportunities at educational institutes</p>
          </div>
        </div>

        {banner && (
          <div className="mb-4 sm:mb-6">
            <Alert variant={banner.tone === 'destructive' ? 'destructive' : 'default'} className={banner.tone === 'warning' ? 'border-amber-200 bg-amber-50' : ''}>
              <AlertCircle className={`h-4 w-4 ${banner.tone === 'warning' ? 'text-amber-600' : ''}`} />
              <AlertTitle>{banner.title}</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                <span className={banner.tone === 'warning' ? 'text-amber-800' : ''}>{banner.body}</span>
                <a
                  href={!user && banner.tone === 'warning' ? '/teacher/signup' : '/#pricing'}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-1.5 text-sm font-semibold whitespace-nowrap ${banner.tone === 'destructive' ? 'bg-destructive-foreground text-destructive hover:opacity-90' : 'bg-amber-600 text-white hover:bg-amber-700'} transition-opacity`}
                >
                  {banner.cta}
                </a>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter trigger */}
          <div className="lg:hidden mb-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-background"
                    />
                  </div>
                  {/* Filters */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <h3 className="font-bold">Filters</h3>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Job Type</label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Department</label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {categories.filter(c => c.type === 'job').map(cat => (
                              <SelectItem key={cat._id} value={cat.slug}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="job-location-sheet" className="text-xs font-semibold text-muted-foreground">Location</label>
                        <Input
                          id="job-location-sheet"
                          type="text"
                          placeholder="City or state"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block lg:w-1/4 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <h3 className="font-bold">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Job Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {categories.filter(c => c.type === 'job').map(cat => (
                        <SelectItem key={cat._id} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-location-sidebar" className="text-xs font-semibold text-muted-foreground">Location</label>
                  <Input
                    id="job-location-sidebar"
                    type="text"
                    placeholder="City or state"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Sidebar Ad */}
            <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
          </aside>

            {/* Results */}
          <div className="flex-1">
            {!marketplaceEmpty && (
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {jobs.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-6">
                {jobs.map((job, index) => (
                  <div key={job.id || (job as any)._id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : marketplaceEmpty ? (
              <Card className="p-12 text-center border-dashed">
                <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hiring season starts here</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're onboarding schools in Mysuru right now — the first openings
                  will appear here. Schools can post a job free in under 3 minutes;
                  teachers who join now are first in line when hiring starts.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/signup">Post a job — free</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/teacher/signup">Create free teacher profile</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center border-dashed">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
