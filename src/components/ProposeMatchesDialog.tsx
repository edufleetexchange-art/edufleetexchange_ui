import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { consultantService } from '@/api/services/consultantService';
import { placementService } from '@/api/services/placementService';
import { toast } from 'sonner';

interface Props {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProposed?: () => void;
}

export function ProposeMatchesDialog({ jobId, open, onOpenChange, onProposed }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<{ teacher: any; score: number }>>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    consultantService.recommendedTeachersForJob(jobId, 20)
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, [open, jobId]);

  const handlePropose = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) { toast.error('Select at least one teacher'); return; }
    setSubmitting(true);
    let ok = 0, dup = 0, fail = 0;
    for (const teacherAccountId of ids) {
      try {
        await placementService.create({ teacherAccountId, jobId, initialStage: 'proposed' });
        ok++;
      } catch (e: any) {
        if (/duplicate|already/i.test(e?.message ?? '')) dup++;
        else fail++;
      }
    }
    setSubmitting(false);
    toast.success(`Proposed ${ok}${dup ? `, ${dup} already pending` : ''}${fail ? `, ${fail} failed` : ''}`);
    onProposed?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Propose teachers to this job</DialogTitle>
          <DialogDescription>Top matches from your roster, ranked by skill-match score.</DialogDescription>
        </DialogHeader>
        {loading ? <Skeleton className="h-32" /> :
          items.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">No rostered teachers match this job.</p> :
          <ul className="divide-y max-h-72 overflow-y-auto">
            {items.map((it) => {
              const id = String(it.teacher.accountId ?? it.teacher.id);
              return (
                <li key={id} className="py-2 flex items-center gap-3">
                  <Checkbox checked={!!selected[id]} onCheckedChange={(v) => setSelected((p) => ({ ...p, [id]: !!v }))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.teacher.name ?? id}</p>
                    <p className="text-xs text-muted-foreground">Match: {(it.score).toFixed(0)}%</p>
                  </div>
                </li>
              );
            })}
          </ul>
        }
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handlePropose} disabled={submitting}>{submitting ? 'Proposing…' : 'Propose selected'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
