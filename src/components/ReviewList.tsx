import { useCallback, useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import {
  reviewService,
  type Review,
  type ReviewStats,
  type ReviewTargetType,
} from '@/api/services/reviewService';
import { Rating } from './Rating';
import { WriteReviewDialog } from './WriteReviewDialog';

interface ReviewListProps {
  targetType: ReviewTargetType;
  targetId: string;
}

function reviewerId(r: Review): string | null {
  if (!r.reviewerAccountId) return null;
  if (typeof r.reviewerAccountId === 'string') return r.reviewerAccountId;
  return r.reviewerAccountId.id ?? null;
}

function reviewerName(r: Review): string {
  if (typeof r.reviewerAccountId === 'object' && r.reviewerAccountId?.name) {
    return r.reviewerAccountId.name;
  }
  return 'Anonymous';
}

export function ReviewList({ targetType, targetId }: ReviewListProps) {
  const { account } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExisting, setEditingExisting] = useState<Review | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        reviewService.list({ targetType, targetId, page: 1, pageSize: 20 }),
        reviewService.stats(targetType, targetId),
      ]);
      setItems(listRes.items ?? []);
      setStats(statsRes ?? null);
    } catch {
      setItems([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    load();
  }, [load]);

  const myReview = account ? items.find((r) => reviewerId(r) === account.id) ?? null : null;

  const openWrite = () => {
    setEditingExisting(myReview);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rating value={stats?.average ?? 0} count={stats?.count ?? 0} size="lg" />
        </div>
        {account ? (
          <Button size="sm" variant={myReview ? 'outline' : 'default'} onClick={openWrite}>
            {myReview ? (
              <>
                <Pencil className="w-3 h-3 mr-1" /> Edit your review
              </>
            ) : (
              'Write a review'
            )}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            <a href="/login" className="underline">Log in</a> to write a review
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center bg-muted/30 rounded-md">
          No reviews yet — be the first.
        </p>
      ) : (
        <ul className="divide-y">
          {items.map((r) => (
            <li key={r.id} className="py-3 flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{reviewerName(r)}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-0.5">
                  <Rating value={r.rating} size="sm" showValue={false} />
                </div>
                {r.body && <p className="text-sm mt-1 text-foreground/80">{r.body}</p>}
                {account && reviewerId(r) === account.id && (
                  <button
                    onClick={openWrite}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Edit
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <WriteReviewDialog
        targetType={targetType}
        targetId={targetId}
        existing={editingExisting}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={load}
      />
    </div>
  );
}
