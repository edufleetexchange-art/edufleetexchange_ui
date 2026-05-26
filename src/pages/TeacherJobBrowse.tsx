import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { jobService } from '@/api/services/jobService';
import type { Job } from '@/api/services/jobService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, MapPin, Briefcase, DollarSign, Calendar, Building, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdSlot } from '@/components/ads/AdSlot';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { checkBrowseLimit } from '@/api/services/subscriptionEnforcement';

const formatLocation = (location: any): string => {
  if (!location) return 'Location not specified';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  return String(location);
};

const formatSalary = (salary: any): string => {
  if (!salary) return 'Salary not specified';
  if (typeof salary === 'string') return salary;
  if (typeof salary === 'object') {
    const min = salary.min || salary.salaryMin;
    const max = salary.max || salary.salaryMax;
    const currency = salary.currency || '₹';
    
    if (min && max) {
      return `${currency}${(min/1000).toFixed(0)}k - ${currency}${(max/1000).toFixed(0)}k`;
    }
    return 'Salary not specified';
  }
  return String(salary);
};

const formatExperience = (experience: any): string => {
  if (!experience && experience !== 0) return 'Experience not specified';
  if (typeof experience === 'string') return experience;
  if (typeof experience === 'object') {
    const min = experience.min;
    const max = experience.max;
    if (min !== undefined && max !== undefined) {
      if (min === max) return `${min} years`;
      return `${min}-${max} years`;
    }
    return 'Experience not specified';
  }
  return String(experience);
};

const PAGE_SIZE = 20;

export function TeacherJobBrowse() {
  const { account } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [debouncedLocationFilter, setDebouncedLocationFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [debouncedSubjectFilter, setDebouncedSubjectFilter] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [browseLimitReached, setBrowseLimitReached] = useState(false);

  // 300ms debounce on text inputs
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSubjectFilter(subjectFilter), 300);
    return () => clearTimeout(t);
  }, [subjectFilter]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocationFilter(locationFilter), 300);
    return () => clearTimeout(t);
  }, [locationFilter]);

  // Enforce browse quota on mount — authenticated users only
  useEffect(() => {
    if (!account) return;
    checkBrowseLimit().then((result) => {
      if (result.data?.allowed === false) setBrowseLimitReached(true);
    });
  }, [account]);

  useEffect(() => {
    loadJobs();
  }, [debouncedSearchTerm, typeFilter, debouncedLocationFilter, debouncedSubjectFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getAllJobs({
        searchTerm: debouncedSearchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter as any : undefined,
        location: debouncedLocationFilter || undefined,
        department: debouncedSubjectFilter || undefined,
        status: 'open',
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setJobs(response.data.items);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-500';
      case 'part-time': return 'bg-blue-500';
      case 'contract': return 'bg-purple-500';
      case 'internship': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {browseLimitReached && (
          <div className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Monthly browse limit reached</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                <span>You've reached your monthly browse limit. Upgrade your plan to see more listings.</span>
                <a
                  href="/#pricing"
                  className="inline-flex items-center justify-center rounded-md bg-destructive-foreground text-destructive px-4 py-1.5 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Upgrade Plan
                </a>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Find your next teaching opportunity at top educational institutes
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title, department, or institute..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Subject / Department Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Subject / Department..."
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location (city, state...)"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `Showing ${filteredJobs.length} jobs`}
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setDebouncedSearchTerm('');
            setTypeFilter('all');
            setLocationFilter('');
            setDebouncedLocationFilter('');
            setSubjectFilter('');
            setDebouncedSubjectFilter('');
          }}>
            Clear Filters
          </Button>
        </div>

        {/* Inline Ad */}
        <div className="mb-8">
          <AdSlot placement="LP_INLINE_1" variant="banner" />
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading jobs...</p>
              </CardContent>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No jobs found. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-1">
                            {job.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span className="font-semibold">{job.institute}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Job Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{formatLocation(job.location)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Badge className={`${getTypeColor(job.type)} text-white text-xs`}>
                          {job.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatExperience(job.experience)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    {/* Department and Deadline */}
                    <div className="flex items-center gap-4 text-sm">
                      {job.department && <Badge variant="outline">{job.department}</Badge>}
                      {job.deadline && (
                        <span className="text-muted-foreground">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Link to={`/job/${job.id || (job as any)._id}`} className="flex-1">
                        <Button className="w-full">View Details & Apply</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination could go here */}
        {filteredJobs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing all {filteredJobs.length} jobs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}