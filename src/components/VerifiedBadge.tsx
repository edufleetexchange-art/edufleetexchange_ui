import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
  label?: boolean;
}

export function VerifiedBadge({ className, size = 'sm', label = true }: VerifiedBadgeProps) {
  const sizeCls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <span
      className={`inline-flex items-center gap-1 text-blue-600 text-xs font-medium ${className ?? ''}`}
      aria-label="Verified"
      data-testid="verified-badge"
    >
      <BadgeCheck className={`${sizeCls} fill-blue-600 text-white`} aria-hidden="true" />
      {label && <span>Verified</span>}
    </span>
  );
}
