import React from 'react'
import clsx from 'clsx'
import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionVariant = 'primary',
  className = '',
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center px-6 py-16 animate-fade-in',
        className,
      )}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-warm-400" aria-hidden="true" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-warm-700 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-warm-400 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button variant={actionVariant} onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
