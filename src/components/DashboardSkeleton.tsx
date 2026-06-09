import { Skeleton } from '@/components/ui/skeleton';

interface DashboardSkeletonProps {
  /** How many tiles to render in the stat strip. Defaults to 4. */
  statTiles?: number;
  /** Optional title hint for screen readers. */
  label?: string;
}

/**
 * Single source of truth for the persona-dashboard loading shell. All dashboards
 * should render this instead of inventing their own arrangement of <Skeleton>
 * blocks — same heights, same spacing, no flash-of-empty between personas.
 *
 * Layout:
 *   - Header row (title + welcome)
 *   - Stat strip (N tiles, responsive)
 *   - Two stacked content blocks (primary + secondary)
 */
export function DashboardSkeleton({ statTiles = 4, label = 'Loading dashboard' }: DashboardSkeletonProps) {
  return (
    <div
      className="container mx-auto p-4 sm:p-6 space-y-6"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-40 hidden sm:block" />
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${Math.min(statTiles, 4)} gap-3`}>
        {Array.from({ length: statTiles }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default DashboardSkeleton;
