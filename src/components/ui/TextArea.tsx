import { forwardRef } from 'react';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';
