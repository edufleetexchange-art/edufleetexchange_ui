import { ReactNode } from 'react';

export function TableWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-full overflow-x-auto rounded-md border ${className ?? ''}`}>
      {children}
    </div>
  );
}
