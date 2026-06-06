import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function ConsultantManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ items: any[] }>('/admin/consultants?pageSize=100')
      .then((r) => setItems(r.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Consultant Management</h1>
      {loading ? <Skeleton className="h-64" /> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => {
            const acct = typeof c.accountId === 'string' ? null : c.accountId;
            return (
              <Card key={c.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{acct?.name ?? '—'}</p>
                    <Badge variant={c.verification?.status === 'verified' ? 'default' : 'outline'}>
                      {c.verification?.status ?? 'none'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{acct?.email}</p>
                  {c.agencyName && <p className="text-xs">{c.agencyName}</p>}
                  <p className="text-xs">{c.yearsOfExperience} yrs · {c.specializations?.subjects?.join(', ')}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
    </div>
  );
}

export default ConsultantManagement;
