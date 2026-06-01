import { useState, useEffect } from 'react';
import { adminService } from '@/api/services/adminService';
import { AuditLog, AuditLogFilters } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  Activity,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableWrapper } from '@/components/ui/table-wrapper';

export default function AuditLogManagement() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    role: undefined,
    action: undefined,
    employeeId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLogs(filters);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: undefined,
      action: undefined,
      employeeId: '',
      startDate: '',
      endDate: ''
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_USER':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Create User</Badge>;
      case 'UPDATE_USER_STATUS':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Update User</Badge>;
      case 'ASSISTED_VEHICLE_LISTING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Vehicle Assist</Badge>;
      case 'ASSISTED_JOB_LISTING':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Job Assist</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track actions taken by marketing team and administrators</p>
        </div>
        <Button onClick={loadLogs} variant="outline" className="gap-2">
          <Activity className="w-4 h-4" />
          Refresh Logs
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label>User Role</Label>
                <Select 
                  value={filters.role || "all"} 
                  onValueChange={(val) => handleFilterChange('role', val === "all" ? undefined : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select 
                  value={filters.action || "all"} 
                  onValueChange={(val) => handleFilterChange('action', val === "all" ? undefined : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE_USER">Create User</SelectItem>
                    <SelectItem value="UPDATE_USER_STATUS">Update Status</SelectItem>
                    <SelectItem value="ASSISTED_VEHICLE_LISTING">Vehicle Assist</SelectItem>
                    <SelectItem value="ASSISTED_JOB_LISTING">Job Assist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input 
                  placeholder="e.g. EMP001" 
                  value={filters.employeeId}
                  onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={loadLogs} className="flex-1">Apply</Button>
                <Button onClick={clearFilters} variant="outline" size="icon">
                  <span className="sr-only">Clear</span>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TableWrapper className="bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {log.userName}
                        </span>
                        <span className="text-[10px] uppercase text-muted-foreground font-mono">
                          {log.userRole} {log.employeeId ? `| ${log.employeeId}` : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      {log.targetType && (
                        <div className="flex flex-col">
                          <Badge variant="outline" className="text-[10px] uppercase w-fit">{log.targetType}</Badge>
                          <span className="text-[10px] text-muted-foreground font-mono mt-1">{log.targetId}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm">{log.details}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableWrapper>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
