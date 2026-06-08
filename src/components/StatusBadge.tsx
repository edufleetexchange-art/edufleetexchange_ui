import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Pause,
  Archive,
  Send,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Tone = 'success' | 'destructive' | 'pending' | 'warning' | 'neutral' | 'info';

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}

const TONE_STYLES: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  destructive: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  warning: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
};

const DEFAULT_ICONS: Record<Tone, LucideIcon> = {
  success: CheckCircle2,
  destructive: XCircle,
  pending: Clock,
  warning: AlertTriangle,
  neutral: Archive,
  info: Eye,
};

/**
 * Single source of truth for status indicators across the app. Always pairs
 * a color tone with a glyph so users with color-vision deficiencies still
 * read the state. Falls back to a sensible default icon per tone.
 */
export function StatusBadge({ label, tone = 'neutral', icon, className }: StatusBadgeProps) {
  const Icon = icon ?? DEFAULT_ICONS[tone];
  return (
    <Badge
      variant="secondary"
      className={`${TONE_STYLES[tone]} gap-1 inline-flex items-center font-medium ${className ?? ''}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}

/** Convenience: map a common status string to a sensible (tone, label) pair. */
export function statusToTone(status: string | undefined): { tone: Tone; label: string; icon?: LucideIcon } {
  const s = (status ?? '').toLowerCase();
  if (['approved', 'active', 'accepted', 'placed', 'completed', 'verified'].includes(s))
    return { tone: 'success', label: status ?? 'Approved' };
  if (['rejected', 'declined', 'canceled', 'cancelled', 'expired', 'lost'].includes(s))
    return { tone: 'destructive', label: status ?? 'Rejected' };
  if (['pending', 'submitted', 'scheduled', 'proposed', 'reviewing', 'reviewed'].includes(s))
    return { tone: 'pending', label: status ?? 'Pending' };
  if (['paused', 'inactive', 'archived', 'hold'].includes(s))
    return { tone: 'neutral', label: status ?? 'Inactive', icon: Pause };
  if (['interviewing', 'interview_scheduled', 'shortlisted', 'offer_extended', 'applied'].includes(s))
    return { tone: 'info', label: status ?? 'In progress', icon: Send };
  return { tone: 'neutral', label: status ?? '—' };
}

export default StatusBadge;
