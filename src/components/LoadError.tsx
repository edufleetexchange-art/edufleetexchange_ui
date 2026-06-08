import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadErrorProps {
  message?: string;
  onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-6 text-center space-y-3">
      <AlertCircle className="w-6 h-6 mx-auto text-destructive" aria-hidden="true" />
      <p className="text-sm text-destructive font-medium">{message ?? "Couldn't load this data."}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}

export default LoadError;
