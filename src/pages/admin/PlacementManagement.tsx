import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function PlacementManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ items: any[] }>('/admin/placements?pageSize=100')
      .then((r) => setItems(r.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Placement Pipeline (admin)</h1>
      {loading ? <Skeleton className="h-64" /> :
        <div className="space-y-2">
          {items.map((p) => {
            const cons = typeof p.consultantAccountId === 'string' ? null : p.consultantAccountId;
            const teacher = typeof p.teacherAccountId === 'string' ? null : p.teacherAccountId;
            const job = typeof p.jobId === 'string' ? null : p.jobId;
            return (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <strong>{teacher?.name ?? '—'}</strong> → <strong>{job?.title ?? '—'}</strong> ({job?.instituteName ?? ''})
                    </p>
                    <p className="text-xs text-muted-foreground">Consultant: {cons?.name ?? cons?.email ?? '—'}</p>
                  </div>
                  <Badge variant="outline">{p.stage}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
    </div>
  );
}

export default PlacementManagement;
