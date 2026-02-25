import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationTableProps {
  applications: any[];
  onView: (app: any) => void;
  limit?: number;
}

export function ApplicationTable({ applications, onView, limit }: ApplicationTableProps) {
  const displayApplications = limit ? applications.slice(0, limit) : applications;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reviewed</Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shortlisted</Badge>;
      case 'interview_scheduled':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Interview Scheduled</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (displayApplications.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg border-dashed">
        <p className="text-muted-foreground">No applications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Job Position</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayApplications.map((app) => (
            <TableRow key={app.id || app._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={app.teacherAvatar} />
                    <AvatarFallback>{app.teacherName?.substring(0, 2).toUpperCase() || 'TR'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{app.teacherName}</p>
                    <p className="text-xs text-muted-foreground">{app.teacherEmail}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium">{app.jobId?.title || app.jobTitle}</p>
                <p className="text-xs text-muted-foreground">{app.jobId?.department || app.department}</p>
              </TableCell>
              <TableCell className="text-sm">
                {app.createdAt ? format(new Date(app.createdAt), 'MMM dd, yyyy') : 'Recently'}
              </TableCell>
              <TableCell>
                {getStatusBadge(app.status)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onView(app)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}