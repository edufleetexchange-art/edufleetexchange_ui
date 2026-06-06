import { useEffect, useState } from 'react';
import { interviewService } from '@/api/services/interviewService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Interview } from '@/api/types';

export function ConsultantInterviews() {
  const [items, setItems] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await interviewService.list({});
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    try { await interviewService.cancel(id, 'Canceled by consultant'); toast.success('Canceled'); load(); }
    catch (e: any) { toast.error(e?.message ?? 'Failed'); }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Interviews</h1>
      {loading ? <Skeleton className="h-32" /> :
        items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No interviews scheduled.</p> :
        <div className="space-y-3">
          {items.map((iv) => (
            <Card key={iv.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold">Round {iv.round} · {iv.mode.replace('_', '-')}</p>
                  <p className="text-sm text-muted-foreground">{new Date(iv.scheduledAt).toLocaleString()}</p>
                  {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="text-xs underline">Open meeting link</a>}
                  {iv.location && <p className="text-xs">📍 {iv.location}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{iv.status}</Badge>
                  {iv.status === 'scheduled' && <Button size="sm" variant="ghost" onClick={() => handleCancel(iv.id)}>Cancel</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

export default ConsultantInterviews;
