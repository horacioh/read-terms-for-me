interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'warning';
}

const variantClasses = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-gray-100 text-gray-800',
  destructive: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
