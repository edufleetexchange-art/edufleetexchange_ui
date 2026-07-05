import { Job } from '@/api/services/jobService';
import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Building2, Clock, DollarSign } from 'lucide-react';
import { MaskedContent } from '@/components/MaskedContent';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ShareButton';
import { ReportButton } from '@/components/ReportButton';

// Helper function to safely format dates
const formatDate = (dateValue: string | undefined | null): string => {
  if (!dateValue) return 'Not specified';
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Not specified';
    return date.toLocaleDateString();
  } catch {
    return 'Not specified';
  }
};

// Helper function to format location
const formatLocation = (location: any): string => {
  if (!location) return 'Location not specified';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  return String(location);
};

// Helper function to format salary
const formatSalary = (salary: any): { min: number; max: number } => {
  if (!salary) return { min: 0, max: 0 };
  if (typeof salary === 'object' && salary !== null) {
    return { 
      min: salary.min || salary.salaryMin || 0, 
      max: salary.max || salary.salaryMax || 0 
    };
  }
  // Handle string salary like "50000-70000"
  if (typeof salary === 'string') {
    const parts = salary.split('-').map(s => parseInt(s.replace(/[^0-9]/g, '')) || 0);
    return { min: parts[0] || 0, max: parts[1] || parts[0] || 0 };
  }
  return { min: 0, max: 0 };
};

// Helper function to format experience
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

interface JobCardProps {
  job: Job;
  isListing?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function JobCard({ job, isListing = false, className, style }: JobCardProps) {
  const { account } = useAuth();
  const { getCategoryName } = useConfig();
  const navigate = useNavigate();
  // Browse-level info (title, salary) is public: a guest must be able to
  // evaluate a job before being asked to sign up. The gate lives at
  // apply/contact (JobDetails), not at reading.
  const isUnmasked = true;

  const handleClick = () => {
    navigate(`/job/${job.id || (job as any)._id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer relative group flex-shrink-0 w-full h-full min-h-[192px] ${className || ''}`}
      style={style}
    >
      <Card className="overflow-hidden border border-[#0B1626]/15 shadow-none group-hover:border-[#0B1626]/35 group-hover:shadow-[0_16px_32px_-20px_rgba(3,9,20,0.45)] transition-all duration-300 rounded-md w-full h-full flex flex-col p-2 bg-white">
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="border border-[#16857B]/25 bg-[#16857B]/[0.08] p-1.5 rounded-sm">
            <Briefcase className="w-4 h-4 text-[#16857B]" />
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <Badge variant="secondary" className="mx-mono text-[8px] h-4 px-1 leading-none rounded-none border border-[#0B1626]/15 bg-[#F3F5F7] uppercase tracking-[0.08em] text-[#0B1626]/70">
              {getCategoryName(job.department || 'other', 'job')}
            </Badge>
            {job.isPriority && (
              <div className="mt-0.5 scale-50 origin-top-right">
                <PriorityBadge />
              </div>
            )}
            <ReportButton
              targetType="job"
              targetId={String(job.id || (job as any)._id)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow min-h-0">
          {!isUnmasked && !isListing ? (
            <MaskedContent variant="text" label="Login" className="h-4 w-full mb-0.5">
              <h3 className="font-bold text-[13px] leading-tight line-clamp-2 text-[#0B1626] mb-0.5 group-hover:text-[#16857B] transition-colors">
                {job.title}
              </h3>
            </MaskedContent>
          ) : (
            <h3 className="font-bold text-[13px] leading-tight line-clamp-2 text-[#0B1626] mb-0.5 group-hover:text-[#16857B] transition-colors" title={job.title}>
              {job.title}
            </h3>
          )}
          
          <div className="flex flex-col gap-0.5 text-[10px] text-[#0B1626]/55">
            <div className="flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{job.instituteName}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{formatLocation(job.location)}</span>
            </div>
          </div>

          <div className="mt-auto pt-1.5 flex flex-col gap-1.5 border-t border-[#0B1626]/10">
            <div className="flex items-center justify-between pt-1">
              <div className="mx-mono flex items-center gap-0.5 text-[11px] font-bold text-[#16857B]">
                <DollarSign className="w-3 h-3" />
                {isUnmasked || isListing ? (
                  <span className="truncate">
                    {(() => {
                      const salary = formatSalary(job.salary);
                      return `${(salary.min / 1000).toFixed(0)}k-${(salary.max / 1000).toFixed(0)}k`;
                    })()}
                  </span>
                ) : (
                  <MaskedContent variant="text" label="Login" className="w-10 h-3" />
                )}
              </div>
              <div className="mx-mono text-[8px] text-[#0B1626]/45">
                {formatDate(job.postedAt || job.postedDate || job.createdAt)}
              </div>
            </div>

            <Button
              size="sm"
              className="w-full text-[10px] h-6 rounded-sm bg-[#0B1626] hover:bg-[#13233A] text-white border-none shadow-none font-semibold transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              View & Apply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
