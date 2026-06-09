import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * Shared empty-state surface. Use whenever a list, table, or section has no
 * data to display. Always include a `title` that coaches the user to a next
 * step (e.g. "No teachers in your roster yet" + an "Add teacher" action),
 * never a flat "No items".
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className ?? ''}`}>
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4" aria-hidden="true">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-2 flex-wrap justify-center">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button size="sm" variant="outline" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
