import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, statusToTone } from '@/components/StatusBadge';
import { placementService } from '@/api/services/placementService';
import type { Placement, PlacementStage } from '@/api/types';
import { toast } from 'sonner';

const ALLOWED_NEXT: Record<PlacementStage, PlacementStage[]> = {
  proposed:       ['applied', 'lost'],
  applied:        ['interviewing', 'declined', 'lost'],
  interviewing:   ['offer_extended', 'declined', 'lost'],
  offer_extended: ['placed', 'declined', 'lost'],
  placed: [], declined: [], lost: [],
};

const STAGE_LABEL: Record<PlacementStage, string> = {
  proposed: 'Proposed', applied: 'Applied', interviewing: 'Interviewing',
  offer_extended: 'Offer Extended', placed: 'Placed', declined: 'Declined', lost: 'Lost',
};

interface Props {
  placement: Placement;
  onChange?: () => void;
}

export function PlacementCard({ placement, onChange }: Props) {
  const next = ALLOWED_NEXT[placement.stage];
  const teacher = typeof placement.teacherAccountId === 'string' ? null : placement.teacherAccountId;
  const job = typeof placement.jobId === 'string' ? null : placement.jobId;

  const handleTransition = async (to: PlacementStage) => {
    try {
      await placementService.transition(placement.id, to);
      toast.success(`Moved to ${STAGE_LABEL[to]}`);
      onChange?.();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to transition');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{teacher?.name ?? 'Teacher'}</p>
            <p className="text-xs text-muted-foreground truncate">{job?.title ?? 'Job'} · {job?.instituteName ?? ''}</p>
          </div>
          <StatusBadge {...statusToTone(placement.stage)} label={STAGE_LABEL[placement.stage]} />
        </div>
        {next.length > 0 && (
          <Select onValueChange={(v) => handleTransition(v as PlacementStage)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Move to…" /></SelectTrigger>
            <SelectContent>
              {next.map((s) => <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
