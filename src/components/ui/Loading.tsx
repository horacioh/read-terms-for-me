import { Loader2 } from 'lucide-react';

interface LoadingProps {
  label?: string;
}

export function Loading({ label }: LoadingProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600" role="status" aria-live="polite">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      {label && <span>{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
