import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadError } from '@/components/LoadError';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge, statusToTone } from '@/components/StatusBadge';
import { CreateAlertDialog } from '@/components/CreateAlertDialog';
import { alertService } from '@/api/services/alertService';
import type { Alert } from '@/api/types';
import { Bell, Trash2, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

export function MyAlerts() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertService.listMine();
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load your alerts.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (a: Alert) => {
    try {
      await alertService.patch(a.id, { status: a.status === 'active' ? 'paused' : 'active' });
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update');
    }
  };

  const remove = async (id: string) => {
    try {
      await alertService.remove(id);
      toast.success('Alert removed');
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to remove');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">My Alerts</h1>
          <p className="text-sm text-muted-foreground">Get notified the moment a matching teacher is available.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Bell className="w-4 h-4" /> New alert</Button>
      </div>

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : error ? (
        <LoadError message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Set an alert like 'Maths teacher in Bengaluru' and we'll ping you when one is available."
          actionLabel="Create your first alert"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{a.label}</p>
                  <StatusBadge {...statusToTone(a.status)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Matches so far: {a.matchCount}
                  {a.lastMatchedAt ? ` · last ${new Date(a.lastMatchedAt).toLocaleDateString()}` : ''}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => toggle(a)}>
                    {a.status === 'active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => remove(a.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAlertDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
    </div>
  );
}

export default MyAlerts;
