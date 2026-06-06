import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/apiClient';
import { rosterService } from '@/api/services/rosterService';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'teacher' | 'institute';
  onAdded?: () => void;
}

interface Candidate { id: string; name: string; email: string; }

export function AddToRosterDialog({ open, onOpenChange, entityType, onAdded }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    try {
      if (entityType === 'teacher') {
        // Existing teachers endpoint accepts subject/location filters; use subject.
        const data = await apiClient.get<{ items: any[] }>(`/teachers?subject=${encodeURIComponent(query)}&pageSize=10`);
        const items = (data.items ?? []).map((it: any) => ({
          id: it.account?.id ?? it.profile?.accountId ?? '',
          name: it.account?.name ?? '—',
          email: it.account?.email ?? '',
        })).filter((c: Candidate) => c.id);
        setResults(items);
      } else {
        const data = await apiClient.get<{ items: any[] }>(`/institutes?city=${encodeURIComponent(query)}&pageSize=10`);
        const items = (data.items ?? []).map((it: any) => ({
          id: it.accountId?._id ?? it.accountId?.id ?? '',
          name: it.accountId?.name ?? it.instituteName ?? '—',
          email: it.accountId?.email ?? '',
        })).filter((c: Candidate) => c.id);
        setResults(items);
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Search failed');
    }
  };

  const handleAdd = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await rosterService.create({
        entityType,
        entityAccountId: selected,
        internalNotes: notes || undefined,
        tags: tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      });
      toast.success('Added to roster');
      onAdded?.();
      onOpenChange(false);
      setQuery(''); setResults([]); setSelected(null); setNotes(''); setTagsRaw('');
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to add';
      if (/duplicate|already/i.test(msg)) toast.info('Already in your roster.');
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {entityType} to roster</DialogTitle>
          <DialogDescription>
            {entityType === 'teacher'
              ? 'Search by subject (e.g. "Math") then pick a teacher to add.'
              : 'Search by city (e.g. "Bengaluru") then pick an institute to add.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={entityType === 'teacher' ? 'Subject' : 'City'} onKeyDown={(e) => e.key === 'Enter' && search()} />
            <Button type="button" onClick={search}>Search</Button>
          </div>
          {results.length > 0 && (
            <ul className="border rounded divide-y max-h-48 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.id)}
                    className={`w-full text-left p-2 text-sm hover:bg-muted ${selected === r.id ? 'bg-muted' : ''}`}
                  >
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div><Label>Internal notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
          <div><Label>Tags (comma-separated, optional)</Label><Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="priority, remote-ok" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selected || submitting}>{submitting ? 'Adding…' : 'Add to roster'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
