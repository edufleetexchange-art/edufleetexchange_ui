import { useState, useEffect } from 'react';
import { verificationService } from '@/api/services/verificationService';
import { Button } from '@/components/ui/button';
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
import { Filter, BadgeCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface VerificationItem {
  id: string;
  targetType: string;
  documentType: string;
  documentUrl: string;
  notes?: string;
  status: string;
  reviewNotes?: string;
  createdAt: string;
  accountId?: { name: string; email: string; role: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  verified: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  gst_certificate: 'GST Certificate',
  pan_card: 'PAN Card',
  registration_certificate: 'Registration Certificate',
  other: 'Other',
};

export default function VerificationModeration() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [statusFilter, targetTypeFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 100 };
      if (statusFilter) params.status = statusFilter;
      if (targetTypeFilter) params.targetType = targetTypeFilter;
      const res = await verificationService.listAdmin(params) as any;
      const list = res?.items ?? res ?? [];
      setItems(list);
      setTotal(res?.total ?? list.length);
    } catch {
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'verified' | 'rejected', notes?: string) => {
    setActionLoading(true);
    try {
      await verificationService.reviewAdmin(id, { status, reviewNotes: notes });
      toast.success(`Request marked as ${status}`);
      await loadItems();
      setSelected(null);
    } catch {
      toast.error('Failed to update verification request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Verification Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Review KYC requests from institutes and vendors ({total} total)
          </p>
        </div>
        <Button onClick={loadItems} variant="outline" className="gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select value={targetTypeFilter || 'all'} onValueChange={(v) => setTargetTypeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-card rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Target Type</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                    No verification requests found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => { setSelected(item); setReviewNotes(item.reviewNotes ?? ''); }}
                  >
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {item.accountId ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.accountId.name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.accountId.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">{item.targetType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {DOC_TYPE_LABELS[item.documentType] || item.documentType}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] capitalize border ${STATUS_COLORS[item.status] ?? ''}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={item.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Doc
                        </a>
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="text-[10px] h-7 px-2 bg-green-600 hover:bg-green-700 text-white ml-2"
                              onClick={() => handleAction(item.id, 'verified')}
                              disabled={actionLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[10px] h-7 px-2 text-destructive"
                              onClick={() => handleAction(item.id, 'rejected')}
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Verification Request Details
            </DialogTitle>
            <DialogDescription>
              Submitted {selected ? format(new Date(selected.createdAt), 'PPP p') : ''}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">Target Type:</span> <span className="capitalize">{selected.targetType}</span></div>
                <div><span className="font-medium">Document:</span> {DOC_TYPE_LABELS[selected.documentType] || selected.documentType}</div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-1 text-[10px] capitalize border ${STATUS_COLORS[selected.status] ?? ''}`}>
                    {selected.status}
                  </Badge>
                </div>
                <div><span className="font-medium">Requester:</span> {selected.accountId?.name ?? 'Unknown'}</div>
              </div>
              {selected.notes && (
                <div>
                  <span className="font-medium">Submitter Notes:</span>
                  <p className="mt-1 text-muted-foreground">{selected.notes}</p>
                </div>
              )}
              <div>
                <a
                  href={selected.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Document
                </a>
              </div>
              {selected.status === 'pending' && (
                <div className="space-y-2">
                  <Label>Review Notes (optional)</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Notes for the requester..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            {selected && selected.status === 'pending' && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAction(selected.id, 'verified', reviewNotes)}
                  disabled={actionLoading}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(selected.id, 'rejected', reviewNotes)}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
