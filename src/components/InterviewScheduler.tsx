import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { interviewService } from '@/api/services/interviewService';
import type { InterviewMode } from '@/api/types';
import { toast } from 'sonner';

interface Props {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

export function InterviewScheduler({ applicationId, open, onOpenChange, onScheduled }: Props) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [mode, setMode] = useState<InterviewMode>('video');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [notesBefore, setNotesBefore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!scheduledAt) { toast.error('Please pick a date/time'); return; }
    setSubmitting(true);
    try {
      await interviewService.schedule({
        applicationId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes,
        mode,
        location: mode === 'in_person' ? location : undefined,
        meetingLink: mode === 'video' ? meetingLink : undefined,
        notesBefore: notesBefore || undefined,
      });
      toast.success('Interview scheduled — participants notified');
      onScheduled?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to schedule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule interview</DialogTitle>
          <DialogDescription>Teacher and institute will be notified automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Date & time</Label><Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></div>
          <div><Label>Duration (minutes)</Label><Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 30)} min={5} /></div>
          <div>
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as InterviewMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="in_person">In-person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === 'video' && <div><Label>Meeting link</Label><Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet…" /></div>}
          {mode === 'in_person' && <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>}
          <div><Label>Notes (optional)</Label><Textarea value={notesBefore} onChange={(e) => setNotesBefore(e.target.value)} rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Scheduling…' : 'Schedule'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
