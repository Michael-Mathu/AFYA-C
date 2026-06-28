import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success: 'border-green-200 bg-green-50 text-green-900',
        error: 'border-red-200 bg-red-50 text-red-900',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    onClose?: () => void;
  };

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, onClose, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastVariants({ variant, className }))}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
);
Toast.displayName = 'Toast';

export { Toast, toastVariants };
