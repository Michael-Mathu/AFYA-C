import * as React from 'react';
import type { ToastProps } from '@/components/ui/toast';
import { Toast } from '@/components/ui/toast';

type ToastItem = {
  id: number;
  description?: string;
} & Omit<ToastProps, 'id' | 'description'>;

interface ToastContextValue {
  toast: (props: Omit<ToastProps, 'onClose'> & { duration?: number; description?: string }) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const removeToast = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ duration = 5000, description, ...props }: { duration?: number; description?: string } & Omit<ToastProps, 'onClose'>) => {
      const id = ++idRef.current;
      const item: ToastItem = { ...props, id, description, onClose: () => removeToast(id) };
      setToasts((prev) => [...prev, item]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = React.useCallback(
    (message: string, duration?: number) =>
      toast({ variant: 'success', title: message, duration } as any),
    [toast]
  );

  const error = React.useCallback(
    (message: string, duration?: number) =>
      toast({ variant: 'error', title: message, duration } as any),
    [toast]
  );

  const warning = React.useCallback(
    (message: string, duration?: number) =>
      toast({ variant: 'warning', title: message, duration } as any),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex max-w-md flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={String(t.id)} {...t} id={undefined}>
            {t.title}
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}