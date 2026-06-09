import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, Loader2 } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const { unreadCount, loading } = useNotifications();
  const [open, setOpen] = useState(false);

  const ariaLabel = unreadCount > 0
    ? `Notifications (${unreadCount} unread)`
    : 'Notifications';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Bell className={`w-5 h-5${loading && unreadCount === 0 ? ' animate-pulse' : ''}`} aria-hidden="true" />

          {loading && unreadCount === 0 ? (
            <span className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center" aria-hidden="true">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </span>
          ) : unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          ) : null}
          <span className="sr-only" aria-live="polite" role="status">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : ''}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[calc(100vw-1rem)] sm:w-96 p-0" align="end">
        <NotificationPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
