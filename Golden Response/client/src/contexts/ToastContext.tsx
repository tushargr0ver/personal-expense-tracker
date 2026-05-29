import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  exiting: boolean;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'border-l-emerald-500 bg-emerald-500/10',
  error: 'border-l-red-500 bg-red-500/10',
  warning: 'border-l-amber-500 bg-amber-500/10',
  info: 'border-l-blue-500 bg-blue-500/10',
};

const TOAST_ICON_COLORS: Record<ToastType, string> = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

const TOAST_PROGRESS_COLORS: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const Icon = TOAST_ICONS[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      id={`toast-${toast.id}`}
      role="alert"
      className={`
        ${toast.exiting ? 'toast-exit' : 'toast-enter'}
        relative flex items-start gap-3 rounded-xl border-l-4 p-4 pr-10
        backdrop-blur-xl shadow-2xl shadow-black/30 min-w-[320px] max-w-[420px]
        ${TOAST_COLORS[toast.type]}
      `}
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${TOAST_ICON_COLORS[toast.type]}`} />
      <p className="text-sm text-dark-100 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 text-dark-400 hover:text-dark-200 transition-colors"
        aria-label="Close notification"
        id={`toast-close-${toast.id}`}
      >
        <X className="h-4 w-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
        <div
          className={`h-full ${TOAST_PROGRESS_COLORS[toast.type]} opacity-50`}
          style={{
            animation: `progressBar ${toast.duration}ms linear forwards`,
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, duration, exiting: false }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
