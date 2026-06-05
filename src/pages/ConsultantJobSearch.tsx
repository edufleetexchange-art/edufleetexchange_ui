import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProposeMatchesDialog } from '@/components/ProposeMatchesDialog';

export function ConsultantJobSearch() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '50', status: 'active' });
      if (q) params.set('q', q);
      const data = await apiClient.get<{ items: any[] }>(`/jobs?${params.toString()}`);
      setItems(data.items ?? []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Jobs</h1>
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by subject, location, title" onKeyDown={(e) => e.key === 'Enter' && load()} />
        <Button onClick={load}>Search</Button>
      </div>
      {loading ? <Skeleton className="h-64" /> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((j) => (
            <Card key={j.id ?? j._id}>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">{j.title}</p>
                <p className="text-xs text-muted-foreground">{j.instituteName} · {j.location?.city ?? j.location}</p>
                <p className="text-xs">{j.subjects?.join(', ')}</p>
                <Button size="sm" className="w-full" onClick={() => setSelectedJob(j.id ?? j._id)}>Propose from roster</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      }
      {selectedJob && (
        <ProposeMatchesDialog
          jobId={selectedJob}
          open={!!selectedJob}
          onOpenChange={(o) => !o && setSelectedJob(null)}
        />
      )}
    </div>
  );
}

export default ConsultantJobSearch;
