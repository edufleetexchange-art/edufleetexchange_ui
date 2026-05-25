import { Star } from 'lucide-react';

interface PriorityBadgeProps {
  className?: string;
}

export function PriorityBadge({ className = '' }: PriorityBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${className}`}
    >
      <Star className="w-3 h-3 fill-current" />
      <span>Priority Listing</span>
    </div>
  );
}
