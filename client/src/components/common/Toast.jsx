import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

const ToastContext = createContext(null)

const icons = {
  success: { Icon: CheckCircle,   color: 'text-success-500' },
  error:   { Icon: AlertCircle,   color: 'text-danger-500'  },
  info:    { Icon: Info,          color: 'text-primary-500' },
  warning: { Icon: AlertTriangle, color: 'text-warning-500' },
}

const backgrounds = {
  success: 'border-success-200 bg-success-50',
  error:   'border-danger-200  bg-danger-50',
  info:    'border-primary-200 bg-primary-50',
  warning: 'border-warning-200 bg-warning-50',
}

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastIdCounter
    setToasts(prev => [...prev, { id, type, message }])
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(({ id, type, message }) => {
          const { Icon, color } = icons[type] || icons.info
          return (
            <div
              key={id}
              className={clsx(
                'flex items-start gap-3 p-4 rounded-2xl border shadow-card pointer-events-auto animate-slide-in-right',
                backgrounds[type] || backgrounds.info,
              )}
              role="status"
              aria-live="polite"
            >
              <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', color)} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium text-warm-800">{message}</p>
              <button
                onClick={() => removeToast(id)}
                className="flex-shrink-0 text-warm-400 hover:text-warm-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
