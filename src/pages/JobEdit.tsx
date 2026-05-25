import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { JobListingForm } from '@/components/JobListingForm';
import type { JobFormValues } from '@/components/JobListingForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

/**
 * JobEdit page
 * Fetches an existing job by :jobId, pre-populates JobListingForm in edit mode,
 * and PUTs the updated payload on submit. Navigates back to /dashboard on success.
 */
export function JobEdit() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<JobFormValues> | null>(null);

  useEffect(() => {
    if (!jobId) {
      setFetchError('No job ID provided.');
      setLoading(false);
      return;
    }
    loadJob(jobId);
  }, [jobId]);

  const loadJob = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.jobs.getJobById(id);
      const job = response.data;

      if (!job) {
        setFetchError('Job not found.');
        return;
      }

      // Normalise API shape → JobFormValues flat shape
      const locCity =
        typeof job.location === 'string' ? '' : (job.location as any)?.city || '';
      const locState =
        typeof job.location === 'string' ? '' : (job.location as any)?.state || '';

      const expMin =
        typeof job.experience === 'string'
          ? ''
          : String((job.experience as any)?.min ?? '');
      const expMax =
        typeof job.experience === 'string'
          ? ''
          : String((job.experience as any)?.max ?? '');

      const salMin =
        typeof job.salary === 'string' ? '' : String((job.salary as any)?.min ?? '');
      const salMax =
        typeof job.salary === 'string' ? '' : String((job.salary as any)?.max ?? '');

      // applicationDeadline → deadline (YYYY-MM-DD)
      const rawDeadline = (job as any).applicationDeadline || job.deadline || '';
      const deadline = rawDeadline ? rawDeadline.slice(0, 10) : '';

      setInitialValues({
        title: job.title || '',
        department: job.department || '',
        city: locCity,
        state: locState,
        employmentType: ((job as any).employmentType || job.type || 'full-time') as JobFormValues['employmentType'],
        experienceMin: expMin,
        experienceMax: expMax,
        salaryMin: salMin,
        salaryMax: salMax,
        description: job.description || '',
        deadline,
        instituteId: '',
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        subjects: Array.isArray((job as any).subjects) ? (job as any).subjects : [],
        qualifications: Array.isArray((job as any).qualification)
          ? (job as any).qualification
          : [],
      });
    } catch (error: any) {
      console.error('Failed to load job:', error);
      setFetchError(error?.error || error?.message || 'Failed to load job.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload: any) => {
    if (!jobId) return;
    const response = await api.jobs.updateJob(jobId, payload);
    if (response.success || response.data) {
      toast.success('Job updated successfully!');
      navigate('/dashboard?tab=jobs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (fetchError || !initialValues) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium mb-4">
            {fetchError || 'Failed to load job.'}
          </p>
          <button
            className="text-primary underline"
            onClick={() => navigate('/dashboard?tab=jobs')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <JobListingForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleUpdate}
          onSuccess={() => navigate('/dashboard?tab=jobs')}
        />
      </div>
    </div>
  );
}
