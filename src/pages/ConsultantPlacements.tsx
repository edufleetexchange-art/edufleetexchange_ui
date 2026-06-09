import { useEffect, useState } from 'react';
import { placementService } from '@/api/services/placementService';
import { PlacementCard } from '@/components/PlacementCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadError } from '@/components/LoadError';
import { EmptyState } from '@/components/EmptyState';
import { Inbox } from 'lucide-react';
import type { Placement, PlacementStage } from '@/api/types';

const STAGES: PlacementStage[] = ['proposed', 'applied', 'interviewing', 'offer_extended', 'placed', 'declined', 'lost'];

export function ConsultantPlacements() {
  const [items, setItems] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<PlacementStage | 'all'>('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = stage === 'all' ? {} : { stage };
      const res = await placementService.list({ ...filter, pageSize: 100 });
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load placements.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [stage]);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Placements</h1>
      <Tabs value={stage} onValueChange={(v) => setStage(v as PlacementStage | 'all')}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {STAGES.map((s) => <TabsTrigger key={s} value={s}>{s.replace('_', ' ')}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={stage} className="mt-4">
          {loading ? <Skeleton className="h-32" /> :
            error ? <LoadError message={error} onRetry={load} /> :
            items.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No placements at this stage"
                description="Propose a teacher from your roster to a job, or move an existing placement forward."
              />
            ) :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p) => <PlacementCard key={p.id} placement={p} onChange={load} />)}
            </div>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ConsultantPlacements;
