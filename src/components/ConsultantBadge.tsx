import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  consultant: { name?: string; agencyName?: string; phone?: string; email?: string } | string;
}

export function ConsultantBadge({ consultant }: Props) {
  if (typeof consultant === 'string') {
    return <Badge variant="outline" className="ml-1 gap-1"><Briefcase className="w-3 h-3" />via Consultant</Badge>;
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant="outline" className="ml-1 gap-1 cursor-pointer">
          <Briefcase className="w-3 h-3" />via {consultant.agencyName ?? consultant.name ?? 'Consultant'}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="font-semibold text-sm">{consultant.name}</p>
        {consultant.agencyName && <p className="text-xs text-muted-foreground">{consultant.agencyName}</p>}
        {consultant.email && <p className="text-xs mt-1">{consultant.email}</p>}
        {consultant.phone && <p className="text-xs">{consultant.phone}</p>}
      </PopoverContent>
    </Popover>
  );
}
