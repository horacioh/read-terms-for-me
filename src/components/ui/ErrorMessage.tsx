import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span className="whitespace-pre-wrap">{message}</span>
    </div>
  );
}
