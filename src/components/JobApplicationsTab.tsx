import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  _id?: string;
  id?: string;
  teacherName?: string;
  teacherEmail?: string;
  jobTitle?: string;
  jobId?: any; // can be string OR populated object
  status: string;
  appliedDate?: string;
  createdAt?: string;
  coverLetter?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700', icon: <Eye className="w-3 h-3" /> },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700', icon: <FileText className="w-3 h-3" /> },
  interview_scheduled: { label: 'Interview', color: 'bg-orange-100 text-orange-700', icon: <Briefcase className="w-3 h-3" /> },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
};

// ✅ helper: normalize jobId (string or populated object)
const resolveJobId = (jobId: any): string => {
  if (!jobId) return '';
  if (typeof jobId === 'string') return jobId;
  // common populated shapes:
  return jobId.id || jobId._id || jobId.jobId || '';
};

export function JobApplicationsTab() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.jobs.getApplications({});
      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as any).items || [];
        setApplications(items);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getApplicationsByStatus = (status: string) => {
    if (status === 'all') return applications;
    return applications.filter((app) => app.status === status);
  };

  const getCount = (status: string) =>
    status === 'all' ? applications.length : applications.filter((a) => a.status === status).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Job Applications</h2>
          <p className="text-sm text-muted-foreground">
            {applications.length} total application{applications.length !== 1 ? 's' : ''} across all your jobs
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchApplications}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card
          className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${activeTab === 'all' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <div className="flex items-center gap-2 mb-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <p className="text-sm">Total</p>
          </div>
          <p className="text-2xl font-bold">{applications.length}</p>
        </Card>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <Card
            key={status}
            className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${
              activeTab === status ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setActiveTab(status)}
          >
            <div className={`flex items-center gap-2 mb-1 ${activeTab === status ? 'text-primary' : 'text-muted-foreground'}`}>
              {config.icon}
              <p className="text-sm">{config.label}</p>
            </div>
            <p className="text-2xl font-bold">{getCount(status)}</p>
          </Card>
        ))}
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50">
          <TabsTrigger value="all" className="px-4 py-2">All</TabsTrigger>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <TabsTrigger key={status} value={status} className="px-4 py-2">
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <ApplicationsTable
            applications={getApplicationsByStatus(activeTab)}
            statusLabel={activeTab === 'all' ? 'Applications' : STATUS_CONFIG[activeTab]?.label}
            onNavigate={(jobId) => navigate(`/institute/job/${jobId}/applications`)}
          />
        </div>
      </Tabs>
    </div>
  );
}

function ApplicationsTable({
  applications,
  statusLabel,
  onNavigate
}: {
  applications: Application[],
  statusLabel: string,
  onNavigate: (jobId: string) => void
}) {
  if (applications.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No {statusLabel} Found</h3>
        <p className="text-muted-foreground text-sm mb-4">
          When candidates apply for your jobs, their information will appear here.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Job Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const appId = app._id || app.id || '';
              const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              const appliedDate = app.appliedDate || app.createdAt;

              // ✅ normalize job id here
              const jobId = resolveJobId(app.jobId);

              return (
                <TableRow key={appId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(app.teacherName || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{app.teacherName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{app.teacherEmail || ''}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm font-medium line-clamp-1">{app.jobTitle || 'N/A'}</p>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConf.color}`}
                    >
                      {statusConf.icon}
                      {statusConf.label}
                    </span>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {appliedDate
                        ? new Date(appliedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </TableCell>

                  <TableCell className="text-right">
                    {jobId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onNavigate(jobId)}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View Details</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}