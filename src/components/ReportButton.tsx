import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { reportService, ReportTargetType, ReportReason } from '@/api/services/reportService';
import { APIError } from '@/lib/apiClient';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
}

const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  fraud: 'Fraud or Scam',
  inappropriate: 'Inappropriate Content',
  inaccurate: 'Inaccurate Information',
  duplicate: 'Duplicate Listing',
  other: 'Other',
};

export function ReportButton({ targetType, targetId, className }: ReportButtonProps) {
  const { account } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) {
      toast.error('Please log in to report this content.');
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason.');
      return;
    }
    setSubmitting(true);
    try {
      await reportService.create({
        targetType,
        targetId,
        reason: reason as ReportReason,
        details: details.trim() || undefined,
      });
      toast.success('Report submitted. Thank you — we will review it.');
      setOpen(false);
      setReason('');
      setDetails('');
    } catch (err) {
      if (err instanceof APIError && err.statusCode === 409) {
        toast('You have already reported this. We are reviewing it.', { icon: 'ℹ️' });
        setOpen(false);
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 text-muted-foreground hover:text-destructive ${className ?? ''}`}
        onClick={handleOpen}
        title="Report this content"
        aria-label="Report"
        disabled={!account}
      >
        <Flag className="w-3.5 h-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Report this {targetType}</DialogTitle>
            <DialogDescription>
              Help us keep EduFleet safe. Select a reason and we will review it promptly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REASON_LABELS) as ReportReason[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {REASON_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Additional details (optional)</Label>
              <Textarea
                id="report-details"
                placeholder="Provide any extra context..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={1000}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !reason}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
