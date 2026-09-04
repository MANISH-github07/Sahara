import React from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  teal:      'btn-teal',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  outline:   'btn bg-transparent border border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
}

const sizes = {
  sm:  'btn-sm',
  md:  '',
  lg:  'btn-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        variants[variant] || variants.primary,
        sizes[size],
        className,
      )}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="w-4 h-4 flex-shrink-0 ml-auto" aria-hidden="true">
          {React.createElement(iconRight, { className: 'w-4 h-4' })}
        </span>
      )}
    </button>
  )
}
