import React from 'react'
import clsx from 'clsx'

const variants = {
  default:  'bg-warm-100   text-warm-700   border-warm-200',
  primary:  'bg-primary-50 text-primary-700 border-primary-200',
  teal:     'bg-teal-50    text-teal-700    border-teal-200',
  success:  'bg-success-50 text-success-700 border-success-200',
  warning:  'bg-warning-50 text-warning-700 border-warning-200',
  danger:   'bg-danger-50  text-danger-700  border-danger-200',
  lavender: 'bg-lavender-50 text-lavender-700 border-lavender-200',
  crisis:   'bg-crisis-50  text-crisis-700  border-crisis-200',
}

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span
      className={clsx(
        'badge border',
        variants[variant] || variants.default,
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'inline-block w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'success'  ? 'bg-success-500'  :
            variant === 'warning'  ? 'bg-warning-500'  :
            variant === 'danger'   ? 'bg-danger-500'   :
            variant === 'primary'  ? 'bg-primary-500'  :
            variant === 'teal'     ? 'bg-teal-500'     :
            variant === 'crisis'   ? 'bg-crisis-500'   :
            'bg-warm-400',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
