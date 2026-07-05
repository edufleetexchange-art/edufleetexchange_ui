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
import { mxPaperCard, mxEmptyPanel, mxLabel, mxBtnInk, mxBtnOutline, mxInput } from '@/lib/meridian';

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
      <div className="min-h-screen bg-[#F3F5F7] py-8">
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
    <div className="min-h-screen bg-[#F3F5F7] text-[#0B1626]">
      {/* Header — ink-navy ledger band (Meridian Exchange) */}
      <section className="relative overflow-hidden bg-[#081120] py-10 text-white sm:py-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 mx-grid-ink [mask-image:linear-gradient(to_right,transparent,black_45%)]"></div>
          <div className="absolute -right-28 -top-44 h-[380px] w-[380px] rounded-full bg-[#16857B]/20 blur-[110px]"></div>
          <div className="mx-rotate absolute -right-24 -top-40 h-[340px] w-[340px]">
            <div className="absolute inset-0 rounded-full border border-white/10"></div>
            <div className="absolute inset-[16%] rounded-full border border-[#2FB8AA]/35"></div>
            <div className="absolute inset-[34%] rounded-full border-2 border-[#F0A62B]/40"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent"></div>
          </div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="mx-serif text-3xl sm:text-[40px] sm:leading-tight font-semibold tracking-tight text-white mb-1">Browse Job Openings</h1>
              <div className="mb-3 h-1 w-24 bg-gradient-to-r from-[#2FB8AA] via-[#2FB8AA]/60 to-transparent" aria-hidden="true"></div>
              <p className="text-sm text-white/65">Discover career opportunities at educational institutes</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {banner && (
          <div className="mb-4 sm:mb-6">
            <Alert variant={banner.tone === 'destructive' ? 'destructive' : 'default'} className={banner.tone === 'warning' ? 'rounded-sm border-[#F0A62B]/45 bg-[#FDF4E1]' : 'rounded-sm'}>
              <AlertCircle className={`h-4 w-4 ${banner.tone === 'warning' ? 'text-[#A66B00]' : ''}`} />
              <AlertTitle className={banner.tone === 'warning' ? 'mx-serif tracking-tight text-[#0B1626]' : ''}>{banner.title}</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                <span className={banner.tone === 'warning' ? 'text-[#7A5200]' : ''}>{banner.body}</span>
                <a
                  href={!user && banner.tone === 'warning' ? '/teacher/signup' : '/#pricing'}
                  className={`inline-flex items-center justify-center rounded-none px-4 py-1.5 text-sm font-semibold whitespace-nowrap ${banner.tone === 'destructive' ? 'bg-destructive-foreground text-destructive hover:opacity-90' : 'bg-[#F0A62B] text-[#0B1626] hover:bg-[#FFB63F]'} transition-colors`}
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
                <Button variant="outline" className="w-full justify-start gap-2 rounded-sm border-[#0B1626]/20 bg-white text-[#0B1626] shadow-none hover:bg-[#FDF4E1] hover:text-[#0B1626]">
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
                      className={`pl-9 ${mxInput}`}
                    />
                  </div>
                  {/* Filters */}
                  <Card className={`p-6 ${mxPaperCard}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#16857B]" />
                        <h3 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B1626]/70">Filters</h3>
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
                        <label className={mxLabel}>Job Type</label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
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
                        <label className={mxLabel}>Department</label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
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
                        <label htmlFor="job-location-sheet" className={mxLabel}>Location</label>
                        <Input
                          id="job-location-sheet"
                          type="text"
                          className={mxInput}
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
                className={`pl-9 ${mxInput}`}
              />
            </div>

            {/* Filters */}
            <Card className={`p-6 ${mxPaperCard}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#16857B]" />
                  <h3 className="mx-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B1626]/70">Filters</h3>
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
                  <label className={mxLabel}>Job Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
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
                  <label className={mxLabel}>Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="rounded-sm border-[#0B1626]/20 bg-white">
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
                  <label htmlFor="job-location-sidebar" className={mxLabel}>Location</label>
                  <Input
                    id="job-location-sidebar"
                    type="text"
                    className={mxInput}
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
              <div className="mb-6 border-b border-[#0B1626]/10 pb-3">
                <p className="mx-mono text-xs uppercase tracking-[0.14em] text-[#0B1626]/55">
                  Showing <span className="font-semibold text-[#16857B]">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''}
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
              <Card className={`${mxEmptyPanel} p-12 text-center`}>
                <Briefcase className="w-12 h-12 text-[#16857B] mx-auto mb-4" />
                <h3 className="mx-serif text-2xl font-semibold tracking-tight mb-2">Hiring season starts here</h3>
                <p className="text-[#0B1626]/60 mb-6 max-w-md mx-auto">
                  We're onboarding schools in Mysuru right now — the first openings
                  will appear here. Schools can post a job free in under 3 minutes;
                  teachers who join now are first in line when hiring starts.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className={mxBtnInk}>
                    <Link to="/signup">Post a job — free</Link>
                  </Button>
                  <Button asChild variant="outline" className={mxBtnOutline}>
                    <Link to="/teacher/signup">Create free teacher profile</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className={`${mxEmptyPanel} p-12 text-center`}>
                <Briefcase className="w-12 h-12 text-[#0B1626]/30 mx-auto mb-4" />
                <h3 className="mx-serif text-2xl font-semibold tracking-tight mb-2">No jobs found</h3>
                <p className="text-[#0B1626]/60 mb-4">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  className={mxBtnOutline}
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
