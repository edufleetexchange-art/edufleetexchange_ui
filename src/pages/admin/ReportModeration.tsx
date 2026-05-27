import { useState, useEffect } from 'react';
import { reportService } from '@/api/services/reportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Flag, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  details?: string;
  resolution?: string;
  createdAt: string;
  reporterAccountId?: { name: string; email: string; role: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-500/10 text-red-600 border-red-500/20',
  reviewing: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

export default function ReportModeration() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter, targetTypeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 100 };
      if (statusFilter) params.status = statusFilter;
      if (targetTypeFilter) params.targetType = targetTypeFilter;
      const res = await reportService.list(params) as any;
      const items = res?.items ?? res ?? [];
      const t = res?.total ?? items.length;
      setReports(items);
      setTotal(t);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: string, res?: string) => {
    setActionLoading(true);
    try {
      await reportService.update(id, { status, resolution: res });
      toast.success(`Report marked as ${status}`);
      await loadReports();
      setSelectedReport(null);
    } catch {
      toast.error('Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const reporter = r.reporterAccountId;
    if (!reporter) return false;
    const term = search.toLowerCase();
    return reporter.name?.toLowerCase().includes(term) || reporter.email?.toLowerCase().includes(term);
  });

  const targetLink = (r: ReportItem) => {
    if (r.targetType === 'vehicle') return `/vehicle/${r.targetId}`;
    if (r.targetType === 'job') return `/job/${r.targetId}`;
    if (r.targetType === 'supplier') return `/suppliers`;
    return null;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Report Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve flagged listings and user reports ({total} total)
          </p>
        </div>
        <Button onClick={loadReports} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select value={targetTypeFilter || 'all'} onValueChange={(v) => setTargetTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search reporter</Label>
                <Input placeholder="Name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-card rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Target Type</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const link = targetLink(report);
                  return (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => { setSelectedReport(report); setResolution(report.resolution ?? ''); }}
                    >
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {report.reporterAccountId ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{report.reporterAccountId.name}</span>
                            <span className="text-[10px] text-muted-foreground">{report.reporterAccountId.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">{report.targetType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {report.targetId.slice(-8)}
                          </a>
                        ) : (
                          report.targetId.slice(-8)
                        )}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{report.reason}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] capitalize border ${STATUS_COLORS[report.status] ?? ''}`}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {report.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] h-7 px-2"
                              onClick={() => handleAction(report.id, 'reviewing')}
                              disabled={actionLoading}
                            >
                              Review
                            </Button>
                          )}
                          {(report.status === 'open' || report.status === 'reviewing') && (
                            <>
                              <Button
                                size="sm"
                                className="text-[10px] h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAction(report.id, 'resolved')}
                                disabled={actionLoading}
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[10px] h-7 px-2 text-muted-foreground"
                                onClick={() => handleAction(report.id, 'dismissed')}
                                disabled={actionLoading}
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(o) => { if (!o) setSelectedReport(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Report Details
            </DialogTitle>
            <DialogDescription>
              Submitted {selectedReport ? format(new Date(selectedReport.createdAt), 'PPP p') : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">Target Type:</span> <span className="capitalize">{selectedReport.targetType}</span></div>
                <div><span className="font-medium">Reason:</span> <span className="capitalize">{selectedReport.reason}</span></div>
                <div><span className="font-medium">Status:</span>
                  <Badge className={`ml-1 text-[10px] capitalize border ${STATUS_COLORS[selectedReport.status] ?? ''}`}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div><span className="font-medium">Reporter:</span> {selectedReport.reporterAccountId?.name ?? 'Unknown'}</div>
              </div>
              {selectedReport.details && (
                <div>
                  <span className="font-medium">Details:</span>
                  <p className="mt-1 text-muted-foreground">{selectedReport.details}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Resolution note</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Optional note for audit purposes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
            {selectedReport && (selectedReport.status === 'open' || selectedReport.status === 'reviewing') && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAction(selectedReport.id, 'resolved', resolution)}
                  disabled={actionLoading}
                >
                  Resolve
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleAction(selectedReport.id, 'dismissed', resolution)}
                  disabled={actionLoading}
                >
                  Dismiss
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
