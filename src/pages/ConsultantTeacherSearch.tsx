import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { rosterService } from '@/api/services/rosterService';
import { LoadError } from '@/components/LoadError';
import { toast } from 'sonner';

interface TeacherItem {
  profile: { id: string; experience: number; subjects: string[]; location?: string };
  account: { id: string; name: string; email: string };
}

export function ConsultantTeacherSearch() {
  const [items, setItems] = useState<TeacherItem[]>([]);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize: '50' });
      if (subject) params.set('subject', subject);
      const data = await apiClient.get<{ items: TeacherItem[] }>(`/teachers?${params.toString()}`);
      setItems(data.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load teachers.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const addToRoster = async (accountId: string) => {
    try { await rosterService.create({ entityType: 'teacher', entityAccountId: accountId }); toast.success('Added to roster'); }
    catch (e: any) {
      const m = e?.message ?? 'Failed';
      if (/duplicate|already/i.test(m)) toast.info('Already in your roster.');
      else toast.error(m);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Teachers</h1>
      <div className="flex gap-2">
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Filter by subject (e.g. Math)" onKeyDown={(e) => e.key === 'Enter' && load()} />
        <Button onClick={load}>Search</Button>
      </div>
      {loading ? <Skeleton className="h-64" /> :
        error ? <LoadError message={error} onRetry={load} /> :
        items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No teachers match this search.</p> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((t) => (
            <Card key={t.account?.id ?? t.profile?.id}>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">{t.account?.name ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{t.profile?.subjects?.join(', ')} · {t.profile?.experience} yrs</p>
                <p className="text-xs">{t.profile?.location ?? ''}</p>
                <Button size="sm" className="w-full" onClick={() => addToRoster(t.account?.id)} disabled={!t.account?.id}>Add to roster</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

export default ConsultantTeacherSearch;
