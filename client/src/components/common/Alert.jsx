import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X, ShieldAlert } from 'lucide-react'
import clsx from 'clsx'

const variants = {
  info: {
    wrapper: 'bg-primary-50 border-primary-200 text-primary-800',
    icon: Info,
    iconColor: 'text-primary-500',
  },
  success: {
    wrapper: 'bg-success-50 border-success-200 text-success-800',
    icon: CheckCircle,
    iconColor: 'text-success-500',
  },
  warning: {
    wrapper: 'bg-warning-50 border-warning-200 text-warning-800',
    icon: AlertTriangle,
    iconColor: 'text-warning-500',
  },
  error: {
    wrapper: 'bg-danger-50 border-danger-200 text-danger-800',
    icon: AlertCircle,
    iconColor: 'text-danger-500',
  },
  crisis: {
    wrapper: 'bg-crisis-50 border-crisis-200 text-crisis-800',
    icon: ShieldAlert,
    iconColor: 'text-crisis-500',
  },
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  role: roleProp,
}) {
  const cfg = variants[variant] || variants.info
  const Icon = cfg.icon

  return (
    <div
      role={roleProp || (variant === 'error' || variant === 'crisis' ? 'alert' : 'status')}
      className={clsx(
        'flex gap-3 p-4 rounded-xl border',
        cfg.wrapper,
        className,
      )}
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', cfg.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-current/30"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
