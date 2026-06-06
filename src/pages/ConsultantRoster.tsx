import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AddToRosterDialog } from '@/components/AddToRosterDialog';
import { rosterService } from '@/api/services/rosterService';
import type { ConsultantRosterEntry } from '@/api/types';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export function ConsultantRoster() {
  const [tab, setTab] = useState<'teacher' | 'institute'>('teacher');
  const [items, setItems] = useState<ConsultantRosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await rosterService.list({ entityType: tab, status: 'active', pageSize: 100 });
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const handleArchive = async (id: string) => {
    try {
      await rosterService.archive(id);
      toast.success('Archived');
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roster</h1>
        <Button onClick={() => setDialogOpen(true)}>Add {tab}</Button>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'teacher' | 'institute')}>
        <TabsList>
          <TabsTrigger value="teacher">Teachers</TabsTrigger>
          <TabsTrigger value="institute">Institutes</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No active {tab}s in your roster.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((entry) => {
                const target = typeof entry.entityAccountId === 'string' ? null : entry.entityAccountId;
                return (
                  <Card key={entry.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{target?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">{target?.email ?? ''}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleArchive(entry.id)} aria-label="Archive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 bg-muted rounded">{t}</span>)}
                        </div>
                      )}
                      {entry.internalNotes && <p className="text-xs text-muted-foreground line-clamp-2">{entry.internalNotes}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <AddToRosterDialog open={dialogOpen} onOpenChange={setDialogOpen} entityType={tab} onAdded={load} />
    </div>
  );
}

export default ConsultantRoster;
