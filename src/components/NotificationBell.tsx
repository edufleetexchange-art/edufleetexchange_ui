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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notifications"
        >
          <Bell className={`w-5 h-5${loading && unreadCount === 0 ? ' animate-pulse' : ''}`} />

          {loading && unreadCount === 0 ? (
            <span className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </span>
          ) : unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[calc(100vw-1rem)] sm:w-96 p-0" align="end">
        <NotificationPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
