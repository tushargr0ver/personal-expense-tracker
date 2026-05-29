import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

const alertConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500/10 border-red-500/20',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
  },
};

export default function Alert({ type, children, className = '' }: AlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 rounded-xl border p-4
        ${config.bg}
        animate-slide-down
        ${className}
      `}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="text-sm text-dark-200">{children}</div>
    </div>
  );
}
