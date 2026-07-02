import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'icon';

interface ButtonProps extends RACButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isPending?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  destructive: 'bg-destructive text-white hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  icon: 'p-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isPending, className = '', children, ...props }, ref) => {
    return (
      <RACButton
        ref={ref}
        isPending={isPending}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </RACButton>
    );
  }
);
Button.displayName = 'Button';
