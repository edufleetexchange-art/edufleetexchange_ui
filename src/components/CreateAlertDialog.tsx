import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { alertService } from '@/api/services/alertService';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill from the current search filters (optional). */
  defaults?: { subjects?: string[]; location?: string; minExperience?: number };
  onCreated?: () => void;
}

/**
 * "Notify me when a matching teacher is available." Captures a saved-search
 * alert. The first ping also reaches the placement team, so this doubles as a
 * demand signal — keep the copy buyer-facing and simple.
 */
export function CreateAlertDialog({ open, onOpenChange, defaults, onCreated }: Props) {
  const [subjects, setSubjects] = useState('');
  const [location, setLocation] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSubjects((defaults?.subjects ?? []).join(', '));
      setLocation(defaults?.location ?? '');
      setMinExperience(defaults?.minExperience != null ? String(defaults.minExperience) : '');
    }
  }, [open, defaults]);

  const toList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const handleSubmit = async () => {
    const subjectList = toList(subjects);
    const label =
      (subjectList[0] ? `${subjectList.join('/')} teacher` : 'Teacher') +
      (location ? ` — ${location}` : '') +
      (minExperience ? ` — ${minExperience}+ yrs` : '');
    setSubmitting(true);
    try {
      await alertService.create({
        entityType: 'teacher',
        label,
        criteria: {
          subjects: subjectList,
          location: location || undefined,
          minExperience: minExperience ? Number(minExperience) : undefined,
        },
        // Email + in-app by default: alert subscribers rarely log in daily,
        // so in-app alone means the match goes unseen.
        channels: ['in_app', 'email'],
      });
      toast.success('Alert set — we\'ll notify you when a matching teacher is available.');
      onCreated?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alert me when a teacher is available</DialogTitle>
          <DialogDescription>
            Tell us what you need. We&apos;ll notify you the moment a matching teacher joins — and our
            placement team will start sourcing one for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="alert-subjects">Subject(s)</Label>
            <Input id="alert-subjects" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Maths, Science" />
          </div>
          <div>
            <Label htmlFor="alert-location">Location (optional)</Label>
            <Input id="alert-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bengaluru" />
          </div>
          <div>
            <Label htmlFor="alert-exp">Minimum experience in years (optional)</Label>
            <Input id="alert-exp" type="number" min={0} value={minExperience} onChange={(e) => setMinExperience(e.target.value)} placeholder="e.g. 3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Setting…' : 'Set alert'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAlertDialog;
