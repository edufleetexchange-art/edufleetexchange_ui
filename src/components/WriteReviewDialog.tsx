import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { reviewService, type Review, type ReviewTargetType } from '@/api/services/reviewService';

interface WriteReviewDialogProps {
  targetType: ReviewTargetType;
  targetId: string;
  existing?: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function WriteReviewDialog({
  targetType,
  targetId,
  existing,
  open,
  onOpenChange,
  onSaved,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [body, setBody] = useState<string>(existing?.body ?? '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(existing?.rating ?? 0);
      setBody(existing?.body ?? '');
      setHover(0);
    }
  }, [open, existing]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please pick a star rating');
      return;
    }
    setSubmitting(true);
    try {
      if (existing) {
        await reviewService.update(existing.id, { rating, body: body || undefined });
        toast.success('Review updated');
      } else {
        await reviewService.create({ targetType, targetId, rating, body: body || undefined });
        toast.success('Review posted');
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      const code = err?.code ?? err?.statusCode;
      const msg = err?.message ?? err?.error ?? 'Failed to save review';
      if (code === 409 || /already reviewed/i.test(msg)) {
        toast.info('You have already reviewed this supplier — refresh to edit it');
      } else if (code === 403 || /self/i.test(msg)) {
        toast.error('You cannot review your own listing');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const display = hover || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit your review' : 'Write a review'}</DialogTitle>
          <DialogDescription>
            Share your experience with this supplier. Be specific — concrete details help other buyers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="block mb-2 text-sm font-medium">Rating</Label>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  className="p-1 hover:scale-110 transition-transform"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  disabled={submitting}
                >
                  <Star
                    className={`w-7 h-7 ${
                      n <= display
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-yellow-400/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-body" className="block mb-2 text-sm font-medium">
              Your review (optional)
            </Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 1000))}
              placeholder="What did you order? Was it on time? How was the quality?"
              rows={4}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{body.length} / 1000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating < 1}>
            {submitting ? 'Saving…' : existing ? 'Save changes' : 'Post review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
