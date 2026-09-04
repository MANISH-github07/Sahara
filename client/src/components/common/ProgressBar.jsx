import React from 'react'
import clsx from 'clsx'

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'primary',
  className = '',
  animated = true,
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const colors = {
    primary:  'bg-primary-500',
    teal:     'bg-teal-500',
    success:  'bg-success-500',
    warning:  'bg-warning-500',
    danger:   'bg-danger-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-teal-500',
  }

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-warm-600">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-warm-700">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        className={clsx('w-full bg-warm-100 rounded-full overflow-hidden', sizes[size] || sizes.md)}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color] || colors.primary,
            animated && 'transition-[width]',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
