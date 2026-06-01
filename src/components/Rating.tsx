import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const SIZE: Record<NonNullable<RatingProps['size']>, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function Rating({ value, count, size = 'md', showValue = true, className }: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const cls = SIZE[size];

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className ?? ''}`}
      aria-label={`Rating ${clamped.toFixed(1)} out of 5`}
      data-testid="rating"
    >
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className={`${cls} fill-yellow-400 text-yellow-400`} aria-hidden="true" />
      ))}
      {hasHalf && (
        <StarHalf key="h" className={`${cls} fill-yellow-400 text-yellow-400`} aria-hidden="true" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={`${cls} text-yellow-400/40`} aria-hidden="true" />
      ))}
      {showValue && <span className="text-xs text-muted-foreground ml-1">{clamped.toFixed(1)}</span>}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground" data-testid="rating-count">
          ({count})
        </span>
      )}
    </span>
  );
}
